import express from "express";
import { createServer as createViteServer } from "vite";
import { isSystemConfigured, getConfigDB, setSetting, getSetting } from "./src/server/db_config.js";
import { initExternalDB, runExternalMigrations, getExternalDB } from "./src/server/external_db.js";
import { encrypt, decrypt } from "./src/server/crypto.js";
import bcrypt from "bcrypt";
import apiRoutes from "./src/server/routes.js";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Middleware: Check if the system is configured
  app.use("/api", (req, res, next) => {
    // Allow setup routes and health check to bypass the check
    if (req.path.startsWith("/setup") || req.path === "/health") {
      return next();
    }

    // If the system is not configured, block access to standard API routes
    if (!isSystemConfigured()) {
      return res.status(403).json({
        error: "System unconfigured",
        message: "The application has not been set up. Please complete the setup wizard.",
        redirect: "/setup"
      });
    }

    // If configured, proceed to the requested route
    next();
  });

  // Middleware: Attach dynamic DB connection to req.db
  app.use("/api", async (req, res, next) => {
    // Skip for setup, health, and proxy routes
    if (req.path.startsWith("/setup") || req.path === "/health" || req.path.startsWith("/proxy")) {
      return next();
    }

    try {
      let db;
      try {
        db = getExternalDB();
      } catch (e) {
        // Not initialized yet, try to initialize
        db = await initExternalDB();
      }
      (req as any).db = db;
      next();
    } catch (error) {
      console.error("Failed to attach DB to request:", error);
      res.status(500).json({ error: "Database connection failed." });
    }
  });

  // Mount the business logic routes
  app.use("/api", apiRoutes);

  // API routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", configured: isSystemConfigured() });
  });

  // --- Setup Wizard Routes ---
  
  // POST /api/setup/admin
  // Creates the initial administrator account
  app.post("/api/setup/admin", async (req, res) => {
    try {
      if (isSystemConfigured()) {
        return res.status(400).json({ error: "System is already configured." });
      }

      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
      }

      const db = getConfigDB();
      
      // Check if an admin already exists
      const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
      if (adminCount.count > 0) {
        return res.status(400).json({ error: "Admin account already exists." });
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run(username, passwordHash);

      res.status(201).json({ message: "Admin account created successfully." });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).json({ error: "Failed to create admin account." });
    }
  });

  // POST /api/setup/database
  // Configures the external database connection and runs migrations
  app.post("/api/setup/database", async (req, res) => {
    try {
      const { client, connection } = req.body;
      
      if (!client || !connection) {
        return res.status(400).json({ error: "Database client and connection details are required." });
      }

      // Save the configuration temporarily to test it
      const configStr = JSON.stringify({ client, connection });
      const encryptedConfig = encrypt(configStr);
      setSetting("external_db_config", encryptedConfig);

      // Attempt to initialize the connection
      const dbInstance = await initExternalDB();

      // Run automated migrations to create business tables
      await runExternalMigrations(dbInstance);

      res.status(200).json({ message: "External database configured and migrated successfully." });
    } catch (error) {
      console.error("Error configuring database:", error);
      // If it fails, we might want to clear the setting so it doesn't stay in a broken state
      // setSetting("external_db_config", ""); 
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to configure database." });
    }
  });

  // POST /api/setup/creator-mode
  // Temporary endpoint to bypass setup and use dummy data
  app.post("/api/setup/creator-mode", async (req, res) => {
    try {
      const db = getConfigDB();
      
      // 1. Create dummy admin if it doesn't exist
      const adminCount = db.prepare("SELECT COUNT(*) as count FROM users WHERE role = 'admin'").get() as { count: number };
      if (adminCount.count === 0) {
        const passwordHash = await bcrypt.hash('creator', 10);
        db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')").run('creator', passwordHash);
      }

      // 2. Configure local SQLite as the "external" database
      const dummyConfig = {
        client: 'sqlite3',
        connection: {
          filename: './dummy_data.db'
        }
      };
      const encryptedConfig = encrypt(JSON.stringify(dummyConfig));
      setSetting("external_db_config", encryptedConfig);

      // 3. Initialize and migrate
      const dbInstance = await initExternalDB();
      await runExternalMigrations(dbInstance);

      // 4. Seed dummy data if empty
      const empCount = await dbInstance('employees').count('* as count').first();
      if (empCount && Number(empCount.count) === 0) {
        await dbInstance('employees').insert([
          { id: 'emp_1', name: 'Alice Smith', role: 'Developer', hourlyRate: 50.00, allocation: 100, billability: 'Yes', availability: 40 },
          { id: 'emp_2', name: 'Bob Jones', role: 'Designer', hourlyRate: 60.00, allocation: 100, billability: 'Yes', availability: 40 },
        ]);
        await dbInstance('projects').insert([
          { id: 'proj_1', name: 'Website Redesign', owner: 'Alice Smith', hourlyRate: 100.00, allocation: 100, billability: 'Yes', type: 'External', customer: 'Acme Corp' },
        ]);
        await dbInstance('allocations').insert([
          { id: 'alloc_1', employeeId: 'emp_1', projectId: 'proj_1', startDate: '2026-03-01', endDate: '2026-06-01', allocationPercentage: 50, type: 'Billable' },
          { id: 'alloc_2', employeeId: 'emp_2', projectId: 'proj_1', startDate: '2026-03-01', endDate: '2026-06-01', allocationPercentage: 50, type: 'Billable' },
        ]);
      }

      res.status(200).json({ message: "Creator mode activated successfully." });
    } catch (error) {
      console.error("Error activating creator mode:", error);
      res.status(500).json({ error: "Failed to activate creator mode." });
    }
  });

  // POST /api/setup/apikeys
  // Stores external API keys securely in the local SQLite DB
  app.post("/api/setup/apikeys", (req, res) => {
    try {
      const { keys } = req.body; // Expecting an object like { "stripe_key": "sk_test_...", "sendgrid_key": "SG...." }
      
      if (!keys || typeof keys !== 'object') {
        return res.status(400).json({ error: "Invalid API keys format." });
      }

      for (const [key, value] of Object.entries(keys)) {
        if (typeof value === 'string') {
          // Prefix with 'api_key_' to namespace them in the settings table
          const encryptedValue = encrypt(value);
          setSetting(`api_key_${key}`, encryptedValue);
        }
      }

      res.status(200).json({ message: "API keys saved successfully." });
    } catch (error) {
      console.error("Error saving API keys:", error);
      res.status(500).json({ error: "Failed to save API keys." });
    }
  });

  // --- API Gateway / Proxy Routes ---

  // OpenAI Proxy
  app.post("/api/proxy/openai/chat", async (req, res) => {
    try {
      const encryptedApiKey = getSetting("api_key_openai");
      if (!encryptedApiKey) {
        return res.status(400).json({ error: "OpenAI API key not configured." });
      }
      const apiKey = decrypt(encryptedApiKey);

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify(req.body)
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("OpenAI Proxy Error:", error);
      res.status(500).json({ error: "Failed to proxy request to OpenAI." });
    }
  });

  // Stripe Proxy (GET)
  app.get("/api/proxy/stripe/*", async (req, res) => {
    try {
      const encryptedApiKey = getSetting("api_key_stripe");
      if (!encryptedApiKey) {
        return res.status(400).json({ error: "Stripe API key not configured." });
      }
      const apiKey = decrypt(encryptedApiKey);

      const path = req.params[0];
      const query = new URLSearchParams(req.query as Record<string, string>).toString();
      const url = `https://api.stripe.com/v1/${path}${query ? `?${query}` : ''}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Stripe Proxy Error:", error);
      res.status(500).json({ error: "Failed to proxy request to Stripe." });
    }
  });

  // Stripe Proxy (POST)
  app.post("/api/proxy/stripe/*", async (req, res) => {
    try {
      const encryptedApiKey = getSetting("api_key_stripe");
      if (!encryptedApiKey) {
        return res.status(400).json({ error: "Stripe API key not configured." });
      }
      const apiKey = decrypt(encryptedApiKey);

      const path = req.params[0];
      const url = `https://api.stripe.com/v1/${path}`;

      const formBody = new URLSearchParams();
      for (const key in req.body) {
        if (typeof req.body[key] === 'object') {
          formBody.append(key, JSON.stringify(req.body[key]));
        } else {
          formBody.append(key, req.body[key]);
        }
      }

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formBody.toString()
      });

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Stripe Proxy Error:", error);
      res.status(500).json({ error: "Failed to proxy request to Stripe." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

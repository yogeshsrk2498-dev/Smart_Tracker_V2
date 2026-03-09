import express, { Request, Response, NextFunction } from 'express';
import { Knex } from 'knex';

// Extend Express Request to include the dynamic db instance
export interface DbRequest extends Request {
  db?: Knex;
}

const router = express.Router();

// Middleware to ensure db is present on the request
const requireDb = (req: DbRequest, res: Response, next: NextFunction) => {
  if (!req.db) {
    return res.status(500).json({ error: "Database connection not established." });
  }
  next();
};

// ==========================================
// Employees Endpoints
// ==========================================

// GET /employees: Fetch all records from the employees table.
router.get('/employees', requireDb, async (req: DbRequest, res: Response) => {
  try {
    const employees = await req.db!('employees').select('*');
    res.status(200).json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ error: "Failed to fetch employees." });
  }
});

// POST /employees: Insert a new employee.
router.post('/employees', requireDb, async (req: DbRequest, res: Response) => {
  try {
    const { id, name, role, hourlyRate, allocation, billability, availability } = req.body;
    
    await req.db!('employees').insert({
      id,
      name,
      role,
      hourlyRate,
      allocation,
      billability,
      availability
    });
    
    res.status(201).json({ message: "Employee created successfully." });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: "Failed to create employee." });
  }
});

// ==========================================
// Projects Endpoints
// ==========================================

// GET /projects: Fetch all records from the projects table.
router.get('/projects', requireDb, async (req: DbRequest, res: Response) => {
  try {
    const projects = await req.db!('projects').select('*');
    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects." });
  }
});

// POST /projects: Insert a new project.
router.post('/projects', requireDb, async (req: DbRequest, res: Response) => {
  try {
    const { id, name, owner, hourlyRate, allocation, billability, type, customer } = req.body;
    
    await req.db!('projects').insert({
      id,
      name,
      owner,
      hourlyRate,
      allocation,
      billability,
      type,
      customer
    });
    
    res.status(201).json({ message: "Project created successfully." });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project." });
  }
});

// ==========================================
// Allocations Endpoints
// ==========================================

// GET /allocations: Fetch all records from the allocations table.
router.get('/allocations', requireDb, async (req: DbRequest, res: Response) => {
  try {
    const allocations = await req.db!('allocations').select('*');
    res.status(200).json(allocations);
  } catch (error) {
    console.error("Error fetching allocations:", error);
    res.status(500).json({ error: "Failed to fetch allocations." });
  }
});

// POST /allocations: Insert a new allocation.
router.post('/allocations', requireDb, async (req: DbRequest, res: Response) => {
  try {
    const { id, employeeId, projectId, startDate, endDate, allocationPercentage, type } = req.body;
    
    await req.db!('allocations').insert({
      id,
      employeeId,
      projectId,
      startDate,
      endDate,
      allocationPercentage,
      type
    });
    
    res.status(201).json({ message: "Allocation created successfully." });
  } catch (error) {
    console.error("Error creating allocation:", error);
    res.status(500).json({ error: "Failed to create allocation." });
  }
});

export default router;

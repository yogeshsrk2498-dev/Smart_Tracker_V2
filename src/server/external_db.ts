import knex, { Knex } from 'knex';
import { getSetting } from './db_config.js';
import { decrypt } from './crypto.js';

let externalDbInstance: Knex | null = null;

// Initialize or re-initialize the external database connection
export async function initExternalDB(): Promise<Knex> {
  const encryptedConfigStr = getSetting('external_db_config');
  
  if (!encryptedConfigStr) {
    throw new Error('External database configuration not found.');
  }

  try {
    const configStr = decrypt(encryptedConfigStr);
    const config = JSON.parse(configStr);
    
    // Destroy existing connection if it exists
    if (externalDbInstance) {
      await externalDbInstance.destroy();
    }

    // Create new connection
    externalDbInstance = knex({
      client: config.client, // e.g., 'pg', 'mysql2', 'sqlite3'
      connection: config.connection, // e.g., { host, user, password, database }
      useNullAsDefault: true,
    });

    // Test connection
    await externalDbInstance.raw('SELECT 1');
    
    return externalDbInstance;
  } catch (error) {
    console.error('Failed to initialize external database:', error);
    throw new Error('Invalid external database configuration or connection failed.');
  }
}

// Get the current external database instance
export function getExternalDB(): Knex {
  if (!externalDbInstance) {
    throw new Error('External database is not initialized.');
  }
  return externalDbInstance;
}

// Run migrations on the external database
export async function runExternalMigrations(dbInstance: Knex) {
  // Example migrations for business tables
  const hasEmployees = await dbInstance.schema.hasTable('employees');
  if (!hasEmployees) {
    await dbInstance.schema.createTable('employees', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.string('email').notNullable().unique();
      table.string('department');
      table.timestamps(true, true);
    });
  }

  const hasProjects = await dbInstance.schema.hasTable('projects');
  if (!hasProjects) {
    await dbInstance.schema.createTable('projects', (table) => {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.date('start_date');
      table.date('end_date');
      table.string('status').defaultTo('active');
      table.timestamps(true, true);
    });
  }

  const hasAllocations = await dbInstance.schema.hasTable('allocations');
  if (!hasAllocations) {
    await dbInstance.schema.createTable('allocations', (table) => {
      table.increments('id').primary();
      table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('CASCADE');
      table.integer('project_id').unsigned().references('id').inTable('projects').onDelete('CASCADE');
      table.integer('hours_per_week').notNullable();
      table.date('start_date');
      table.date('end_date');
      table.timestamps(true, true);
    });
  }
}

// Initialize database with tables
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to database...');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Create database schema by running drizzle-kit push
    console.log('Running database migrations...');
    const { exec } = require('child_process');
    exec('npx drizzle-kit push:pg', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error running migrations: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Migration stderr: ${stderr}`);
        return;
      }
      console.log(`Migration output: ${stdout}`);
      console.log('Database migrations completed successfully');
    });

    // Add default admin user if none exists
    const checkUserResult = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      ['admin']
    );

    if (checkUserResult.rows.length === 0) {
      console.log('Creating default admin user...');
      await pool.query(
        'INSERT INTO users (username, password, firstName, lastName, email) VALUES ($1, $2, $3, $4, $5)',
        ['admin', 'admin123', 'Admin', 'User', 'admin@example.com']
      );
      console.log('Default admin user created');
    } else {
      console.log('Admin user already exists');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
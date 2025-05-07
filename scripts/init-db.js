// Script to initialize database with admin user
import fetch from 'node-fetch';

async function initDatabase() {
  try {
    console.log('Initializing database with admin user...');
    
    // Create admin user if it doesn't exist
    const response = await fetch('http://localhost:5000/api/init-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        emailNotifications: true,
        browserNotifications: true,
        apiChangeNotifications: false
      }),
    });
    
    const result = await response.json();
    console.log('Initialization result:', result);
    
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDatabase();
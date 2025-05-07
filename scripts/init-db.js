// Simple script to initialize the database with some data
import fetch from 'node-fetch';

async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create admin user
    const adminResponse = await fetch('http://localhost:5000/api/init-admin', {
      method: 'POST',
    });
    
    const adminData = await adminResponse.json();
    console.log('Admin user:', adminData);
    
    // Create sample events
    const now = new Date();
    
    // Sample event 1: Company Conference (15-17 Nov)
    const startDate1 = new Date(now.getFullYear(), now.getMonth() + 1, 15, 9, 0);
    const endDate1 = new Date(now.getFullYear(), now.getMonth() + 1, 17, 17, 0);
    
    const event1 = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Company Conference",
        description: "Annual company conference with keynote speakers and workshops.",
        location: "Grand Conference Center",
        startDate: startDate1,
        endDate: endDate1,
      }),
    });
    
    console.log('Event 1 created:', await event1.json());
    
    // Sample event 2: Product Launch (1 Dec)
    const startDate2 = new Date(now.getFullYear(), now.getMonth() + 2, 1, 14, 0);
    const endDate2 = new Date(now.getFullYear(), now.getMonth() + 2, 1, 16, 30);
    
    const event2 = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Product Launch",
        description: "Launching our new product line with demonstrations and special guests.",
        location: "Downtown Venue",
        startDate: startDate2,
        endDate: endDate2,
      }),
    });
    
    console.log('Event 2 created:', await event2.json());
    
    // Sample event 3: Team Building (25 Oct)
    const startDate3 = new Date(now.getFullYear(), now.getMonth(), 25, 10, 0);
    const endDate3 = new Date(now.getFullYear(), now.getMonth(), 25, 15, 0);
    
    const event3 = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Team Building Workshop",
        description: "Outdoor activities designed to improve team collaboration and communication.",
        location: "City Park",
        startDate: startDate3,
        endDate: endDate3,
      }),
    });
    
    console.log('Event 3 created:', await event3.json());
    
    // Create sample courses
    const courseStart1 = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    const course1 = await fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Introduction to JavaScript",
        description: "Learn the fundamentals of JavaScript programming language.",
        instructor: "Jane Smith",
        level: "beginner",
        duration: "8 weeks",
        startDate: courseStart1,
      }),
    });
    
    console.log('Course 1 created:', await course1.json());
    
    const courseStart2 = new Date(now.getFullYear(), now.getMonth() + 2, 10);
    const course2 = await fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Advanced React Development",
        description: "Master React hooks, context API, and advanced state management.",
        instructor: "Michael Johnson",
        level: "advanced",
        duration: "6 weeks",
        startDate: courseStart2,
      }),
    });
    
    console.log('Course 2 created:', await course2.json());
    
    const courseStart3 = new Date(now.getFullYear(), now.getMonth(), 15);
    const course3 = await fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Database Design Fundamentals",
        description: "Learn relational database concepts and SQL query optimization.",
        instructor: "Sarah Wilson",
        level: "intermediate",
        duration: "4 weeks",
        startDate: courseStart3,
      }),
    });
    
    console.log('Course 3 created:', await course3.json());
    
    console.log('Database initialization completed!');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

initDatabase();
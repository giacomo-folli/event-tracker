// Script to populate the database with sample data
import fetch from 'node-fetch';

async function populateDatabase() {
  try {
    console.log('Populating database with sample data...');
    
    const now = new Date();
    
    // Add two more events
    
    // Event 2: Product Launch
    const startDate2 = new Date(now.getFullYear(), now.getMonth() + 2, 1, 14, 0);
    const endDate2 = new Date(now.getFullYear(), now.getMonth() + 2, 1, 16, 30);
    
    const event2 = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Product Launch",
        description: "Launching our new product line with demonstrations and special guests.",
        location: "Downtown Venue",
        startDate: startDate2.toISOString(),
        endDate: endDate2.toISOString(),
      }),
    });
    
    const event2Data = await event2.json();
    console.log('Event 2 created:', event2Data);
    
    // Event 3: Team Building
    const startDate3 = new Date(now.getFullYear(), now.getMonth(), 25, 10, 0);
    const endDate3 = new Date(now.getFullYear(), now.getMonth(), 25, 15, 0);
    
    const event3 = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Team Building Workshop",
        description: "Outdoor activities designed to improve team collaboration and communication.",
        location: "City Park",
        startDate: startDate3.toISOString(),
        endDate: endDate3.toISOString(),
      }),
    });
    
    const event3Data = await event3.json();
    console.log('Event 3 created:', event3Data);
    
    // Add sample courses
    
    // Course 1: JavaScript
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
        startDate: courseStart1.toISOString(),
      }),
    });
    
    const course1Data = await course1.json();
    console.log('Course 1 created:', course1Data);
    
    // Course 2: React
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
        startDate: courseStart2.toISOString(),
      }),
    });
    
    const course2Data = await course2.json();
    console.log('Course 2 created:', course2Data);
    
    // Course 3: Database Design
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
        startDate: courseStart3.toISOString(),
      }),
    });
    
    const course3Data = await course3.json();
    console.log('Course 3 created:', course3Data);
    
    console.log('Database populated successfully!');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

populateDatabase();
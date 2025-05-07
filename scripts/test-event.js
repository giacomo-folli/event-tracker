// Test script for event creation
import fetch from 'node-fetch';

async function createTestEvent() {
  try {
    const now = new Date();
    
    // Sample event: Company Conference
    const startDate = new Date(now.getFullYear(), now.getMonth() + 1, 15, 9, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 17, 17, 0);
    
    console.log('Creating event with dates:', { 
      startDate: startDate.toISOString(), 
      endDate: endDate.toISOString() 
    });
    
    const response = await fetch('http://localhost:5000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: "Company Conference",
        description: "Annual company conference with keynote speakers and workshops.",
        location: "Grand Conference Center",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });
    
    const data = await response.text();
    console.log('Response:', data);
    
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestEvent();
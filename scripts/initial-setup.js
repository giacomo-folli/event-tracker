import fetch from "node-fetch";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db, pool } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();
const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function seedAdminUser() {
  console.log("Seeding initial admin user...");
  try {
    // Check if admin user already exists
    const existingAdmin = await db
      .select()
      .from(users)
      .where(eq(users.username, "admin"))
      .limit(1);

    if (existingAdmin.length > 0) {
      console.log("Admin user already exists:", existingAdmin[0]);
      return; // Exit if admin already exists
    }

    const hashedPassword = await hashPassword("admin123");
    const result = await db
      .insert(users)
      .values({
        username: "admin",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        email: "admin@example.com",
        emailNotifications: true,
        browserNotifications: false,
        apiChangeNotifications: true,
      })
      .returning();
    console.log("Created initial admin user:", result[0]);
  } catch (error) {
    console.error("Error seeding admin user:", error);
    // Optionally re-throw or handle more gracefully depending on desired script behavior
    throw error;
  }
}

async function populateSampleData() {
  console.log("Populating database with sample data (events and courses)...");
  try {
    const now = new Date();

    // Event 1: Product Launch (from populate-db.js)
    const startDate2 = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      1,
      14,
      0
    );
    const endDate2 = new Date(now.getFullYear(), now.getMonth() + 2, 1, 16, 30);
    const event2Response = await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Product Launch",
        description:
          "Launching our new product line with demonstrations and special guests.",
        location: "Downtown Venue",
        startDate: startDate2.toISOString(),
        endDate: endDate2.toISOString(),
      }),
    });
    if (!event2Response.ok) {
      console.error(
        `Error creating Event 2: ${
          event2Response.status
        } ${await event2Response.text()}`
      );
    } else {
      const event2Data = await event2Response.json();
      console.log("Event 2 created:", event2Data);
    }

    // Event 2: Team Building (from populate-db.js)
    const startDate3 = new Date(now.getFullYear(), now.getMonth(), 25, 10, 0);
    const endDate3 = new Date(now.getFullYear(), now.getMonth(), 25, 15, 0);
    const event3Response = await fetch("http://localhost:5000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Team Building Workshop",
        description:
          "Outdoor activities designed to improve team collaboration and communication.",
        location: "City Park",
        startDate: startDate3.toISOString(),
        endDate: endDate3.toISOString(),
      }),
    });
    if (!event3Response.ok) {
      console.error(
        `Error creating Event 3: ${
          event3Response.status
        } ${await event3Response.text()}`
      );
    } else {
      const event3Data = await event3Response.json();
      console.log("Event 3 created:", event3Data);
    }

    // Course 1: JavaScript (from populate-db.js)
    const courseStart1 = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    const courseData1 = {
      title: "Introduction to JavaScript",
      description: "Learn the fundamentals of JavaScript programming language.",
      instructor: "Jane Smith",
      level: "beginner",
      duration: "8 weeks",
      startDate: courseStart1.toISOString(),
    };
    const course1Response = await fetch("http://localhost:5000/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(courseData1),
    });
    if (!course1Response.ok) {
      console.error(
        `Error creating Course 1: ${
          course1Response.status
        } ${await course1Response.text()}`
      );
    } else {
      const course1Data = await course1Response.json();
      console.log("Course 1 created:", course1Data);
    }

    // Course 2: React (from populate-db.js)
    const courseStart2 = new Date(now.getFullYear(), now.getMonth() + 2, 10);
    const course2Response = await fetch("http://localhost:5000/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Advanced React Development",
        description:
          "Master React hooks, context API, and advanced state management.",
        instructor: "Michael Johnson",
        level: "advanced",
        duration: "6 weeks",
        startDate: courseStart2.toISOString(),
      }),
    });
    if (!course2Response.ok) {
      console.error(
        `Error creating Course 2: ${
          course2Response.status
        } ${await course2Response.text()}`
      );
    } else {
      const course2Data = await course2Response.json();
      console.log("Course 2 created:", course2Data);
    }

    // Course 3: Database Design (from populate-db.js)
    const courseStart3 = new Date(now.getFullYear(), now.getMonth(), 15);
    const course3Response = await fetch("http://localhost:5000/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Database Design Fundamentals",
        description:
          "Learn relational database concepts and SQL query optimization.",
        instructor: "Sarah Wilson",
        level: "intermediate",
        duration: "4 weeks",
        startDate: courseStart3.toISOString(),
      }),
    });
    if (!course3Response.ok) {
      console.error(
        `Error creating Course 3: ${
          course3Response.status
        } ${await course3Response.text()}`
      );
    } else {
      const course3Data = await course3Response.json();
      console.log("Course 3 created:", course3Data);
    }

    console.log("Sample data (events and courses) populated successfully!");
  } catch (error) {
    console.error("Error populating sample data:", error);
    // Optionally re-throw or handle more gracefully
    throw error;
  }
}

async function runInitialSetup() {
  console.log("Starting initial database setup...");
  try {
    await seedAdminUser();
    await populateSampleData(); // This function now makes API calls
    console.log("Initial database setup completed successfully!");
  } catch (error) {
    console.error("Failed to complete initial database setup:", error);
  } finally {
    // Close the database pool only if it was used directly (seedAdminUser)
    // populateSampleData uses fetch, so no direct db connection to close here for that part.
    await pool.end();
    console.log("Database connection pool closed.");
  }
}

runInitialSetup();

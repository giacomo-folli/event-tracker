import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db, pool } from "../server/db";
import { users } from "../shared/schema";
import "dotenv/config";

const scryptAsync = promisify(scrypt);

async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}

async function seedUsers() {
  try {
    console.log("Seeding initial user...");

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

    console.log("Created initial user:", result[0]);
  } catch (error) {
    console.error("Error seeding users:", error);
  } finally {
    await pool.end();
  }
}

seedUsers();

import { db } from "./db";
import { users, events, courses, type User, type InsertUser, type UpdateUserSettings, type Event, type InsertEvent, type UpdateEvent, type Course, type InsertCourse, type UpdateCourse } from "@shared/schema";
import { eq } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUserSettings(id: number, settings: UpdateUserSettings): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(settings)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return db.select().from(events);
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }
  
  async updateEvent(id: number, updateData: UpdateEvent): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }
  
  // Course methods
  async getCourses(): Promise<Course[]> {
    return db.select().from(courses);
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }
  
  async updateCourse(id: number, updateData: UpdateCourse): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set(updateData)
      .where(eq(courses.id, id))
      .returning();
    return course || undefined;
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    const result = await db.delete(courses).where(eq(courses.id, id)).returning();
    return result.length > 0;
  }
}
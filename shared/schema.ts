import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  email: text("email"),
  emailNotifications: boolean("email_notifications").default(true),
  browserNotifications: boolean("browser_notifications").default(false),
  apiChangeNotifications: boolean("api_change_notifications").default(true),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  location: text("location"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  creatorId: integer("creator_id").references(() => users.id),
});

export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  instructor: text("instructor"),
  level: text("level"), // beginner, intermediate, advanced
  duration: text("duration"),
  startDate: timestamp("start_date"),
  creatorId: integer("creator_id").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  email: true,
  emailNotifications: true,
  browserNotifications: true,
  apiChangeNotifications: true,
});

export const updateUserSettingsSchema = createInsertSchema(users).pick({
  firstName: true,
  lastName: true,
  email: true,
  emailNotifications: true,
  browserNotifications: true,
  apiChangeNotifications: true,
});

export const insertEventSchema = createInsertSchema(events)
  .pick({
    title: true,
    description: true,
    location: true,
    creatorId: true,
  })
  .extend({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  });

export const updateEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  location: true,
  startDate: true,
  endDate: true,
});

// Extended schemas with validation
export const eventFormSchema = insertEventSchema.extend({
  title: z.string().min(1, "Title is required"),
  startDate: z.coerce.date().refine(date => date instanceof Date, {
    message: "Start date is required"
  }),
  endDate: z.coerce.date().refine(date => date instanceof Date, {
    message: "End date is required"
  }),
});

export const userSettingsFormSchema = updateUserSettingsSchema.extend({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
});

export const insertCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  instructor: true,
  level: true,
  duration: true,
  startDate: true,
  creatorId: true,
});

export const updateCourseSchema = createInsertSchema(courses).pick({
  title: true,
  description: true,
  instructor: true,
  level: true,
  duration: true,
  startDate: true,
});

// Extended schema with validation for course form
export const courseFormSchema = insertCourseSchema.extend({
  title: z.string().min(1, "Title is required"),
  instructor: z.string().min(1, "Instructor name is required"),
  level: z.string().min(1, "Level is required"),
  startDate: z.coerce.date().optional(),
});

export const passwordUpdateSchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUserSettings = z.infer<typeof updateUserSettingsSchema>;
export type User = typeof users.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type UpdateEvent = z.infer<typeof updateEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
export type Course = typeof courses.$inferSelect;

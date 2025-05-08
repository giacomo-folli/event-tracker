import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  isShared: boolean("is_shared").default(false).notNull(),
  shareToken: text("share_token").unique(),
  shareUrl: text("share_url"),
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

// Media type enum
export const mediaTypeEnum = pgEnum("media_type", ["image", "video", "document", "audio"]);

// Media table
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(), // MIME type
  mediaType: mediaTypeEnum("media_type").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
  creatorId: integer("creator_id").references(() => users.id),
});

// Course media relations (many-to-many)
export const courseMedia = pgTable("course_media", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  mediaId: integer("media_id").notNull().references(() => media.id, { onDelete: "cascade" }),
  order: integer("order").default(0), // For ordering media within a course
});

// Event participants table
export const eventParticipants = pgTable("event_participants", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  name: text("name"),
  attended: boolean("attended").default(false),
}, (table) => {
  return {
    // Ensure no duplicate emails for the same event
    uniqueEmailPerEvent: unique().on(table.eventId, table.email)
  };
});

// Training sessions table
export const trainingSessions = pgTable("training_sessions", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  hour: integer("hour").notNull(), // 0-23 hour of day
  minute: integer("minute").default(0).notNull(), // 0-59 minute of hour
  creatorId: integer("creator_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// API keys table for external service authentication
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Descriptive name for the API key
  key: text("key").notNull().unique(), // The actual API key
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"), // Optional expiration date
});

// Training sessions relations
export const trainingSessionsRelations = relations(trainingSessions, ({ one }) => ({
  course: one(courses, {
    fields: [trainingSessions.courseId],
    references: [courses.id],
  }),
  creator: one(users, {
    fields: [trainingSessions.creatorId],
    references: [users.id],
  }),
}));

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  participants: many(eventParticipants),
}));

export const eventParticipantsRelations = relations(eventParticipants, ({ one }) => ({
  event: one(events, {
    fields: [eventParticipants.eventId],
    references: [events.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  apiKeys: many(apiKeys)
}));

export const apiKeysRelations = relations(apiKeys, ({ one }) => ({
  user: one(users, {
    fields: [apiKeys.userId],
    references: [users.id],
  }),
}));

export const coursesRelations = relations(courses, ({ many }) => ({
  courseMedia: many(courseMedia),
  trainingSessions: many(trainingSessions),
  participants: many(courseParticipants),
}));

export const mediaRelations = relations(media, ({ many }) => ({
  courseMedia: many(courseMedia),
}));

// Course participants schema
export const courseParticipants = pgTable("course_participants", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").notNull().references(() => courses.id),
  email: text("email").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
  attended: boolean("attended").default(false).notNull(),
});

export type CourseParticipant = typeof courseParticipants.$inferSelect;

export const courseParticipantsRelations = relations(courseParticipants, ({ one }) => ({
  course: one(courses, {
    fields: [courseParticipants.courseId],
    references: [courses.id],
  }),
}));

export const courseMediaRelations = relations(courseMedia, ({ one }) => ({
  course: one(courses, {
    fields: [courseMedia.courseId],
    references: [courses.id],
  }),
  media: one(media, {
    fields: [courseMedia.mediaId],
    references: [media.id],
  }),
}));

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

export const updateEventSchema = createInsertSchema(events)
  .partial() // Make all fields optional for updates
  .extend({
    // But still coerce dates if they are provided
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  });

// Partial event update for sharing
export const updateEventSharingSchema = createInsertSchema(events).partial().pick({
  isShared: true,
  shareToken: true,
  shareUrl: true,
});

// Type is defined below

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

export const insertCourseSchema = createInsertSchema(courses)
  .pick({
    title: true,
    description: true,
    instructor: true,
    level: true,
    duration: true,
    creatorId: true,
  })
  .extend({
    startDate: z.coerce.date().optional(),
  });

export const updateCourseSchema = createInsertSchema(courses)
  .pick({
    title: true,
    description: true,
    instructor: true,
    level: true,
    duration: true,
  })
  .extend({
    startDate: z.coerce.date().optional(),
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
export type UpdateEventSharing = z.infer<typeof updateEventSharingSchema>;
export type Event = typeof events.$inferSelect;

export const insertMediaSchema = createInsertSchema(media)
  .pick({
    title: true,
    description: true,
    fileName: true,
    filePath: true,
    fileSize: true,
    fileType: true,
    mediaType: true,
    creatorId: true,
  });

export const updateMediaSchema = createInsertSchema(media)
  .pick({
    title: true,
    description: true,
  });

export const mediaFormSchema = insertMediaSchema.extend({
  title: z.string().min(1, "Title is required"),
  file: z.instanceof(File).optional(),
});

export const insertCourseMediaSchema = createInsertSchema(courseMedia)
  .pick({
    courseId: true,
    mediaId: true,
    order: true,
  });

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type UpdateCourse = z.infer<typeof updateCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertMedia = z.infer<typeof insertMediaSchema>;
export type UpdateMedia = z.infer<typeof updateMediaSchema>;
export type Media = typeof media.$inferSelect;

export const insertEventParticipantSchema = createInsertSchema(eventParticipants)
  .pick({
    eventId: true,
    email: true,
    name: true,
  });

export const eventParticipantFormSchema = insertEventParticipantSchema.extend({
  email: z.string().email("Please enter a valid email address"),
  name: z.string().optional(),
});

export type InsertCourseMedia = z.infer<typeof insertCourseMediaSchema>;
export type CourseMedia = typeof courseMedia.$inferSelect;

export type InsertEventParticipant = z.infer<typeof insertEventParticipantSchema>;
export type EventParticipant = typeof eventParticipants.$inferSelect;

// Course participant schemas
export const insertCourseParticipantSchema = createInsertSchema(courseParticipants)
  .pick({
    courseId: true,
    email: true,
    attended: true,
  });

export const courseParticipantFormSchema = insertCourseParticipantSchema.extend({
  email: z.string().email("Please enter a valid email address"),
});

export type InsertCourseParticipant = z.infer<typeof insertCourseParticipantSchema>;



// Training sessions schemas
export const insertTrainingSessionSchema = createInsertSchema(trainingSessions)
  .pick({
    courseId: true,
    hour: true,
    minute: true,
    creatorId: true,
  })
  .extend({
    date: z.coerce.date(),
  });

export const trainingSessionFormSchema = insertTrainingSessionSchema.extend({
  courseId: z.coerce.number().min(1, "Please select a course"),
  date: z.coerce.date().refine(date => date instanceof Date, {
    message: "Date is required"
  }),
  hour: z.coerce.number().min(0).max(23),
  minute: z.coerce.number().min(0).max(59).default(0),
  isRecurring: z.boolean().default(false),
  recurrenceCount: z.coerce.number().min(1).max(52).optional(),
  recurrenceType: z.enum(['daily', 'weekly', 'monthly']).optional(),
});

export type InsertTrainingSession = z.infer<typeof insertTrainingSessionSchema>;
export type TrainingSession = typeof trainingSessions.$inferSelect;

// API Key schemas
export const insertApiKeySchema = createInsertSchema(apiKeys)
  .pick({
    name: true,
    userId: true,
  });

export const apiKeyFormSchema = insertApiKeySchema.extend({
  name: z.string().min(1, "Name is required"),
  expiryDays: z.number().min(1).max(365).nullable().optional(),
});

export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
export type ApiKey = typeof apiKeys.$inferSelect;

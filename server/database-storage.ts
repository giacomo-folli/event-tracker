import { db } from "./db";
import { 
  users, events, courses, media, courseMedia,
  type User, type InsertUser, type UpdateUserSettings,
  type Event, type InsertEvent, type UpdateEvent,
  type Course, type InsertCourse, type UpdateCourse,
  type Media, type InsertMedia, type UpdateMedia,
  type CourseMedia, type InsertCourseMedia
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
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
  
  // Media methods
  async getMedia(): Promise<Media[]> {
    return db.select().from(media).orderBy(desc(media.uploadedAt));
  }
  
  async getMediaById(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select().from(media).where(eq(media.id, id));
    return mediaItem || undefined;
  }
  
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const [mediaItem] = await db
      .insert(media)
      .values(insertMedia)
      .returning();
    return mediaItem;
  }
  
  async updateMedia(id: number, updateData: UpdateMedia): Promise<Media | undefined> {
    const [mediaItem] = await db
      .update(media)
      .set(updateData)
      .where(eq(media.id, id))
      .returning();
    return mediaItem || undefined;
  }
  
  async deleteMedia(id: number): Promise<boolean> {
    // This will cascade delete any course-media relationships
    const result = await db.delete(media).where(eq(media.id, id)).returning();
    return result.length > 0;
  }
  
  // Course-media relation methods
  async getCourseMedia(courseId: number): Promise<(Media & { order: number })[]> {
    const result = await db
      .select({
        ...media,
        order: courseMedia.order
      })
      .from(courseMedia)
      .innerJoin(media, eq(courseMedia.mediaId, media.id))
      .where(eq(courseMedia.courseId, courseId))
      .orderBy(asc(courseMedia.order));
    
    return result;
  }
  
  async linkMediaToCourse(courseId: number, mediaId: number, order: number = 0): Promise<CourseMedia> {
    // Check if the relationship already exists
    const [existing] = await db
      .select()
      .from(courseMedia)
      .where(
        and(
          eq(courseMedia.courseId, courseId),
          eq(courseMedia.mediaId, mediaId)
        )
      );
    
    if (existing) {
      return existing;
    }
    
    // Create new relationship
    const [relation] = await db
      .insert(courseMedia)
      .values({
        courseId,
        mediaId,
        order
      })
      .returning();
    
    return relation;
  }
  
  async unlinkMediaFromCourse(courseId: number, mediaId: number): Promise<boolean> {
    const result = await db
      .delete(courseMedia)
      .where(
        and(
          eq(courseMedia.courseId, courseId),
          eq(courseMedia.mediaId, mediaId)
        )
      )
      .returning();
    
    return result.length > 0;
  }
  
  async updateMediaOrder(courseId: number, mediaId: number, order: number): Promise<CourseMedia | undefined> {
    const [relation] = await db
      .update(courseMedia)
      .set({ order })
      .where(
        and(
          eq(courseMedia.courseId, courseId),
          eq(courseMedia.mediaId, mediaId)
        )
      )
      .returning();
    
    return relation || undefined;
  }
}
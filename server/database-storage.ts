import { db, pool } from "./db";
import { 
  users, events, courses, media, courseMedia, eventParticipants,
  type User, type InsertUser, type UpdateUserSettings,
  type Event, type InsertEvent, type UpdateEvent,
  type Course, type InsertCourse, type UpdateCourse,
  type Media, type InsertMedia, type UpdateMedia,
  type CourseMedia, type InsertCourseMedia,
  type EventParticipant, type InsertEventParticipant
} from "@shared/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    // Create PostgreSQL session store
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true,
      tableName: 'session'
    });
  }
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
    return await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      startDate: events.startDate,
      endDate: events.endDate,
      creatorId: events.creatorId,
      isShared: events.isShared,
      shareToken: events.shareToken,
      shareUrl: events.shareUrl
    }).from(events);
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      startDate: events.startDate,
      endDate: events.endDate,
      creatorId: events.creatorId,
      isShared: events.isShared,
      shareToken: events.shareToken,
      shareUrl: events.shareUrl
    }).from(events).where(eq(events.id, id));
    return event || undefined;
  }
  
  async getEventByToken(token: string): Promise<Event | undefined> {
    const [event] = await db.select({
      id: events.id,
      title: events.title,
      description: events.description,
      location: events.location,
      startDate: events.startDate,
      endDate: events.endDate,
      creatorId: events.creatorId,
      isShared: events.isShared,
      shareToken: events.shareToken,
      shareUrl: events.shareUrl
    }).from(events).where(eq(events.shareToken, token));
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
    console.log(`Updating event with ID ${id} with data:`, updateData);
    try {
      const [event] = await db
        .update(events)
        .set(updateData)
        .where(eq(events.id, id))
        .returning();
      
      console.log("Updated event result:", event);
      return event || undefined;
    } catch (error) {
      console.error("Error in updateEvent:", error);
      throw error;
    }
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id)).returning();
    return result.length > 0;
  }
  
  // Course methods
  async getCourses(): Promise<Course[]> {
    return await db.select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      startDate: courses.startDate,
      creatorId: courses.creatorId,
      instructor: courses.instructor,
      level: courses.level,
      duration: courses.duration
    }).from(courses);
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select({
      id: courses.id,
      title: courses.title,
      description: courses.description,
      startDate: courses.startDate,
      creatorId: courses.creatorId,
      instructor: courses.instructor,
      level: courses.level,
      duration: courses.duration
    }).from(courses).where(eq(courses.id, id));
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
    return await db.select({
      id: media.id,
      title: media.title,
      description: media.description,
      fileName: media.fileName,
      filePath: media.filePath,
      fileSize: media.fileSize,
      fileType: media.fileType,
      mediaType: media.mediaType,
      uploadedAt: media.uploadedAt,
      creatorId: media.creatorId
    }).from(media).orderBy(desc(media.uploadedAt));
  }
  
  async getMediaById(id: number): Promise<Media | undefined> {
    const [mediaItem] = await db.select({
      id: media.id,
      title: media.title,
      description: media.description,
      fileName: media.fileName,
      filePath: media.filePath,
      fileSize: media.fileSize,
      fileType: media.fileType,
      mediaType: media.mediaType,
      uploadedAt: media.uploadedAt,
      creatorId: media.creatorId
    }).from(media).where(eq(media.id, id));
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
        id: media.id,
        title: media.title,
        description: media.description,
        fileName: media.fileName,
        filePath: media.filePath,
        fileSize: media.fileSize,
        fileType: media.fileType,
        mediaType: media.mediaType,
        uploadedAt: media.uploadedAt,
        creatorId: media.creatorId,
        order: courseMedia.order
      })
      .from(courseMedia)
      .innerJoin(media, eq(courseMedia.mediaId, media.id))
      .where(eq(courseMedia.courseId, courseId))
      .orderBy(asc(courseMedia.order));
    
    return result as any;
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

  // Event participants methods
  async getEventParticipants(eventId: number): Promise<EventParticipant[]> {
    return await db.select()
      .from(eventParticipants)
      .where(eq(eventParticipants.eventId, eventId))
      .orderBy(desc(eventParticipants.registeredAt));
  }

  async getEventParticipant(id: number): Promise<EventParticipant | undefined> {
    const [participant] = await db.select()
      .from(eventParticipants)
      .where(eq(eventParticipants.id, id));
    return participant || undefined;
  }

  async createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    try {
      const [newParticipant] = await db
        .insert(eventParticipants)
        .values(participant)
        .returning();
      return newParticipant;
    } catch (error: any) {
      // Handle unique constraint violation (same email for same event)
      if (error.message?.includes('uniqueEmailPerEvent')) {
        throw new Error('This email is already registered for this event');
      }
      throw error;
    }
  }

  async updateEventParticipantAttendance(id: number, attended: boolean): Promise<EventParticipant | undefined> {
    const [participant] = await db
      .update(eventParticipants)
      .set({ attended })
      .where(eq(eventParticipants.id, id))
      .returning();
    return participant || undefined;
  }

  async deleteEventParticipant(id: number): Promise<boolean> {
    const result = await db
      .delete(eventParticipants)
      .where(eq(eventParticipants.id, id))
      .returning();
    return result.length > 0;
  }
}
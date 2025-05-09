import { db, pool } from "./db";
import { 
  users, events, courses, media, courseMedia, eventParticipants, trainingSessions, apiKeys, courseParticipants,
  type User, type InsertUser, type UpdateUserSettings,
  type Event, type InsertEvent, type UpdateEvent,
  type Course, type InsertCourse, type UpdateCourse,
  type Media, type InsertMedia, type UpdateMedia,
  type CourseMedia, type InsertCourseMedia,
  type EventParticipant, type InsertEventParticipant,
  type TrainingSession, type InsertTrainingSession,
  type ApiKey, type CourseParticipant, type InsertCourseParticipant
} from "@shared/schema";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import * as crypto from "crypto";

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
  
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
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
  
  // Training sessions methods
  async getTrainingSessions(): Promise<TrainingSession[]> {
    return await db.select().from(trainingSessions);
  }
  
  async getTrainingSessionsByMonth(year: number, month: number): Promise<TrainingSession[]> {
    // Create start and end date for the month
    const startDate = new Date(year, month - 1, 1); // month is 1-12, Date expects 0-11
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return await db.select()
      .from(trainingSessions)
      .where(
        and(
          gte(trainingSessions.date, startDate),
          lte(trainingSessions.date, endDate)
        )
      )
      .orderBy(asc(trainingSessions.date), asc(trainingSessions.hour));
  }
  
  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    const [session] = await db.select()
      .from(trainingSessions)
      .where(eq(trainingSessions.id, id));
    return session || undefined;
  }
  
  async createTrainingSession(insertSession: InsertTrainingSession): Promise<TrainingSession> {
    const [session] = await db
      .insert(trainingSessions)
      .values(insertSession)
      .returning();
    return session;
  }
  
  async deleteTrainingSession(id: number): Promise<boolean> {
    const result = await db
      .delete(trainingSessions)
      .where(eq(trainingSessions.id, id))
      .returning();
    return result.length > 0;
  }
  
  // API keys methods
  async getUserApiKeys(userId: number): Promise<ApiKey[]> {
    return await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.userId, userId))
      .orderBy(desc(apiKeys.createdAt));
  }
  
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.id, id));
    return apiKey || undefined;
  }
  
  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    const [apiKey] = await db.select()
      .from(apiKeys)
      .where(
        and(
          eq(apiKeys.key, key),
          eq(apiKeys.isActive, true)
        )
      );
    return apiKey || undefined;
  }
  
  async createApiKey(userId: number, name: string, expiryDays?: number): Promise<ApiKey> {
    // Generate a random API key (32 bytes hex string)
    const randomKey = crypto.randomBytes(32).toString('hex');
    const key = 'ak_' + randomKey;
    
    // Set expiry date if provided
    let expiresAt = null;
    if (expiryDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
    }
    
    const [apiKey] = await db
      .insert(apiKeys)
      .values({
        name,
        key,
        userId,
        isActive: true,
        expiresAt
      })
      .returning();
      
    return apiKey;
  }
  
  async updateApiKeyLastUsed(id: number): Promise<ApiKey | undefined> {
    const lastUsedAt = new Date();
    
    const [apiKey] = await db
      .update(apiKeys)
      .set({ lastUsedAt })
      .where(eq(apiKeys.id, id))
      .returning();
      
    return apiKey || undefined;
  }
  
  async toggleApiKeyStatus(id: number, isActive: boolean): Promise<ApiKey | undefined> {
    const [apiKey] = await db
      .update(apiKeys)
      .set({ isActive })
      .where(eq(apiKeys.id, id))
      .returning();
      
    return apiKey || undefined;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    const result = await db
      .delete(apiKeys)
      .where(eq(apiKeys.id, id))
      .returning();
      
    return result.length > 0;
  }
  
  // Course participants methods
  async getCourseParticipants(courseId: number): Promise<CourseParticipant[]> {
    return await db.select()
      .from(courseParticipants)
      .where(eq(courseParticipants.courseId, courseId))
      .orderBy(desc(courseParticipants.registeredAt));
  }

  async getCourseParticipant(id: number): Promise<CourseParticipant | undefined> {
    const [participant] = await db.select()
      .from(courseParticipants)
      .where(eq(courseParticipants.id, id));
    return participant || undefined;
  }

  async createCourseParticipant(participant: InsertCourseParticipant): Promise<CourseParticipant> {
    try {
      // Check if the course exists
      const [course] = await db.select()
        .from(courses)
        .where(eq(courses.id, participant.courseId));
      
      if (!course) {
        throw new Error('Course not found');
      }

      // Check if email already exists for this course
      const existingParticipants = await db.select()
        .from(courseParticipants)
        .where(and(
          eq(courseParticipants.courseId, participant.courseId),
          eq(courseParticipants.email, participant.email)
        ));
      
      if (existingParticipants.length > 0) {
        throw new Error('This email is already registered for this course');
      }
      
      const [newParticipant] = await db
        .insert(courseParticipants)
        .values(participant)
        .returning();
      return newParticipant;
    } catch (error: any) {
      if (error.message?.includes('registered for this course') || 
          error.message?.includes('Course not found')) {
        throw error;
      }
      console.error('Error creating course participant:', error);
      throw new Error('Failed to register participant');
    }
  }

  async updateCourseParticipantAttendance(id: number, attended: boolean): Promise<CourseParticipant | undefined> {
    const [participant] = await db
      .update(courseParticipants)
      .set({ attended })
      .where(eq(courseParticipants.id, id))
      .returning();
    return participant || undefined;
  }
}
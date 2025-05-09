import { 
  users, events, courses, media, courseMedia, eventParticipants, trainingSessions, apiKeys, courseParticipants,
  type User, type InsertUser, type UpdateUserSettings,
  type Event, type InsertEvent, type UpdateEvent,
  type Course, type InsertCourse, type UpdateCourse,
  type Media, type InsertMedia, type UpdateMedia,
  type CourseMedia, type InsertCourseMedia,
  type EventParticipant, type InsertEventParticipant,
  type TrainingSession, type InsertTrainingSession,
  type ApiKey, type InsertApiKey,
  type CourseParticipant, type InsertCourseParticipant
} from "@shared/schema";
import { DatabaseStorage } from "./database-storage";
import session from "express-session";

export interface IStorage {
  // Session store for authentication
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSettings(id: number, settings: UpdateUserSettings): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  getEventByToken(token: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: UpdateEvent): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Course methods
  getCourses(): Promise<Course[]>;
  getCourse(id: number): Promise<Course | undefined>;
  getCourseByToken(token: string): Promise<Course | undefined>;
  createCourse(course: InsertCourse): Promise<Course>;
  updateCourse(id: number, course: UpdateCourse): Promise<Course | undefined>;
  deleteCourse(id: number): Promise<boolean>;
  
  // Media methods
  getMedia(): Promise<Media[]>;
  getMediaById(id: number): Promise<Media | undefined>;
  createMedia(media: InsertMedia): Promise<Media>;
  updateMedia(id: number, media: UpdateMedia): Promise<Media | undefined>;
  deleteMedia(id: number): Promise<boolean>;
  
  // Course-media relation methods
  getCourseMedia(courseId: number): Promise<(Media & { order: number })[]>;
  linkMediaToCourse(courseId: number, mediaId: number, order?: number): Promise<CourseMedia>;
  unlinkMediaFromCourse(courseId: number, mediaId: number): Promise<boolean>;
  updateMediaOrder(courseId: number, mediaId: number, order: number): Promise<CourseMedia | undefined>;
  
  // Event participants methods
  getEventParticipants(eventId: number): Promise<EventParticipant[]>;
  getEventParticipant(id: number): Promise<EventParticipant | undefined>;
  createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant>;
  updateEventParticipantAttendance(id: number, attended: boolean): Promise<EventParticipant | undefined>;
  deleteEventParticipant(id: number): Promise<boolean>;
  
  // Training sessions methods
  getTrainingSessions(): Promise<TrainingSession[]>;
  getTrainingSessionsByMonth(year: number, month: number): Promise<TrainingSession[]>;
  getTrainingSession(id: number): Promise<TrainingSession | undefined>;
  createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession>;
  deleteTrainingSession(id: number): Promise<boolean>;
  
  // Course participants methods
  getCourseParticipants(courseId: number): Promise<CourseParticipant[]>;
  getCourseParticipant(id: number): Promise<CourseParticipant | undefined>;
  createCourseParticipant(participant: InsertCourseParticipant): Promise<CourseParticipant>;
  updateCourseParticipantAttendance(id: number, attended: boolean): Promise<CourseParticipant | undefined>;
  
  // API keys methods
  getUserApiKeys(userId: number): Promise<ApiKey[]>;
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKeyByKey(key: string): Promise<ApiKey | undefined>;
  createApiKey(userId: number, name: string, expiryDays?: number): Promise<ApiKey>;
  updateApiKeyLastUsed(id: number): Promise<ApiKey | undefined>;
  toggleApiKeyStatus(id: number, isActive: boolean): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private courses: Map<number, Course>;
  private media: Map<number, Media> = new Map();
  private courseMediaRelations: Map<string, CourseMedia> = new Map(); // Key is `${courseId}-${mediaId}`
  private eventParticipants: Map<number, EventParticipant> = new Map();
  private userCurrentId: number;
  private eventCurrentId: number;
  private courseCurrentId: number; 
  private mediaCurrentId: number = 1;
  private eventParticipantCurrentId: number = 1;
  public sessionStore: session.Store;

  constructor() {
    // Create memory store for session storage
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    this.users = new Map();
    this.events = new Map();
    this.courses = new Map();
    this.userCurrentId = 1;
    this.eventCurrentId = 1;
    this.courseCurrentId = 1;
    
    // Add a default admin user
    this.createUser({
      username: "admin",
      password: "password",
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@example.com",
      emailNotifications: true,
      browserNotifications: false,
      apiChangeNotifications: true,
    });
    
    // Add some example events
    const now = new Date();
    
    // Sample event 1: Company Conference (15-17 Nov)
    const startDate1 = new Date(now.getFullYear(), now.getMonth() + 1, 15, 9, 0);
    const endDate1 = new Date(now.getFullYear(), now.getMonth() + 1, 17, 17, 0);
    
    this.createEvent({
      title: "Company Conference",
      description: "Annual company conference with keynote speakers and workshops.",
      location: "Grand Conference Center",
      startDate: startDate1,
      endDate: endDate1,
      creatorId: 1
    });
    
    // Sample event 2: Product Launch (1 Dec)
    const startDate2 = new Date(now.getFullYear(), now.getMonth() + 2, 1, 14, 0);
    const endDate2 = new Date(now.getFullYear(), now.getMonth() + 2, 1, 16, 30);
    
    this.createEvent({
      title: "Product Launch",
      description: "Launching our new product line with demonstrations and special guests.",
      location: "Downtown Venue",
      startDate: startDate2,
      endDate: endDate2,
      creatorId: 1
    });
    
    // Sample event 3: Team Building (25 Oct)
    const startDate3 = new Date(now.getFullYear(), now.getMonth(), 25, 10, 0);
    const endDate3 = new Date(now.getFullYear(), now.getMonth(), 25, 15, 0);
    
    this.createEvent({
      title: "Team Building Workshop",
      description: "Outdoor activities designed to improve team collaboration and communication.",
      location: "City Park",
      startDate: startDate3,
      endDate: endDate3,
      creatorId: 1
    });
    
    // Add sample courses
    const courseStart1 = new Date(now.getFullYear(), now.getMonth() + 1, 5);
    this.createCourse({
      title: "Introduction to JavaScript",
      description: "Learn the fundamentals of JavaScript programming language.",
      instructor: "Jane Smith",
      level: "beginner",
      duration: "8 weeks",
      startDate: courseStart1,
      creatorId: 1
    });
    
    const courseStart2 = new Date(now.getFullYear(), now.getMonth() + 2, 10);
    this.createCourse({
      title: "Advanced React Development",
      description: "Master React hooks, context API, and advanced state management.",
      instructor: "Michael Johnson",
      level: "advanced",
      duration: "6 weeks",
      startDate: courseStart2,
      creatorId: 1
    });
    
    const courseStart3 = new Date(now.getFullYear(), now.getMonth(), 15);
    this.createCourse({
      title: "Database Design Fundamentals",
      description: "Learn relational database concepts and SQL query optimization.",
      instructor: "Sarah Wilson",
      level: "intermediate",
      duration: "4 weeks",
      startDate: courseStart3,
      creatorId: 1
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserSettings(id: number, settings: UpdateUserSettings): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...settings };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async getEventByToken(token: string): Promise<Event | undefined> {
    return Array.from(this.events.values()).find(
      (event) => event.shareToken === token && event.isShared === true
    );
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventCurrentId++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }
  
  async updateEvent(id: number, updateData: UpdateEvent): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updateData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Course methods
  async getCourses(): Promise<Course[]> {
    return Array.from(this.courses.values());
  }
  
  async getCourse(id: number): Promise<Course | undefined> {
    return this.courses.get(id);
  }
  
  async getCourseByToken(token: string): Promise<Course | undefined> {
    return Array.from(this.courses.values()).find(
      (course) => course.shareToken === token && course.isShared === true
    );
  }
  
  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const id = this.courseCurrentId++;
    const course: Course = { ...insertCourse, id };
    this.courses.set(id, course);
    return course;
  }
  
  async updateCourse(id: number, updateData: UpdateCourse): Promise<Course | undefined> {
    const course = this.courses.get(id);
    if (!course) return undefined;
    
    const updatedCourse = { ...course, ...updateData };
    this.courses.set(id, updatedCourse);
    return updatedCourse;
  }
  
  async deleteCourse(id: number): Promise<boolean> {
    return this.courses.delete(id);
  }

  // Media methods
  async getMedia(): Promise<Media[]> {
    return Array.from(this.media.values());
  }
  
  async getMediaById(id: number): Promise<Media | undefined> {
    return this.media.get(id);
  }
  
  async createMedia(insertMedia: InsertMedia): Promise<Media> {
    const id = this.mediaCurrentId++;
    const media: Media = { 
      ...insertMedia, 
      id,
      description: insertMedia.description ?? null,
      creatorId: insertMedia.creatorId ?? null 
    };
    this.media.set(id, media);
    return media;
  }
  
  async updateMedia(id: number, updateData: UpdateMedia): Promise<Media | undefined> {
    const mediaItem = this.media.get(id);
    if (!mediaItem) return undefined;
    
    const updatedMedia = { ...mediaItem, ...updateData };
    this.media.set(id, updatedMedia);
    return updatedMedia;
  }
  
  async deleteMedia(id: number): Promise<boolean> {
    return this.media.delete(id);
  }
  
  // Course-media relation methods
  async getCourseMedia(courseId: number): Promise<(Media & { order: number })[]> {
    const courseMediaItems: CourseMedia[] = Array.from(this.courseMediaRelations.values())
      .filter(cm => cm.courseId === courseId);
    
    const result: (Media & { order: number })[] = [];
    
    for (const cm of courseMediaItems) {
      const media = this.media.get(cm.mediaId);
      if (media) {
        result.push({ ...media, order: cm.order });
      }
    }
    
    return result;
  }
  
  async linkMediaToCourse(courseId: number, mediaId: number, order: number = 0): Promise<CourseMedia> {
    const key = `${courseId}-${mediaId}`;
    const relation: CourseMedia = { id: courseId * 1000 + mediaId, courseId, mediaId, order };
    this.courseMediaRelations.set(key, relation);
    return relation;
  }
  
  async unlinkMediaFromCourse(courseId: number, mediaId: number): Promise<boolean> {
    const key = `${courseId}-${mediaId}`;
    return this.courseMediaRelations.delete(key);
  }
  
  async updateMediaOrder(courseId: number, mediaId: number, order: number): Promise<CourseMedia | undefined> {
    const key = `${courseId}-${mediaId}`;
    const relation = this.courseMediaRelations.get(key);
    if (!relation) return undefined;
    
    const updatedRelation = { ...relation, order };
    this.courseMediaRelations.set(key, updatedRelation);
    return updatedRelation;
  }

  // Event participants methods
  async getEventParticipants(eventId: number): Promise<EventParticipant[]> {
    return Array.from(this.eventParticipants.values())
      .filter(participant => participant.eventId === eventId);
  }

  async getEventParticipant(id: number): Promise<EventParticipant | undefined> {
    return this.eventParticipants.get(id);
  }

  async createEventParticipant(participant: InsertEventParticipant): Promise<EventParticipant> {
    // Check if email already exists for this event
    const exists = Array.from(this.eventParticipants.values())
      .some(p => p.eventId === participant.eventId && p.email === participant.email);
    
    if (exists) {
      throw new Error('This email is already registered for this event');
    }

    const id = this.eventParticipantCurrentId++;
    const now = new Date();
    const eventParticipant: EventParticipant = {
      ...participant,
      id,
      name: participant.name || null,
      attended: null,
      registeredAt: now
    };
    
    this.eventParticipants.set(id, eventParticipant);
    return eventParticipant;
  }

  async updateEventParticipantAttendance(id: number, attended: boolean): Promise<EventParticipant | undefined> {
    const participant = this.eventParticipants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, attended };
    this.eventParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }

  async deleteEventParticipant(id: number): Promise<boolean> {
    return this.eventParticipants.delete(id);
  }
  
  // Training sessions methods
  private trainingSessions: Map<number, TrainingSession> = new Map();
  private trainingSessionCurrentId: number = 1;
  
  async getTrainingSessions(): Promise<TrainingSession[]> {
    return Array.from(this.trainingSessions.values());
  }
  
  async getTrainingSessionsByMonth(year: number, month: number): Promise<TrainingSession[]> {
    // Create start and end date for the month
    const startDate = new Date(year, month - 1, 1); // month is 1-12, Date expects 0-11
    const endDate = new Date(year, month, 0); // Last day of the month
    
    return Array.from(this.trainingSessions.values())
      .filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate;
      })
      .sort((a, b) => {
        // Sort by date, then by hour
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (dateA.getTime() === dateB.getTime()) {
          return a.hour - b.hour;
        }
        return dateA.getTime() - dateB.getTime();
      });
  }
  
  async getTrainingSession(id: number): Promise<TrainingSession | undefined> {
    return this.trainingSessions.get(id);
  }
  
  async createTrainingSession(session: InsertTrainingSession): Promise<TrainingSession> {
    const id = this.trainingSessionCurrentId++;
    const createdAt = new Date();
    const trainingSession: TrainingSession = { ...session, id, createdAt };
    this.trainingSessions.set(id, trainingSession);
    return trainingSession;
  }
  
  async deleteTrainingSession(id: number): Promise<boolean> {
    return this.trainingSessions.delete(id);
  }
  
  // API keys methods
  private apiKeys: Map<number, ApiKey> = new Map();
  private apiKeyCurrentId: number = 1;
  
  async getUserApiKeys(userId: number): Promise<ApiKey[]> {
    return Array.from(this.apiKeys.values())
      .filter(key => key.userId === userId);
  }
  
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }
  
  async getApiKeyByKey(key: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values())
      .find(apiKey => apiKey.key === key && apiKey.isActive);
  }
  
  async createApiKey(userId: number, name: string, expiryDays?: number): Promise<ApiKey> {
    const id = this.apiKeyCurrentId++;
    const createdAt = new Date();
    
    // Generate a random API key (32 bytes hex string)
    const key = require('crypto').randomBytes(32).toString('hex');
    
    // Set expiry date if provided
    let expiresAt = null;
    if (expiryDays) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiryDays);
    }
    
    const apiKey: ApiKey = {
      id,
      name,
      key,
      userId,
      isActive: true,
      createdAt,
      lastUsedAt: null,
      expiresAt
    };
    
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }
  
  async updateApiKeyLastUsed(id: number): Promise<ApiKey | undefined> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) return undefined;
    
    const updatedApiKey = { ...apiKey, lastUsedAt: new Date() };
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  }
  
  async toggleApiKeyStatus(id: number, isActive: boolean): Promise<ApiKey | undefined> {
    const apiKey = this.apiKeys.get(id);
    if (!apiKey) return undefined;
    
    const updatedApiKey = { ...apiKey, isActive };
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  }
  
  async deleteApiKey(id: number): Promise<boolean> {
    return this.apiKeys.delete(id);
  }

  // Course participants implementation
  private courseParticipants: Map<number, CourseParticipant> = new Map();
  private courseParticipantCurrentId: number = 1;

  async getCourseParticipants(courseId: number): Promise<CourseParticipant[]> {
    return Array.from(this.courseParticipants.values())
      .filter(participant => participant.courseId === courseId);
  }

  async getCourseParticipant(id: number): Promise<CourseParticipant | undefined> {
    return this.courseParticipants.get(id);
  }

  async createCourseParticipant(participant: InsertCourseParticipant): Promise<CourseParticipant> {
    // Check if email already exists for this course
    const exists = Array.from(this.courseParticipants.values())
      .some(p => p.courseId === participant.courseId && p.email === participant.email);
    
    if (exists) {
      throw new Error('This email is already registered for this course');
    }

    const id = this.courseParticipantCurrentId++;
    const now = new Date();
    const courseParticipant: CourseParticipant = {
      ...participant,
      id,
      registeredAt: now,
      attended: participant.attended ?? false
    };
    
    this.courseParticipants.set(id, courseParticipant);
    return courseParticipant;
  }

  async updateCourseParticipantAttendance(id: number, attended: boolean): Promise<CourseParticipant | undefined> {
    const participant = this.courseParticipants.get(id);
    if (!participant) return undefined;
    
    const updatedParticipant = { ...participant, attended };
    this.courseParticipants.set(id, updatedParticipant);
    return updatedParticipant;
  }
}

// Use the DatabaseStorage implementation instead of MemStorage
export const storage = new DatabaseStorage();
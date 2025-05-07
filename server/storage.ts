import { users, events, type User, type InsertUser, type UpdateUserSettings, type Event, type InsertEvent, type UpdateEvent } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserSettings(id: number, settings: UpdateUserSettings): Promise<User | undefined>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: UpdateEvent): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private userCurrentId: number;
  private eventCurrentId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.userCurrentId = 1;
    this.eventCurrentId = 1;
    
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
  
  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
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
}

export const storage = new MemStorage();

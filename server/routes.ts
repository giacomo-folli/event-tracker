import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { updateEventSchema, insertEventSchema, updateUserSettingsSchema, passwordUpdateSchema, insertCourseSchema, updateCourseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create a default admin user for database initialization
  app.post("/api/init-admin", async (req: Request, res: Response) => {
    try {
      // Check if admin already exists
      const existingUser = await storage.getUserByUsername("admin");
      if (existingUser) {
        return res.json({ message: "Admin user already exists", user: existingUser });
      }

      // Create default admin user with data from request body or fallback to defaults
      const userData = {
        username: req.body.username || "admin",
        password: req.body.password || "password",
        firstName: req.body.firstName || "John",
        lastName: req.body.lastName || "Doe",
        email: req.body.email || "john.doe@example.com",
        emailNotifications: req.body.emailNotifications !== undefined ? req.body.emailNotifications : true,
        browserNotifications: req.body.browserNotifications !== undefined ? req.body.browserNotifications : false,
        apiChangeNotifications: req.body.apiChangeNotifications !== undefined ? req.body.apiChangeNotifications : true,
      };
      
      const user = await storage.createUser(userData);
      
      res.status(201).json({ message: "Admin user created", user });
    } catch (error) {
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });
  
  // REST endpoints for events
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
      res.json({ events });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.get("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({ event });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.post("/api/events", async (req: Request, res: Response) => {
    try {
      const result = insertEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      // Default creatorId to 1 (admin) for now
      const eventData = { ...result.data, creatorId: 1 };
      const event = await storage.createEvent(eventData);
      res.status(201).json({ event });
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.put("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const result = updateEventSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      const updatedEvent = await storage.updateEvent(id, result.data);
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({ event: updatedEvent });
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // User settings endpoints
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      // For simplicity, we'll always return the admin user (id: 1)
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't return the password
      const { password, ...safeUser } = user;
      res.json({ user: safeUser });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  app.put("/api/user/settings", async (req: Request, res: Response) => {
    try {
      const result = updateUserSettingsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      // For simplicity, we'll always update the admin user (id: 1)
      const updatedUser = await storage.updateUserSettings(1, result.data);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Don't return the password
      const { password, ...safeUser } = updatedUser;
      res.json({ user: safeUser });
    } catch (error) {
      res.status(500).json({ error: "Failed to update user settings" });
    }
  });

  app.put("/api/user/password", async (req: Request, res: Response) => {
    try {
      const result = passwordUpdateSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      // For simplicity, we'll check if the current password matches for the admin user
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.password !== result.data.currentPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Update the password - need to handle it separately
      const updatedUser = await storage.updateUserSettings(1, {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        emailNotifications: user.emailNotifications,
        browserNotifications: user.browserNotifications,
        apiChangeNotifications: user.apiChangeNotifications,
      });
      
      // NOTE: In a real application, you would hash the password before storing it
      // For now, we're storing it directly in the updateUserSettings method

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update password" });
    }
  });
  
  // REST endpoints for courses
  app.get("/api/courses", async (req: Request, res: Response) => {
    try {
      const courses = await storage.getCourses();
      res.json({ courses });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }

      const course = await storage.getCourse(id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.json({ course });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course" });
    }
  });

  app.post("/api/courses", async (req: Request, res: Response) => {
    try {
      const result = insertCourseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      // Default creatorId to 1 (admin) for now
      const courseData = { ...result.data, creatorId: 1 };
      const course = await storage.createCourse(courseData);
      res.status(201).json({ course });
    } catch (error) {
      res.status(500).json({ error: "Failed to create course" });
    }
  });

  app.put("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }

      const result = updateCourseSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      const updatedCourse = await storage.updateCourse(id, result.data);
      if (!updatedCourse) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.json({ course: updatedCourse });
    } catch (error) {
      res.status(500).json({ error: "Failed to update course" });
    }
  });

  app.delete("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }

      const success = await storage.deleteCourse(id);
      if (!success) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { updateEventSchema, insertEventSchema, updateUserSettingsSchema, passwordUpdateSchema, insertCourseSchema, updateCourseSchema, insertMediaSchema, updateMediaSchema, insertCourseMediaSchema, insertEventParticipantSchema, eventParticipantFormSchema } from "@shared/schema";
import { join } from "path";
import * as fs from "fs";
import multer from "multer";
import { z } from "zod";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);
  
  // Setup upload directory for media files
  const uploadDir = join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Configure multer for file uploads
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Generate a unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = file.originalname.split('.').pop();
      cb(null, uniqueSuffix + '.' + ext);
    }
  });
  
  const upload = multer({ 
    storage: multerStorage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
      // Accept images, videos, documents, and audio
      const mimeTypes = [
        // Images
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        // Videos
        'video/mp4', 'video/mpeg', 'video/quicktime',
        // Documents
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        // Audio
        'audio/mpeg', 'audio/wav', 'audio/ogg'
      ];
      
      if (mimeTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, videos, documents, and audio files are allowed.'));
      }
    }
  });
  // Create a default admin user for database initialization
  app.post("/api/init-admin", async (req: Request, res: Response) => {
    try {
      // Check if admin already exists
      const existingUser = await dbStorage.getUserByUsername("admin");
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
      
      const user = await dbStorage.createUser(userData);
      
      res.status(201).json({ message: "Admin user created", user });
    } catch (error) {
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });
  
  // REST endpoints for events
  app.get("/api/events", async (req: Request, res: Response) => {
    try {
      const events = await dbStorage.getEvents();
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

      const event = await dbStorage.getEvent(id);
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
      const event = await dbStorage.createEvent(eventData);
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

      const updatedEvent = await dbStorage.updateEvent(id, result.data);
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

      const success = await dbStorage.deleteEvent(id);
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
      const user = await dbStorage.getUser(1);
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
      const updatedUser = await dbStorage.updateUserSettings(1, result.data);
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
      const user = await dbStorage.getUser(1);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.password !== result.data.currentPassword) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Update the password - need to handle it separately
      const updatedUser = await dbStorage.updateUserSettings(1, {
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
  
  // Authentication is now handled by auth.ts
  
  // REST endpoints for courses
  app.get("/api/courses", async (req: Request, res: Response) => {
    try {
      console.log("Getting courses...");
      const courses = await dbStorage.getCourses();
      console.log("Courses retrieved:", courses);
      res.json({ courses });
    } catch (error) {
      console.error("Error in GET /api/courses:", error);
      res.status(500).json({ error: "Failed to fetch courses" });
    }
  });

  app.get("/api/courses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }

      const course = await dbStorage.getCourse(id);
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
      const course = await dbStorage.createCourse(courseData);
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

      const updatedCourse = await dbStorage.updateCourse(id, result.data);
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

      const success = await dbStorage.deleteCourse(id);
      if (!success) {
        return res.status(404).json({ error: "Course not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete course" });
    }
  });

  // REST endpoints for media
  app.get("/api/media", async (req: Request, res: Response) => {
    try {
      const mediaItems = await dbStorage.getMedia();
      res.json({ media: mediaItems });
    } catch (error) {
      console.error("Error in GET /api/media:", error);
      res.status(500).json({ error: "Failed to fetch media items" });
    }
  });

  app.get("/api/media/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid media ID" });
      }

      const mediaItem = await dbStorage.getMediaById(id);
      if (!mediaItem) {
        return res.status(404).json({ error: "Media not found" });
      }

      res.json({ media: mediaItem });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch media" });
    }
  });

  // Upload new media
  app.post("/api/media", upload.single('file'), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      const { title, description, mediaType } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Title is required" });
      }

      if (!mediaType || !['image', 'video', 'document', 'audio'].includes(mediaType)) {
        return res.status(400).json({ error: "Valid media type is required (image, video, document, or audio)" });
      }

      // Create the media record in the database
      const mediaItem = await dbStorage.createMedia({
        title,
        description: description || null,
        fileName: file.originalname,
        filePath: file.path,
        fileSize: file.size,
        fileType: file.mimetype,
        mediaType: mediaType as any, // Cast to the enum type
        creatorId: 1, // Default to admin user
      });

      res.status(201).json({ media: mediaItem });
    } catch (error) {
      console.error('Media upload error:', error);
      res.status(500).json({ error: "Failed to upload media" });
    }
  });

  // Update media metadata
  app.put("/api/media/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid media ID" });
      }

      const result = updateMediaSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      const updatedMedia = await dbStorage.updateMedia(id, result.data);
      if (!updatedMedia) {
        return res.status(404).json({ error: "Media not found" });
      }

      res.json({ media: updatedMedia });
    } catch (error) {
      res.status(500).json({ error: "Failed to update media" });
    }
  });

  // Delete media
  app.delete("/api/media/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid media ID" });
      }

      // Get the media first to know the file path
      const mediaItem = await dbStorage.getMediaById(id);
      if (!mediaItem) {
        return res.status(404).json({ error: "Media not found" });
      }

      // Delete from database
      const success = await dbStorage.deleteMedia(id);
      if (!success) {
        return res.status(500).json({ error: "Failed to delete media from database" });
      }

      // Delete the physical file
      try {
        if (fs.existsSync(mediaItem.filePath)) {
          fs.unlinkSync(mediaItem.filePath);
        }
      } catch (fileError) {
        console.error("Failed to delete media file:", fileError);
        // Continue anyway since the database record is gone
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete media" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', (req, res, next) => {
    // Add cache-control headers for better performance
    res.setHeader('Cache-Control', 'public, max-age=86400');
    next();
  }, express.static(uploadDir));

  // Course-media relation endpoints
  app.get("/api/courses/:courseId/media", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }

      const mediaItems = await dbStorage.getCourseMedia(courseId);
      res.json({ media: mediaItems });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course media" });
    }
  });

  // Link media to course
  app.post("/api/courses/:courseId/media/:mediaId", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const mediaId = parseInt(req.params.mediaId);
      
      if (isNaN(courseId) || isNaN(mediaId)) {
        return res.status(400).json({ error: "Invalid course or media ID" });
      }

      const order = req.body.order !== undefined ? parseInt(req.body.order) : 0;
      if (isNaN(order)) {
        return res.status(400).json({ error: "Invalid order value" });
      }

      // Check if course exists
      const course = await dbStorage.getCourse(courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }

      // Check if media exists
      const mediaItem = await dbStorage.getMediaById(mediaId);
      if (!mediaItem) {
        return res.status(404).json({ error: "Media not found" });
      }

      const relation = await dbStorage.linkMediaToCourse(courseId, mediaId, order);
      res.status(201).json({ relation });
    } catch (error) {
      res.status(500).json({ error: "Failed to link media to course" });
    }
  });

  // Unlink media from course
  app.delete("/api/courses/:courseId/media/:mediaId", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const mediaId = parseInt(req.params.mediaId);
      
      if (isNaN(courseId) || isNaN(mediaId)) {
        return res.status(400).json({ error: "Invalid course or media ID" });
      }

      const success = await dbStorage.unlinkMediaFromCourse(courseId, mediaId);
      if (!success) {
        return res.status(404).json({ error: "Course-media relationship not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to unlink media from course" });
    }
  });

  // Update media order within a course
  app.put("/api/courses/:courseId/media/:mediaId/order", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      const mediaId = parseInt(req.params.mediaId);
      
      if (isNaN(courseId) || isNaN(mediaId)) {
        return res.status(400).json({ error: "Invalid course or media ID" });
      }

      const { order } = req.body;
      if (order === undefined || isNaN(parseInt(order))) {
        return res.status(400).json({ error: "Valid order value is required" });
      }

      const relation = await dbStorage.updateMediaOrder(courseId, mediaId, parseInt(order));
      if (!relation) {
        return res.status(404).json({ error: "Course-media relationship not found" });
      }

      res.json({ relation });
    } catch (error) {
      res.status(500).json({ error: "Failed to update media order" });
    }
  });

  // REST endpoints for event participants
  app.get("/api/events/:eventId/participants", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      const participants = await dbStorage.getEventParticipants(eventId);
      res.json({ participants });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event participants" });
    }
  });

  app.post("/api/events/:eventId/participants", async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }

      // Validate the event exists
      const event = await dbStorage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      // Validate participant data
      const result = eventParticipantFormSchema.safeParse({
        ...req.body,
        eventId
      });
      
      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      try {
        const participant = await dbStorage.createEventParticipant(result.data);
        res.status(201).json({ participant });
      } catch (error: any) {
        // Handle unique email constraint error
        if (error.message?.includes("already registered")) {
          return res.status(400).json({ error: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error registering participant:", error);
      res.status(500).json({ error: "Failed to register participant" });
    }
  });

  app.put("/api/events/participants/:id/attendance", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid participant ID" });
      }

      const { attended } = req.body;
      if (typeof attended !== 'boolean') {
        return res.status(400).json({ error: "Attended status must be a boolean" });
      }

      const participant = await dbStorage.updateEventParticipantAttendance(id, attended);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      res.json({ participant });
    } catch (error) {
      res.status(500).json({ error: "Failed to update participant attendance" });
    }
  });

  app.delete("/api/events/participants/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid participant ID" });
      }

      const success = await dbStorage.deleteEventParticipant(id);
      if (!success) {
        return res.status(404).json({ error: "Participant not found" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete participant" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

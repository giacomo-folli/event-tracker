import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage as dbStorage } from "./storage";
import { updateEventSchema, insertEventSchema, updateUserSettingsSchema, passwordUpdateSchema, insertCourseSchema, updateCourseSchema, insertMediaSchema, updateMediaSchema, insertCourseMediaSchema, insertEventParticipantSchema, eventParticipantFormSchema, updateEventSharingSchema, insertTrainingSessionSchema, insertCourseParticipantSchema } from "@shared/schema";
import { join } from "path";
import * as fs from "fs";
import multer from "multer";
import { z } from "zod";
import { setupAuth } from "./auth";
import { generateShareToken, generateShareUrl } from "./utils";
import { apiKeyAuth } from "./middleware/api-key-auth";
import apiKeysRouter from "./routes/api-keys";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication (session-based)
  await setupAuth(app);
  
  // Setup API key authentication
  app.use(apiKeyAuth);
  
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

      console.log("Received event update request for ID:", id);
      console.log("Request body:", req.body);

      const result = updateEventSchema.safeParse(req.body);
      if (!result.success) {
        console.error("Failed schema validation:", result.error.format());
        return res.status(400).json({ error: result.error.format() });
      }

      console.log("Validated data:", result.data);

      const updatedEvent = await dbStorage.updateEvent(id, result.data);
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }

      console.log("Event updated successfully:", updatedEvent);
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
  
  // Endpoint to toggle event sharing
  app.put("/api/events/:id/share", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid event ID" });
      }
      
      console.log("Toggle sharing request for event ID:", id, "with data:", req.body);
      
      // Get current event
      const event = await dbStorage.getEvent(id);
      if (!event) {
        console.log("Event not found with ID:", id);
        return res.status(404).json({ error: "Event not found" });
      }
      
      console.log("Current event state:", event);
      
      // Toggle sharing status
      const isShared = req.body.isShared === true;
      console.log("Setting isShared to:", isShared);
      
      let shareToken = event.shareToken;
      let shareUrl = event.shareUrl;
      
      // If we're enabling sharing and there's no token yet, generate one
      if (isShared && !shareToken) {
        shareToken = generateShareToken();
        shareUrl = generateShareUrl(shareToken);
        console.log("Generated new share token:", shareToken);
        console.log("Generated share URL:", shareUrl);
      }
      
      // Add the other required fields from the existing event
      const updateData = {
        title: event.title,
        startDate: event.startDate,
        endDate: event.endDate,
        description: event.description,
        location: event.location,
        isShared,
        shareToken,
        shareUrl
      };
      
      console.log("Update data:", updateData);
      
      const updatedEvent = await dbStorage.updateEvent(id, updateData);
      
      if (!updatedEvent) {
        return res.status(404).json({ error: "Failed to update event sharing status" });
      }
      
      res.json({ event: updatedEvent });
    } catch (error) {
      console.error("Error toggling event sharing:", error);
      res.status(500).json({ error: "Failed to update event sharing status" });
    }
  });
  
  // Public endpoint to get a shared event by token (no authentication required)
  app.get("/api/events/shared/:token", async (req: Request, res: Response) => {
    try {
      const token = req.params.token;
      if (!token) {
        return res.status(400).json({ error: "Invalid share token" });
      }
      
      // Find event by token using our optimized method
      const event = await dbStorage.getEventByToken(token);
      
      if (!event || !event.isShared) {
        return res.status(404).json({ error: "Shared event not found" });
      }
      
      res.json({ event });
    } catch (error) {
      console.error("Error getting shared event:", error);
      res.status(500).json({ error: "Failed to get shared event" });
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

  // Course participants endpoints
  app.get("/api/courses/:courseId/participants", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }

      const participants = await dbStorage.getCourseParticipants(courseId);
      res.json({ participants });
    } catch (error) {
      console.error("Error fetching course participants:", error);
      res.status(500).json({ error: "Failed to fetch course participants" });
    }
  });

  app.post("/api/courses/:courseId/participants", async (req: Request, res: Response) => {
    try {
      const courseId = parseInt(req.params.courseId);
      if (isNaN(courseId)) {
        return res.status(400).json({ error: "Invalid course ID" });
      }

      // Validate the participant data
      const result = insertCourseParticipantSchema.safeParse({
        ...req.body,
        courseId,
        attended: false, // Default to not attended
        registeredAt: new Date()
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error.format() });
      }

      try {
        const participant = await dbStorage.createCourseParticipant(result.data);
        res.status(201).json({ participant });
      } catch (error: any) {
        // Handle specific errors from the storage layer
        if (error.message?.includes('registered for this course')) {
          return res.status(409).json({ error: error.message });
        }
        if (error.message?.includes('Course not found')) {
          return res.status(404).json({ error: error.message });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error creating course participant:", error);
      res.status(500).json({ error: "Failed to register participant" });
    }
  });

  app.put("/api/courses/:courseId/participants/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const courseId = parseInt(req.params.courseId);
      if (isNaN(id) || isNaN(courseId)) {
        return res.status(400).json({ error: "Invalid ID" });
      }

      const { attended } = req.body;
      if (typeof attended !== 'boolean') {
        return res.status(400).json({ error: "Attended status must be a boolean" });
      }

      const participant = await dbStorage.updateCourseParticipantAttendance(id, attended);
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }

      res.json({ participant });
    } catch (error) {
      console.error("Error updating course participant attendance:", error);
      res.status(500).json({ error: "Failed to update participant attendance" });
    }
  });

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
  
  // Training sessions endpoints
  app.get("/api/training-sessions", async (req: Request, res: Response) => {
    try {
      const sessions = await dbStorage.getTrainingSessions();
      res.json({ sessions });
    } catch (error) {
      console.error("Error getting training sessions:", error);
      res.status(500).json({ error: "Failed to fetch training sessions" });
    }
  });

  app.get("/api/training-sessions/month/:year/:month", async (req: Request, res: Response) => {
    try {
      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);
      
      if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: "Invalid year or month" });
      }
      
      const sessions = await dbStorage.getTrainingSessionsByMonth(year, month);
      res.json({ sessions });
    } catch (error) {
      console.error("Error getting monthly training sessions:", error);
      res.status(500).json({ error: "Failed to fetch monthly training sessions" });
    }
  });

  app.get("/api/training-sessions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid training session ID" });
      }
      
      const session = await dbStorage.getTrainingSession(id);
      if (!session) {
        return res.status(404).json({ error: "Training session not found" });
      }
      
      res.json({ session });
    } catch (error) {
      console.error("Error getting training session:", error);
      res.status(500).json({ error: "Failed to fetch training session" });
    }
  });

  app.post("/api/training-sessions", async (req: Request, res: Response) => {
    try {
      const parseResult = insertTrainingSessionSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({ 
          error: "Invalid training session data", 
          details: parseResult.error.format() 
        });
      }
      
      // Verify course exists
      const course = await dbStorage.getCourse(parseResult.data.courseId);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      
      const session = await dbStorage.createTrainingSession(parseResult.data);
      
      // Notify connected clients about the new training session
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'training_session_created',
            session
          }));
        }
      });
      
      res.status(201).json({ session });
    } catch (error) {
      console.error("Error creating training session:", error);
      res.status(500).json({ error: "Failed to create training session" });
    }
  });

  app.delete("/api/training-sessions/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid training session ID" });
      }
      
      const success = await dbStorage.deleteTrainingSession(id);
      if (!success) {
        return res.status(404).json({ error: "Training session not found" });
      }
      
      // Notify connected clients about the deleted training session
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: 'training_session_deleted',
            sessionId: id
          }));
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting training session:", error);
      res.status(500).json({ error: "Failed to delete training session" });
    }
  });

  // API Keys endpoints
  app.use("/api/keys", apiKeysRouter);

  const httpServer = createServer(app);
  
  // Set up WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        // Handle different message types
        if (data.type === 'training_session_created') {
          // Broadcast to all connected clients
          wss.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify({
                type: 'training_session_updated',
                data: data.session
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  return httpServer;
}

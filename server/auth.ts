import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { ApiKeyAuthRequest } from "./middleware/api-key-auth";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export async function setupAuth(app: Express) {
  // Create a randomized session secret
  const sessionSecret = process.env.SESSION_SECRET || randomBytes(32).toString('hex');
  
  // Use the session store from our storage implementation
  const sessionSettings: session.SessionOptions = {
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        const isPasswordValid = await comparePasswords(password, user.password);
        if (!isPasswordValid) {
          return done(null, false, { message: "Incorrect username or password" });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // User management routes - require authentication
  app.post("/api/users", async (req, res, next) => {
    // Only allow authenticated users to create new users
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required to create users" });
    }

    try {
      const { username, password, firstName, lastName, email } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await hashPassword(password || 'temp_password');
      
      // Create user
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        firstName,
        lastName,
        email,
        emailNotifications: false,
        browserNotifications: false,
        apiChangeNotifications: false,
      });
      
      // Don't send password back to client
      const { password: _, ...safeUser } = user;
      res.status(201).json({ user: safeUser });
    } catch (error) {
      console.error("User creation error:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Get all users - requires authentication
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Authentication required" });
    }

    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(user => {
        const { password, ...safeUser } = user;
        return safeUser;
      });
      
      return res.json({ users: safeUsers });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/login", (req, res, next) => {
    // Check if the request contains the required fields
    if (!req.body || !req.body.username || !req.body.password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) {
        // Provide a clear error message for failed login
        return res.status(401).json({ error: info?.message || "Invalid username or password" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Don't send password back to client
        const { password, ...safeUser } = user;
        console.log("Login successful for user:", safeUser.username);
        res.json({ user: safeUser });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((err) => {
        if (err) return next(err);
        res.sendStatus(200);
      });
    });
  });

  // Check if user is authenticated (via session or API key)
  app.get("/api/user", async (req: ApiKeyAuthRequest, res) => {
    // Check for session authentication
    if (req.isAuthenticated()) {
      // Return user from session
      const { password, ...safeUser } = req.user as SelectUser;
      return res.json({ user: safeUser, auth_method: 'session' });
    }
    
    // Check for API key authentication
    if (req.apiKey) {
      // Look up user by ID from the API key
      const user = await storage.getUser(req.apiKey.userId);
      if (user) {
        // Don't send password back to client
        const { password, ...safeUser } = user;
        return res.json({ user: safeUser, auth_method: 'api_key' });
      }
    }
    
    // Not authenticated by any method
    return res.status(401).json({ error: "Not authenticated" });
  });
}
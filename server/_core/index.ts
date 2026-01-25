import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
// import passport from "passport"; // Disabled - social login removed
import { createServer } from "http";
import net from "net";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic } from "./vite";
import { startAllCronJobs } from "../cronJobs";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1);
  
  // ============================================
  // SECURITY MIDDLEWARE - ENTERPRISE GRADE
  // ============================================
  
  // 1. HELMET - Security Headers (OWASP recommended)
  // Sets various HTTP headers to protect against common attacks
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com", "https://maps.googleapis.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'", "https://api.stripe.com", "https://api.manus.im", "wss:", "ws:"],
        frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false, // Required for external resources
    crossOriginResourcePolicy: { policy: "cross-origin" },
    // X-Frame-Options - Prevent clickjacking
    frameguard: { action: "deny" },
    // X-Content-Type-Options - Prevent MIME sniffing
    noSniff: true,
    // X-XSS-Protection - Enable browser XSS filter
    xssFilter: true,
    // Referrer-Policy - Control referrer information
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // HSTS - Force HTTPS (only in production)
    hsts: process.env.NODE_ENV === "production" ? {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    } : false,
  }));
  
  // 2. CORS - Cross-Origin Resource Sharing
  const allowedOrigins = [
    process.env.VITE_APP_URL || "http://localhost:3000",
    "https://api.manus.im",
    "https://js.stripe.com",
  ];
  
  // Allowed domain patterns for deployment platforms
  const allowedDomainPatterns = [
    "manus.computer",
    "localhost",
    "railway.app",
    "up.railway.app",
    "ondigitalocean.app",
    "vercel.app",
    "render.com",
    "disputestrike.com",
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin matches allowed origins list
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        return callback(null, true);
      }
      
      // Check if origin matches any allowed domain pattern
      if (allowedDomainPatterns.some(pattern => origin.includes(pattern))) {
        return callback(null, true);
      }
      
      // In development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      console.warn(`[CORS] Blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }));
  
  // 3. RATE LIMITING - Prevent brute force and DDoS
  // General API rate limit
  const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting for static assets
      return req.path.startsWith("/assets") || req.path.startsWith("/static");
    },
  });
  
  // Stricter rate limit for authentication endpoints
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 attempts per hour
    message: { error: "Too many authentication attempts, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Stricter rate limit for sensitive operations (payments, letter generation)
  const sensitiveLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 requests per hour
    message: { error: "Rate limit exceeded for sensitive operations." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Apply rate limiters
  app.use("/api/oauth", authLimiter);
  app.use("/api/stripe", sensitiveLimiter);
  app.use("/api/trpc", generalLimiter);
  
  // 4. REQUEST SIZE LIMITS - Prevent payload attacks
  // CRITICAL: Stripe webhook MUST be registered BEFORE express.json()
  // to preserve raw body for signature verification
  app.use('/api/stripe', express.raw({ type: 'application/json', limit: '1mb' }));
  const { stripeWebhookRouter } = await import('../stripeWebhook');
  app.use('/api/stripe', stripeWebhookRouter);
  
  // Configure body parser with size limits
  app.use(express.json({ limit: "50mb" })); // For file uploads
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser()); // For admin session cookies
  
  // 5. SECURITY LOGGING
  app.use((req, res, next) => {
    // Log suspicious requests
    const suspiciousPatterns = [
      /(\.\.|\/etc\/|\/proc\/)/i, // Path traversal
      /<script/i, // XSS attempt
      /union\s+select/i, // SQL injection
      /javascript:/i, // XSS via protocol
    ];
    
    const fullUrl = req.originalUrl || req.url;
    const isSuspicious = suspiciousPatterns.some(pattern => 
      pattern.test(fullUrl) || pattern.test(JSON.stringify(req.body || {}))
    );
    
    if (isSuspicious) {
      console.warn(`[SECURITY] Suspicious request blocked: ${req.method} ${fullUrl} from ${req.ip}`);
      return res.status(400).json({ error: "Invalid request" });
    }
    
    next();
  });
  
  // ============================================
  // APPLICATION ROUTES
  // ============================================
  
  // Health check endpoint for load balancers and monitoring
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });
  
  // Admin authentication routes (separate from user OAuth)
  const adminAuthRouter = (await import('../adminAuthRouter')).default;
  app.use('/api/admin', adminAuthRouter);
  
  // Custom email/password authentication routes (for self-hosting)
  const customAuthRouter = (await import('../customAuthRouter')).default;
  app.use('/api/auth', customAuthRouter);
  
  // Social OAuth (Google, Facebook) authentication - DISABLED
  // const { initializeSocialAuth, createSocialAuthRouter } = await import('../socialAuth');
  // initializeSocialAuth();
  // app.use(passport.initialize());
  // app.use('/api/auth', createSocialAuthRouter());
  
  // V2 - Trial, subscription, and round management routes
  const routesV2 = (await import('../routesV2')).default;
  app.use('/api', routesV2);

  // File upload and serving routes (Railway volume storage)
  const { fileStorage } = await import('../s3Provider');
  const multer = (await import('multer')).default;
  
  // Configure multer for memory storage (we'll save to Railway volume)
  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
  });
  
  // File upload endpoint
  app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      // Get user ID from session
      // We need to pass the full options to createContext
      const ctx = await createContext({ req, res } as any);
      const userId = ctx.user?.id;
      
      if (!userId) {
        console.warn('[Upload] Unauthorized upload attempt');
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const bureau = req.body.bureau || 'document';
      const fileName = req.file.originalname;
      
      // Generate file key and save
      const fileKey = fileStorage.generateFileKey(
        userId,
        bureau,
        fileName
      );
      
      const result = await fileStorage.saveFile(fileKey, req.file.buffer, req.file.mimetype);
      
      res.json({
        success: true,
        fileUrl: result.fileUrl,
        fileKey: result.fileKey,
      });
    } catch (error) {
      console.error('[Upload] Error:', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  });
  
  // File serving endpoint
  app.get('/api/files/:key(*)', async (req, res) => {
    try {
      const key = decodeURIComponent(req.params.key);
      const file = await fileStorage.getFile(key);
      
      if (!file) {
        return res.status(404).json({ error: 'File not found' });
      }
      
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(file.data);
    } catch (error) {
      console.error('[Files] Error:', error);
      res.status(500).json({ error: 'Failed to retrieve file' });
    }
  });
  
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    // Dynamically import setupVite from vite-dev.ts only in development
    // This file is NOT bundled for production, avoiding vite dependency issues
    const { setupVite } = await import("./vite-dev");
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`[SECURITY] Helmet, CORS, and Rate Limiting enabled`);
    
    // Start cron jobs after server is running
    startAllCronJobs();
  });
}

startServer().catch(console.error);

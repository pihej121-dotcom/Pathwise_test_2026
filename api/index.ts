/**
 * Vercel serverless entry point.
 *
 * Wraps the Express app so it can run as a Vercel serverless function.
 * Static frontend assets are served by Vercel's CDN from dist/public.
 *
 * Middleware order matters:
 * 1. express.raw() for /api/stripe/webhook  ← must be before express.json()
 * 2. express.json() for all other routes
 */
import express, { type Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import { registerRoutes } from "../server/routes";

const app = express();

// Stripe webhook needs raw body BEFORE express.json() parses it.
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: false, limit: "15mb" }));
app.use(cookieParser());

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      console.log(logLine);
    }
  });

  next();
});

// Error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});

// Register all API routes once; reuse across warm invocations.
let routesReady: Promise<void>;
function ensureRoutes() {
  if (!routesReady) {
    routesReady = registerRoutes(app).then(() => {});
  }
  return routesReady;
}

// Default export consumed by Vercel's Node.js runtime.
export default async function handler(req: Request, res: Response) {
  await ensureRoutes();
  app(req, res);
}

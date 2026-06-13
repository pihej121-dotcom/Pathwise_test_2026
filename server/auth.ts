import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import type { User } from "@shared/schema";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "your-secret-key";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface AuthRequest extends Request {
  user?: User;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  // Delete existing sessions for this user (single session per user)
  await storage.deleteUserSessions(userId);
  
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  
  await storage.createSession(userId, token, expiresAt);
  return token;
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") || 
                  req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    const user = session.user;
    
    // STRICT LICENSING ENFORCEMENT
    // Check if user is verified and active
    if (!user.isVerified) {
      return res.status(401).json({ error: "Email verification required" });
    }
    
    if (!user.isActive) {
      return res.status(401).json({ error: "Account is inactive. Contact your administrator." });
    }
    
    // Check if user's institution has a valid license
    if (user.institutionId) {
      const license = await storage.getInstitutionLicense(user.institutionId);
      if (!license) {
        return res.status(401).json({ error: "Institution license has expired. Contact your administrator." });
      }
      
      // Update last active timestamp
      await storage.updateUser(user.id, { lastActiveAt: new Date() });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "institution_admin")) {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== "super_admin") {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
}

// Utility function to check if user has access to a specific feature
export async function hasFeatureAccess(userId: string, featureKey: string): Promise<boolean> {
  const user = await storage.getUser(userId);
  
  if (!user) {
    return false;
  }
  
  // Check if user has active subscription (paid or institutional) - unlimited use
  if (user.subscriptionTier === 'paid' || user.subscriptionTier === 'institutional') {
    // Check subscription status is active or trialing
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing') {
      return true;
    }
  }
  
  // Check if user has unused credit for this specific feature - one-time use
  const unusedCredit = await storage.getUnusedFeatureCredit(userId, featureKey);
  return !!unusedCredit;
}

// Middleware to check if user has access to a specific feature AND consume credit if pay-per-use
export function requireFeature(featureKey: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const userId = req.user.id;
    const user = await storage.getUser(userId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check if user has active subscription (unlimited access - no credit consumption)
    const hasActiveSubscription = 
      (user.subscriptionTier === 'paid' || user.subscriptionTier === 'institutional') &&
      (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing');

    if (hasActiveSubscription) {
      // Subscription user - pass through without consuming credits
      return next();
    }

    // Pay-per-use user - check for unused credit and consume it atomically
    const unusedCredit = await storage.getUnusedFeatureCredit(userId, featureKey);
    
    if (!unusedCredit) {
      // No available credits
      return res.status(403).json({ 
        error: `This feature requires either purchasing it individually or subscribing to Pathwise Unlimited.`,
        requiresUpgrade: true,
        featureKey: featureKey
      });
    }

    // Consume the credit atomically (only succeeds if credit is still unused)
    try {
      const consumed = await storage.consumeFeatureCredit(unusedCredit.id);
      
      if (!consumed) {
        // Credit was already consumed by another concurrent request
        console.warn(`⚠️ Race condition detected: Credit ${unusedCredit.id} already consumed for ${featureKey} by user ${userId}`);
        return res.status(403).json({ 
          error: "This credit has already been used. Please purchase again to continue.",
          requiresUpgrade: true,
          featureKey: featureKey
        });
      }
      
      console.log(`✅ Credit consumed atomically: ${featureKey} for user ${userId}`);
      
      // Pass through to the protected route
      return next();
    } catch (error) {
      console.error('Error consuming credit:', error);
      return res.status(500).json({ error: "Failed to process feature access" });
    }
  };
}

// Middleware to check if user has access to paid features (legacy - for routes that don't specify a feature)
export function requirePaidFeatures(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const tier = req.user.subscriptionTier;
  
  // Allow access if user has paid or institutional tier
  if (tier === "paid" || tier === "institutional") {
    return next();
  }

  // Free tier users are blocked
  return res.status(403).json({ 
    error: "This feature requires a Pro subscription. Upgrade to access Career Roadmaps, Job Matching, Micro-Projects, and more.",
    requiresUpgrade: true
  });
}

export async function logout(token: string): Promise<void> {
  await storage.deleteSession(token);
}

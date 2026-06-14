import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { authenticate, requireAdmin, requireSuperAdmin, requirePaidFeatures, requireFeature, hashPassword, verifyPassword, createSession, logout, generateToken, type AuthRequest } from "./auth";
import { aiService } from "./ai";
import { jobsService } from "./jobs";
import { beyondJobsService } from "./beyond-jobs";
import { ObjectStorageService } from "./objectStorage";
import { emailService } from "./email";
import { 
  loginSchema, 
  registerSchema, 
  insertInstitutionSchema, 
  insertLicenseSchema, 
  inviteUserSchema, 
  verifyEmailSchema,
  insertSkillGapAnalysisSchema,
  insertMicroProjectSchema,
  insertProjectCompletionSchema,
  insertPortfolioArtifactSchema,
  FEATURE_CATALOG,
  FeatureKey
} from "@shared/schema";
import crypto from "crypto";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import PDFParse from "pdf-parse";
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";

function parseResumeContentToDocx(resumeText: string): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = resumeText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const isSectionHeader = 
      line === line.toUpperCase() && line.length > 2 && line.length < 50 ||
      /^(PROFESSIONAL SUMMARY|SUMMARY|EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS|ACHIEVEMENTS|CONTACT|OBJECTIVE)/i.test(line);
    
    if (isSectionHeader) {
      paragraphs.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 200,
            after: 100,
          },
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          text: line,
          spacing: {
            after: 100,
          },
        })
      );
    }
  }
  
  return paragraphs;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      // Validate request body
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      
      const { email, password, school, major, gradYear, invitationToken, selectedPlan } = req.body;
      const firstName: string = req.body.firstName || "";
      const lastName: string = req.body.lastName || "";
      
      // Check if user exists
      const existingUser = await storage.getUserByEmail(email);
if (existingUser && existingUser.isActive) {
  return res.status(400).json({ error: "User already exists" });
}
// If user exists but is deactivated, reactivate them
if (existingUser && !existingUser.isActive) {
  const reactivatedUser = await storage.activateUser(existingUser.id);
  
  // Generate new session token
  const token = generateToken();
  await storage.createSession(reactivatedUser.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  
  return res.status(200).json({
    message: "User reactivated successfully",
    user: reactivatedUser,
    token
  });
}

      // If invitation token provided, validate it
      let invitation = null;
      let institutionId = null;
      let userRole = "student";
      let subscriptionTier: "free" | "paid" | "institutional" = "free";
      
      if (invitationToken) {
        invitation = await storage.getInvitationByToken(invitationToken);
        if (!invitation) {
          return res.status(400).json({ error: "Invalid or expired invitation" });
        }
        
        if (invitation.email !== email) {
          return res.status(400).json({ error: "Email does not match invitation" });
        }
        
        institutionId = invitation.institutionId;
        userRole = invitation.role;
        subscriptionTier = "institutional"; // Institutional users get full access
        
        // Check seat availability for students
        if (userRole === "student") {
          const seatInfo = await storage.checkSeatAvailability(institutionId);
          if (!seatInfo.available) {
            return res.status(400).json({ 
              error: "No available seats. Please contact your administrator." 
            });
          }
        }
      } else {
        // No invitation - check if domain matches an institution
        const domain = email.split('@')[1];
        const institution = await storage.getInstitutionByDomain(domain);
        
        if (institution) {
          // Domain-based institutional registration
          institutionId = institution.id;
          subscriptionTier = "institutional";
          
          // Check seat availability for domain-based registration
          const seatInfo = await storage.checkSeatAvailability(institutionId);
          if (!seatInfo.available) {
            return res.status(400).json({ 
              error: "No available seats. Please contact your administrator." 
            });
          }
        } else {
          // Direct signup - no institution affiliation
          institutionId = null;
          userRole = "student";
          
          // Use selected plan if provided, otherwise default to free
          subscriptionTier = selectedPlan === "paid" ? "paid" : "free";
        }
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(password);
      
      const user = await storage.createUser({
        institutionId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: userRole as any,
        school,
        major,
        gradYear,
        subscriptionTier,
        subscriptionStatus: subscriptionTier === 'paid' ? 'incomplete' : 'active',
        isActive: !!(invitation || subscriptionTier === 'paid'),
        isVerified: !!(invitation || subscriptionTier === 'paid'),
      });

      // Claim invitation if provided
      if (invitation) {
        await storage.claimInvitation(invitationToken!, user.id);
      }
      
      // Update license seat usage for active students
      if (userRole === "student" && institutionId) {
        const license = await storage.getInstitutionLicense(institutionId);
        if (license && license.licenseType === "per_student") {
          await storage.updateLicenseUsage(license.id, license.usedSeats + 1);
          
          // Check if we need to send usage notification
          const seatInfo = await storage.checkSeatAvailability(institutionId);
          if (license.licensedSeats && seatInfo.usedSeats >= license.licensedSeats * 0.8) {
            const institution = await storage.getInstitution(institutionId);
            const adminUsers = await storage.getInstitutionUsers(institutionId);
            const admins = adminUsers.filter(u => u.role === "admin");
            
            // Send notification to admins
            for (const admin of admins) {
              await emailService.sendLicenseUsageNotification({
                adminEmail: admin.email,
                institutionName: institution?.name || "Unknown Institution",
                usedSeats: seatInfo.usedSeats,
                totalSeats: seatInfo.totalSeats || 0,
                usagePercentage: Math.round((seatInfo.usedSeats / (seatInfo.totalSeats || 1)) * 100)
              });
            }
          }
        }
      }
      
      console.log(`✅ User registered successfully: ${user.id} (${userRole}) for institution ${institutionId}`)
      
      // Create activity
      await storage.createActivity(
        user.id,
        "account_created",
        "Welcome to Pathwise!",
        "Your account is ready to use."
      );

      // For paid users, create Stripe checkout session instead of auto-login
      if (subscriptionTier === 'paid') {
        if (!stripe) {
          return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." });
        }

        if (!process.env.STRIPE_PRICE_ID) {
          return res.status(500).json({ error: "Stripe Price ID is not configured. Please add STRIPE_PRICE_ID to your environment variables." });
        }

        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });
        
        // Update user with Stripe customer ID
        await storage.updateUser(user.id, { stripeCustomerId: customer.id });

        // Create checkout session
        const referer = req.get("referer") || "http://localhost:5000";
        const url = new URL(referer);
        const baseUrl = `${url.protocol}//${url.host}`;
        
        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          mode: 'subscription',
          payment_method_types: ['card'],
          line_items: [
            {
              price: process.env.STRIPE_PRICE_ID,
              quantity: 1,
            },
          ],
          success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/register`,
          metadata: {
            userId: user.id,
          },
          allow_promotion_codes: true, // Enable promo code field in Stripe checkout
        });

        void emailService.sendWelcomeEmail({ email: user.email, firstName });
        return res.status(201).json({
          message: "Registration successful! Redirecting to payment...",
          user: { ...user, password: undefined },
          requiresPayment: true,
          checkoutUrl: session.url,
          requiresVerification: false
        });
      }

      // Invited users → auto-login immediately (admin already vouched for them)
      if (invitation) {
        const token = generateToken();
        await storage.createSession(user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
        if (userRole === "student") {
          void emailService.sendWelcomeEmail({ email: user.email, firstName });
        }
        return res.status(201).json({
          message: "Registration successful! You can now log in.",
          user: { ...user, password: undefined },
          token,
          requiresVerification: false,
        });
      }

      // Direct / domain-based signups → send verification email, no auto-login
      const verificationToken = generateToken();
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      await storage.createEmailVerification({
        email: user.email,
        token: verificationToken,
        expiresAt: verificationExpiresAt,
        isUsed: false,
      });
      let institutionDisplayName = "Pathwise";
      if (institutionId) {
        const inst = await storage.getInstitution(institutionId);
        if (inst) institutionDisplayName = inst.name;
      }
      await emailService.sendEmailVerification({
        email: user.email,
        token: verificationToken,
        institutionName: institutionDisplayName,
      });
      void emailService.sendWelcomeEmail({ email: user.email, firstName });
      return res.status(201).json({
        message: "Account created! Please check your email to verify your address.",
        requiresVerification: true,
        email: user.email,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Incorrect password" });
      }

      if (!user.isVerified) {
        return res.status(401).json({ error: "Please verify your email before logging in. Check your inbox for a verification link." });
      }

      const token = await createSession(user.id);
      
      // Create login activity
      await storage.createActivity(
        user.id,
        "user_login",
        "Logged In",
        `Welcome back, ${user.firstName}!`
      );
      
      // Set HTTP-only cookie for authentication
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });
      
      res.json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", authenticate, async (req: AuthRequest, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.auth_token;
      if (token) {
        await logout(token);
      }
      
      // Clear the auth cookie
      res.clearCookie('auth_token');
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", authenticate, async (req: AuthRequest, res) => {
    res.json(req.user); // ← Return user directly, no nesting
  });

  // Password reset routes
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!user) {
        return res.json({ 
          message: "If an account with that email exists, you will receive a password reset link shortly." 
        });
      }
      
      // Generate reset token
      const resetToken = generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      // Store reset token
      await storage.createPasswordResetToken({
        userId: user.id,
        token: resetToken,
        expiresAt,
        isUsed: false,
      });
      
      // Send reset email
      await emailService.sendPasswordReset({
        email: user.email,
        token: resetToken,
        userName: user.firstName,
      });
      
      res.json({ 
        message: "If an account with that email exists, you will receive a password reset link shortly." 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });

  app.get("/api/auth/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
      
      // Validate token
      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      res.json({ valid: true });
    } catch (error) {
      console.error("Validate reset token error:", error);
      res.status(500).json({ error: "Failed to validate reset token" });
    }
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, password, confirmPassword } = req.body;
      
      if (!token || !password || !confirmPassword) {
        return res.status(400).json({ error: "All fields are required" });
      }
      
      if (password !== confirmPassword) {
        return res.status(400).json({ error: "Passwords don't match" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      // Validate token
      const resetToken = await storage.getPasswordResetToken(token);
      
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      
      // Hash new password
      const hashedPassword = await hashPassword(password);
      
      // Update user password
      await storage.updateUser(resetToken.userId, {
        password: hashedPassword,
      });
      
      // Mark token as used
      await storage.markPasswordResetTokenAsUsed(token);
      
      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });

  // Promo code validation
  app.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Promo code is required" });
      }

      const promoCode = await storage.getPromoCodeByCode(code.trim().toUpperCase());
      
      if (!promoCode) {
        return res.status(404).json({ error: "Invalid or expired promo code" });
      }

      // Check if max uses exceeded
      if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
        return res.status(400).json({ error: "Promo code has reached maximum uses" });
      }

      return res.json({
        valid: true,
        type: promoCode.type,
        code: promoCode.code,
      });
    } catch (error) {
      console.error("Promo code validation error:", error);
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });

  // Update user settings
  app.patch("/api/users/settings", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const updateData = req.body;

      // Validate input with Zod
      const settingsSchema = z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        school: z.string().optional(),
        major: z.string().optional(),
        gradYear: z.number().int().min(2000).max(2040).optional(),
        targetRole: z.string().optional(),
        location: z.string().optional(),
        remoteOk: z.boolean().optional(),
      });

      const validated = settingsSchema.parse(updateData);

      // Update user in database
      const updatedUser = await storage.updateUser(userId, validated);

      res.json(updatedUser);
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Environment variables diagnostic endpoint
  app.get("/api/admin/env-check", async (req, res) => {
    try {
      const envStatus = {
        NODE_ENV: process.env.NODE_ENV || "not_set",
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "configured" : "missing",
        CORESIGNAL_API_KEY: process.env.CORESIGNAL_API_KEY ? "configured" : "missing",
        ADZUNA_APP_ID: process.env.ADZUNA_APP_ID ? "configured" : "missing", 
        ADZUNA_APP_KEY: process.env.ADZUNA_APP_KEY ? "configured" : "missing",
        RESEND_API_KEY: process.env.RESEND_API_KEY ? "configured" : "missing",
        DATABASE_URL: process.env.DATABASE_URL ? "configured" : "missing"
      };
      
      res.json({ environmentVariables: envStatus });
    } catch (error) {
      console.error("Error checking environment variables:", error);
      res.status(500).json({ error: "Failed to check environment variables" });
    }
  });

  // SUPER ADMIN ROUTES
  
  // List all institutions (super admin only)
  app.get("/api/admin/institutions", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const institutions = await storage.listInstitutions();
      
      const institutionsWithDetails = await Promise.all(
        institutions.map(async (inst) => {
          const license = await storage.getInstitutionLicense(inst.id);
          const users = await storage.getInstitutionUsers(inst.id, true);
          const seatInfo = license ? await storage.checkSeatAvailability(inst.id) : null;
          
          return {
            ...inst,
            license: license ? {
              ...license,
              seatInfo
            } : null,
            activeUsers: users.length
          };
        })
      );
      
      res.json(institutionsWithDetails);
    } catch (error: any) {
      console.error("Error listing institutions:", error);
      res.status(500).json({ error: "Failed to list institutions" });
    }
  });
  
  // Delete institution (super admin only)
  app.delete("/api/admin/institutions/:id", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const institution = await storage.getInstitution(req.params.id);
      if (!institution) {
        return res.status(404).json({ error: "Institution not found" });
      }
      
      // Delete institution (cascade will handle users, licenses, etc.)
      await storage.deleteInstitution(req.params.id);
      
      res.json({ message: "Institution deleted successfully" });
    } catch (error: any) {
      console.error("Error deleting institution:", error);
      res.status(500).json({ error: "Failed to delete institution" });
    }
  });

  // Onboard new institution with admin invitation (super admin only)
  app.post("/api/admin/onboard-institution", authenticate, requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const onboardSchema = z.object({
        name: z.string().min(1),
        adminEmail: z.string().email(),
        studentLimit: z.number().int().positive(),
        licenseStart: z.string(),
        licenseEnd: z.string(),
      });
      
      const { name, adminEmail, studentLimit, licenseStart, licenseEnd } = onboardSchema.parse(req.body);
      
      const existingUser = await storage.getUserByEmail(adminEmail);
      if (existingUser) {
        return res.status(400).json({ error: "A user with this email already exists" });
      }
      
      const institution = await storage.createInstitution({
        name,
        contactEmail: adminEmail,
        contactName: "Admin",
        isActive: true,
      });
      
      const license = await storage.createLicense({
        institutionId: institution.id,
        licenseType: "per_student",
        licensedSeats: studentLimit,
        usedSeats: 0,
        startDate: new Date(licenseStart),
        endDate: new Date(licenseEnd),
        brandingEnabled: false,
        supportLevel: "standard",
        isActive: true,
      });
      
      // Generate a random password for the admin
      const tempPassword = crypto.randomBytes(16).toString('base64').slice(0, 12);
      const hashedPassword = await hashPassword(tempPassword);
      
      // Create the admin user account directly
      const adminUser = await storage.createUser({
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        institutionId: institution.id,
        isVerified: true,
        isActive: true,
        subscriptionTier: "institutional",
      });
      
      // Send welcome email with credentials
      const emailSent = await emailService.sendAdminWelcome({
        email: adminEmail,
        password: tempPassword,
        institutionName: name,
        studentLimit,
        licenseEndDate: new Date(licenseEnd).toLocaleDateString(),
      });
      
      if (!emailSent) {
        console.warn("Failed to send welcome email, but institution and admin account were created");
      }
      
      res.json({
        message: "Institution onboarded successfully",
        institution,
        license,
        admin: {
          email: adminEmail,
          id: adminUser.id
        },
        emailSent
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Error onboarding institution:", error);
      res.status(500).json({ error: "Failed to onboard institution" });
    }
  });

  // INSTITUTIONAL LICENSING ROUTES
  
  // Create institution (super admin only)
  app.post("/api/institutions", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "super_admin") {
        return res.status(403).json({ error: "Only super admins can create institutions" });
      }
      
      const institutionData = insertInstitutionSchema.parse(req.body);
      const institution = await storage.createInstitution(institutionData);
      res.json(institution);
    } catch (error: any) {
      console.error("Error creating institution:", error);
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get institution details
  app.get("/api/institutions/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const institution = await storage.getInstitution(req.params.id);
      if (!institution) {
        return res.status(404).json({ error: "Institution not found" });
      }
      
      // Only allow access to users from the same institution or super admins
      if (req.user!.role !== "super_admin" && req.user!.institutionId !== institution.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(institution);
    } catch (error: any) {
      console.error("Error fetching institution:", error);
      res.status(500).json({ error: "Failed to fetch institution" });
    }
  });
  
  // Create license for institution
  app.post("/api/institutions/:id/license", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "super_admin") {
        return res.status(403).json({ error: "Only super admins can create licenses" });
      }
      
      const licenseData = insertLicenseSchema.parse({
        ...req.body,
        institutionId: req.params.id
      });
      
      const license = await storage.createLicense(licenseData);
      res.json(license);
    } catch (error: any) {
      console.error("Error creating license:", error);
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get license information
  app.get("/api/institutions/:id/license", authenticate, async (req: AuthRequest, res) => {
    try {
      const license = await storage.getInstitutionLicense(req.params.id);
      if (!license) {
        return res.status(404).json({ error: "No active license found" });
      }
      
      // Only allow access to users from the same institution or super admins
      if (req.user!.role !== "super_admin" && req.user!.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const seatInfo = await storage.checkSeatAvailability(req.params.id);
      
      res.json({
        ...license,
        seatInfo
      });
    } catch (error: any) {
      console.error("Error fetching license:", error);
      res.status(500).json({ error: "Failed to fetch license" });
    }
  });
  
  // Invite user to institution
  app.post("/api/institutions/:id/invite", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "admin" && req.user!.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can send invitations" });
      }
      
      if (req.user!.role === "admin" && req.user!.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const { email, role = "student" } = inviteUserSchema.parse({
        ...req.body,
        institutionId: req.params.id
      });
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      
      // Check seat availability for per-student licenses
      const seatInfo = await storage.checkSeatAvailability(req.params.id);
      if (!seatInfo.available && role === "student") {
        return res.status(400).json({ 
          error: "No available seats. Please upgrade your license or deactivate inactive users." 
        });
      }
      
      // Create invitation token
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      const invitation = await storage.createInvitation({
        institutionId: req.params.id,
        email,
        role: role as any,
        invitedBy: req.user!.id,
        token,
        expiresAt
      });
      
      // Get institution details for email
      const institution = await storage.getInstitution(req.params.id);
      
      // Send invitation email
      const emailSent = await emailService.sendInvitation({
        email,
        token,
        institutionName: institution?.name || "Unknown Institution",
        inviterName: `${req.user!.firstName} ${req.user!.lastName}`,
        role
      });
      
      if (!emailSent) {
        console.warn("Failed to send invitation email - this is likely due to Resend requiring domain verification for production use");
        // For now, we'll still return success since the invitation was created in the database
      }
      
      res.json({ 
        message: "Invitation sent successfully",
        invitation: {
          id: invitation.id,
          email: invitation.email,
          role: invitation.role,
          status: invitation.status,
          expiresAt: invitation.expiresAt
        }
      });
    } catch (error: any) {
      console.error("Error sending invitation:", error);
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get institution users and seat usage
  app.get("/api/institutions/:id/users", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "admin" && req.user!.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can view user lists" });
      }
      
      if (req.user!.role === "admin" && req.user!.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const users = await storage.getInstitutionUsers(req.params.id);
      const invitations = await storage.getInstitutionInvitations(req.params.id);
      const license = await storage.getInstitutionLicense(req.params.id);
      const seatInfo = await storage.checkSeatAvailability(req.params.id);
      
      res.json({
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastActiveAt: user.lastActiveAt,
          createdAt: user.createdAt
        })),
        invitations: invitations.map(inv => ({
          id: inv.id,
          email: inv.email,
          role: inv.role,
          status: inv.status,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt
        })),
        license,
        seatInfo
      });
    } catch (error: any) {
      console.error("Error fetching institution users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  // Get detailed student information (admin only)
  app.get("/api/institutions/:institutionId/users/:userId/details", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "admin" && req.user!.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can view student details" });
      }
      
      if (req.user!.role === "admin" && req.user!.institutionId !== req.params.institutionId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const user = await storage.getUser(req.params.userId);
      if (!user || user.institutionId !== req.params.institutionId) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get user's latest active resume
      const resumes = await storage.getUserResumes(req.params.userId);
      const activeResume = resumes.find(r => r.isActive);
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          school: user.school,
          major: user.major,
          gradYear: user.gradYear,
          targetRole: user.targetRole,
          industries: user.industries,
          targetCompanies: user.targetCompanies,
          location: user.location,
          remoteOk: user.remoteOk,
          isVerified: user.isVerified,
          isActive: user.isActive,
          lastActiveAt: user.lastActiveAt,
          createdAt: user.createdAt
        },
        resume: activeResume ? {
          id: activeResume.id,
          fileName: activeResume.fileName,
          rmsScore: activeResume.rmsScore,
          skillsScore: activeResume.skillsScore,
          experienceScore: activeResume.experienceScore,
          keywordsScore: activeResume.keywordsScore,
          educationScore: activeResume.educationScore,
          certificationsScore: activeResume.certificationsScore,
          overallInsights: activeResume.overallInsights,
          sectionAnalysis: activeResume.sectionAnalysis,
          gaps: activeResume.gaps,
          targetRole: activeResume.targetRole,
          targetIndustry: activeResume.targetIndustry,
          targetCompanies: activeResume.targetCompanies,
          createdAt: activeResume.createdAt
        } : null
      });
    } catch (error: any) {
      console.error("Error fetching student details:", error);
      res.status(500).json({ error: "Failed to fetch student details" });
    }
  });
  
  // Terminate user (admin only)
  app.delete("/api/institutions/:id/users/:userId", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "admin" && req.user!.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can terminate users" });
      }
      
      if (req.user!.role === "admin" && req.user!.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Cannot terminate yourself
      if (req.user!.id === req.params.userId) {
        return res.status(400).json({ error: "Cannot terminate your own account" });
      }
      
      // Get user to verify they belong to the institution
      const userToTerminate = await storage.getUser(req.params.userId);
      if (!userToTerminate || userToTerminate.institutionId !== req.params.id) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Deactivate user and revoke sessions
      await storage.deactivateUser(req.params.userId);
      await storage.deleteUserSessions(req.params.userId);
      
      // Update license seat count
      if (userToTerminate.institutionId) {
        const license = await storage.getInstitutionLicense(userToTerminate.institutionId);
        if (license && license.licenseType === "per_student" && userToTerminate.role === "student") {
          await storage.updateLicenseUsage(license.id, Math.max(0, license.usedSeats - 1));
        }
      }
      
      res.json({ message: "User terminated successfully" });
    } catch (error: any) {
      console.error("Error terminating user:", error);
      res.status(500).json({ error: "Failed to terminate user" });
    }
  });
  
  // Cancel invitation (admin only)
  app.delete("/api/institutions/:id/invitations/:invitationId", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "admin" && req.user!.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can cancel invitations" });
      }
      
      if (req.user!.role === "admin" && req.user!.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get invitation to verify it belongs to the institution
      const invitation = await storage.getInvitation(req.params.invitationId);
      if (!invitation || invitation.institutionId !== req.params.id) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      
      // Can only cancel pending invitations
      if (invitation.status !== "pending") {
        return res.status(400).json({ error: "Can only cancel pending invitations" });
      }
      
      await storage.cancelInvitation(req.params.invitationId);
      
      res.json({ message: "Invitation cancelled successfully" });
    } catch (error: any) {
      console.error("Error cancelling invitation:", error);
      res.status(500).json({ error: "Failed to cancel invitation" });
    }
  });
  
  // Email verification endpoint
  app.post("/api/verify-email", async (req, res) => {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      
      const verification = await storage.getEmailVerification(token);
      if (!verification) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }
      
      // Mark user as verified and activate
      const user = await storage.getUserByEmail(verification.email);
      if (user) {
        await storage.updateUser(user.id, { isVerified: true });
        await storage.activateUser(user.id);
        await storage.markEmailVerificationUsed(token);
        
        // Update license seat usage
        if (user.institutionId) {
          const license = await storage.getInstitutionLicense(user.institutionId);
          if (license && license.licenseType === "per_student") {
            await storage.updateLicenseUsage(license.id, license.usedSeats + 1);
            
            // Check if we need to send usage notification
            const seatInfo = await storage.checkSeatAvailability(user.institutionId);
            if (license.licensedSeats && seatInfo.usedSeats >= license.licensedSeats * 0.8) {
              const institution = await storage.getInstitution(user.institutionId);
              const adminUsers = await storage.getInstitutionUsers(user.institutionId);
              const admins = adminUsers.filter(u => u.role === "admin");
              
              // Send notification to admins
              for (const admin of admins) {
                await emailService.sendLicenseUsageNotification({
                  adminEmail: admin.email,
                  institutionName: institution?.name || "Unknown Institution",
                  usedSeats: seatInfo.usedSeats,
                  totalSeats: seatInfo.totalSeats || 0,
                  usagePercentage: Math.round((seatInfo.usedSeats / (seatInfo.totalSeats || 1)) * 100)
                });
              }
            }
          }
        }
        
        res.json({ message: "Email verified successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error: any) {
      console.error("Error verifying email:", error);
      res.status(400).json({ error: error.message });
    }
  });

  // Resume routes
  app.post("/api/resumes/upload", authenticate, async (req: AuthRequest, res) => {
    try {
      const objectStorage = new ObjectStorageService();
      const uploadURL = await objectStorage.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Resume upload URL error:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.post("/api/resumes", authenticate, async (req: AuthRequest, res) => {
    try {
      console.log('=== POST /api/resumes CALLED ===');
      console.log('User ID:', req.user?.id);
      console.log('Request body:', { 
        fileName: req.body.fileName, 
        filePath: req.body.filePath, 
        extractedTextLength: req.body.extractedText?.length,
        hasTargetRole: !!req.body.targetRole
      });
      
      const { fileName, filePath, extractedText, targetRole, targetIndustry, targetCompanies } = req.body;
      
      if (!extractedText) {
        console.log('ERROR: extractedText is missing or empty');
        return res.status(400).json({ error: "extractedText is required" });
      }

      // Create resume record with the provided text
      const resume = await storage.createResume({
        userId: req.user!.id,
        fileName: fileName || "resume.txt",
        filePath: filePath || "/text-input",
        extractedText,
      });

      // Create activity for resume upload
      await storage.createActivity(
        req.user!.id,
        "resume_uploaded",
        "Resume Uploaded",
        `Uploaded new resume: ${fileName || "resume.txt"}`
      );

      // Trigger AI analysis if target role is provided
      if (extractedText && targetRole) {
        try {
          const analysis = await aiService.analyzeResume(
            req.user!.id,
            extractedText,
            targetRole,
            targetIndustry,
            targetCompanies
          );
          
          console.log("AI Analysis Response:", JSON.stringify(analysis, null, 2));
          
          // Calculate rmsScore if not provided by AI or if it's 0
          let finalRmsScore = analysis.rmsScore;
          if (!finalRmsScore || finalRmsScore === 0) {
            // Calculate as weighted average of section scores
            const scores = [
              analysis.skillsScore || 0,
              analysis.experienceScore || 0,
              analysis.keywordsScore || 0,
              analysis.educationScore || 0,
              analysis.certificationsScore || 0
            ];
            finalRmsScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
            console.log(`Calculated rmsScore from section scores: ${finalRmsScore}`);
          }
          
          await storage.updateResumeAnalysis(resume.id, {
            rmsScore: finalRmsScore,
            skillsScore: analysis.skillsScore,
            experienceScore: analysis.experienceScore,
            keywordsScore: analysis.keywordsScore,
            educationScore: analysis.educationScore,
            certificationsScore: analysis.certificationsScore,
            gaps: analysis.gaps,
            overallInsights: analysis.overallInsights,
            sectionAnalysis: analysis.sectionAnalysis,
            targetRole: targetRole,
            targetIndustry: targetIndustry,
            targetCompanies: targetCompanies,
            analysisHash: analysis.analysisHash
          });

          // Save to analysis history for tracking over time
          await storage.createResumeAnalysisHistory({
            userId: req.user!.id,
            resumeId: resume.id,
            fileName: resume.fileName,
            rmsScore: finalRmsScore,
            skillsScore: analysis.skillsScore,
            experienceScore: analysis.experienceScore,
            keywordsScore: analysis.keywordsScore,
            educationScore: analysis.educationScore,
            certificationsScore: analysis.certificationsScore,
            gaps: analysis.gaps,
            overallInsights: analysis.overallInsights,
            sectionAnalysis: analysis.sectionAnalysis,
            targetRole: targetRole || null,
            targetIndustry: targetIndustry || null,
            targetCompanies: targetCompanies ? [targetCompanies] : null,
            analysisHash: analysis.analysisHash
          });

          // Create activity
          await storage.createActivity(
            req.user!.id,
            "resume_analyzed",
            "Resume Analysis Complete",
            `Your resume scored ${finalRmsScore}/100`
          );
        } catch (aiError) {
          console.error("AI analysis error:", aiError);
          // Continue without analysis for now
        }
      }

      console.log('=== Resume created successfully ===');
      console.log('Resume ID:', resume.id);
      res.status(201).json(resume);
    } catch (error) {
      console.error("Resume creation error:", error);
      res.status(500).json({ error: "Failed to create resume" });
    }
  });

  app.post("/api/resumes/:id/analyze", authenticate, requireFeature('resume_analysis'), async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { targetRole, targetIndustry, targetCompanies } = req.body;
      
      if (!targetRole) {
        return res.status(400).json({ error: "targetRole is required" });
      }

      // Get the resume
      const resumes = await storage.getUserResumes(req.user!.id);
      const resume = resumes.find(r => r.id === id);
      
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }

      if (!resume.extractedText) {
        return res.status(400).json({ error: "Resume has no text content" });
      }

      // Trigger AI analysis with new target criteria
      try {
        const analysis = await aiService.analyzeResume(
          req.user!.id,
          resume.extractedText,
          targetRole,
          targetIndustry,
          targetCompanies
        );
        
        console.log("AI Re-Analysis Response:", JSON.stringify(analysis, null, 2));
        
        // Calculate rmsScore if not provided by AI or if it's 0
        let finalRmsScore = analysis.rmsScore;
        if (!finalRmsScore || finalRmsScore === 0) {
          // Calculate as weighted average of section scores
          const scores = [
            analysis.skillsScore || 0,
            analysis.experienceScore || 0,
            analysis.keywordsScore || 0,
            analysis.educationScore || 0,
            analysis.certificationsScore || 0
          ];
          finalRmsScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
          console.log(`Calculated rmsScore from section scores: ${finalRmsScore}`);
        }
        
        await storage.updateResumeAnalysis(resume.id, {
          rmsScore: finalRmsScore,
          skillsScore: analysis.skillsScore,
          experienceScore: analysis.experienceScore,
          keywordsScore: analysis.keywordsScore,
          educationScore: analysis.educationScore,
          certificationsScore: analysis.certificationsScore,
          gaps: analysis.gaps,
          overallInsights: analysis.overallInsights,
          sectionAnalysis: analysis.sectionAnalysis,
          targetRole: targetRole,
          targetIndustry: targetIndustry,
          targetCompanies: targetCompanies,
          analysisHash: analysis.analysisHash
        });

        // Save to analysis history for tracking over time
        await storage.createResumeAnalysisHistory({
          userId: req.user!.id,
          resumeId: resume.id,
          fileName: resume.fileName,
          rmsScore: finalRmsScore,
          skillsScore: analysis.skillsScore,
          experienceScore: analysis.experienceScore,
          keywordsScore: analysis.keywordsScore,
          educationScore: analysis.educationScore,
          certificationsScore: analysis.certificationsScore,
          gaps: analysis.gaps,
          overallInsights: analysis.overallInsights,
          sectionAnalysis: analysis.sectionAnalysis,
          targetRole: targetRole || null,
          targetIndustry: targetIndustry || null,
          targetCompanies: targetCompanies ? [targetCompanies] : null,
          analysisHash: analysis.analysisHash
        });

        // Create activity
        await storage.createActivity(
          req.user!.id,
          "resume_analyzed",
          "Resume Re-Analyzed",
          `Your resume was re-analyzed for ${targetRole} and scored ${finalRmsScore}/100`
        );

        res.json({ 
          message: "Resume re-analyzed successfully",
          rmsScore: finalRmsScore 
        });
      } catch (aiError) {
        console.error("AI analysis error:", aiError);
        res.status(500).json({ error: "Failed to analyze resume" });
      }
    } catch (error) {
      console.error("Resume re-analysis error:", error);
      res.status(500).json({ error: "Failed to re-analyze resume" });
    }
  });

  app.get("/api/resumes", authenticate, async (req: AuthRequest, res) => {
    try {
      const resumes = await storage.getUserResumes(req.user!.id);
      res.json(resumes);
    } catch (error) {
      console.error("Get resumes error:", error);
      res.status(500).json({ error: "Failed to get resumes" });
    }
  });

  app.get("/api/resumes/active", authenticate, async (req: AuthRequest, res) => {
    try {
      const resume = await storage.getActiveResume(req.user!.id);
      res.json(resume || null);
    } catch (error) {
      console.error("Get active resume error:", error);
      res.status(500).json({ error: "Failed to get active resume" });
    }
  });

  // Resume Analysis History
  app.get("/api/resume-analysis-history", authenticate, async (req: AuthRequest, res) => {
    try {
      const { targetRole, targetIndustry, startDate, endDate } = req.query;
      
      const filters: any = {};
      if (targetRole) filters.targetRole = targetRole as string;
      if (targetIndustry) filters.targetIndustry = targetIndustry as string;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const history = await storage.getUserResumeAnalysisHistory(req.user!.id, filters);
      res.json(history);
    } catch (error) {
      console.error("Get resume analysis history error:", error);
      res.status(500).json({ error: "Failed to get resume analysis history" });
    }
  });

  // Get resume analysis history for a specific user (admin only)
  app.get("/api/institutions/:institutionId/users/:userId/resume-analysis-history", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "admin" && req.user!.role !== "super_admin" && req.user!.role !== "institution_admin") {
        return res.status(403).json({ error: "Only admins can view user analysis history" });
      }
      
      if ((req.user!.role === "admin" || req.user!.role === "institution_admin") && req.user!.institutionId !== req.params.institutionId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const user = await storage.getUser(req.params.userId);
      if (!user || user.institutionId !== req.params.institutionId) {
        return res.status(404).json({ error: "User not found" });
      }
      
      const history = await storage.getUserResumeAnalysisHistory(req.params.userId);
      
      // Include AI summary in response
      res.json({
        history,
        aiSummary: user.aiSummary,
        aiSummaryGeneratedAt: user.aiSummaryGeneratedAt
      });
    } catch (error: any) {
      console.error("Error fetching user analysis history:", error);
      res.status(500).json({ error: "Failed to fetch user analysis history" });
    }
  });

  // Generate AI summary of student insights
  app.post("/api/institutions/:institutionId/users/:userId/generate-summary", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "admin" && req.user!.role !== "super_admin" && req.user!.role !== "institution_admin") {
        return res.status(403).json({ error: "Only admins can generate student summaries" });
      }
      
      if ((req.user!.role === "admin" || req.user!.role === "institution_admin") && req.user!.institutionId !== req.params.institutionId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const user = await storage.getUser(req.params.userId);
      if (!user || user.institutionId !== req.params.institutionId) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      // Fetch all resume analysis history for this student
      const history = await storage.getUserResumeAnalysisHistory(req.params.userId);
      
      if (history.length === 0) {
        return res.status(400).json({ error: "No resume analysis history available for this student" });
      }
      
      // Prepare data for AI summarization
      const analysisData = history.map(h => ({
        date: h.createdAt,
        targetRole: h.targetRole,
        rmsScore: h.rmsScore,
        strengths: h.overallInsights?.strengths || [],
        improvements: h.overallInsights?.improvements || [],
        sectionAnalysis: h.sectionAnalysis
      }));
      
      // Generate AI summary using OpenAI
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const summaryPrompt = `You are an expert career counselor analyzing a student's resume development journey. Based on the following resume analyses conducted over time, provide a comprehensive summary that highlights:

1. Overall progress and trends in their resume quality
2. Consistent strengths across all analyses
3. Areas that need continued improvement
4. Key recommendations for their career development

Student name: ${user.firstName} ${user.lastName}
Total analyses: ${history.length}

Analysis data:
${JSON.stringify(analysisData, null, 2)}

Provide a concise, actionable summary (max 500 words) that an institutional administrator can use to guide this student.`;

      // Using OpenAI directly since aiService doesn't expose callOpenAI
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const openaiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert career counselor providing insights to institutional administrators about student career development."
          },
          {
            role: "user",
            content: summaryPrompt
          }
        ],
        max_completion_tokens: 1500
      });
      
      const summary = openaiResponse.choices[0].message.content || "Unable to generate summary";
      
      // Store the summary in the database
      await storage.updateUserSummary(req.params.userId, summary);
      
      res.json({ 
        summary,
        generatedAt: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Error generating AI summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });

  // Generate group insights for all students in an institution
  app.post("/api/institutions/:institutionId/generate-group-insights", authenticate, async (req: AuthRequest, res) => {
    try {
      if (req.user!.role !== "admin" && req.user!.role !== "super_admin" && req.user!.role !== "institution_admin") {
        return res.status(403).json({ error: "Only admins can generate group insights" });
      }
      
      if ((req.user!.role === "admin" || req.user!.role === "institution_admin") && req.user!.institutionId !== req.params.institutionId) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Get all students in the institution
      const students = await storage.getInstitutionUsers(req.params.institutionId, true);
      
      if (students.length === 0) {
        return res.status(400).json({ error: "No students found in this institution" });
      }
      
      // Get the most recent resume analysis for each student
      const studentInsights = await Promise.all(
        students.map(async (student) => {
          const history = await storage.getUserResumeAnalysisHistory(student.id);
          
          if (history.length === 0) {
            return null;
          }
          
          // Get the most recent analysis
          const mostRecent = history[0];
          
          return {
            studentName: `${student.firstName} ${student.lastName}`,
            studentEmail: student.email,
            targetRole: mostRecent.targetRole,
            targetIndustry: mostRecent.targetIndustry,
            rmsScore: mostRecent.rmsScore,
            skillsScore: mostRecent.skillsScore,
            experienceScore: mostRecent.experienceScore,
            keywordsScore: mostRecent.keywordsScore,
            educationScore: mostRecent.educationScore,
            strengths: mostRecent.overallInsights?.strengths || [],
            improvements: mostRecent.overallInsights?.improvements || [],
            sectionAnalysis: mostRecent.sectionAnalysis,
            analyzedAt: mostRecent.createdAt
          };
        })
      );
      
      // Filter out students with no resume analyses
      const validInsights = studentInsights.filter(insight => insight !== null);
      
      if (validInsights.length === 0) {
        return res.status(400).json({ error: "No students have resume analyses yet" });
      }
      
      // Generate group insights using OpenAI
      const groupPrompt = `You are an expert career counselor and institutional advisor analyzing resume data across ${validInsights.length} students from the same institution. Based on the following student resume analyses, provide comprehensive group insights that will help the institution support their students more effectively.

CRITICAL REQUIREMENTS:
1. Identify COLLECTIVE STRENGTHS across all students (what are they doing well as a group?)
2. Identify COLLECTIVE WEAKNESSES and gaps (what areas need improvement across the student body?)
3. Provide ACTIONABLE RECOMMENDATIONS for students (what should they focus on improving?)
4. Identify CAREER GOALS AND TRENDS (what industries, roles, and career paths are students pursuing?)
5. Provide INSTITUTIONAL RECOMMENDATIONS:
   - Which resources to invest in (software, tools, platforms)
   - Which courses or workshops to offer
   - Which guest speakers or professionals to invite (specific fields/topics)
   - Which certifications or training programs to prioritize
   - How to better support students' career development

Student Data:
${JSON.stringify(validInsights, null, 2)}

Provide a comprehensive analysis (max 800 words) organized into clear sections:
1. Overall Group Performance Summary
2. Collective Strengths (what students are doing well)
3. Common Gaps and Weaknesses (areas needing improvement)
4. Career Goals and Industry Trends
5. Recommendations for Students
6. Strategic Recommendations for Institution

Make your recommendations specific, actionable, and data-driven based on the actual student data provided.`;

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      
      const openaiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert institutional career advisor providing strategic insights to help educational institutions support their students' career development more effectively."
          },
          {
            role: "user",
            content: groupPrompt
          }
        ],
        max_completion_tokens: 2000
      });
      
      const groupInsights = openaiResponse.choices[0].message.content || "Unable to generate group insights";
      
      res.json({ 
        insights: groupInsights,
        generatedAt: new Date().toISOString(),
        studentsAnalyzed: validInsights.length,
        totalStudents: students.length
      });
    } catch (error: any) {
      console.error("Error generating group insights:", error);
      res.status(500).json({ error: "Failed to generate group insights" });
    }
  });

  // Career roadmap routes
  app.post("/api/roadmaps/generate", authenticate, requireFeature('career_roadmap_generator'), async (req: AuthRequest, res) => {
    try {
      const { phase } = req.body;
      
      if (!["30_days", "3_months", "6_months"].includes(phase)) {
        return res.status(400).json({ error: "Invalid phase" });
      }

      // Get user's resume analysis for context
      const activeResume = await storage.getActiveResume(req.user!.id);
      let resumeAnalysis;
      
      if (activeResume?.gaps) {
        resumeAnalysis = {
          rmsScore: activeResume.rmsScore || 0,
          skillsScore: activeResume.skillsScore || 0,
          experienceScore: activeResume.experienceScore || 0,
          keywordsScore: activeResume.keywordsScore || 0,
          educationScore: activeResume.educationScore || 0,
          certificationsScore: activeResume.certificationsScore || 0,
          gaps: activeResume.gaps
        } as any;
      }

      const roadmapData = await aiService.generateCareerRoadmap(
        phase,
        req.user!,
        resumeAnalysis
      );

      const roadmap = await storage.createRoadmap({
        userId: req.user!.id,
        phase,
        title: roadmapData.title,
        description: roadmapData.description,
        actions: roadmapData.actions,
      });

      // Create activity
      await storage.createActivity(
        req.user!.id,
        "roadmap_generated",
        `${roadmapData.title} Created`,
        `Your ${phase.replace("_", "-")} roadmap is ready`
      );

      res.status(201).json(roadmap);
    } catch (error) {
      console.error("Roadmap generation error:", error);
      res.status(500).json({ error: "Failed to generate roadmap" });
    }
  });

  app.get("/api/roadmaps", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const roadmaps = await storage.getUserRoadmaps(req.user!.id);
      res.json(roadmaps);
    } catch (error) {
      console.error("Get roadmaps error:", error);
      res.status(500).json({ error: "Failed to get roadmaps" });
    }
  });

  app.put("/api/roadmaps/:id/progress", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { progress } = req.body;
      
      if (typeof progress !== "number" || progress < 0 || progress > 100) {
        return res.status(400).json({ error: "Progress must be between 0 and 100" });
      }

      const roadmap = await storage.updateRoadmapProgress(id, progress);
      res.json(roadmap);
    } catch (error) {
      console.error("Update roadmap progress error:", error);
      res.status(500).json({ error: "Failed to update roadmap progress" });
    }
  });

  // Track task completion for roadmap subsections
  app.post("/api/roadmaps/:id/tasks/:taskId/complete", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { id: roadmapId, taskId } = req.params;
      const userId = req.user!.id;
      
      // Update task completion status in roadmap subsections
      const roadmap = await storage.updateTaskCompletion(roadmapId, taskId, userId, true);
      res.json(roadmap);
    } catch (error) {
      console.error("Task completion error:", error);
      res.status(500).json({ error: "Failed to mark task as complete" });
    }
  });

  app.delete("/api/roadmaps/:id/tasks/:taskId/complete", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { id: roadmapId, taskId } = req.params;
      const userId = req.user!.id;
      
      // Update task completion status in roadmap subsections
      const roadmap = await storage.updateTaskCompletion(roadmapId, taskId, userId, false);
      res.json(roadmap);
    } catch (error) {
      console.error("Task uncomplete error:", error);
      res.status(500).json({ error: "Failed to mark task as incomplete" });
    }
  });

  // Get task completion status for a user
  app.get("/api/roadmaps/:id/completion-status", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { id: roadmapId } = req.params;
      const userId = req.user!.id;
      
      const completionStatus = await storage.getTaskCompletionStatus(roadmapId, userId);
      res.json(completionStatus);
    } catch (error) {
      console.error("Get completion status error:", error);
      res.status(500).json({ error: "Failed to get completion status" });
    }
  });

  // Legacy action completion for old roadmap format
  app.put("/api/roadmaps/:id/actions/:actionId/complete", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { id: roadmapId, actionId } = req.params;
      const userId = req.user!.id;
      
      // Update legacy action completion status
      const roadmap = await storage.updateActionCompletion(roadmapId, actionId, userId, true);
      res.json(roadmap);
    } catch (error) {
      console.error("Legacy action completion error:", error);
      res.status(500).json({ error: "Failed to mark action as complete" });
    }
  });

  // Job matching routes
  app.get("/api/jobs/search", async (req, res) => {
    try {
      const {
        query = "software engineer",
        location = "United States", 
        page = "1",
        limit = "20"
      } = req.query;

      console.log("Job search params:", { query, location, page, limit });

      // Get user's active resume and extract skills for compatibility scoring
      let userSkills: string[] = [];
      
      try {
        // Get the authenticated user's active resume if available
        if ((req as any).user?.id) {
          const activeResume = await storage.getActiveResume((req as any).user.id);
          if (activeResume?.extractedText) {
            // Extract skills from resume analysis if available - for now use demo skills
            // TODO: Integrate with actual resume analysis system
          }
        }
        
        // Fallback to demo skills if no user resume found
        if (userSkills.length === 0) {
          userSkills = ["JavaScript", "Python", "React", "SQL", "Machine Learning"];
          console.log("Using demo skills:", userSkills);
        } else {
          console.log("Using user skills from resume:", userSkills);
        }
      } catch (error) {
        console.error("Error extracting skills from resume:", error);
        userSkills = ["JavaScript", "Python", "React", "SQL", "Machine Learning"];
      }

      const jobsData = await jobsService.searchJobs({
        query: query as string,
        location: location as string,
        page: parseInt(page as string),
        resultsPerPage: parseInt(limit as string),
      }, userSkills);

      console.log("Jobs found:", jobsData.jobs.length);
      if (jobsData.jobs.length > 0 && jobsData.jobs[0].compatibilityScore) {
        console.log("Sample compatibility scores:", jobsData.jobs.slice(0, 3).map(j => ({ title: j.title, score: j.compatibilityScore })));
      }

      // Create activity for job search if user is authenticated
      if ((req as any).user?.id) {
        await storage.createActivity(
          (req as any).user.id,
          "job_search_performed",
          "Job Search",
          `Searched for "${query}" in ${location} - found ${jobsData.jobs.length} results`
        );
      }

      res.json({
        jobs: jobsData.jobs,
        totalCount: jobsData.totalCount,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });
    } catch (error) {
      console.error("Job search error:", error);
      res.status(500).json({ error: "Failed to search jobs" });
    }
  });

  // New endpoint: Extract job details from URL
  app.post("/api/jobs/extract-from-url", authenticate, async (req: AuthRequest, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }
        
        const html = await response.text();
        
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        
        const title = titleMatch ? titleMatch[1].split('|')[0].split('-')[0].trim() : '';
        const description = descriptionMatch ? descriptionMatch[1] : '';
        
        const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                                 .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                 .replace(/<[^>]+>/g, ' ')
                                 .replace(/\s+/g, ' ')
                                 .trim();
        
        res.json({
          title: title || 'Job Position',
          company: 'Company Name',
          description: description || textContent.substring(0, 2000),
          url
        });
      } catch (fetchError) {
        return res.status(400).json({ 
          error: "Unable to extract job details from URL. Please enter details manually." 
        });
      }
    } catch (error: any) {
      console.error("URL extraction error:", error);
      res.status(500).json({ error: "Failed to extract job details" });
    }
  });

  // New endpoint: Extract job details from URL
  app.post("/api/jobs/extract-from-url", authenticate, async (req: AuthRequest, res) => {
    try {
      const { url } = req.body;

      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }

        const html = await response.text();

        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);

        const title = titleMatch ? titleMatch[1].split('|')[0].split('-')[0].trim() : '';
        const description = descriptionMatch ? descriptionMatch[1] : '';

        const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
                                 .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
                                 .replace(/<[^>]+>/g, ' ')
                                 .replace(/\s+/g, ' ')
                                 .trim();

        res.json({
          title: title || 'Job Position',
          company: 'Company Name',
          description: description || textContent.substring(0, 2000),
          url
        });
      } catch (fetchError) {
        return res.status(400).json({ 
          error: "Unable to extract job details from URL. Please enter details manually." 
        });
      }
    } catch (error: any) {
      console.error("URL extraction error:", error);
      res.status(500).json({ error: "Failed to extract job details" });
    }
  });

  // New endpoint: Analyze job match (simplified - no job ID needed)
  app.post("/api/jobs/analyze-match", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { jobData } = req.body;

      if (!jobData) {
        return res.status(400).json({ error: "Job data is required" });
      }

      const activeResume = await storage.getActiveResume(req.user!.id);

      if (!activeResume?.extractedText) {
        return res.status(400).json({ error: "No active resume found. Please upload a resume first." });
      }

      const matchAnalysis = await aiService.analyzeJobMatch(activeResume.extractedText, jobData);

      res.json(matchAnalysis);
    } catch (error: any) {
      console.error("Job match analysis error:", error);
      res.status(500).json({ error: "Failed to analyze job match" });
    }
  });

  // New endpoint: Generate cover letter for job
  app.post("/api/jobs/generate-cover-letter", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { jobData } = req.body;

      if (!jobData) {
        return res.status(400).json({ error: "Job data is required" });
      }

      const activeResume = await storage.getActiveResume(req.user!.id);

      if (!activeResume?.extractedText) {
        return res.status(400).json({ error: "No active resume found. Please upload a resume first." });
      }

      const coverLetter = await aiService.generateCoverLetter(
        activeResume.extractedText,
        jobData.description || '',
        jobData.company?.display_name || jobData.company || 'the company',
        jobData.title || 'the position'
      );

      res.json({ coverLetter });
    } catch (error: any) {
      console.error("Cover letter generation error:", error);
      res.status(500).json({ error: "Failed to generate cover letter" });
    }
  });

  // Old endpoint: Get detailed AI match analysis for a specific job
  // Old endpoint: Get detailed AI match analysis for a specific job
  app.post("/api/jobs/match-analysis", authenticate, requireFeature('job_match_assistant'), async (req: AuthRequest, res) => {
    try {
      console.log("Match analysis request received from user:", req.user?.id);
      const { jobId, jobData } = req.body;
      
      if (!jobData) {
        console.log("Missing job data in request");
        return res.status(400).json({ error: "Job data is required" });
      }
      
      console.log("Job data received:", { title: jobData.title, company: jobData.company?.display_name });
      
      // Get user's active resume
      const activeResume = await storage.getActiveResume(req.user!.id);
      console.log("Active resume found:", !!activeResume?.extractedText);
      
      if (!activeResume?.extractedText) {
        return res.status(400).json({ error: "No active resume found. Please upload a resume first." });
      }
      
      console.log("Calling AI service for match analysis...");
      // Get AI analysis of resume vs job match
      const matchAnalysis = await aiService.analyzeJobMatch(activeResume.extractedText, jobData);
      
      console.log("AI analysis completed successfully");
      res.json(matchAnalysis);
    } catch (error: any) {
      console.error("Job match analysis error:", error);
      res.status(500).json({ error: "Failed to analyze job match" });
    }
  });

  app.get("/api/jobs/matches", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const jobMatches = await storage.getUserJobMatches(req.user!.id, limit);
      res.json(jobMatches);
    } catch (error) {
      console.error("Get job matches error:", error);
      res.status(500).json({ error: "Failed to get job matches" });
    }
  });

  // Get user's job analysis history
  app.get("/api/jobs/analyses", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const analyses = await storage.getUserJobAnalyses(req.user!.id, limit);
      res.json(analyses);
    } catch (error) {
      console.error("Get job analyses error:", error);
      res.status(500).json({ error: "Failed to get job analyses" });
    }
  });

  // Get user's tailored resumes
  app.get("/api/jobs/tailored-resumes", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const tailoredResumes = await storage.getTailoredResumes(req.user!.id, limit);
      res.json(tailoredResumes);
    } catch (error) {
      console.error("Get tailored resumes error:", error);
      res.status(500).json({ error: "Failed to get tailored resumes" });
    }
  });

  // Get user's cover letters
  app.get("/api/jobs/cover-letters", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const coverLetters = await storage.getUserCoverLetters(req.user!.id, limit);
      res.json(coverLetters);
    } catch (error) {
      console.error("Get cover letters error:", error);
      res.status(500).json({ error: "Failed to get cover letters" });
    }
  });

  // Beyond Jobs routes - experiential opportunities
  app.get("/api/beyond-jobs/search", authenticate, async (req: AuthRequest, res) => {
    try {
      const {
        type,
        location,
        keyword,
        remote,
        limit
      } = req.query;

      const opportunities = await beyondJobsService.searchOpportunities({
        type: type as string,
        location: location as string,
        keyword: keyword as string,
        remote: remote === 'true',
        limit: limit ? parseInt(limit as string) : 5
      });

      res.json({ opportunities, totalCount: opportunities.length });
    } catch (error: any) {
      console.error("Beyond Jobs search error:", error);
      res.status(500).json({ error: "Failed to search opportunities" });
    }
  });

  app.post("/api/beyond-jobs/ai-rank", authenticate, async (req: AuthRequest, res) => {
    try {
      const { opportunities } = req.body;
      
      // Get user's resume for personalized ranking
      const activeResume = await storage.getActiveResume(req.user!.id);
      if (!activeResume) {
        return res.status(400).json({ error: "No active resume found" });
      }

      const userSkills = activeResume.extractedText ? 
        aiService.extractSkills(activeResume.extractedText) : [];
      const resumeGaps = activeResume.gaps || [];

      const rankedOpportunities = await beyondJobsService.getAIRanking(
        opportunities,
        userSkills,
        resumeGaps,
        aiService
      );

      res.json({ opportunities: rankedOpportunities });
    } catch (error: any) {
      console.error("AI ranking error:", error);
      res.status(500).json({ error: "Failed to rank opportunities" });
    }
  });

  app.post("/api/beyond-jobs/save", authenticate, async (req: AuthRequest, res) => {
    try {
      const { opportunityData } = req.body;
      
      const savedOpportunity = await storage.saveOpportunity(req.user!.id, opportunityData);
      
      res.json(savedOpportunity);
    } catch (error: any) {
      console.error("Save opportunity error:", error);
      res.status(500).json({ error: "Failed to save opportunity" });
    }
  });

  app.get("/api/beyond-jobs/saved", authenticate, async (req: AuthRequest, res) => {
    try {
      const saved = await storage.getSavedOpportunities(req.user!.id);
      res.json(saved);
    } catch (error: any) {
      console.error("Get saved opportunities error:", error);
      res.status(500).json({ error: "Failed to get saved opportunities" });
    }
  });

  // Updated resume tailoring endpoint - works with real-time job data
  // AI Copilot - Get tailored resumes for user
  app.get("/api/copilot/tailored-resumes", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      console.log('Fetching tailored resumes for user:', userId);
      
      const tailoredResumes = await storage.getTailoredResumes(userId);
      console.log('Retrieved tailored resumes count:', tailoredResumes.length);
      console.log('First resume:', tailoredResumes[0] ? { id: tailoredResumes[0].id, jobTitle: tailoredResumes[0].jobTitle, company: tailoredResumes[0].company } : 'none');
      
      res.json(tailoredResumes);
    } catch (error) {
      console.error("Error fetching tailored resumes:", error);
      res.status(500).json({ error: "Failed to fetch tailored resumes" });
    }
  });

  // AI Copilot - Generate cover letter
  app.post("/api/copilot/cover-letter", authenticate, async (req: AuthRequest, res) => {
    try {
      const { jobTitle, company, jobDescription, resumeText } = req.body;
      
      if (!jobTitle || !company || !jobDescription || !resumeText) {
        return res.status(400).json({ 
          error: "jobTitle, company, jobDescription, and resumeText are required" 
        });
      }

      const coverLetter = await aiService.generateCoverLetter(
        resumeText,
        jobDescription,
        company,
        jobTitle
      );

      res.json({ coverLetter });
    } catch (error) {
      console.error("Error generating cover letter:", error);
      res.status(500).json({ error: "Failed to generate cover letter" });
    }
  });

  // AI Copilot - Salary negotiation strategy
  app.post("/api/copilot/salary-negotiation", authenticate, requireFeature('salary_negotiator'), async (req: AuthRequest, res) => {
    try {
      const { currentSalary, targetSalary, jobRole, location, yearsExperience } = req.body;
      
      if (!targetSalary || !jobRole) {
        return res.status(400).json({ error: "targetSalary and jobRole are required" });
      }

      // Get user's resume for personalized advice
      const resume = await storage.getActiveResume(req.user!.id);
      if (!resume?.extractedText) {
        return res.status(400).json({ error: "Resume required for personalized salary negotiation" });
      }

      const negotiationStrategy = await aiService.generateSalaryNegotiationStrategy({
        currentSalary,
        targetSalary,
        jobRole,
        location,
        yearsExperience,
        resumeText: resume.extractedText
      });

      res.json({ strategy: negotiationStrategy });
    } catch (error) {
      console.error("Error generating salary negotiation strategy:", error);
      res.status(500).json({ error: "Failed to generate salary negotiation strategy" });
    }
  });

  // AI Copilot - Auto resume updater from roadmap
  app.post("/api/copilot/update-resume-from-roadmap", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Get user's current resume and roadmap progress
      const resume = await storage.getActiveResume(userId);
      if (!resume?.extractedText) {
        return res.status(400).json({ error: "Resume required for auto-update" });
      }

      const roadmaps = await storage.getUserRoadmaps(userId);
      const completedTasks = roadmaps.filter(r => r.progress === 100);

      if (completedTasks.length === 0) {
        return res.status(400).json({ error: "No completed roadmap tasks to sync with resume" });
      }

      const updatedResume = await aiService.updateResumeFromRoadmap({
        resumeText: resume.extractedText,
        completedTasks: completedTasks.map(task => ({
          title: task.title,
          description: task.description || undefined,
          actions: task.actions
        }))
      });

      res.json(updatedResume);
    } catch (error) {
      console.error("Error updating resume from roadmap:", error);
      res.status(500).json({ error: "Failed to update resume from roadmap" });
    }
  });

  app.post("/api/jobs/tailor-resume", authenticate, requireFeature('job_match_assistant'), async (req: AuthRequest, res) => {
    try {
      const { jobData, baseResumeId, jobAnalysisId } = req.body;
      
      if (!jobData) {
        return res.status(400).json({ error: "Job data is required" });
      }
      
      // Get base resume
      const resume = baseResumeId 
        ? (await storage.getUserResumes(req.user!.id)).find(r => r?.id === baseResumeId)
        : await storage.getActiveResume(req.user!.id);
        
      if (!resume?.extractedText) {
        return res.status(400).json({ error: "Resume text not available. Please upload a resume first." });
      }

      // Extract keywords from job description
      const targetKeywords = jobData.description
        ?.split(/\s+/)
        .filter((word: string) => word.length > 3)
        .slice(0, 20) || [];

      const tailoredResult = await aiService.tailorResume(
        resume.extractedText,
        jobData.description || "",
        targetKeywords,
        req.user!
      );

      // Generate DOCX file with proper formatting
      const resumeParagraphs = parseResumeContentToDocx(tailoredResult.tailoredContent);
      const doc = new Document({
        sections: [{
          properties: {},
          children: resumeParagraphs,
        }],
      });

      const docxBuffer = await Packer.toBuffer(doc);
      
      // Create or find job match record for the tailored resume
      const jobMatchData = {
        userId: req.user!.id,
        externalJobId: jobData.id || `external-${Date.now()}`,
        title: jobData.title || 'Job Position',
        company: jobData.company?.display_name || jobData.company || 'Company',
        location: jobData.location || '',
        description: jobData.description || '',
        requirements: jobData.requirements || '',
        salary: jobData.salary?.display || '',
        compatibilityScore: tailoredResult.jobSpecificScore || 0,
        matchReasons: [],
        skillsGaps: [],
        source: 'job_matching'
      };
      
      console.log('Creating job match with data:', { ...jobMatchData, description: jobMatchData.description?.slice(0, 100) + '...' });
      const jobMatch = await storage.createJobMatch(jobMatchData);
      console.log('Job match created:', { id: jobMatch.id, title: jobMatch.title });
      
      // Save the tailored resume to database
      const tailoredResumeData = {
        userId: req.user!.id,
        baseResumeId: resume.id,
        jobMatchId: jobMatch.id,
        jobAnalysisId: jobAnalysisId || null,
        jobTitle: jobData.title || 'Job Position',
        jobCompany: jobData.company?.display_name || jobData.company || 'Company',
        tailoredContent: tailoredResult.tailoredContent,
        diffJson: tailoredResult.diffJson,
        jobSpecificScore: tailoredResult.jobSpecificScore,
        keywordsCovered: tailoredResult.keywordsCovered,
        remainingGaps: tailoredResult.remainingGaps
      };
      
      console.log('Creating tailored resume with data:', { userId: tailoredResumeData.userId, baseResumeId: tailoredResumeData.baseResumeId, jobMatchId: tailoredResumeData.jobMatchId });
      const tailoredResumeRecord = await storage.createTailoredResume(tailoredResumeData);
      console.log('Tailored resume created:', { id: tailoredResumeRecord.id, userId: tailoredResumeRecord.userId });
      
      // Create activity
      await storage.createActivity(
        req.user!.id,
        "resume_tailored",
        "Resume Tailored",
        `Resume optimized for ${jobData.company?.display_name || 'Company'} - ${jobData.title}`
      );

      res.status(201).json({
        id: tailoredResumeRecord.id,
        jobMatchId: jobMatch.id,
        tailoredContent: tailoredResult.tailoredContent,
        jobSpecificScore: tailoredResult.jobSpecificScore,
        keywordsCovered: tailoredResult.keywordsCovered,
        remainingGaps: tailoredResult.remainingGaps,
        diffJson: tailoredResult.diffJson,
        docxBuffer: docxBuffer.toString('base64'),
        jobTitle: jobData.title,
        companyName: jobData.company?.display_name || 'Company'
      });
    } catch (error) {
      console.error("Resume tailoring error:", error);
      res.status(500).json({ error: "Failed to tailor resume" });
    }
  });

  // Applications routes
  app.post("/api/applications", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const applicationData = req.body;
      console.log('Raw application data:', applicationData);
      
      // Convert appliedDate string to Date object if provided
      const processedData = {
        ...applicationData,
        userId: req.user!.id,
        appliedDate: applicationData.appliedDate ? new Date(applicationData.appliedDate) : new Date(),
      };
      
      console.log('Processed application data:', { 
        ...processedData, 
        appliedDate: processedData.appliedDate?.toISOString?.() || processedData.appliedDate 
      });
      
      const application = await storage.createApplication(processedData);

      // Create activity
      await storage.createActivity(
        req.user!.id,
        "application_submitted",
        "Application Submitted",
        `Applied to ${application.company} for ${application.position}`
      );

      res.status(201).json(application);
    } catch (error) {
      console.error("Create application error:", error);
      res.status(500).json({ error: "Failed to create application" });
    }
  });

  app.get("/api/applications", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const applications = await storage.getUserApplications(req.user!.id);
      res.json(applications);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ error: "Failed to get applications" });
    }
  });

  app.put("/api/applications/:id/status", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { status, responseDate } = req.body;
      
      const application = await storage.updateApplicationStatus(
        id, 
        status, 
        responseDate ? new Date(responseDate) : undefined
      );
      
      res.json(application);
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ error: "Failed to update application status" });
    }
  });

  // Public career analysis endpoint (no auth required)
  app.post("/api/ai/career-analysis", async (req, res) => {
    try {
      const { systemPrompt, userPrompt } = req.body;
      if (!systemPrompt || !userPrompt) {
        return res.status(400).json({ error: "Missing prompt data" });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const { maxTokens } = req.body;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: typeof maxTokens === "number" ? maxTokens : 3000,
        temperature: 0.7,
      });

      const analysis = completion.choices[0]?.message?.content || "";
      res.json({ analysis });
    } catch (error) {
      console.error("Career analysis error:", error);
      res.status(500).json({ error: "Failed to generate career analysis" });
    }
  });

  // Authenticated resume score generation from chat flow — generates score and persists it
  app.post("/api/ai/chat-resume-score", authenticate, async (req: AuthRequest, res) => {
    try {
      const { resumeText, targetRole, targetIndustry, targetCompanies, preferredLocation, background } = req.body;
      if (!resumeText) {
        return res.status(400).json({ error: "Resume text is required" });
      }

      const userId = req.user!.id;

      // Run full analysis via the existing AIService
      const analysis = await aiService.analyzeResume(
        userId,
        resumeText,
        targetRole,
        targetIndustry,
        targetCompanies
      );

      // Get or create the user's active resume record to attach the score
      let resume = await storage.getActiveResume(userId);

      if (!resume) {
        // Create a lightweight resume entry to hold the score
        resume = await storage.createResume({
          userId,
          fileName: "Chat Resume",
          filePath: "chat://inline",
          extractedText: resumeText,
          isActive: true,
        });
      }

      // Persist the analysis scores
      await storage.updateResumeAnalysis(resume.id, {
        rmsScore: analysis.rmsScore,
        skillsScore: analysis.skillsScore,
        experienceScore: analysis.experienceScore,
        keywordsScore: analysis.keywordsScore,
        educationScore: analysis.educationScore,
        certificationsScore: analysis.certificationsScore,
        overallInsights: analysis.overallInsights,
        sectionAnalysis: analysis.sectionAnalysis,
        gaps: analysis.gaps,
        targetRole: targetRole || null,
        targetIndustry: targetIndustry || null,
        targetCompanies: targetCompanies || null,
        analysisHash: { hash: analysis.analysisHash, method: "chat", source: "chat-flow" },
      });

      // Save to history
      try {
        await storage.createResumeAnalysisHistory({
          userId,
          resumeId: resume.id,
          fileName: resume.fileName,
          rmsScore: analysis.rmsScore,
          skillsScore: analysis.skillsScore,
          experienceScore: analysis.experienceScore,
          keywordsScore: analysis.keywordsScore,
          educationScore: analysis.educationScore,
          certificationsScore: analysis.certificationsScore,
          overallInsights: analysis.overallInsights as any,
          sectionAnalysis: analysis.sectionAnalysis as any,
          gaps: analysis.gaps as any,
          targetRole: targetRole || null,
          targetIndustry: targetIndustry || null,
        });
      } catch (histErr) {
        console.warn("Could not save resume analysis history:", histErr);
      }

      res.json({
        rmsScore: analysis.rmsScore,
        skillsScore: analysis.skillsScore,
        experienceScore: analysis.experienceScore,
        keywordsScore: analysis.keywordsScore,
        educationScore: analysis.educationScore,
        certificationsScore: analysis.certificationsScore,
        overallInsights: analysis.overallInsights,
        sectionAnalysis: analysis.sectionAnalysis,
        gaps: analysis.gaps,
      });
    } catch (error) {
      console.error("Chat resume score error:", error);
      res.status(500).json({ error: "Failed to generate resume score" });
    }
  });

  // AI Co-pilot routes
  app.post("/api/ai/cover-letter", authenticate, async (req: AuthRequest, res) => {
    try {
      const { jobDescription, company, role } = req.body;
      
      const activeResume = await storage.getActiveResume(req.user!.id);
      if (!activeResume?.extractedText) {
        return res.status(400).json({ error: "No active resume found" });
      }

      const coverLetter = await aiService.generateCoverLetter(
        activeResume.extractedText,
        jobDescription,
        company,
        role
      );

      res.json({ coverLetter });
    } catch (error) {
      console.error("Cover letter generation error:", error);
      res.status(500).json({ error: "Failed to generate cover letter" });
    }
  });

  app.post("/api/ai/linkedin-optimize", authenticate, async (req: AuthRequest, res) => {
    try {
      const { currentProfile } = req.body;
      
      const optimization = await aiService.optimizeLinkedInProfile(
        currentProfile,
        req.user!.targetRole || "Professional",
        req.user!.industries || []
      );

      res.json(optimization);
    } catch (error) {
      console.error("LinkedIn optimization error:", error);
      res.status(500).json({ error: "Failed to optimize LinkedIn profile" });
    }
  });

  // Activities and achievements
  app.get("/api/activities", authenticate, async (req: AuthRequest, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const activities = await storage.getUserActivities(req.user!.id, limit);
      res.json(activities);
    } catch (error) {
      console.error("Get activities error:", error);
      res.status(500).json({ error: "Failed to get activities" });
    }
  });

  app.get("/api/achievements", authenticate, async (req: AuthRequest, res) => {
    try {
      const achievements = await storage.getUserAchievements(req.user!.id);
      res.json(achievements);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Failed to get achievements" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authenticate, async (req: AuthRequest, res) => {
    try {
      const [
        activeResume,
        applications,
        roadmaps,
        achievements,
        activities,
        jobMatches
      ] = await Promise.all([
        storage.getActiveResume(req.user!.id),
        storage.getUserApplications(req.user!.id),
        storage.getUserRoadmaps(req.user!.id),
        storage.getUserAchievements(req.user!.id),
        storage.getUserActivities(req.user!.id, 5),
        storage.getUserJobMatches(req.user!.id, 10)
      ]);

      // Calculate dynamic stats
      const rmsScoreImprovement = activeResume?.rmsScore ? 
        Math.max(0, (activeResume.rmsScore - 45)) : 0; // Improvement from baseline
      
      const applicationStats = {
        total: applications.length,
        pending: applications.filter(app => app.status === "applied").length,
        interviewing: applications.filter(app => ["interview_scheduled", "interviewed"].includes(app.status)).length,
        rejected: applications.filter(app => app.status === "rejected").length,
        offers: applications.filter(app => app.status === "offered").length
      };

      // Calculate actual streak from activities
      const today = new Date();
      let currentStreak = 0;
      const recentDays = 30;
      
      for (let i = 0; i < recentDays; i++) {
        const dayToCheck = new Date(today);
        dayToCheck.setDate(today.getDate() - i);
        const dayStart = new Date(dayToCheck.setHours(0, 0, 0, 0));
        const dayEnd = new Date(dayToCheck.setHours(23, 59, 59, 999));
        
        const hasActivity = activities.some(activity => {
          const activityDate = new Date(activity.createdAt);
          return activityDate >= dayStart && activityDate <= dayEnd;
        });
        
        if (hasActivity) {
          currentStreak++;
        } else if (i > 0) {
          break; // Break streak if no activity found (but not for today)
        }
      }

      // Get current active roadmap phase
      const activeRoadmap = roadmaps.find(r => r.isActive === true) || roadmaps[0];
      // Phase title mapping to match Career Roadmap
      const phaseLabels = {
        '30_days': '30-Day Career Advancement Plan',
        '3_months': '3-Month Foundation Building',
        '6_months': '6-Month Career Transformation'
      };
      
      const currentPhase = activeRoadmap ? {
        title: activeRoadmap.title || phaseLabels[activeRoadmap.phase as keyof typeof phaseLabels] || '30-Day Career Advancement Plan',
        progress: activeRoadmap.progress || 0,
        phase: activeRoadmap.phase || '30_days'
      } : null;

      // Get AI insights from actual resume analysis
      const aiInsights = activeResume?.gaps && Array.isArray(activeResume.gaps) ? {
        topRecommendations: [...activeResume.gaps] // Create copy to avoid mutation
          .map((gap: any) => ({
            // Normalize the gap data structure
            category: gap.category || 'General Improvement',
            rationale: gap.rationale || gap.recommendation || gap.description || 'No details provided',
            priority: (gap.priority || 'medium').toLowerCase(),
            impact: Number(gap.impact) || 0
          }))
          .sort((a: any, b: any) => {
            // Prioritize by impact and priority (same logic as Resume Analysis)
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            const aScore = (priorityWeight[a.priority as keyof typeof priorityWeight] || 1) * (a.impact || 0);
            const bScore = (priorityWeight[b.priority as keyof typeof priorityWeight] || 1) * (b.impact || 0);
            return bScore - aScore;
          })
          .slice(0, 2) // Get top 2 recommendations
      } : null;

      // Get actual roadmap tasks for dashboard display
      const currentRoadmapTasks = activeRoadmap && activeRoadmap.subsections ? 
        (activeRoadmap.subsections as any[]).flatMap(subsection => 
          (subsection.tasks || []).map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.completed ? 'completed' : 'pending',
            completed: task.completed,
            priority: task.priority || 'medium',
            dueDate: task.dueDate,
            icon: task.icon || 'clock'
          }))
        ).slice(0, 3) // Show top 3 tasks on dashboard
      : [];

      const stats = {
        rmsScore: activeResume?.rmsScore || 0,
        rmsScoreImprovement,
        applicationsCount: applications.length,
        pendingApplications: applicationStats.pending,
        interviewingCount: applicationStats.interviewing,
        applicationStats,
        roadmapProgress: roadmaps.length > 0 ? 
          Math.round(roadmaps.reduce((sum, r) => sum + (r.progress || 0), 0) / roadmaps.length) : 0,
        currentPhase,
        currentRoadmapTasks,
        achievementsCount: achievements.length,
        recentActivities: activities,
        topJobMatches: jobMatches.slice(0, 5),
        streak: Math.max(1, currentStreak),
        totalActivities: activities.length,
        aiInsights,
        weeklyProgress: {
          applicationsThisWeek: applications.filter(app => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(app.appliedDate) > weekAgo;
          }).length,
          activitiesThisWeek: activities.filter(activity => {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(activity.createdAt) > weekAgo;
          }).length
        }
      };

      // Update user session with streak info for display in header
      if ((req as any).user) {
        (req as any).user.streak = stats.streak;
        (req as any).user.unreadNotifications = Math.min(9, stats.totalActivities); // Cap at 9 for UI
      }
      
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ error: "Failed to get dashboard stats" });
    }
  });

  // Interview prep routes
  app.post("/api/interview-prep/generate-questions", authenticate, requireFeature('interview_prep_assistant'), async (req: AuthRequest, res) => {
    try {
      const { applicationId, category, count = 10 } = req.body;
      
      if (!applicationId || !category) {
        return res.status(400).json({ error: "Application ID and category are required" });
      }

      // Get the application details to extract job info
      const applications = await storage.getUserApplications(req.user!.id);
      const application = applications.find(app => app.id === applicationId);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      const questions = await aiService.generateInterviewQuestions(
        application.position,
        application.company,
        category,
        count
      );

      res.json(questions);
    } catch (error) {
      console.error("Generate interview questions error:", error);
      res.status(500).json({ error: "Failed to generate interview questions" });
    }
  });

  app.get("/api/interview-prep/questions", authenticate, async (req: AuthRequest, res) => {
    try {
      const { applicationId, category } = req.query;
      
      if (!applicationId) {
        return res.status(400).json({ error: "Application ID is required" });
      }

      // Get the application details
      const applications = await storage.getUserApplications(req.user!.id);
      const application = applications.find(app => app.id === applicationId);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // For now, return empty array - questions are generated on demand
      // In a real implementation, you might want to store generated questions
      res.json([]);
    } catch (error) {
      console.error("Get interview questions error:", error);
      res.status(500).json({ error: "Failed to get interview questions" });
    }
  });

  app.get("/api/interview-prep/resources", authenticate, async (req: AuthRequest, res) => {
    try {
      const { applicationId } = req.query;
      
      if (!applicationId) {
        return res.status(400).json({ error: "Application ID is required" });
      }

      // Get the application details
      const applications = await storage.getUserApplications(req.user!.id);
      const application = applications.find(app => app.id === applicationId);
      
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }

      // Extract skills from job match requirements or use defaults based on position
      let skills: string[] = [];
      if (application.jobMatchId) {
        try {
          const jobMatches = await storage.getUserJobMatches(req.user!.id);
          const jobMatch = jobMatches.find(jm => jm.id === application.jobMatchId);
          if (jobMatch && jobMatch.requirements) {
            // Extract basic skills from requirements text
            const commonSkills = ['JavaScript', 'Python', 'SQL', 'React', 'Node.js', 'AWS', 'Docker', 'Git'];
            skills = commonSkills.filter(skill => 
              jobMatch.requirements?.toLowerCase().includes(skill.toLowerCase())
            );
          }
        } catch (error) {
          console.error('Error fetching job match for skills:', error);
        }
      }
      
      // Call OpenAI to generate resources
      console.log(`Generating resources for ${application.position} at ${application.company} with skills:`, skills);
      const resources = await aiService.generatePrepResources(
        application.position,
        application.company,
        skills
      );
      console.log('OpenAI returned resources:', JSON.stringify(resources, null, 2));

      res.json(resources);
    } catch (error) {
      console.error("Get prep resources error:", error);
      res.status(500).json({ error: "Failed to get preparation resources" });
    }
  });







  // ── Mock Interview ──────────────────────────────────────────────────────────

  // Total questions per mock interview session — change this one number to adjust the count.
  const MOCK_INTERVIEW_QUESTION_COUNT = 9;

  app.post("/api/mock-interview/generate-questions", authenticate, async (req: AuthRequest, res) => {
    try {
      const { role, category = "behavioral", resumeText } = req.body;
      if (!role) return res.status(400).json({ error: "Role is required" });

      const perType = Math.floor(MOCK_INTERVIEW_QUESTION_COUNT / 3);
      const remainder = MOCK_INTERVIEW_QUESTION_COUNT - perType * 3;

      let questions: any[];
      if (category === "mix") {
        const [behavioral, technical, situational] = await Promise.all([
          aiService.generateInterviewQuestions(role, "a leading company", "behavioral", perType + remainder, resumeText),
          aiService.generateInterviewQuestions(role, "a leading company", "technical", perType, resumeText),
          aiService.generateInterviewQuestions(role, "a leading company", "situational", perType, resumeText),
        ]);
        questions = [...behavioral, ...technical, ...situational];
      } else {
        questions = await aiService.generateInterviewQuestions(role, "a leading company", category, MOCK_INTERVIEW_QUESTION_COUNT, resumeText);
      }
      res.json(questions);
    } catch (err: any) {
      console.error("Mock interview generate-questions error:", err.message);
      res.status(500).json({ error: err.message || "Failed to generate questions" });
    }
  });

  app.post("/api/mock-interview/speak", authenticate, async (req: AuthRequest, res) => {
    try {
      const { text } = req.body;
      if (!text) return res.status(400).json({ error: "text is required" });
      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: String(text).slice(0, 4096),
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      res.set("Content-Type", "audio/mpeg");
      res.set("Cache-Control", "no-store");
      res.send(buffer);
    } catch (err: any) {
      console.error("Mock interview speak error:", err.message);
      res.status(500).json({ error: err.message || "TTS failed" });
    }
  });

  app.post("/api/mock-interview/transcribe", authenticate, async (req: AuthRequest, res) => {
    try {
      const { audio, mimeType = "audio/webm" } = req.body;
      if (!audio) return res.status(400).json({ error: "Audio data is required" });

      const { default: OpenAI, toFile } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const audioBuffer = Buffer.from(audio, "base64");
      const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
      const audioFile = await toFile(audioBuffer, `answer.${ext}`, { type: mimeType });

      const response = await openai.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"],
      } as any);

      res.json({ text: (response as any).text || "", words: (response as any).words || [] });
    } catch (err: any) {
      console.error("Mock interview transcribe error:", err.message);
      res.status(500).json({ error: err.message || "Transcription failed" });
    }
  });

  app.post("/api/mock-interview/critique", authenticate, async (req: AuthRequest, res) => {
    try {
      const { role, answers, resumeText } = req.body as {
        role: string;
        resumeText?: string;
        answers: Array<{
          question: string;
          transcript: string;
          durationSeconds: number;
          words: Array<{ word: string; start: number; end: number }>;
        }>;
      };
      if (!answers?.length) return res.status(400).json({ error: "Answers are required" });

      const FILLERS = ["um", "uh", "like", "you know", "basically", "literally", "right", "so", "kind of", "sort of", "i mean", "actually"];

      const enriched = answers.map((a, i) => {
        const wordCount = a.transcript.trim().split(/\s+/).filter(Boolean).length;
        const wpm = a.durationSeconds > 5 ? Math.round(wordCount / (a.durationSeconds / 60)) : 0;
        const lower = a.transcript.toLowerCase();
        const fillerCounts: Record<string, number> = {};
        for (const f of FILLERS) {
          const matches = lower.match(new RegExp(`\\b${f}\\b`, "g"));
          if (matches?.length) fillerCounts[f] = matches.length;
        }
        const totalFillers = Object.values(fillerCounts).reduce((s, n) => s + n, 0);
        const longPauses: number[] = [];
        if (Array.isArray(a.words) && a.words.length > 1) {
          for (let j = 1; j < a.words.length; j++) {
            const gap = a.words[j].start - a.words[j - 1].end;
            if (gap >= 2) longPauses.push(Math.round(gap * 10) / 10);
          }
        }
        return { number: i + 1, question: a.question, transcript: a.transcript, durationSeconds: a.durationSeconds, wordCount, wpm, fillerCounts, totalFillers, longPauses };
      });

      const systemPrompt = `You are a senior interview coach and hiring manager with 15+ years of experience at top-tier companies. Your critiques are honest, detailed, and evidence-based — you cite specific phrases from the transcript.

Your content analysis goes beyond surface-level feedback. For every answer you ask:
1. Did the candidate actually answer what was asked, or did they pivot to something easier?
2. Is the claim specific and verifiable (names, numbers, timelines, outcomes) or vague and generic?
3. Would a skeptical hiring manager find this answer memorable or forgettable?
4. What is missing that a strong candidate would have included?

Format: Use markdown with ## for section headers, ### for sub-headers, **bold** for key terms, and - for bullets. Quote specific phrases from the transcript in "quotes" when praising or critiquing them. Be direct — do not soften valid criticism with filler praise.

Important: This analysis is based on transcript text and timing data only. Do NOT assess tone, vocal energy, confidence, or body language.`;

      const answersSummary = enriched.map(a => `---
## Question ${a.number}: "${a.question}"
Duration: ${a.durationSeconds}s | Words: ${a.wordCount} | WPM: ${a.wpm > 0 ? a.wpm : "N/A"}
Filler words: ${a.totalFillers > 0 ? Object.entries(a.fillerCounts).map(([k, v]) => `"${k}" ×${v}`).join(", ") : "none detected"}
Long pauses (>2s): ${a.longPauses.length > 0 ? a.longPauses.map((p: number) => `${p}s`).join(", ") : "none"}
Transcript: "${a.transcript || "(no speech detected)"}"`).join("\n\n");

      const resumeContext = resumeText?.trim()
        ? `\n\nCandidate's resume (use it to assess whether answers match their stated background and call out any inconsistencies or missed opportunities to reference real experience):\n<resume>\n${resumeText.trim()}\n</resume>`
        : "";

      const userPrompt = `The candidate is practicing for a **${role || "General"}** interview.${resumeContext}

${answersSummary}

---

## Instructions

For EACH question, provide the following two sections. Be thorough and evidence-based — quote phrases from the transcript.

---

### Q[N] — Content Analysis

**1. Answer Accuracy**
- Did the candidate directly answer the question asked, or did they sidestep it?
- If they missed the core of the question, state exactly what they failed to address.

**2. Structure & Framework**
- For behavioral questions: evaluate STAR completeness. Was the Situation clear and concise? Was the Task (their specific responsibility) defined? Were the Actions detailed and in first person ("I did X" not "we did X")? Was the Result quantified or at least clearly stated?
- For technical questions: did they explain their reasoning step by step? Did they cover edge cases, trade-offs, or alternatives?
- For situational questions: did they lay out a clear decision process? Did they show awareness of stakeholders, risks, and outcomes?
- Quote the weakest part of their structure with a brief explanation of why it falls short.

**3. Specificity & Evidence**
- List any specific details they gave (names, metrics, timeframes, team sizes, technologies, dollar figures). If they gave none, say so explicitly.
- Identify the single most vague or generic statement in their answer and explain how it would land with a skeptical interviewer.
- Rate specificity: **Low** (all generalities) / **Medium** (some details, no hard outcomes) / **High** (concrete, verifiable claims).

**4. Role Relevance**
- How well does the answer demonstrate skills or qualities that matter for a **${role || "this role"}**?
- Did they miss an opportunity to connect their experience to what interviewers at this level actually care about?

**5. What a Strong Answer Would Add**
- Give 2–3 concrete, specific things a top-10% candidate would have said that this candidate did not. Be prescriptive — not "add more detail" but "state the business impact in dollars or percentage improvement."

**6. Overall Content Score: X/10**
- One sentence justifying the score.

---

### Q[N] — Delivery *(transcript-based metrics only)*
- **Pace:** ${enriched[0]?.wpm > 0 ? "Comment on WPM. Ideal 120–160; <100 is too slow; >180 is rushed." : "Answer too brief to compute WPM reliably."}
- **Fillers:** Note total count and which words were most frequent. Under 3/min acceptable; 5+/min distracting.
- **Length:** Flag if too short (<60s — insufficient depth), appropriate (60–180s), or rambling (>180s — needs editing).
- **Pauses:** Note any gaps >2s. Were they before key points (thoughtful) or mid-sentence (hesitant)?

---

After analyzing all questions, provide:

## 🎯 Overall Session Assessment

### Strengths (2–3)
For each: name the strength, quote or cite the answer where it appeared, and explain why it works.

### Critical Areas to Improve (2–3)
For each: name the specific problem, cite which answers it appeared in, and give ONE concrete, actionable fix the candidate can practice today.

### Prioritized Practice Drill
Identify the single biggest weakness across the session and prescribe a specific drill:
- What to practice (exact exercise or method)
- How often / for how long
- What "good" looks like so they know when they've improved

### Hiring Manager Perspective
In 2–3 sentences: if this were a real interview, what would a hiring manager's gut reaction be after hearing these answers? Would the candidate advance to the next round? What single thing is holding them back?

---

> *This critique is based on transcript text and timing data only. Tone, vocal energy, and confidence assessment are not included.*`;

      const { default: OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 6000,
        temperature: 0.4,
      });

      const critique = completion.choices[0]?.message?.content || "Unable to generate critique.";
      res.json({ critique });
    } catch (err: any) {
      console.error("Mock interview critique error:", err.message);
      res.status(500).json({ error: err.message || "Failed to generate critique" });
    }
  });

  // Micro-Internship Marketplace routes - Skill Gap Analysis
  app.post("/api/skill-gaps", authenticate, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertSkillGapAnalysisSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      if (!validatedData.resumeId && !validatedData.jobMatchId) {
        return res.status(400).json({ error: "Either resumeId or jobMatchId is required" });
      }
      
      const { microProjectsService } = await import("./micro-projects");
      
      const analysis = await microProjectsService.analyzeSkillGaps(
        req.user!.id,
        validatedData.resumeId,
        validatedData.jobMatchId,
        validatedData.targetRole
      );
      
      res.status(201).json(analysis);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error analyzing skill gaps:", error);
      res.status(500).json({ error: "Failed to analyze skill gaps" });
    }
  });

  app.get("/api/skill-gaps", authenticate, async (req: AuthRequest, res) => {
    try {
      const analyses = await storage.getSkillGapAnalysesByUser(req.user!.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching skill gap analyses:", error);
      res.status(500).json({ error: "Failed to fetch skill gap analyses" });
    }
  });

  app.get("/api/skill-gaps/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getSkillGapAnalysisById(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Skill gap analysis not found" });
      }
      
      if (analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching skill gap analysis:", error);
      res.status(500).json({ error: "Failed to fetch skill gap analysis" });
    }
  });

  app.patch("/api/skill-gaps/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getSkillGapAnalysisById(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Skill gap analysis not found" });
      }
      
      if (analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      const updates = insertSkillGapAnalysisSchema.partial().parse(req.body);
      
      // Note: No updateSkillGapAnalysis method yet - would need to add to storage
      res.json({ message: "Update endpoint not yet implemented" });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error updating skill gap analysis:", error);
      res.status(500).json({ error: "Failed to update skill gap analysis" });
    }
  });

  app.delete("/api/skill-gaps/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getSkillGapAnalysisById(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Skill gap analysis not found" });
      }
      
      if (analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      
      // Note: No deleteSkillGapAnalysis method yet - would need to add to storage
      res.status(204).json({ message: "Delete endpoint not yet implemented" });
    } catch (error) {
      console.error("Error deleting skill gap analysis:", error);
      res.status(500).json({ error: "Failed to delete skill gap analysis" });
    }
  });

  // Micro-Projects routes
  app.post("/api/micro-projects/generate", authenticate, requireFeature('micro_project_generator'), async (req: AuthRequest, res) => {
    try {
      const { skillGapAnalysisId } = req.body;
      
      if (!skillGapAnalysisId) {
        return res.status(400).json({ error: "Skill gap analysis ID is required" });
      }
      
      // Verify ownership of skill gap analysis
      const analysis = await storage.getSkillGapAnalysisById(skillGapAnalysisId);
      if (!analysis || analysis.userId !== req.user!.id) {
        return res.status(403).json({ error: "Access denied to skill gap analysis" });
      }
      
      const { microProjectsService } = await import("./micro-projects");
      
      const projects = await microProjectsService.generateMicroProjectsForSkillGaps(skillGapAnalysisId);
      
      res.status(201).json(projects);
    } catch (error) {
      console.error("Error generating micro-projects:", error);
      res.status(500).json({ error: "Failed to generate micro-projects" });
    }
  });

  app.get("/api/micro-projects", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { skills, limit = 20, offset = 0 } = req.query;
      const userId = req.user!.id;
      
      let projects;
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        projects = await storage.getMicroProjectsBySkills(skillsArray as string[], userId);
      } else {
        projects = await storage.getMicroProjectsByUser(userId, Number(limit), Number(offset));
      }
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching micro-projects:", error);
      res.status(500).json({ error: "Failed to fetch micro-projects" });
    }
  });

  app.get("/api/micro-projects/recommended", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { microProjectsService } = await import("./micro-projects");
      
      const projects = await microProjectsService.getRecommendedProjectsForUser(req.user!.id);
      
      res.json(projects);
    } catch (error) {
      console.error("Error fetching recommended projects:", error);
      res.status(500).json({ error: "Failed to fetch recommended projects" });
    }
  });

  // NEW: Role-based project generation
  app.post("/api/micro-projects/generate-from-role", authenticate, requireFeature('micro_project_generator'), async (req: AuthRequest, res) => {
    try {
      const { targetRole, count, difficulty } = req.body;
      
      if (!targetRole || typeof targetRole !== 'string') {
        return res.status(400).json({ error: "Target role is required" });
      }
      
      const projectCount = count && typeof count === 'number' && count >= 1 && count <= 3 ? count : 2;
      const projectDifficulty = difficulty && ['beginner', 'intermediate', 'advanced'].includes(difficulty) ? difficulty : 'intermediate';
      
      const { microProjectsService } = await import("./micro-projects");
      
      console.log(`Generating ${projectCount} ${projectDifficulty} projects for role: ${targetRole}`);
      const newProjects = await microProjectsService.generateProjectsForRole(req.user!.id, targetRole, projectCount, projectDifficulty);
      
      // Create activity for project generation
      if (newProjects.length > 0) {
        await storage.createActivity(
          req.user!.id,
          "role_projects_generated",
          "Role-Based Projects Generated",
          `Generated ${newProjects.length} ${projectDifficulty} project(s) for ${targetRole}`
        );
      }
      
      res.json({
        message: `Generated ${newProjects.length} ${projectDifficulty} project(s) for ${targetRole}`,
        projects: newProjects
      });
    } catch (error) {
      console.error("Error generating role-based projects:", error);
      res.status(500).json({ error: "Failed to generate projects from role" });
    }
  });

  app.post("/api/micro-projects/generate-ai", authenticate, requireFeature('micro_project_generator'), async (req: AuthRequest, res) => {
    try {
      const { microProjectsService } = await import("./micro-projects");
      
      console.log(`Generating single AI project for user ${req.user!.id}`);
      const newProjects = await microProjectsService.generateAIPoweredProjects(req.user!.id);
      
      // Create activity for AI project generation
      if (newProjects.length > 0) {
        await storage.createActivity(
          req.user!.id,
          "ai_project_generated",
          "AI Project Generated",
          `Generated new practice project: ${newProjects[0].title}`
        );
      }
      
      if (newProjects.length === 0) {
        return res.status(200).json({
          message: "Generated fallback project",
          projects: [{
            id: 'fallback-' + Date.now(),
            title: "Product Management Fundamentals Practice",
            description: "Learn core PM skills through hands-on exercises with user stories, roadmaps, and stakeholder alignment.",
            targetSkill: "Product Management",
            difficulty: "intermediate",
            estimatedHours: 10,
            tags: ['product management'],
            isActive: true
          }]
        });
      }
      
      res.json({
        message: `Generated ${newProjects.length} AI-powered project`,
        projects: newProjects
      });
    } catch (error) {
      console.error("Error generating AI project:", error);
      res.status(500).json({ error: "Failed to generate AI project" });
    }
  });

  app.get("/api/micro-projects/:id", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getMicroProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: "Micro-project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error fetching micro-project:", error);
      res.status(500).json({ error: "Failed to fetch micro-project" });
    }
  });

  app.patch("/api/micro-projects/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = insertMicroProjectSchema.partial().parse(req.body);
      
      const project = await storage.getMicroProjectById(id);
      if (!project) {
        return res.status(404).json({ error: "Micro-project not found" });
      }
      
      const updatedProject = await storage.updateMicroProject(id, updates);
      res.json(updatedProject);
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error updating micro-project:", error);
      res.status(500).json({ error: "Failed to update micro-project" });
    }
  });

  // Clear all projects for the current user (must come before /:id route)
  app.delete("/api/micro-projects/clear", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      
      // Delete all micro projects for this user
      await storage.clearAllMicroProjects(userId);
      
      // Delete all project completions for this user
      await storage.clearAllProjectCompletions(userId);
      
      res.json({ message: "All projects cleared successfully" });
    } catch (error) {
      console.error("Error clearing all micro-projects:", error);
      res.status(500).json({ error: "Failed to clear all projects" });
    }
  });

  app.delete("/api/micro-projects/:id", requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const project = await storage.getMicroProjectById(id);
      
      if (!project) {
        return res.status(404).json({ error: "Micro-project not found" });
      }
      
      await storage.deleteMicroProject(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting micro-project:", error);
      res.status(500).json({ error: "Failed to delete micro-project" });
    }
  });

  app.post("/api/micro-projects/:projectId/start", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { projectId } = req.params;
      
      const { microProjectsService } = await import("./micro-projects");
      
      await microProjectsService.startProject(req.user!.id, projectId);
      
      res.json({ message: "Project started successfully" });
    } catch (error) {
      console.error("Error starting project:", error);
      res.status(500).json({ error: "Failed to start project" });
    }
  });

  app.put("/api/micro-projects/:projectId/progress", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { projectId } = req.params;
      const { progressPercentage, timeSpent } = req.body;
      
      if (progressPercentage < 0 || progressPercentage > 100) {
        return res.status(400).json({ error: "Progress percentage must be between 0 and 100" });
      }
      
      const { microProjectsService } = await import("./micro-projects");
      
      await microProjectsService.updateProjectProgress(
        req.user!.id, 
        projectId, 
        progressPercentage,
        timeSpent
      );
      
      res.json({ message: "Progress updated successfully" });
    } catch (error) {
      console.error("Error updating project progress:", error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  app.post("/api/micro-projects/:projectId/complete", authenticate, requirePaidFeatures, async (req: AuthRequest, res) => {
    try {
      const { projectId } = req.params;
      const { artifactUrls, reflectionNotes, selfAssessment } = req.body;
      
      if (!artifactUrls || artifactUrls.length === 0) {
        return res.status(400).json({ error: "At least one artifact URL is required" });
      }
      
      // Verify project exists
      const project = await storage.getMicroProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      const { microProjectsService } = await import("./micro-projects");
      
      await microProjectsService.completeProject(
        req.user!.id,
        projectId,
        artifactUrls,
        reflectionNotes,
        selfAssessment
      );
      
      res.status(201).json({ message: "Project completed successfully" });
    } catch (error) {
      console.error("Error completing project:", error);
      res.status(500).json({ error: "Failed to complete project" });
    }
  });

  // Project Completions routes
  app.get("/api/project-completions", authenticate, async (req: AuthRequest, res) => {
    try {
      const completions = await storage.getProjectCompletionsByUser(req.user!.id);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching project completions:", error);
      res.status(500).json({ error: "Failed to fetch project completions" });
    }
  });

  app.patch("/api/project-completions/:id", authenticate, async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Verify ownership through existing completion
      const existingCompletion = await storage.getProjectCompletionsByUser(req.user!.id);
      const completion = existingCompletion.find(c => c.id === id);
      
      if (!completion) {
        return res.status(404).json({ error: "Project completion not found or access denied" });
      }
      
      await storage.updateProjectCompletion(id, updates);
      res.json({ message: "Project completion updated successfully" });
    } catch (error) {
      console.error("Error updating project completion:", error);
      res.status(500).json({ error: "Failed to update project completion" });
    }
  });

  // Portfolio Artifacts routes
  app.post("/api/portfolio-artifacts", authenticate, async (req: AuthRequest, res) => {
    try {
      const validatedData = insertPortfolioArtifactSchema.parse({
        ...req.body,
        userId: req.user!.id
      });
      
      const artifactId = await storage.createPortfolioArtifact(validatedData);
      res.status(201).json({ id: artifactId, message: "Portfolio artifact created successfully" });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating portfolio artifact:", error);
      res.status(500).json({ error: "Failed to create portfolio artifact" });
    }
  });

  app.get("/api/portfolio-artifacts", authenticate, async (req: AuthRequest, res) => {
    try {
      const artifacts = await storage.getPortfolioArtifactsByUser(req.user!.id);
      res.json(artifacts);
    } catch (error) {
      console.error("Error fetching portfolio artifacts:", error);
      res.status(500).json({ error: "Failed to fetch portfolio artifacts" });
    }
  });

  // Stripe routes
  // Initialize Stripe (only if keys are present)
  let stripe: Stripe | null = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover",
    });
  }

  // Create Stripe checkout session for paid subscriptions
  app.post("/api/stripe/create-checkout-session", authenticate, async (req: AuthRequest, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." });
    }

    if (!process.env.STRIPE_PRICE_ID) {
      return res.status(500).json({ error: "Stripe Price ID is not configured. Please add STRIPE_PRICE_ID to your environment variables." });
    }

    try {
      const user = req.user!;

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Construct base URL with proper scheme
      const referer = req.get("referer") || "http://localhost:5000";
      const url = new URL(referer);
      const baseUrl = `${url.protocol}//${url.host}`;

      // Create checkout session - immediate payment required
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard?purchase=cancelled`,
        metadata: {
          userId: user.id,
        },
        allow_promotion_codes: true,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe checkout session error:', error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Create Stripe checkout session for individual feature purchase
  app.post("/api/stripe/purchase-feature", authenticate, async (req: AuthRequest, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." });
    }

    try {
      const user = req.user!;
      const { featureKey } = req.body;

      // Validate feature key
      if (!featureKey || !(featureKey in FEATURE_CATALOG)) {
        return res.status(400).json({ error: "Invalid feature key" });
      }

      const feature = FEATURE_CATALOG[featureKey as FeatureKey];

      // Check if user already has an UNUSED credit for this feature
      // Allow purchase if all previous credits have been consumed
      const unusedCredit = await storage.getUnusedFeatureCredit(user.id, featureKey);
      if (unusedCredit) {
        return res.status(400).json({ 
          error: "You already have an unused credit for this feature. Please use it before purchasing again." 
        });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id,
          },
        });
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }

      // Construct base URL with proper scheme
      const referer = req.get("referer") || "http://localhost:5000";
      const url = new URL(referer);
      const baseUrl = `${url.protocol}//${url.host}`;

      // Get Price ID from environment variables
      const priceIdEnvKey = `STRIPE_PRICE_ID_${featureKey.split('_').map((word: string) => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join('_')}`;
      const priceId = process.env[priceIdEnvKey];

      if (!priceId) {
        return res.status(500).json({ 
          error: `Stripe Price ID not configured for ${feature.name}. Please add ${priceIdEnvKey} to environment variables.` 
        });
      }

      // Create checkout session for one-time payment using actual Price ID
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment', // One-time payment
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId, // Use actual Stripe Price ID
            quantity: 1,
          },
        ],
        success_url: `${baseUrl}/dashboard?purchase=success&feature=${featureKey}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard?purchase=cancelled`,
        metadata: {
          userId: user.id,
          featureKey: featureKey,
          purchaseType: 'feature',
        },
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Stripe feature purchase error:', error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  // Stripe webhook handler
  app.post("/api/stripe/webhook", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const sig = req.headers['stripe-signature'] as string;

    if (!sig) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    let event: Stripe.Event;

    try {
      // In production, you should use a webhook secret
      // For now, we'll parse the event directly
      event = req.body;

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.metadata?.userId;
          const purchaseType = session.metadata?.purchaseType;

          if (userId) {
            // Check if this is a feature purchase or subscription
            if (purchaseType === 'feature') {
              const featureKey = session.metadata?.featureKey;
              const paymentIntentId = session.payment_intent as string;
              const checkoutSessionId = session.id;

              if (featureKey && (featureKey in FEATURE_CATALOG)) {
                const feature = FEATURE_CATALOG[featureKey as FeatureKey];
                
                // Check for duplicate purchase (idempotency) using robust multi-ref check
                const existingPurchase = await storage.findPurchaseByStripeRefs(userId, paymentIntentId, checkoutSessionId);
                
                if (existingPurchase) {
                  console.log(`ℹ️ Webhook: Feature purchase already recorded: ${featureKey} for user ${userId}`);
                } else {
                  // Record the feature purchase with both payment intent and session ID
                  await storage.createUserPurchasedFeature({
                    userId,
                    featureKey,
                    stripeProductId: feature.stripeProductId,
                    stripePaymentIntentId: paymentIntentId,
                    stripeCheckoutSessionId: checkoutSessionId,
                    amountPaid: feature.price,
                  });
                  
                  console.log(`✅ Feature purchase completed: ${featureKey} for user ${userId}`);
                }
              }
            } else {
              // Handle subscription
              const subscriptionId = session.subscription as string;
              
              if (subscriptionId) {
                // Update user subscription - both 'trialing' and 'active' grant full access
                await storage.updateUser(userId, {
                  stripeSubscriptionId: subscriptionId,
                  subscriptionStatus: 'trialing',
                  subscriptionTier: 'paid',
                });
                console.log(`✅ Subscription created for user ${userId} (status: trialing, tier: paid - full access granted)`);
              }
            }
          }
          break;
        }

        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          
          if (user) {
            // Map Stripe status to our subscription status
            let subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete' = 'active';
            
            if (subscription.status === 'trialing') {
              subscriptionStatus = 'trialing';
            } else if (subscription.status === 'past_due') {
              subscriptionStatus = 'past_due';
            } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
              subscriptionStatus = 'canceled';
            } else if (subscription.status === 'incomplete' || subscription.status === 'incomplete_expired') {
              subscriptionStatus = 'incomplete';
            } else if (subscription.status === 'active') {
              subscriptionStatus = 'active';
            }

            await storage.updateUser(user.id, {
              subscriptionStatus,
              subscriptionTier: subscriptionStatus === 'active' || subscriptionStatus === 'trialing' ? 'paid' : 'free',
            });
            
            console.log(`✅ Subscription updated for user ${user.id}: ${subscriptionStatus}`);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;

          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          
          if (user) {
            // Downgrade to free tier and clear subscription data
            await storage.updateUser(user.id, {
              subscriptionStatus: 'canceled',
              subscriptionTier: 'free',
              stripeSubscriptionId: null,
            });
            
            console.log(`✅ Subscription canceled for user ${user.id}, downgraded to free tier`);
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId = invoice.customer as string;

          // Find user by Stripe customer ID
          const user = await storage.getUserByStripeCustomerId(customerId);
          
          if (user) {
            // Update user to past_due status to restrict access
            await storage.updateUser(user.id, {
              subscriptionStatus: 'past_due',
              subscriptionTier: 'free', // Downgrade access immediately
            });
            
            console.log(`⚠️ Payment failed for user ${user.id}, status set to past_due`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err: any) {
      console.error('Webhook error:', err.message);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
  });

  // Verify Stripe checkout session and log user in (for new user registration)
  app.post("/api/stripe/verify-and-login", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      // Retrieve the checkout session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      const userId = session.metadata?.userId;

      if (!userId) {
        return res.status(400).json({ error: "User ID not found in session" });
      }

      // Get user and verify subscription is active
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Update subscription to paid tier
      await storage.updateUser(userId, {
        stripeSubscriptionId: session.subscription as string,
        subscriptionStatus: 'active',
        subscriptionTier: 'paid',
      });

      // Create session token for login
      const token = generateToken();
      await storage.createSession(userId, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));

      console.log(`✅ User ${userId} logged in after payment completion`);

      res.json({
        user: { ...user, password: undefined, subscriptionStatus: 'active' },
        token,
      });
    } catch (err: any) {
      console.error('Verify and login error:', err.message);
      res.status(500).json({ error: err.message || "Failed to verify payment" });
    }
  });

  // Verify Stripe checkout session for existing logged-in users upgrading
  app.post("/api/stripe/verify-session", authenticate, async (req: AuthRequest, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const { sessionId } = req.body;
      const userId = req.user!.id;

      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      // Retrieve the checkout session from Stripe with line items expanded
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'line_items.data.price.product']
      });

      if (session.payment_status !== 'paid') {
        return res.status(400).json({ error: "Payment not completed" });
      }

      // Verify the session belongs to this user
      if (session.metadata?.userId !== userId) {
        return res.status(403).json({ error: "Session does not belong to this user" });
      }

      const purchaseType = session.metadata?.purchaseType;
      const paymentIntentId = session.payment_intent as string;

      // Check if this is a feature purchase or subscription
      if (purchaseType === 'feature' || session.mode === 'payment') {
        // Derive feature key from line items, with metadata as fallback
        let featureKey = session.metadata?.featureKey;
        let priceId: string | null = null;

        if (session.line_items && session.line_items.data.length > 0) {
          const lineItem = session.line_items.data[0];
          priceId = lineItem.price?.id || null;
          
          // Find feature by matching stripe product ID
          if (priceId) {
            for (const [key, feature] of Object.entries(FEATURE_CATALOG)) {
              if (feature.stripeProductId === priceId) {
                featureKey = key;
                break;
              }
            }
          }
        }

        if (!featureKey || !(featureKey in FEATURE_CATALOG)) {
          console.error(`Could not derive feature from session ${sessionId}. Metadata: ${JSON.stringify(session.metadata)}, Line items: ${session.line_items?.data.length || 0}`);
          return res.status(400).json({ error: "Could not identify purchased feature" });
        }

        const feature = FEATURE_CATALOG[featureKey as FeatureKey];
        
        // Check for duplicate purchase (idempotency) using robust multi-ref check
        const existingPurchase = await storage.findPurchaseByStripeRefs(userId, paymentIntentId, sessionId);
        
        if (existingPurchase) {
          console.log(`ℹ️ Feature purchase already recorded: ${featureKey} for user ${userId} (payment: ${paymentIntentId}, session: ${sessionId})`);
          return res.json({ success: true, message: "Feature purchase already confirmed", featureKey, duplicate: true });
        }
        
        // Record the feature purchase with both payment intent and session ID for robust idempotency
        await storage.createUserPurchasedFeature({
          userId,
          featureKey,
          stripeProductId: feature.stripeProductId,
          stripePaymentIntentId: paymentIntentId,
          stripeCheckoutSessionId: sessionId,
          amountPaid: feature.price,
        });
        
        console.log(`✅ Feature purchase recorded: ${featureKey} for user ${userId}`);
        res.json({ success: true, message: "Feature purchase confirmed", featureKey });
      } else {
        // Handle subscription
        await storage.updateUser(userId, {
          stripeSubscriptionId: session.subscription as string,
          subscriptionTier: 'paid',
          subscriptionStatus: 'active',
        });

        console.log(`✅ Subscription activated for existing user ${userId}`);
        res.json({ success: true, message: "Subscription activated successfully" });
      }
    } catch (err: any) {
      console.error('Verify session error:', err.message);
      res.status(500).json({ error: err.message || "Failed to verify payment" });
    }
  });

  // Cancel subscription endpoint
  app.post("/api/stripe/cancel-subscription", authenticate, async (req: AuthRequest, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || !user.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription found" });
      }

      // Cancel the subscription at period end
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      // Update user to free tier
      await storage.updateUser(userId, {
        subscriptionTier: 'free',
        subscriptionStatus: 'canceled',
      });

      console.log(`✅ Subscription canceled for user ${userId}`);

      res.json({ success: true, message: "Subscription canceled successfully" });
    } catch (err: any) {
      console.error('Cancel subscription error:', err.message);
      res.status(500).json({ error: err.message || "Failed to cancel subscription" });
    }
  });

  // Create Stripe billing portal session
  app.post("/api/stripe/billing-portal", authenticate, async (req: AuthRequest, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ error: "No Stripe customer found" });
      }

      const baseUrl = process.env.REPLIT_DEV_DOMAIN 
        ? (process.env.REPLIT_DEV_DOMAIN.startsWith('http') ? process.env.REPLIT_DEV_DOMAIN : `https://${process.env.REPLIT_DEV_DOMAIN}`)
        : 'http://localhost:5000';

      // Create billing portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/dashboard`,
      });

      console.log(`✅ Billing portal created for user ${userId}`);

      res.json({ url: session.url });
    } catch (err: any) {
      console.error('Billing portal error:', err.message);
      res.status(500).json({ error: err.message || "Failed to create billing portal" });
    }
  });

  // Get user's purchased features (simple list)
  app.get("/api/user/purchased-features", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const purchasedFeatures = await storage.getUserPurchasedFeatures(userId);
      res.json(purchasedFeatures);
    } catch (err: any) {
      console.error('Error fetching purchased features:', err.message);
      res.status(500).json({ error: err.message || "Failed to fetch purchased features" });
    }
  });

  // Get user feature access status
  app.get("/api/user/feature-access", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);
      const unusedCredits = await storage.getUserUnusedCredits(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Check subscription status
      const hasActiveSubscription = 
        (user.subscriptionTier === 'paid' || user.subscriptionTier === 'institutional') &&
        (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trialing');

      // Build feature access map
      const featureAccess: Record<string, boolean> = {};
      const creditCounts: Record<string, number> = {};
      
      for (const key in FEATURE_CATALOG) {
        const featureKey = key as FeatureKey;
        if (hasActiveSubscription) {
          featureAccess[featureKey] = true;
          creditCounts[featureKey] = -1; // -1 means unlimited
        } else {
          const credits = unusedCredits.filter(f => f.featureKey === featureKey);
          featureAccess[featureKey] = credits.length > 0;
          creditCounts[featureKey] = credits.length;
        }
      }

      res.json({
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        hasActiveSubscription,
        purchasedFeatures: unusedCredits.map(f => f.featureKey),
        featureAccess,
        creditCounts,
      });
    } catch (err: any) {
      console.error('Feature access error:', err.message);
      res.status(500).json({ error: err.message || "Failed to fetch feature access" });
    }
  });

  // Note: Credit consumption is now handled automatically by requireFeature middleware
  // This endpoint is removed to prevent client-side credit manipulation

  // Delete user account endpoint
  app.delete("/api/users/delete-account", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Cancel Stripe subscription if exists
      if (stripe && user.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(user.stripeSubscriptionId);
          console.log(`✅ Stripe subscription canceled for user ${userId}`);
        } catch (err: any) {
          console.error('Error canceling Stripe subscription:', err.message);
        }
      }

      // Delete user (this should cascade delete related data)
      await storage.deleteUser(userId);

      console.log(`✅ User account deleted: ${userId}`);

      res.json({ success: true, message: "Account deleted successfully" });
    } catch (err: any) {
      console.error('Delete account error:', err.message);
      res.status(500).json({ error: err.message || "Failed to delete account" });
    }
  });

  // Tour tracking routes
  app.get("/api/tours/status", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const completedTours = await storage.getUserCompletedTours(userId);
      
      res.json({ 
        completedTours: completedTours.map(t => t.tourId)
      });
    } catch (err: any) {
      console.error('Get tour status error:', err.message);
      res.status(500).json({ error: err.message || "Failed to fetch tour status" });
    }
  });

  app.post("/api/tours/complete", authenticate, async (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { tourId } = req.body;

      if (!tourId || typeof tourId !== 'string') {
        return res.status(400).json({ error: "Tour ID is required" });
      }

      // Check if already completed
      const existingCompletion = await storage.getTourCompletion(userId, tourId);
      
      if (existingCompletion) {
        return res.json({ 
          message: "Tour already completed",
          completion: existingCompletion
        });
      }

      // Mark as completed
      const completion = await storage.completeTour(userId, tourId);
      
      res.json({ 
        message: "Tour marked as completed",
        completion
      });
    } catch (err: any) {
      console.error('Complete tour error:', err.message);
      res.status(500).json({ error: err.message || "Failed to mark tour as completed" });
    }
  });

  // Simple in-memory rate limiter for /api/contact (5 requests per hour per IP)
  const contactRateMap = new Map<string, { count: number; resetAt: number }>();
  app.post("/api/contact", async (req: AuthRequest, res) => {
    try {
      // Honeypot check — silently succeed if filled
      if (req.body.honeypot || req.body.website) {
        return res.json({ message: "Contact form submitted successfully" });
      }

      // Per-IP rate limiting
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || "unknown";
      const now = Date.now();
      const entry = contactRateMap.get(ip);
      if (entry && now < entry.resetAt) {
        if (entry.count >= 5) {
          return res.status(429).json({ error: "Too many requests. Please wait before submitting again." });
        }
        entry.count++;
      } else {
        contactRateMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
      }

      // Accept both new schema (firstName/lastName/category) and legacy Dashboard schema (name/subject)
      const body = req.body;
      let firstName: string, lastName: string, email: string, category: string, message: string;

      if (body.firstName !== undefined || body.lastName !== undefined) {
        // New schema
        const newSchema = z.object({
          firstName: z.string().min(1, "First name is required"),
          lastName: z.string().min(1, "Last name is required"),
          email: z.string().email("Please enter a valid email address"),
          category: z.enum(["Support issue", "Feature suggestion", "Other"]),
          message: z.string().min(10, "Message must be at least 10 characters"),
          honeypot: z.string().optional(),
        });
        const result = newSchema.safeParse(body);
        if (!result.success) {
          return res.status(400).json({ error: fromZodError(result.error).message });
        }
        ({ firstName, lastName, email, category, message } = result.data);
      } else {
        // Legacy Dashboard schema (name, email, subject, message)
        const legacySchema = z.object({
          name: z.string().min(2),
          email: z.string().email(),
          subject: z.string().min(5),
          message: z.string().min(10),
        });
        const result = legacySchema.safeParse(body);
        if (!result.success) {
          return res.status(400).json({ error: fromZodError(result.error).message });
        }
        const parts = result.data.name.trim().split(" ");
        firstName = parts[0];
        lastName = parts.slice(1).join(" ") || "-";
        email = result.data.email;
        category = result.data.subject;
        message = result.data.message;
      }

      // Attach user ID if an auth token is present (optional auth — same lookup as authenticate middleware)
      let userId: number | undefined;
      try {
        const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.auth_token;
        if (token) {
          const session = await storage.getSession(token);
          if (session) userId = session.userId;
        }
      } catch { /* no auth token — that's fine */ }

      const success = await emailService.sendContactForm({ firstName, lastName, email, category, message, userId });

      if (!success) {
        return res.status(500).json({ error: "Failed to send email. Please try again later." });
      }

      res.json({ message: "Contact form submitted successfully" });
    } catch (err: any) {
      console.error('Contact form error:', err.message);
      res.status(500).json({ error: err.message || "Failed to send contact form" });
    }
  });

  // ── Networking Recommendations ─────────────────────────────────────────────
  app.post("/api/networking/recommendations", authenticate, async (req: AuthRequest, res) => {
    try {
      const user = req.user!;

      // Get user's active resume for gaps
      const activeResume = await storage.getActiveResume(user.id);
      const gaps = activeResume?.gaps ?? [];

      const industries: string[] = (user.industries as string[]) || [];

      // Intake answers from the POST body (session-only, not persisted to DB)
      const {
        force = false,
        intakeRole,
        intakeBackground,
        intakeLocation,
        intakeResumeText,
      } = req.body as {
        force?: boolean;
        intakeRole?: string;
        intakeBackground?: string;
        intakeLocation?: string;
        intakeResumeText?: string;
      };

      const targetRole = intakeRole || user.targetRole || (activeResume?.targetRole as string) || "professional";
      const location: string = intakeLocation || user.location || "";

      const { getNetworkingRecommendations } = await import("./networking");
      const recommendations = await getNetworkingRecommendations(
        targetRole,
        industries,
        Array.isArray(gaps) ? gaps : [],
        location,
        !!force,
        {
          background: intakeBackground,
          resumeText: intakeResumeText,
        }
      );

      res.json(recommendations);
    } catch (err: any) {
      console.error("Networking recommendations error:", err.message);
      res.status(500).json({ error: err.message || "Failed to generate networking recommendations" });
    }
  });

  // Resume <-> CV Converter (public — no auth required)
  app.post("/api/ai/convert-resume-cv", async (req, res) => {
    try {
      const { text, direction } = req.body;

      if (!text || typeof text !== "string" || text.trim().length < 30) {
        return res.status(400).json({ error: "Please provide document text (at least 30 characters)." });
      }
      if (direction !== "resume-to-cv" && direction !== "cv-to-resume") {
        return res.status(400).json({ error: "Direction must be 'resume-to-cv' or 'cv-to-resume'." });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const isResumeToCv = direction === "resume-to-cv";

      const systemPrompt = isResumeToCv
        ? `You are an expert academic CV writer. Your job is to reformat a resume into a proper academic CV structure.

CRITICAL HONESTY RULES — DO NOT BREAK THESE:
1. Do NOT invent, fabricate, or assume ANY information not in the source document.
2. Do NOT add publications, grants, research, awards, presentations, or patents unless they appear in the source.
3. For sections where you have no source data, add a clear placeholder like: [Add your publications here] or [Add your teaching experience here].
4. Do NOT expand on or embellish any experience, dates, titles, or accomplishments beyond what is stated.
5. If the source is a simple resume with no academic content, restructure what exists into CV format and clearly label the placeholder sections.

CV FORMAT STRUCTURE (use ALL sections — mark empty ones with placeholders):
CURRICULUM VITAE
[Full Name from source]
[Contact info from source]

SUMMARY / RESEARCH INTERESTS
[Reformat from resume summary or objective. If none: Add your research interests or professional summary here.]

EDUCATION
[All education from source, reverse chronological. Include degree, institution, year, GPA if listed.]

ACADEMIC / PROFESSIONAL EXPERIENCE
[All experience from source in CV style — full dates, institution name, title, bullet-point responsibilities.]

RESEARCH EXPERIENCE
[Only if source mentions research. Otherwise: Add any research experience, thesis, dissertation, or lab work here.]

PUBLICATIONS
[PLACEHOLDER: Add your peer-reviewed publications here. Format: Author(s). (Year). Title. Journal, Volume(Issue), pages.]

PRESENTATIONS & CONFERENCES
[PLACEHOLDER: Add your conference presentations or invited talks here.]

TEACHING EXPERIENCE
[Only if source mentions teaching. Otherwise: Add any teaching, tutoring, or instructional experience here.]

AWARDS & HONORS
[Only if source mentions awards. Otherwise: Add scholarships, fellowships, grants, or academic honors here.]

SKILLS
[All skills from source — technical skills, languages, tools, certifications.]

PROFESSIONAL MEMBERSHIPS
[PLACEHOLDER: Add professional associations or memberships here.]

REFERENCES
[PLACEHOLDER: Available upon request. Add 3 references with name, title, institution, email, phone.]

FORMAT RULES:
- Plain text with section headers in ALL CAPS
- CV has no page limit — include all detail from the source
- Start your response directly with the CV content, no preamble`
        : `You are an expert resume writer. Your job is to condense a CV into a focused 1–2 page resume.

CRITICAL HONESTY RULES — DO NOT BREAK THESE:
1. Do NOT invent, fabricate, or add ANY information not in the source CV.
2. Do NOT add skills, accomplishments, or experiences not in the source.
3. Only remove or condense — never expand beyond what is in the source.

RESUME FORMAT (1–2 pages, prioritize recent and most relevant):

[Full Name]
[Contact info — email, phone, location, LinkedIn if present]

PROFESSIONAL SUMMARY
[2–3 sentence summary from the CV's most impressive and relevant points. Only use what is in the CV.]

EXPERIENCE
[Top 3–5 most recent/relevant positions. For each: Job Title | Company | Start – End date | 3–5 bullet points. Condense verbose CV descriptions into tight, action-verb-led bullets. Quantify impact where the CV already provides numbers — do not invent numbers.]

EDUCATION
[Highest degree first. Include degree, institution, year. Omit thesis details unless very brief.]

SKILLS
[Consolidated list of technical skills, tools, languages from the CV.]

CERTIFICATIONS
[Only if present in the source CV.]

PUBLICATIONS (condensed)
[If 1–3 publications, list them. If more than 3, note "X peer-reviewed publications — see full CV." Omit if none.]

FORMAT RULES:
- Plain text, section headers in ALL CAPS
- Action verbs to start every bullet (Led, Built, Designed, Managed, etc.)
- Start your response directly with the resume content, no preamble`;

      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Source document to convert:\n\n${text.trim()}` },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      });

      const convertedText = completion.choices[0]?.message?.content || "";
      if (!convertedText) {
        return res.status(500).json({ error: "Conversion produced empty output." });
      }

      const paragraphs = parseResumeContentToDocx(convertedText);
      const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
      const docxBuffer = await Packer.toBuffer(doc);

      res.json({
        convertedText,
        docxBuffer: docxBuffer.toString("base64"),
      });
    } catch (error) {
      console.error("CV converter error:", error);
      res.status(500).json({ error: "Failed to convert document." });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  FEATURE_CATALOG: () => FEATURE_CATALOG,
  SUBSCRIPTION_PRODUCT: () => SUBSCRIPTION_PRODUCT,
  achievements: () => achievements,
  achievementsRelations: () => achievementsRelations,
  activities: () => activities,
  activitiesRelations: () => activitiesRelations,
  applicationStatusEnum: () => applicationStatusEnum,
  applications: () => applications,
  applicationsRelations: () => applicationsRelations,
  atomicRoadmapSchema: () => atomicRoadmapSchema,
  atomicTaskSchema: () => atomicTaskSchema,
  coreFeatureSchema: () => coreFeatureSchema,
  coverLetters: () => coverLetters,
  deliverableSchema: () => deliverableSchema,
  emailVerifications: () => emailVerifications,
  fileMetadata: () => fileMetadata,
  forgotPasswordSchema: () => forgotPasswordSchema,
  getCompetitivenessBand: () => getCompetitivenessBand,
  insertApplicationSchema: () => insertApplicationSchema,
  insertCoverLetterSchema: () => insertCoverLetterSchema,
  insertEmailVerificationSchema: () => insertEmailVerificationSchema,
  insertFileMetadataSchema: () => insertFileMetadataSchema,
  insertInstitutionSchema: () => insertInstitutionSchema,
  insertInvitationSchema: () => insertInvitationSchema,
  insertJobAnalysisSchema: () => insertJobAnalysisSchema,
  insertJobMatchSchema: () => insertJobMatchSchema,
  insertLicenseSchema: () => insertLicenseSchema,
  insertMicroProjectSchema: () => insertMicroProjectSchema,
  insertOpportunitySchema: () => insertOpportunitySchema,
  insertPasswordResetTokenSchema: () => insertPasswordResetTokenSchema,
  insertPortfolioArtifactSchema: () => insertPortfolioArtifactSchema,
  insertProjectCompletionSchema: () => insertProjectCompletionSchema,
  insertPromoCodeSchema: () => insertPromoCodeSchema,
  insertResumeAnalysisHistorySchema: () => insertResumeAnalysisHistorySchema,
  insertResumeSchema: () => insertResumeSchema,
  insertRoadmapSchema: () => insertRoadmapSchema,
  insertRoadmapSubsectionSchema: () => insertRoadmapSubsectionSchema,
  insertSavedOpportunitySchema: () => insertSavedOpportunitySchema,
  insertSkillGapAnalysisSchema: () => insertSkillGapAnalysisSchema,
  insertTailoredResumeSchema: () => insertTailoredResumeSchema,
  insertTourCompletionSchema: () => insertTourCompletionSchema,
  insertUserPurchasedFeatureSchema: () => insertUserPurchasedFeatureSchema,
  insertUserSchema: () => insertUserSchema,
  institutions: () => institutions,
  institutionsRelations: () => institutionsRelations,
  invitations: () => invitations,
  invitationsRelations: () => invitationsRelations,
  inviteStatusEnum: () => inviteStatusEnum,
  inviteUserSchema: () => inviteUserSchema,
  jobAnalyses: () => jobAnalyses,
  jobMatchAnalysisSchema: () => jobMatchAnalysisSchema,
  jobMatches: () => jobMatches,
  jobMatchesRelations: () => jobMatchesRelations,
  licenseTypeEnum: () => licenseTypeEnum,
  licenses: () => licenses,
  licensesRelations: () => licensesRelations,
  loginSchema: () => loginSchema,
  microProjects: () => microProjects,
  opportunities: () => opportunities,
  opportunitiesRelations: () => opportunitiesRelations,
  opportunityTypeEnum: () => opportunityTypeEnum,
  passwordResetTokens: () => passwordResetTokens,
  portfolioArtifacts: () => portfolioArtifacts,
  priorityEnum: () => priorityEnum,
  projectCompletions: () => projectCompletions,
  projectInstructionsSchema: () => projectInstructionsSchema,
  promoCodes: () => promoCodes,
  registerSchema: () => registerSchema,
  resetPasswordSchema: () => resetPasswordSchema,
  resourceLinkSchema: () => resourceLinkSchema,
  resources: () => resources,
  resumeAnalysisHistory: () => resumeAnalysisHistory,
  resumeAnalysisHistoryRelations: () => resumeAnalysisHistoryRelations,
  resumes: () => resumes,
  resumesRelations: () => resumesRelations,
  roadmapPhaseEnum: () => roadmapPhaseEnum,
  roadmapSubsectionSchema: () => roadmapSubsectionSchema,
  roadmapSubsections: () => roadmapSubsections,
  roadmapSubsectionsRelations: () => roadmapSubsectionsRelations,
  roadmaps: () => roadmaps,
  roadmapsRelations: () => roadmapsRelations,
  roleEnum: () => roleEnum,
  savedOpportunities: () => savedOpportunities,
  savedOpportunitiesRelations: () => savedOpportunitiesRelations,
  sessions: () => sessions,
  sessionsRelations: () => sessionsRelations,
  skillGapAnalyses: () => skillGapAnalyses,
  subscriptionStatusEnum: () => subscriptionStatusEnum,
  subscriptionTierEnum: () => subscriptionTierEnum,
  tailoredResumes: () => tailoredResumes,
  tailoredResumesRelations: () => tailoredResumesRelations,
  tourCompletions: () => tourCompletions,
  tourCompletionsRelations: () => tourCompletionsRelations,
  uploadStatusEnum: () => uploadStatusEnum,
  userPurchasedFeatures: () => userPurchasedFeatures,
  userPurchasedFeaturesRelations: () => userPurchasedFeaturesRelations,
  users: () => users,
  usersRelations: () => usersRelations,
  verifyEmailSchema: () => verifyEmailSchema,
  weekPlanSchema: () => weekPlanSchema
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
function getCompetitivenessBand(score) {
  if (score >= 90) return "Exceptional";
  if (score >= 80) return "Strong";
  if (score >= 70) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 50) return "Weak";
  return "Poor";
}
var roleEnum, applicationStatusEnum, roadmapPhaseEnum, priorityEnum, licenseTypeEnum, inviteStatusEnum, opportunityTypeEnum, subscriptionTierEnum, subscriptionStatusEnum, institutions, licenses, invitations, emailVerifications, passwordResetTokens, users, sessions, promoCodes, resumes, resumeAnalysisHistory, roadmaps, roadmapSubsections, jobMatches, jobAnalyses, tailoredResumes, coverLetters, applications, achievements, activities, resources, skillGapAnalyses, resourceLinkSchema, deliverableSchema, coreFeatureSchema, weekPlanSchema, projectInstructionsSchema, microProjects, projectCompletions, portfolioArtifacts, opportunities, savedOpportunities, tourCompletions, userPurchasedFeatures, FEATURE_CATALOG, SUBSCRIPTION_PRODUCT, institutionsRelations, licensesRelations, invitationsRelations, usersRelations, sessionsRelations, resumesRelations, resumeAnalysisHistoryRelations, roadmapsRelations, roadmapSubsectionsRelations, jobMatchesRelations, tailoredResumesRelations, applicationsRelations, achievementsRelations, opportunitiesRelations, savedOpportunitiesRelations, tourCompletionsRelations, userPurchasedFeaturesRelations, activitiesRelations, atomicTaskSchema, roadmapSubsectionSchema, atomicRoadmapSchema, insertInstitutionSchema, insertLicenseSchema, insertInvitationSchema, insertEmailVerificationSchema, insertPasswordResetTokenSchema, insertUserSchema, insertPromoCodeSchema, insertResumeSchema, insertResumeAnalysisHistorySchema, insertRoadmapSchema, insertRoadmapSubsectionSchema, insertJobMatchSchema, insertJobAnalysisSchema, insertTailoredResumeSchema, insertCoverLetterSchema, insertApplicationSchema, insertSkillGapAnalysisSchema, insertMicroProjectSchema, insertProjectCompletionSchema, insertPortfolioArtifactSchema, loginSchema, registerSchema, inviteUserSchema, verifyEmailSchema, forgotPasswordSchema, resetPasswordSchema, jobMatchAnalysisSchema, insertOpportunitySchema, insertSavedOpportunitySchema, insertUserPurchasedFeatureSchema, insertTourCompletionSchema, uploadStatusEnum, fileMetadata, insertFileMetadataSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["student", "admin", "institution_admin", "super_admin"]);
    applicationStatusEnum = pgEnum("application_status", ["applied", "interviewed", "rejected", "offered"]);
    roadmapPhaseEnum = pgEnum("roadmap_phase", ["30_days", "3_months", "6_months"]);
    priorityEnum = pgEnum("priority", ["high", "medium", "low"]);
    licenseTypeEnum = pgEnum("license_type", ["per_student", "site"]);
    inviteStatusEnum = pgEnum("invite_status", ["pending", "claimed", "expired"]);
    opportunityTypeEnum = pgEnum("opportunity_type", ["volunteer", "internship", "hackathon", "competition", "apprenticeship", "externship"]);
    subscriptionTierEnum = pgEnum("subscription_tier", ["free", "paid", "institutional"]);
    subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due", "trialing", "incomplete"]);
    institutions = pgTable("institutions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      name: text("name").notNull(),
      domain: text("domain").unique(),
      // For domain allowlist
      contactEmail: text("contact_email").notNull(),
      contactName: text("contact_name").notNull(),
      logoUrl: text("logo_url"),
      primaryColor: text("primary_color"),
      secondaryColor: text("secondary_color"),
      customBranding: jsonb("custom_branding"),
      allowedDomains: text("allowed_domains").array(),
      // Multiple email domains
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    licenses = pgTable("licenses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      institutionId: varchar("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
      licenseType: licenseTypeEnum("license_type").notNull(),
      licensedSeats: integer("licensed_seats"),
      // null for site licenses
      usedSeats: integer("used_seats").notNull().default(0),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date").notNull(),
      brandingEnabled: boolean("branding_enabled").notNull().default(false),
      supportLevel: text("support_level").default("standard"),
      // standard, premium, enterprise
      isActive: boolean("is_active").notNull().default(true),
      metadata: jsonb("metadata"),
      // Additional license metadata
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    invitations = pgTable("invitations", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      institutionId: varchar("institution_id").notNull().references(() => institutions.id, { onDelete: "cascade" }),
      email: text("email").notNull(),
      role: roleEnum("role").notNull().default("student"),
      invitedBy: varchar("invited_by").notNull().references(() => users.id),
      token: text("token").notNull().unique(),
      status: inviteStatusEnum("status").notNull().default("pending"),
      claimedBy: varchar("claimed_by").references(() => users.id),
      expiresAt: timestamp("expires_at").notNull(),
      claimedAt: timestamp("claimed_at"),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    emailVerifications = pgTable("email_verifications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      email: text("email").notNull(),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      isUsed: boolean("is_used").notNull().default(false),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    passwordResetTokens = pgTable("password_reset_tokens", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      isUsed: boolean("is_used").notNull().default(false),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    users = pgTable("users", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      institutionId: varchar("institution_id").references(() => institutions.id, { onDelete: "cascade" }),
      email: text("email").notNull().unique(),
      password: text("password").notNull(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      role: roleEnum("role").notNull().default("student"),
      isVerified: boolean("is_verified").notNull().default(false),
      isActive: boolean("is_active").notNull().default(true),
      lastActiveAt: timestamp("last_active_at"),
      school: text("school"),
      major: text("major"),
      gradYear: integer("grad_year"),
      targetRole: text("target_role"),
      industries: text("industries").array(),
      targetCompanies: text("target_companies").array(),
      location: text("location"),
      remoteOk: boolean("remote_ok").default(false),
      // Subscription fields
      subscriptionTier: subscriptionTierEnum("subscription_tier").notNull().default("paid"),
      subscriptionStatus: subscriptionStatusEnum("subscription_status").notNull().default("active"),
      stripeCustomerId: text("stripe_customer_id"),
      stripeSubscriptionId: text("stripe_subscription_id"),
      subscriptionEndsAt: timestamp("subscription_ends_at"),
      // AI summary for institutional admins
      aiSummary: text("ai_summary"),
      aiSummaryGeneratedAt: timestamp("ai_summary_generated_at"),
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    sessions = pgTable("sessions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: text("token").notNull().unique(),
      expiresAt: timestamp("expires_at").notNull(),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    promoCodes = pgTable("promo_codes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      code: text("code").notNull().unique(),
      type: text("type").notNull().default("free_paid_tier"),
      // Type of benefit: "free_paid_tier" or "percentage_discount"
      discountPercentage: integer("discount_percentage"),
      // For percentage_discount type (e.g., 50 for 50% off)
      maxUses: integer("max_uses"),
      // null for unlimited
      currentUses: integer("current_uses").notNull().default(0),
      expiresAt: timestamp("expires_at"),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    resumes = pgTable("resumes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      fileName: text("file_name").notNull(),
      filePath: text("file_path").notNull(),
      extractedText: text("extracted_text"),
      rmsScore: integer("rms_score"),
      skillsScore: integer("skills_score"),
      experienceScore: integer("experience_score"),
      keywordsScore: integer("keywords_score"),
      educationScore: integer("education_score"),
      certificationsScore: integer("certifications_score"),
      gaps: jsonb("gaps"),
      // Array of gap objects with priority, impact, rationale, resources
      overallInsights: jsonb("overall_insights"),
      // Overall analysis insights
      sectionAnalysis: jsonb("section_analysis"),
      // Detailed section-by-section analysis
      targetRole: jsonb("target_role").$type(),
      targetIndustry: jsonb("target_industry").$type(),
      targetCompanies: jsonb("target_companies").$type(),
      analysisHash: jsonb("analysis_hash").$type(),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    resumeAnalysisHistory = pgTable("resume_analysis_history", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      resumeId: varchar("resume_id").notNull().references(() => resumes.id, { onDelete: "cascade" }),
      fileName: text("file_name").notNull(),
      rmsScore: integer("rms_score").notNull(),
      skillsScore: integer("skills_score"),
      experienceScore: integer("experience_score"),
      keywordsScore: integer("keywords_score"),
      educationScore: integer("education_score"),
      certificationsScore: integer("certifications_score"),
      gaps: jsonb("gaps"),
      overallInsights: jsonb("overall_insights"),
      sectionAnalysis: jsonb("section_analysis"),
      targetRole: jsonb("target_role"),
      targetIndustry: jsonb("target_industry"),
      targetCompanies: jsonb("target_companies"),
      analysisHash: jsonb("analysis_hash").$type(),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    roadmaps = pgTable("roadmaps", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      phase: roadmapPhaseEnum("phase").notNull(),
      title: text("title").notNull(),
      description: text("description"),
      actions: jsonb("actions"),
      // Array of action objects
      subsections: jsonb("subsections"),
      // Array of subsection objects with completion tracking
      progress: integer("progress").default(0),
      // 0-100
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    roadmapSubsections = pgTable("roadmap_subsections", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      roadmapId: varchar("roadmap_id").notNull().references(() => roadmaps.id, { onDelete: "cascade" }),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      subsectionIndex: integer("subsection_index").notNull(),
      title: text("title").notNull(),
      description: text("description"),
      tasks: jsonb("tasks"),
      // Array of task objects
      isCompleted: boolean("is_completed").default(false),
      completedAt: timestamp("completed_at"),
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    jobMatches = pgTable("job_matches", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      externalJobId: text("external_job_id").notNull(),
      title: text("title").notNull(),
      company: text("company").notNull(),
      location: text("location"),
      description: text("description"),
      requirements: text("requirements"),
      salary: text("salary"),
      compatibilityScore: integer("compatibility_score"),
      // 0-100
      matchReasons: text("match_reasons").array(),
      skillsGaps: text("skills_gaps").array(),
      resourceLinks: jsonb("resource_links"),
      // Array of resource objects
      source: text("source").default("adzuna"),
      // adzuna, coresignal, usajobs
      isBookmarked: boolean("is_bookmarked").default(false),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    jobAnalyses = pgTable("job_analyses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      resumeId: varchar("resume_id").notNull().references(() => resumes.id),
      jobTitle: text("job_title").notNull(),
      jobCompany: text("job_company").notNull(),
      jobLocation: text("job_location"),
      jobDescription: text("job_description").notNull(),
      jobRequirements: text("job_requirements"),
      jobUrl: text("job_url"),
      overallMatch: integer("overall_match"),
      // 0-100
      competitivenessBand: text("competitiveness_band"),
      strengths: text("strengths").array(),
      concerns: text("concerns").array(),
      recommendations: text("recommendations").array(),
      nextSteps: text("next_steps").array(),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    tailoredResumes = pgTable("tailored_resumes", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      baseResumeId: varchar("base_resume_id").notNull().references(() => resumes.id),
      jobAnalysisId: varchar("job_analysis_id").references(() => jobAnalyses.id),
      jobMatchId: varchar("job_match_id").references(() => jobMatches.id),
      jobTitle: text("job_title").notNull(),
      jobCompany: text("job_company").notNull(),
      tailoredContent: text("tailored_content").notNull(),
      diffJson: jsonb("diff_json"),
      // Source map of all edits
      jobSpecificScore: integer("job_specific_score"),
      // 0-100
      keywordsCovered: text("keywords_covered").array(),
      remainingGaps: jsonb("remaining_gaps"),
      docxPath: text("docx_path"),
      pdfPath: text("pdf_path"),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    coverLetters = pgTable("cover_letters", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      resumeId: varchar("resume_id").notNull().references(() => resumes.id),
      jobAnalysisId: varchar("job_analysis_id").references(() => jobAnalyses.id),
      jobTitle: text("job_title").notNull(),
      jobCompany: text("job_company").notNull(),
      content: text("content").notNull(),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    applications = pgTable("applications", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      jobMatchId: varchar("job_match_id").references(() => jobMatches.id),
      tailoredResumeId: varchar("tailored_resume_id").references(() => tailoredResumes.id),
      company: text("company").notNull(),
      position: text("position").notNull(),
      status: applicationStatusEnum("status").notNull().default("applied"),
      appliedDate: timestamp("applied_date").notNull().default(sql`now()`),
      responseDate: timestamp("response_date"),
      notes: text("notes"),
      attachments: text("attachments").array(),
      // File paths
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    achievements = pgTable("achievements", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      description: text("description"),
      icon: text("icon"),
      unlockedAt: timestamp("unlocked_at").notNull().default(sql`now()`)
    });
    activities = pgTable("activities", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      type: text("type").notNull(),
      // completed_task, earned_achievement, etc.
      title: text("title").notNull(),
      description: text("description"),
      metadata: jsonb("metadata"),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    resources = pgTable("resources", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: text("title").notNull(),
      provider: text("provider").notNull(),
      url: text("url").notNull(),
      cost: text("cost"),
      skillCategories: text("skill_categories").array(),
      relevanceScore: integer("relevance_score"),
      // 0-100
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    skillGapAnalyses = pgTable("skill_gap_analyses", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      resumeId: varchar("resume_id").references(() => resumes.id),
      jobMatchId: varchar("job_match_id").references(() => jobMatches.id),
      targetRole: text("target_role"),
      targetCompany: text("target_company"),
      missingSkills: text("missing_skills").array().notNull(),
      skillCategories: text("skill_categories").array(),
      // technical, soft, domain-specific
      priorityLevel: text("priority_level").notNull().default("medium"),
      // high, medium, low
      analysisSource: text("analysis_source").notNull(),
      // resume-only, job-match, manual
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    resourceLinkSchema = z.object({
      title: z.string(),
      url: z.string().url(),
      type: z.string()
    });
    deliverableSchema = z.object({
      stepNumber: z.number(),
      instruction: z.string(),
      resourceLinks: z.array(resourceLinkSchema)
    });
    coreFeatureSchema = z.object({
      title: z.string(),
      description: z.string().optional(),
      details: z.array(z.string())
    });
    weekPlanSchema = z.object({
      week: z.number(),
      title: z.string(),
      tasks: z.array(z.string()),
      resources: z.array(resourceLinkSchema).optional()
    });
    projectInstructionsSchema = z.object({
      whyEmployersLove: z.array(z.string()).optional(),
      techStack: z.object({
        frontend: z.array(z.string()).optional(),
        backend: z.array(z.string()).optional()
      }).optional(),
      coreFeatures: z.array(coreFeatureSchema).optional(),
      implementationPlan: z.array(weekPlanSchema).optional(),
      skillsMastered: z.object({
        technicalSkills: z.array(z.string()).optional(),
        systemDesign: z.array(z.string()).optional(),
        bestPractices: z.array(z.string()).optional()
      }).optional(),
      resourcesProvided: z.array(z.string()).optional()
    });
    microProjects = pgTable("micro_projects", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      // Resume-friendly title
      description: text("description").notNull(),
      // 2-3 sentence project summary
      targetRole: text("target_role").notNull(),
      // e.g., "Data Scientist", "Product Manager"
      targetSkill: text("target_skill"),
      // Optional: specific skill this addresses
      skillCategory: text("skill_category"),
      // technical, soft, domain-specific
      difficultyLevel: text("difficulty_level").notNull().default("intermediate"),
      // beginner, intermediate, advanced
      estimatedHours: integer("estimated_hours").notNull().default(20),
      // Hours to complete (typically 10-40 for 1-2 weeks)
      projectType: text("project_type").notNull(),
      // data-analysis, coding, design, writing, research
      // Step-by-step deliverables with embedded resource links
      // Format: [{stepNumber, instruction, resourceLinks: [{title, url, type}]}]
      deliverables: jsonb("deliverables").$type().notNull(),
      // Actionable steps with resource links
      skillsGained: text("skills_gained").array().notNull(),
      // Skills/tools demonstrated (e.g., "Python", "Pandas", "Scikit-learn")
      relevanceToRole: text("relevance_to_role").notNull(),
      // Why this matters for the target role
      // Legacy fields for backward compatibility
      datasetUrl: text("dataset_url"),
      templateUrl: text("template_url"),
      repositoryUrl: text("repository_url"),
      tutorialUrl: text("tutorial_url"),
      // Comprehensive project specification (stored as JSONB for flexibility)
      instructions: jsonb("instructions").$type(),
      // Rich project format with sections
      evaluationCriteria: text("evaluation_criteria").array(),
      // Portfolio integration  
      portfolioTemplate: text("portfolio_template"),
      // How to present the artifact
      exampleArtifacts: text("example_artifacts").array(),
      // Links to example completions
      // Metadata
      tags: text("tags").array(),
      isActive: boolean("is_active").notNull().default(true),
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    projectCompletions = pgTable("project_completions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      projectId: varchar("project_id").notNull().references(() => microProjects.id, { onDelete: "cascade" }),
      skillGapAnalysisId: varchar("skill_gap_analysis_id").references(() => skillGapAnalyses.id),
      status: text("status").notNull().default("not_started"),
      // not_started, in_progress, completed, submitted
      progressPercentage: integer("progress_percentage").notNull().default(0),
      // 0-100
      timeSpent: integer("time_spent").default(0),
      // in minutes
      startedAt: timestamp("started_at"),
      completedAt: timestamp("completed_at"),
      submittedAt: timestamp("submitted_at"),
      // Completion artifacts
      artifactUrls: text("artifact_urls").array(),
      // Links to completed work
      reflectionNotes: text("reflection_notes"),
      // What the student learned
      selfAssessment: integer("self_assessment"),
      // 1-5 rating
      skillImprovement: text("skill_improvement"),
      // How it addressed the skill gap
      nextSteps: text("next_steps"),
      // What to do next
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    portfolioArtifacts = pgTable("portfolio_artifacts", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      completionId: varchar("completion_id").notNull().references(() => projectCompletions.id, { onDelete: "cascade" }),
      title: text("title").notNull(),
      description: text("description"),
      artifactType: text("artifact_type").notNull(),
      // code, analysis, design, report, dashboard
      fileUrl: text("file_url"),
      previewUrl: text("preview_url"),
      // Screenshot or preview image
      githubUrl: text("github_url"),
      liveUrl: text("live_url"),
      // Portfolio presentation
      displayOrder: integer("display_order").default(0),
      isPublic: boolean("is_public").notNull().default(false),
      isFeatured: boolean("is_featured").notNull().default(false),
      tags: text("tags").array(),
      technologiesUsed: text("technologies_used").array(),
      skillsDemonstrated: text("skills_demonstrated").array(),
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    opportunities = pgTable("opportunities", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      title: text("title").notNull(),
      description: text("description").notNull(),
      organization: text("organization").notNull(),
      type: opportunityTypeEnum("type").notNull(),
      // volunteer, internship, hackathon, competition, apprenticeship, externship
      location: text("location"),
      isRemote: boolean("is_remote").default(false),
      compensation: text("compensation"),
      // 'paid', 'unpaid', 'stipend', 'academic-credit'
      requirements: text("requirements").array(),
      skills: text("skills").array(),
      applicationUrl: text("application_url"),
      contactEmail: text("contact_email"),
      deadline: timestamp("deadline"),
      postedDate: timestamp("posted_date").notNull().default(sql`now()`),
      source: text("source").notNull(),
      // API source identifier
      externalId: text("external_id"),
      // Original ID from source API
      isActive: boolean("is_active").default(true),
      tags: text("tags").array(),
      estimatedHours: integer("estimated_hours"),
      duration: text("duration"),
      // 'semester', 'summer', 'ongoing', 'one-time'
      createdAt: timestamp("created_at").notNull().default(sql`now()`),
      updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
    });
    savedOpportunities = pgTable("saved_opportunities", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      opportunityId: varchar("opportunity_id").notNull().references(() => opportunities.id, { onDelete: "cascade" }),
      savedAt: timestamp("saved_at").notNull().default(sql`now()`),
      notes: text("notes")
    });
    tourCompletions = pgTable("tour_completions", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id),
      tourId: text("tour_id").notNull(),
      completedAt: timestamp("completed_at").notNull().default(sql`now()`)
    });
    userPurchasedFeatures = pgTable("user_purchased_features", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      featureKey: text("feature_key").notNull(),
      // e.g., 'salary_negotiator', 'resume_analysis'
      stripeProductId: text("stripe_product_id").notNull(),
      stripePaymentIntentId: text("stripe_payment_intent_id"),
      stripeCheckoutSessionId: text("stripe_checkout_session_id").notNull().default(""),
      // For idempotency
      amountPaid: integer("amount_paid").notNull(),
      // in cents
      isUsed: boolean("is_used").notNull().default(false),
      // Track if this credit has been consumed
      usedAt: timestamp("used_at"),
      // When the credit was used
      purchasedAt: timestamp("purchased_at").notNull().default(sql`now()`)
    });
    FEATURE_CATALOG = {
      salary_negotiator: {
        key: "salary_negotiator",
        name: "Salary Negotiator",
        description: "AI-powered salary negotiation guidance and scripts",
        price: 600,
        // $6.00 in cents
        stripeProductId: "price_1SQfBWAKwoZwA01t3Dh3ca9F"
      },
      micro_project_generator: {
        key: "micro_project_generator",
        name: "Micro-Project Generator",
        description: "Generate tailored portfolio projects based on skill gaps",
        price: 300,
        // $3.00 in cents
        stripeProductId: "price_1SQfAoAKwoZwA01tajtnxm9e"
      },
      career_roadmap_generator: {
        key: "career_roadmap_generator",
        name: "Career Roadmap Generator",
        description: "AI-generated 30-day, 3-month, and 6-month career plans",
        price: 600,
        // $6.00 in cents
        stripeProductId: "price_1SQf7bAKwoZwA01tLGwVEyFY"
      },
      job_match_assistant: {
        key: "job_match_assistant",
        name: "Job Match Assistant",
        description: "AI-powered job matching with compatibility scoring",
        price: 1200,
        // $12.00 in cents
        stripeProductId: "price_1SQevNAKwoZwA01t0HCXpBWM"
      },
      resume_analysis: {
        key: "resume_analysis",
        name: "Resume Analysis",
        description: "Comprehensive AI resume review with RMS scoring",
        price: 300,
        // $3.00 in cents
        stripeProductId: "price_1SQetFAKwoZwA01tFss9axqV"
      },
      interview_prep_assistant: {
        key: "interview_prep_assistant",
        name: "Interview Prep Assistant",
        description: "Personalized interview preparation and practice",
        price: 500,
        // $5.00 in cents
        stripeProductId: "price_1SQfCSAKwoZwA01tevhrxOAQ"
      }
    };
    SUBSCRIPTION_PRODUCT = {
      key: "pathwise_unlimited",
      name: "Pathwise Unlimited",
      description: "Unlimited access to all AI tools and beta features",
      monthlyPrice: 1500,
      // $15.00 in cents
      yearlyPrice: 12e3,
      // $120.00 in cents
      stripeProductId: "prod_TFTi3DjdSitHEb"
    };
    institutionsRelations = relations(institutions, ({ many, one }) => ({
      licenses: many(licenses),
      users: many(users),
      invitations: many(invitations)
    }));
    licensesRelations = relations(licenses, ({ one }) => ({
      institution: one(institutions, { fields: [licenses.institutionId], references: [institutions.id] })
    }));
    invitationsRelations = relations(invitations, ({ one }) => ({
      institution: one(institutions, { fields: [invitations.institutionId], references: [institutions.id] }),
      invitedByUser: one(users, { fields: [invitations.invitedBy], references: [users.id] }),
      claimedByUser: one(users, { fields: [invitations.claimedBy], references: [users.id] })
    }));
    usersRelations = relations(users, ({ many, one }) => ({
      institution: one(institutions, { fields: [users.institutionId], references: [institutions.id] }),
      sessions: many(sessions),
      resumes: many(resumes),
      resumeAnalysisHistory: many(resumeAnalysisHistory),
      roadmaps: many(roadmaps),
      roadmapSubsections: many(roadmapSubsections),
      jobMatches: many(jobMatches),
      applications: many(applications),
      achievements: many(achievements),
      activities: many(activities),
      savedOpportunities: many(savedOpportunities),
      tourCompletions: many(tourCompletions),
      purchasedFeatures: many(userPurchasedFeatures),
      sentInvitations: many(invitations, { relationName: "invitedBy" }),
      claimedInvitations: many(invitations, { relationName: "claimedBy" })
    }));
    sessionsRelations = relations(sessions, ({ one }) => ({
      user: one(users, { fields: [sessions.userId], references: [users.id] })
    }));
    resumesRelations = relations(resumes, ({ one, many }) => ({
      user: one(users, { fields: [resumes.userId], references: [users.id] }),
      tailoredResumes: many(tailoredResumes),
      analysisHistory: many(resumeAnalysisHistory)
    }));
    resumeAnalysisHistoryRelations = relations(resumeAnalysisHistory, ({ one }) => ({
      user: one(users, { fields: [resumeAnalysisHistory.userId], references: [users.id] }),
      resume: one(resumes, { fields: [resumeAnalysisHistory.resumeId], references: [resumes.id] })
    }));
    roadmapsRelations = relations(roadmaps, ({ one, many }) => ({
      user: one(users, { fields: [roadmaps.userId], references: [users.id] }),
      subsections: many(roadmapSubsections)
    }));
    roadmapSubsectionsRelations = relations(roadmapSubsections, ({ one }) => ({
      roadmap: one(roadmaps, { fields: [roadmapSubsections.roadmapId], references: [roadmaps.id] }),
      user: one(users, { fields: [roadmapSubsections.userId], references: [users.id] })
    }));
    jobMatchesRelations = relations(jobMatches, ({ one, many }) => ({
      user: one(users, { fields: [jobMatches.userId], references: [users.id] }),
      tailoredResumes: many(tailoredResumes),
      applications: many(applications)
    }));
    tailoredResumesRelations = relations(tailoredResumes, ({ one, many }) => ({
      user: one(users, { fields: [tailoredResumes.userId], references: [users.id] }),
      baseResume: one(resumes, { fields: [tailoredResumes.baseResumeId], references: [resumes.id] }),
      jobMatch: one(jobMatches, { fields: [tailoredResumes.jobMatchId], references: [jobMatches.id] }),
      applications: many(applications)
    }));
    applicationsRelations = relations(applications, ({ one }) => ({
      user: one(users, { fields: [applications.userId], references: [users.id] }),
      jobMatch: one(jobMatches, { fields: [applications.jobMatchId], references: [jobMatches.id] }),
      tailoredResume: one(tailoredResumes, { fields: [applications.tailoredResumeId], references: [tailoredResumes.id] })
    }));
    achievementsRelations = relations(achievements, ({ one }) => ({
      user: one(users, { fields: [achievements.userId], references: [users.id] })
    }));
    opportunitiesRelations = relations(opportunities, ({ many }) => ({
      savedByUsers: many(savedOpportunities)
    }));
    savedOpportunitiesRelations = relations(savedOpportunities, ({ one }) => ({
      user: one(users, { fields: [savedOpportunities.userId], references: [users.id] }),
      opportunity: one(opportunities, { fields: [savedOpportunities.opportunityId], references: [opportunities.id] })
    }));
    tourCompletionsRelations = relations(tourCompletions, ({ one }) => ({
      user: one(users, { fields: [tourCompletions.userId], references: [users.id] })
    }));
    userPurchasedFeaturesRelations = relations(userPurchasedFeatures, ({ one }) => ({
      user: one(users, { fields: [userPurchasedFeatures.userId], references: [users.id] })
    }));
    activitiesRelations = relations(activities, ({ one }) => ({
      user: one(users, { fields: [activities.userId], references: [users.id] })
    }));
    atomicTaskSchema = z.object({
      id: z.string().uuid().or(z.literal("")).transform((val) => val || crypto.randomUUID()),
      // Auto-generate if missing
      title: z.string().min(5).max(60),
      // Enforce short, actionable titles
      description: z.string().min(10).max(140),
      // Twitter-length descriptions
      estimatedMinutes: z.number().min(20).max(60),
      // Bite-sized time commitment
      priority: z.enum(["high", "medium", "low"]),
      definitionOfDone: z.array(z.string().max(80)).min(3).max(5),
      // Clear completion criteria
      resources: z.array(z.object({
        title: z.string().max(50),
        url: z.string().url()
      })).max(2).default([]),
      // Optional resources, prevent overwhelm
      dependencies: z.array(z.string().uuid()).default([]),
      // Task IDs this depends on
      completed: z.boolean().default(false),
      completedAt: z.coerce.date().nullable().optional()
    }).strict();
    roadmapSubsectionSchema = z.object({
      id: z.string().uuid().or(z.literal("")).transform((val) => val || crypto.randomUUID()),
      // Auto-generate if missing
      title: z.string().min(5).max(80),
      description: z.string().min(10).max(200),
      // Brief subsection overview
      tasks: z.array(atomicTaskSchema).min(3).max(5),
      // 3-5 tasks per subsection
      estimatedHours: z.number().min(1).max(5),
      // Total time for subsection
      priority: z.enum(["high", "medium", "low"])
    }).strict();
    atomicRoadmapSchema = z.object({
      phase: z.enum(["30_days", "3_months", "6_months"]),
      // Align with DB enum
      title: z.string().min(10).max(100),
      description: z.string().min(20).max(300),
      subsections: z.array(roadmapSubsectionSchema).min(4).max(6),
      // 4-6 subsections max
      estimatedWeeks: z.number().min(1).max(12)
    }).strict();
    insertInstitutionSchema = createInsertSchema(institutions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertLicenseSchema = createInsertSchema(licenses).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertInvitationSchema = createInsertSchema(invitations).omit({
      id: true,
      createdAt: true
    });
    insertEmailVerificationSchema = createInsertSchema(emailVerifications).omit({
      id: true,
      createdAt: true
    });
    insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens).omit({
      id: true,
      createdAt: true
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPromoCodeSchema = createInsertSchema(promoCodes).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      currentUses: true
    });
    insertResumeSchema = createInsertSchema(resumes).omit({
      id: true,
      createdAt: true
    });
    insertResumeAnalysisHistorySchema = createInsertSchema(resumeAnalysisHistory).omit({
      id: true,
      createdAt: true
    });
    insertRoadmapSchema = createInsertSchema(roadmaps).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertRoadmapSubsectionSchema = createInsertSchema(roadmapSubsections).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertJobMatchSchema = createInsertSchema(jobMatches).omit({
      id: true,
      createdAt: true
    });
    insertJobAnalysisSchema = createInsertSchema(jobAnalyses).omit({
      id: true,
      createdAt: true
    });
    insertTailoredResumeSchema = createInsertSchema(tailoredResumes).omit({
      id: true,
      createdAt: true
    });
    insertCoverLetterSchema = createInsertSchema(coverLetters).omit({
      id: true,
      createdAt: true
    });
    insertApplicationSchema = createInsertSchema(applications).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertSkillGapAnalysisSchema = createInsertSchema(skillGapAnalyses).omit({
      id: true,
      createdAt: true
    });
    insertMicroProjectSchema = createInsertSchema(microProjects).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      deliverables: z.array(deliverableSchema),
      instructions: projectInstructionsSchema.optional()
    });
    insertProjectCompletionSchema = createInsertSchema(projectCompletions).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertPortfolioArtifactSchema = createInsertSchema(portfolioArtifacts).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });
    registerSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      confirmPassword: z.string().min(6).optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      school: z.string().optional(),
      major: z.string().optional(),
      gradYear: z.number().optional(),
      invitationToken: z.string().optional(),
      selectedPlan: z.enum(["free", "paid"]).optional()
    });
    inviteUserSchema = z.object({
      email: z.string().email(),
      role: z.enum(["student", "admin"]).default("student"),
      institutionId: z.string().min(1)
      // Allow both UUID and demo string IDs
    });
    verifyEmailSchema = z.object({
      token: z.string()
    });
    forgotPasswordSchema = z.object({
      email: z.string().email()
    });
    resetPasswordSchema = z.object({
      token: z.string(),
      password: z.string().min(6),
      confirmPassword: z.string().min(6)
    }).refine((data) => data.password === data.confirmPassword, {
      message: "Passwords don't match",
      path: ["confirmPassword"]
    });
    jobMatchAnalysisSchema = z.object({
      overallMatch: z.number().int().min(1).max(100),
      competitivenessBand: z.enum(["Exceptional", "Strong", "Good", "Fair", "Weak", "Poor"]),
      strengths: z.array(z.string()).min(1),
      concerns: z.array(z.string()),
      skillsAnalysis: z.object({
        strongMatches: z.array(z.string()),
        partialMatches: z.array(z.string()),
        missingSkills: z.array(z.string()),
        explanation: z.string().min(50)
      }),
      experienceAnalysis: z.object({
        relevantExperience: z.array(z.string()),
        experienceGaps: z.array(z.string()),
        explanation: z.string().min(50)
      }),
      recommendations: z.array(z.string()).min(1),
      nextSteps: z.array(z.string()).min(1)
    });
    insertOpportunitySchema = createInsertSchema(opportunities).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      postedDate: true
    });
    insertSavedOpportunitySchema = createInsertSchema(savedOpportunities).omit({
      id: true,
      savedAt: true
    });
    insertUserPurchasedFeatureSchema = createInsertSchema(userPurchasedFeatures).omit({
      id: true,
      purchasedAt: true
    });
    insertTourCompletionSchema = createInsertSchema(tourCompletions).omit({
      id: true,
      completedAt: true
    });
    uploadStatusEnum = pgEnum("upload_status", ["pending", "completed", "failed"]);
    fileMetadata = pgTable("file_metadata", {
      id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
      /** Supabase Storage object path, e.g. "uploads/{userId}/{uuid}" */
      objectPath: text("object_path").notNull().unique(),
      /** FK to users.id — the user who initiated the upload */
      ownerUserId: varchar("owner_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      visibility: text("visibility").$type().notNull().default("private"),
      originalFilename: text("original_filename").notNull().default(""),
      mimeType: text("mime_type"),
      fileSizeBytes: integer("file_size_bytes"),
      /** pending: URL issued but upload not confirmed; completed: upload verified; failed: abandoned */
      uploadStatus: uploadStatusEnum("upload_status").notNull().default("pending"),
      createdAt: timestamp("created_at").notNull().default(sql`now()`)
    });
    insertFileMetadataSchema = createInsertSchema(fileMetadata).omit({
      id: true,
      createdAt: true
    });
  }
});

// server/db.ts
import pkg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var Pool, pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    ({ Pool } = pkg);
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 2,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 1e4
    });
    db = drizzle(pool);
  }
});

// server/storage.ts
import { eq, desc, and, or, sql as sql2 } from "drizzle-orm";
var DatabaseStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    DatabaseStorage = class {
      async getUser(id) {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user || void 0;
      }
      async getUserByEmail(email) {
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user || void 0;
      }
      async getUserByStripeCustomerId(stripeCustomerId) {
        const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
        return user || void 0;
      }
      async createUser(insertUser) {
        const [user] = await db.insert(users).values(insertUser).returning();
        return user;
      }
      async updateUser(id, updates) {
        const [user] = await db.update(users).set({ ...updates, updatedAt: sql2`now()` }).where(eq(users.id, id)).returning();
        return user;
      }
      async updateUserSummary(userId, summary) {
        const [user] = await db.update(users).set({
          aiSummary: summary,
          aiSummaryGeneratedAt: sql2`now()`,
          updatedAt: sql2`now()`
        }).where(eq(users.id, userId)).returning();
        return user;
      }
      async createSession(userId, token, expiresAt) {
        await db.insert(sessions).values({ userId, token, expiresAt });
      }
      async getSession(token) {
        const [session] = await db.select({ user: users }).from(sessions).innerJoin(users, eq(sessions.userId, users.id)).where(and(eq(sessions.token, token), sql2`${sessions.expiresAt} > now()`));
        return session || void 0;
      }
      async deleteSession(token) {
        await db.delete(sessions).where(eq(sessions.token, token));
      }
      async deleteUserSessions(userId) {
        await db.delete(sessions).where(eq(sessions.userId, userId));
      }
      async deleteUser(userId) {
        await db.delete(users).where(eq(users.id, userId));
      }
      async createResume(resume) {
        await db.update(resumes).set({ isActive: false }).where(eq(resumes.userId, resume.userId));
        const [newResume] = await db.insert(resumes).values(resume).returning();
        return newResume;
      }
      async getUserResumes(userId) {
        return await db.select().from(resumes).where(eq(resumes.userId, userId)).orderBy(desc(resumes.createdAt));
      }
      async getActiveResume(userId) {
        const [resume] = await db.select().from(resumes).where(and(eq(resumes.userId, userId), eq(resumes.isActive, true)));
        return resume || void 0;
      }
      async updateResumeAnalysis(id, analysis) {
        const validFields = {
          ...analysis.rmsScore !== void 0 && { rmsScore: analysis.rmsScore },
          ...analysis.skillsScore !== void 0 && { skillsScore: analysis.skillsScore },
          ...analysis.experienceScore !== void 0 && { experienceScore: analysis.experienceScore },
          ...analysis.keywordsScore !== void 0 && { keywordsScore: analysis.keywordsScore },
          ...analysis.educationScore !== void 0 && { educationScore: analysis.educationScore },
          ...analysis.certificationsScore !== void 0 && { certificationsScore: analysis.certificationsScore },
          ...analysis.gaps !== void 0 && { gaps: analysis.gaps },
          ...analysis.overallInsights !== void 0 && { overallInsights: analysis.overallInsights },
          ...analysis.sectionAnalysis !== void 0 && { sectionAnalysis: analysis.sectionAnalysis },
          ...analysis.targetRole !== void 0 && { targetRole: analysis.targetRole },
          ...analysis.targetIndustry !== void 0 && { targetIndustry: analysis.targetIndustry },
          ...analysis.targetCompanies !== void 0 && { targetCompanies: analysis.targetCompanies },
          ...analysis.analysisHash !== void 0 && { analysisHash: analysis.analysisHash }
        };
        if (Object.keys(validFields).length === 0) {
          throw new Error("No valid analysis fields to update");
        }
        const [resume] = await db.update(resumes).set(validFields).where(eq(resumes.id, id)).returning();
        return resume;
      }
      async createResumeAnalysisHistory(history) {
        const [newHistory] = await db.insert(resumeAnalysisHistory).values(history).returning();
        return newHistory;
      }
      async getUserResumeAnalysisHistory(userId, filters) {
        let query = db.select().from(resumeAnalysisHistory).where(eq(resumeAnalysisHistory.userId, userId)).$dynamic();
        const conditions = [eq(resumeAnalysisHistory.userId, userId)];
        if (filters?.targetRole) {
          conditions.push(eq(resumeAnalysisHistory.targetRole, filters.targetRole));
        }
        if (filters?.targetIndustry) {
          conditions.push(eq(resumeAnalysisHistory.targetIndustry, filters.targetIndustry));
        }
        if (filters?.startDate) {
          conditions.push(sql2`${resumeAnalysisHistory.createdAt} >= ${filters.startDate}`);
        }
        if (filters?.endDate) {
          conditions.push(sql2`${resumeAnalysisHistory.createdAt} <= ${filters.endDate}`);
        }
        return await db.select().from(resumeAnalysisHistory).where(and(...conditions)).orderBy(desc(resumeAnalysisHistory.createdAt));
      }
      async createRoadmap(roadmap) {
        await db.update(roadmaps).set({ isActive: false }).where(and(eq(roadmaps.userId, roadmap.userId), eq(roadmaps.phase, roadmap.phase)));
        const [newRoadmap] = await db.insert(roadmaps).values(roadmap).returning();
        return newRoadmap;
      }
      async getUserRoadmaps(userId) {
        return await db.select().from(roadmaps).where(and(eq(roadmaps.userId, userId), eq(roadmaps.isActive, true))).orderBy(roadmaps.phase);
      }
      async updateRoadmapProgress(id, progress) {
        const [roadmap] = await db.update(roadmaps).set({ progress, updatedAt: sql2`now()` }).where(eq(roadmaps.id, id)).returning();
        return roadmap;
      }
      async updateActionCompletion(roadmapId, actionId, userId, completed) {
        const [currentRoadmap] = await db.select().from(roadmaps).where(eq(roadmaps.id, roadmapId));
        if (!currentRoadmap || !currentRoadmap.actions) {
          throw new Error("Roadmap not found or has no actions");
        }
        const updatedActions = currentRoadmap.actions.map((action) => {
          if (action.id === actionId) {
            return { ...action, completed };
          }
          return action;
        });
        const completedCount = updatedActions.filter((action) => action.completed).length;
        const progress = Math.round(completedCount / updatedActions.length * 100);
        const [updatedRoadmap] = await db.update(roadmaps).set({
          actions: updatedActions,
          progress,
          updatedAt: sql2`now()`
        }).where(eq(roadmaps.id, roadmapId)).returning();
        return updatedRoadmap;
      }
      async updateTaskCompletion(roadmapId, taskId, userId, completed) {
        const [currentRoadmap] = await db.select().from(roadmaps).where(eq(roadmaps.id, roadmapId));
        if (!currentRoadmap || !currentRoadmap.subsections) {
          throw new Error("Roadmap not found or has no subsections");
        }
        const updatedSubsections = currentRoadmap.subsections.map((subsection) => {
          if (subsection.tasks) {
            subsection.tasks = subsection.tasks.map((task) => {
              if (task.id === taskId) {
                return { ...task, completed };
              }
              return task;
            });
          }
          return subsection;
        });
        let totalTasks = 0;
        let completedTasks = 0;
        updatedSubsections.forEach((subsection) => {
          if (subsection.tasks) {
            totalTasks += subsection.tasks.length;
            completedTasks += subsection.tasks.filter((task) => task.completed).length;
          }
        });
        const progress = totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0;
        const [updatedRoadmap] = await db.update(roadmaps).set({
          subsections: updatedSubsections,
          progress,
          updatedAt: sql2`now()`
        }).where(eq(roadmaps.id, roadmapId)).returning();
        return updatedRoadmap;
      }
      async getTaskCompletionStatus(roadmapId, userId) {
        const [roadmap] = await db.select().from(roadmaps).where(and(eq(roadmaps.id, roadmapId), eq(roadmaps.userId, userId)));
        if (!roadmap || !roadmap.subsections) {
          return {};
        }
        const completionStatus = {};
        roadmap.subsections.forEach((subsection) => {
          if (subsection.tasks) {
            subsection.tasks.forEach((task) => {
              completionStatus[task.id] = task.completed || false;
            });
          }
        });
        return completionStatus;
      }
      async createJobMatch(jobMatch) {
        const [match] = await db.insert(jobMatches).values(jobMatch).returning();
        return match;
      }
      async getUserJobMatches(userId, limit = 20) {
        return await db.select().from(jobMatches).where(eq(jobMatches.userId, userId)).orderBy(desc(jobMatches.compatibilityScore)).limit(limit);
      }
      async updateJobMatchBookmark(id, isBookmarked) {
        const [jobMatch] = await db.update(jobMatches).set({ isBookmarked }).where(eq(jobMatches.id, id)).returning();
        return jobMatch;
      }
      async createApplication(application) {
        const [app2] = await db.insert(applications).values(application).returning();
        return app2;
      }
      async getUserApplications(userId) {
        return await db.select().from(applications).where(eq(applications.userId, userId)).orderBy(desc(applications.appliedDate));
      }
      async updateApplicationStatus(id, status, responseDate) {
        const updates = { status, updatedAt: sql2`now()` };
        if (responseDate) updates.responseDate = responseDate;
        const [application] = await db.update(applications).set(updates).where(eq(applications.id, id)).returning();
        return application;
      }
      async createActivity(userId, type, title, description, metadata) {
        const [activity] = await db.insert(activities).values({ userId, type, title, description, metadata }).returning();
        return activity;
      }
      async getUserActivities(userId, limit = 10) {
        return await db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.createdAt)).limit(limit);
      }
      async createAchievement(userId, title, description, icon) {
        const [achievement] = await db.insert(achievements).values({ userId, title, description, icon }).returning();
        return achievement;
      }
      async getUserAchievements(userId) {
        return await db.select().from(achievements).where(eq(achievements.userId, userId)).orderBy(desc(achievements.unlockedAt));
      }
      async createTailoredResume(tailoredResume) {
        const [newTailoredResume] = await db.insert(tailoredResumes).values(tailoredResume).returning();
        return newTailoredResume;
      }
      async getTailoredResumes(userId, limit) {
        const query = db.select().from(tailoredResumes).where(eq(tailoredResumes.userId, userId)).orderBy(desc(tailoredResumes.createdAt));
        if (limit) {
          return await query.limit(limit);
        }
        return await query;
      }
      // Job Analyses Methods
      async createJobAnalysis(jobAnalysis) {
        const [newJobAnalysis] = await db.insert(jobAnalyses).values(jobAnalysis).returning();
        return newJobAnalysis;
      }
      async getUserJobAnalyses(userId, limit = 20) {
        return await db.select().from(jobAnalyses).where(eq(jobAnalyses.userId, userId)).orderBy(desc(jobAnalyses.createdAt)).limit(limit);
      }
      async getJobAnalysisById(id) {
        const [jobAnalysis] = await db.select().from(jobAnalyses).where(eq(jobAnalyses.id, id));
        return jobAnalysis || void 0;
      }
      // Cover Letters Methods
      async createCoverLetter(coverLetter) {
        const [newCoverLetter] = await db.insert(coverLetters).values(coverLetter).returning();
        return newCoverLetter;
      }
      async getUserCoverLetters(userId, limit = 20) {
        return await db.select().from(coverLetters).where(eq(coverLetters.userId, userId)).orderBy(desc(coverLetters.createdAt)).limit(limit);
      }
      async getResources(skillCategories) {
        if (!skillCategories?.length) {
          return await db.select().from(resources).orderBy(desc(resources.relevanceScore));
        }
        return await db.select().from(resources).where(sql2`${resources.skillCategories} && ${skillCategories}`).orderBy(desc(resources.relevanceScore));
      }
      // Institution & Licensing Methods
      async createInstitution(institution) {
        const [newInstitution] = await db.insert(institutions).values(institution).returning();
        return newInstitution;
      }
      async getInstitution(id) {
        const [institution] = await db.select().from(institutions).where(eq(institutions.id, id));
        return institution || void 0;
      }
      async getInstitutionByDomain(domain) {
        const [institution] = await db.select().from(institutions).where(
          or(
            eq(institutions.domain, domain),
            sql2`${domain} = ANY(${institutions.allowedDomains})`
          )
        );
        return institution || void 0;
      }
      async updateInstitution(id, updates) {
        const [institution] = await db.update(institutions).set({ ...updates, updatedAt: sql2`now()` }).where(eq(institutions.id, id)).returning();
        return institution;
      }
      async listInstitutions() {
        return await db.select().from(institutions).orderBy(desc(institutions.createdAt));
      }
      async deleteInstitution(id) {
        await db.delete(institutions).where(eq(institutions.id, id));
      }
      async createLicense(license) {
        await db.update(licenses).set({ isActive: false, updatedAt: sql2`now()` }).where(eq(licenses.institutionId, license.institutionId));
        const [newLicense] = await db.insert(licenses).values(license).returning();
        return newLicense;
      }
      async getInstitutionLicense(institutionId) {
        const [license] = await db.select().from(licenses).where(and(
          eq(licenses.institutionId, institutionId),
          eq(licenses.isActive, true),
          sql2`${licenses.endDate} > now()`
        )).orderBy(desc(licenses.createdAt));
        return license || void 0;
      }
      async updateLicenseUsage(licenseId, usedSeats) {
        const [license] = await db.update(licenses).set({ usedSeats, updatedAt: sql2`now()` }).where(eq(licenses.id, licenseId)).returning();
        return license;
      }
      async checkSeatAvailability(institutionId) {
        const license = await this.getInstitutionLicense(institutionId);
        if (!license) {
          return { available: false, usedSeats: 0, totalSeats: null };
        }
        if (license.licenseType === "site") {
          return { available: true, usedSeats: license.usedSeats, totalSeats: null };
        }
        const available = license.usedSeats < (license.licensedSeats || 0);
        return {
          available,
          usedSeats: license.usedSeats,
          totalSeats: license.licensedSeats
        };
      }
      async createInvitation(invitation) {
        const [newInvitation] = await db.insert(invitations).values(invitation).returning();
        return newInvitation;
      }
      async getInvitationByToken(token) {
        const [invitation] = await db.select().from(invitations).where(and(
          eq(invitations.token, token),
          eq(invitations.status, "pending"),
          sql2`${invitations.expiresAt} > now()`
        ));
        return invitation || void 0;
      }
      async claimInvitation(token, userId) {
        const [invitation] = await db.update(invitations).set({
          status: "claimed",
          claimedBy: userId,
          claimedAt: sql2`now()`
        }).where(eq(invitations.token, token)).returning();
        return invitation;
      }
      async getInstitutionInvitations(institutionId) {
        return await db.select().from(invitations).where(eq(invitations.institutionId, institutionId)).orderBy(desc(invitations.createdAt));
      }
      async getInvitation(id) {
        const [invitation] = await db.select().from(invitations).where(eq(invitations.id, id));
        return invitation || void 0;
      }
      async cancelInvitation(id) {
        await db.update(invitations).set({ status: "expired" }).where(eq(invitations.id, id));
      }
      async createEmailVerification(verification) {
        const [newVerification] = await db.insert(emailVerifications).values(verification).returning();
        return newVerification;
      }
      async getEmailVerification(token) {
        const [verification] = await db.select().from(emailVerifications).where(and(
          eq(emailVerifications.token, token),
          eq(emailVerifications.isUsed, false),
          sql2`${emailVerifications.expiresAt} > now()`
        ));
        return verification || void 0;
      }
      async markEmailVerificationUsed(token) {
        await db.update(emailVerifications).set({ isUsed: true }).where(eq(emailVerifications.token, token));
      }
      async createPasswordResetToken(resetToken) {
        const [newToken] = await db.insert(passwordResetTokens).values(resetToken).returning();
        return newToken;
      }
      async getPasswordResetToken(token) {
        const [resetToken] = await db.select().from(passwordResetTokens).where(and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.isUsed, false),
          sql2`${passwordResetTokens.expiresAt} > now()`
        ));
        return resetToken || void 0;
      }
      async markPasswordResetTokenAsUsed(token) {
        await db.update(passwordResetTokens).set({ isUsed: true }).where(eq(passwordResetTokens.token, token));
      }
      async deletePasswordResetToken(token) {
        await db.delete(passwordResetTokens).where(eq(passwordResetTokens.token, token));
      }
      async getPromoCodeByCode(code) {
        const [promoCode] = await db.select().from(promoCodes).where(and(
          eq(promoCodes.code, code),
          eq(promoCodes.isActive, true),
          or(
            sql2`${promoCodes.expiresAt} IS NULL`,
            sql2`${promoCodes.expiresAt} > now()`
          )
        ));
        return promoCode || void 0;
      }
      async incrementPromoCodeUsage(id) {
        await db.update(promoCodes).set({
          currentUses: sql2`${promoCodes.currentUses} + 1`,
          updatedAt: sql2`now()`
        }).where(eq(promoCodes.id, id));
      }
      async activateUser(userId) {
        const [user] = await db.update(users).set({ isActive: true, lastActiveAt: sql2`now()`, updatedAt: sql2`now()` }).where(eq(users.id, userId)).returning();
        return user;
      }
      async deactivateUser(userId) {
        const [user] = await db.update(users).set({ isActive: false, updatedAt: sql2`now()` }).where(eq(users.id, userId)).returning();
        return user;
      }
      async getInstitutionUsers(institutionId, activeOnly = true) {
        const whereConditions = [eq(users.institutionId, institutionId)];
        if (activeOnly) {
          whereConditions.push(eq(users.isActive, true));
        }
        return await db.select().from(users).where(and(...whereConditions)).orderBy(desc(users.createdAt));
      }
      async checkDomainAllowlist(email, institutionId) {
        const domain = email.split("@")[1];
        const institution = await this.getInstitution(institutionId);
        if (!institution) {
          return false;
        }
        if (institution.domain === domain) {
          return true;
        }
        if (institution.allowedDomains && institution.allowedDomains.includes(domain)) {
          return true;
        }
        return false;
      }
      // Additional required methods
      async getResumeById(id) {
        const [resume] = await db.select().from(resumes).where(eq(resumes.id, id));
        return resume || void 0;
      }
      async getResumeByHash(userId, analysisHash) {
        const [resume] = await db.select().from(resumes).where(and(
          eq(resumes.userId, userId),
          sql2`${resumes.analysisHash}->>'hash' = ${analysisHash}`,
          eq(resumes.isActive, true)
        ));
        return resume || void 0;
      }
      async getJobMatchById(id) {
        const [jobMatch] = await db.select().from(jobMatches).where(eq(jobMatches.id, id));
        return jobMatch || void 0;
      }
      // Micro-Internship Marketplace implementations
      async createSkillGapAnalysis(analysis) {
        const [result] = await db.insert(skillGapAnalyses).values(analysis).returning({ id: skillGapAnalyses.id });
        return result.id;
      }
      async getSkillGapAnalysisById(id) {
        const [analysis] = await db.select().from(skillGapAnalyses).where(eq(skillGapAnalyses.id, id));
        return analysis || void 0;
      }
      async getSkillGapAnalysesByUser(userId) {
        return await db.select().from(skillGapAnalyses).where(eq(skillGapAnalyses.userId, userId)).orderBy(desc(skillGapAnalyses.createdAt));
      }
      async createMicroProject(project) {
        const [result] = await db.insert(microProjects).values(project).returning({ id: microProjects.id });
        return result.id;
      }
      async getMicroProjectById(id) {
        const [project] = await db.select().from(microProjects).where(eq(microProjects.id, id));
        return project || void 0;
      }
      async getMicroProjectsBySkills(skills, userId) {
        if (skills.length === 0) return [];
        const conditions = skills.map(
          (skill) => or(
            eq(microProjects.targetSkill, skill),
            eq(microProjects.skillCategory, skill),
            sql2`${skill.toLowerCase()} = ANY(${microProjects.tags})`
          )
        );
        const whereConditions = [
          eq(microProjects.isActive, true),
          or(...conditions)
        ];
        if (userId) {
          whereConditions.push(eq(microProjects.userId, userId));
        }
        return await db.select().from(microProjects).where(and(...whereConditions)).orderBy(desc(microProjects.createdAt)).limit(10);
      }
      async getMicroProjectsByUser(userId, limit = 50, offset = 0) {
        return await db.select().from(microProjects).where(and(
          eq(microProjects.userId, userId),
          eq(microProjects.isActive, true)
        )).orderBy(desc(microProjects.createdAt)).limit(limit).offset(offset);
      }
      async updateMicroProject(id, updates) {
        const [project] = await db.update(microProjects).set({ ...updates, updatedAt: sql2`now()` }).where(eq(microProjects.id, id)).returning();
        return project;
      }
      async deleteMicroProject(id) {
        await db.delete(microProjects).where(eq(microProjects.id, id));
      }
      async clearAllMicroProjects(userId) {
        await db.delete(microProjects).where(eq(microProjects.userId, userId));
      }
      async getAllMicroProjects(limit = 50, offset = 0) {
        return await db.select().from(microProjects).where(eq(microProjects.isActive, true)).orderBy(desc(microProjects.createdAt)).limit(limit).offset(offset);
      }
      async createProjectCompletion(completion) {
        const [result] = await db.insert(projectCompletions).values(completion).returning({ id: projectCompletions.id });
        return result.id;
      }
      async getProjectCompletion(userId, projectId) {
        const [completion] = await db.select().from(projectCompletions).where(and(
          eq(projectCompletions.userId, userId),
          eq(projectCompletions.projectId, projectId)
        ));
        return completion || void 0;
      }
      async getProjectCompletionsByUser(userId) {
        return await db.select().from(projectCompletions).where(eq(projectCompletions.userId, userId)).orderBy(desc(projectCompletions.createdAt));
      }
      async updateProjectCompletion(id, updates) {
        await db.update(projectCompletions).set({ ...updates, updatedAt: sql2`now()` }).where(eq(projectCompletions.id, id));
      }
      async clearAllProjectCompletions(userId) {
        await db.delete(projectCompletions).where(eq(projectCompletions.userId, userId));
      }
      async createPortfolioArtifact(artifact) {
        const [result] = await db.insert(portfolioArtifacts).values(artifact).returning({ id: portfolioArtifacts.id });
        return result.id;
      }
      async getPortfolioArtifactsByUser(userId) {
        return await db.select().from(portfolioArtifacts).where(eq(portfolioArtifacts.userId, userId)).orderBy(desc(portfolioArtifacts.createdAt));
      }
      async saveOpportunity(userId, opportunityData) {
        let opportunity;
        const existing = await db.select().from(opportunities).where(eq(opportunities.externalId, opportunityData.id)).limit(1);
        if (existing.length > 0) {
          opportunity = existing[0];
        } else {
          const [newOpp] = await db.insert(opportunities).values({
            title: opportunityData.title,
            description: opportunityData.description,
            organization: opportunityData.organization,
            type: opportunityData.type,
            location: opportunityData.location,
            isRemote: opportunityData.remote,
            applicationUrl: opportunityData.url,
            source: opportunityData.source,
            externalId: opportunityData.id,
            duration: opportunityData.duration,
            isActive: true
          }).returning();
          opportunity = newOpp;
        }
        const [saved] = await db.insert(savedOpportunities).values({
          userId,
          opportunityId: opportunity.id
        }).returning();
        return { ...saved, opportunity };
      }
      async getSavedOpportunities(userId) {
        const saved = await db.select({
          id: savedOpportunities.id,
          savedAt: savedOpportunities.savedAt,
          notes: savedOpportunities.notes,
          opportunity: opportunities
        }).from(savedOpportunities).innerJoin(opportunities, eq(savedOpportunities.opportunityId, opportunities.id)).where(eq(savedOpportunities.userId, userId)).orderBy(desc(savedOpportunities.savedAt));
        return saved;
      }
      async getUserPurchasedFeature(userId, featureKey) {
        const [feature] = await db.select().from(userPurchasedFeatures).where(and(
          eq(userPurchasedFeatures.userId, userId),
          eq(userPurchasedFeatures.featureKey, featureKey)
        ));
        return feature || void 0;
      }
      async getUserPurchasedFeatures(userId) {
        return await db.select().from(userPurchasedFeatures).where(eq(userPurchasedFeatures.userId, userId)).orderBy(desc(userPurchasedFeatures.purchasedAt));
      }
      async getUnusedFeatureCredit(userId, featureKey) {
        const [feature] = await db.select().from(userPurchasedFeatures).where(and(
          eq(userPurchasedFeatures.userId, userId),
          eq(userPurchasedFeatures.featureKey, featureKey),
          eq(userPurchasedFeatures.isUsed, false)
        )).orderBy(desc(userPurchasedFeatures.purchasedAt)).limit(1);
        return feature || void 0;
      }
      async getUserUnusedCredits(userId) {
        return await db.select().from(userPurchasedFeatures).where(and(
          eq(userPurchasedFeatures.userId, userId),
          eq(userPurchasedFeatures.isUsed, false)
        )).orderBy(desc(userPurchasedFeatures.purchasedAt));
      }
      async createUserPurchasedFeature(feature) {
        const [purchasedFeature] = await db.insert(userPurchasedFeatures).values(feature).returning();
        return purchasedFeature;
      }
      async consumeFeatureCredit(creditId) {
        const [consumed] = await db.update(userPurchasedFeatures).set({
          isUsed: true,
          usedAt: sql2`now()`
        }).where(and(
          eq(userPurchasedFeatures.id, creditId),
          eq(userPurchasedFeatures.isUsed, false)
        )).returning();
        return consumed || null;
      }
      async findPurchaseByStripeRefs(userId, paymentIntentId, checkoutSessionId) {
        const conditions = [eq(userPurchasedFeatures.userId, userId)];
        if (paymentIntentId || checkoutSessionId) {
          const refConditions = [];
          if (paymentIntentId) {
            refConditions.push(eq(userPurchasedFeatures.stripePaymentIntentId, paymentIntentId));
          }
          if (checkoutSessionId) {
            refConditions.push(eq(userPurchasedFeatures.stripeCheckoutSessionId, checkoutSessionId));
          }
          if (refConditions.length > 0) {
            conditions.push(or(...refConditions));
          }
        }
        const [purchase] = await db.select().from(userPurchasedFeatures).where(and(...conditions)).limit(1);
        return purchase || void 0;
      }
      async getUserCompletedTours(userId) {
        return await db.select().from(tourCompletions).where(eq(tourCompletions.userId, userId)).orderBy(desc(tourCompletions.completedAt));
      }
      async getTourCompletion(userId, tourId) {
        const [completion] = await db.select().from(tourCompletions).where(and(
          eq(tourCompletions.userId, userId),
          eq(tourCompletions.tourId, tourId)
        ));
        return completion || void 0;
      }
      async completeTour(userId, tourId) {
        const [completion] = await db.insert(tourCompletions).values({ userId, tourId }).returning();
        return completion;
      }
    };
    storage = new DatabaseStorage();
  }
});

// server/ai.ts
var ai_exports = {};
__export(ai_exports, {
  AIService: () => AIService,
  aiService: () => aiService
});
import OpenAI from "openai";
import { z as z2 } from "zod";
import { randomUUID, createHash } from "crypto";
function generateAnalysisHash(resumeText, targetRole, targetIndustry, targetCompanies) {
  const normalizedText = resumeText.trim().toLowerCase();
  const normalizedRole = (targetRole || "").trim().toLowerCase();
  const normalizedIndustry = (targetIndustry || "").trim().toLowerCase();
  const normalizedCompanies = (targetCompanies || "").trim().toLowerCase();
  const combinedInput = `${normalizedText}|${normalizedRole}|${normalizedIndustry}|${normalizedCompanies}`;
  return createHash("sha256").update(combinedInput).digest("hex");
}
var openai, AIService, aiService;
var init_ai = __esm({
  "server/ai.ts"() {
    "use strict";
    init_schema();
    init_storage();
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
    });
    AIService = class {
      async generateText(prompt) {
        try {
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant that provides clear and concise responses."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            max_completion_tokens: 1e3,
            temperature: 0.7
          });
          return response.choices[0].message.content || "";
        } catch (error) {
          console.error("AI text generation failed:", error);
          throw error;
        }
      }
      // Two-pass atomization: refines tasks to ensure they're truly bite-sized
      async atomizeTasks(subsections) {
        try {
          const atomizePrompt = `You are a task atomizer. Your job is to ensure every task is truly atomic and bite-sized.

REVIEW these subsections and split ANY task that:
- Has multiple sentences
- Contains "and", "then", "also", "additionally"  
- Takes longer than 60 minutes
- Has multiple deliverables
- Is vague or complex

ATOMIZATION RULES:
1. Each task = ONE verb + ONE object
2. Completable in 20-60 minutes
3. Single clear outcome
4. Title max 60 chars, description max 140 chars
5. Keep same JSON structure

INPUT SUBSECTIONS:
${JSON.stringify(subsections, null, 2)}

Return JSON in this format: { "subsections": [...] }

ID REQUIREMENTS: 
- Preserve existing task IDs when possible
- Generate new RFC-4122 UUID v4 for new tasks created by splitting
- Maintain dependencies and copy them to all resulting tasks from a split`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            // Using GPT-4o for reliable performance
            messages: [
              {
                role: "system",
                content: "You are a precision task atomizer. Split complex tasks into atomic, trackable actions. Return JSON only."
              },
              {
                role: "user",
                content: atomizePrompt
              }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 3e3
          });
          const atomizedResult = JSON.parse(response.choices[0].message.content || "{}");
          const { insertRoadmapSubsectionSchema: insertRoadmapSubsectionSchema2 } = await Promise.resolve().then(() => (init_schema(), schema_exports));
          const validatedSubsections = z2.array(insertRoadmapSubsectionSchema2).parse(atomizedResult.subsections || []);
          return validatedSubsections;
        } catch (error) {
          console.error("Task atomization failed:", error);
          return subsections;
        }
      }
      sanitizeJSON(rawJSON) {
        try {
          let sanitized = rawJSON.trim();
          if (sanitized.startsWith("```json")) {
            sanitized = sanitized.replace(/^```json\s*/i, "").replace(/```\s*$/, "");
          } else if (sanitized.startsWith("```")) {
            sanitized = sanitized.replace(/^```\s*/, "").replace(/```\s*$/, "");
          }
          sanitized = sanitized.replace(/,(\s*[}\]])/g, "$1");
          sanitized = sanitized.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
          sanitized = sanitized.replace(/:\s*'([^']*)'/g, ': "$1"');
          return sanitized.trim();
        } catch (error) {
          console.error("JSON sanitization error:", error);
          return rawJSON;
        }
      }
      async analyzeJobMatch(resumeText, jobData) {
        try {
          const prompt = `You are an expert career counselor and hiring manager analyzing how well a candidate's resume matches a specific job posting. Provide comprehensive, data-driven insights that quantify why the candidate is or isn't competitive for this role.

CANDIDATE RESUME:
${resumeText}

JOB POSTING:
Title: ${jobData.title}
Company: ${jobData.company?.display_name || "Not specified"}
Description: ${jobData.description || "No description provided"}
Location: ${jobData.location?.display_name || "Not specified"}
Employment Type: ${jobData.contract_type || "Not specified"}

ANALYSIS REQUIREMENTS:
- Be highly specific and reference exact details from both resume and job posting
- Quantify competitiveness with detailed reasoning
- Provide actionable, prioritized recommendations
- Focus on what matters most to hiring managers for this specific role

Respond with a comprehensive JSON object:
{
  "overallMatch": <number 1-100 representing overall competitiveness>,
  "strengths": [
    "<specific strength 1 with quantified impact>",
    "<specific strength 2 with evidence from resume>",
    "<specific strength 3 tied directly to job requirements>"
  ],
  "concerns": [
    "<critical gap 1 with impact assessment>",
    "<moderate concern 2 with context>",
    "<minor issue 3 if applicable>"
  ],
  "skillsAnalysis": {
    "strongMatches": [<exact skills from resume that directly match job requirements>],
    "partialMatches": [<transferable skills with explanation of relevance>],
    "missingSkills": [<critical skills from job posting absent in resume>],
    "explanation": "<200+ word detailed analysis of skills alignment, including: skill match percentage, most important gaps, transferability assessment, and competitive positioning relative to typical candidates>"
  },
  "experienceAnalysis": {
    "relevantExperience": [<specific roles/projects from resume most relevant to this job>],
    "experienceGaps": [<experience requirements from job that candidate lacks>],
    "explanation": "<200+ word detailed analysis including: years of relevant experience vs. requirements, industry alignment, responsibility level match, achievement relevance, and experience quality assessment>"
  },
  "recommendations": [
    "<high-impact recommendation 1 for immediate application improvement>",
    "<medium-impact recommendation 2 for cover letter/interview prep>",
    "<strategic recommendation 3 for long-term positioning>"
  ],
  "nextSteps": [
    "<immediate action 1 (within 24 hours)>",
    "<short-term action 2 (within 1 week)>",
    "<medium-term action 3 (within 1 month)>"
  ]
}

SCORING CRITERIA for overallMatch:
90-100: Exceptional fit - top 10% of candidates, likely to get interviews
80-89: Strong fit - competitive candidate with good interview chances  
70-79: Good fit - meets most requirements, moderate competition
60-69: Fair fit - meets basic requirements, needs strengthening
50-59: Weak fit - significant gaps, requires major improvements
Below 50: Poor fit - not competitive for this specific role

Focus on being brutally honest about competitiveness while providing constructive, actionable guidance.`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are an expert hiring manager. Respond with valid JSON exactly matching the required schema. No additional prose or markdown." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500,
            temperature: 0.3,
            top_p: 0.9
          });
          const rawContent = response.choices[0].message.content || "{}";
          let rawAnalysis;
          try {
            const sanitizedContent = this.sanitizeJSON(rawContent);
            rawAnalysis = JSON.parse(sanitizedContent);
          } catch (parseError) {
            console.error("\u274C JSON parsing failed for job match analysis");
            console.error("Parse error:", parseError);
            console.error("Raw content (first 500 chars):", rawContent.substring(0, 500));
            console.error("Falling back to default analysis due to malformed JSON from AI");
            return this.getFallbackAnalysis();
          }
          try {
            const analysisWithBand = {
              ...rawAnalysis,
              competitivenessBand: getCompetitivenessBand(rawAnalysis.overallMatch || 75)
            };
            const validatedAnalysis = jobMatchAnalysisSchema.parse(analysisWithBand);
            return validatedAnalysis;
          } catch (validationError) {
            console.error("\u274C AI analysis validation failed:", validationError);
            console.error("Raw analysis structure:", JSON.stringify(rawAnalysis, null, 2).substring(0, 500));
            return this.getFallbackAnalysis();
          }
        } catch (error) {
          console.error("\u274C AI job match analysis failed:", error);
          return this.getFallbackAnalysis();
        }
      }
      getFallbackAnalysis() {
        const fallbackScore = 75;
        return {
          overallMatch: fallbackScore,
          competitivenessBand: getCompetitivenessBand(fallbackScore),
          strengths: [
            "Professional background shows relevant experience for the role",
            "Educational qualifications align with industry standards",
            "Demonstrated ability to learn and adapt to new environments"
          ],
          concerns: [
            "Some specific technical skills mentioned in the job posting may need validation",
            "Industry-specific experience depth requires assessment",
            "Certain advanced qualifications may need development"
          ],
          skillsAnalysis: {
            strongMatches: ["Core competencies from your professional background"],
            partialMatches: ["Transferable skills that can be applied to this role"],
            missingSkills: ["Role-specific technical skills that may require development"],
            explanation: "AI analysis is temporarily unavailable, but based on general patterns, your background likely includes transferable skills relevant to this position. A detailed review of specific technical requirements would provide more precise matching insights. Consider highlighting your most relevant experiences and any recent training or certifications that align with the job requirements."
          },
          experienceAnalysis: {
            relevantExperience: ["Professional roles and projects from your background"],
            experienceGaps: ["Specialized experience areas that may need strengthening"],
            explanation: "While detailed AI analysis is unavailable, your professional history likely contains valuable experience relevant to this role. Focus on quantifying your achievements and demonstrating measurable impact in previous positions. Consider how your experience directly addresses the core responsibilities mentioned in the job posting."
          },
          recommendations: [
            "Thoroughly review the job description and tailor your application to highlight the most relevant experiences",
            "Research the company and role to understand their specific needs and priorities",
            "Prepare specific examples that demonstrate your impact and problem-solving abilities"
          ],
          nextSteps: [
            "Within 24 hours: Customize your resume to emphasize the most relevant skills and experiences",
            "Within 1 week: Research the company culture and recent developments to personalize your cover letter",
            "Within 1 month: Consider additional training or certification in key areas identified in the job posting"
          ]
        };
      }
      async analyzeResume(userId, resumeText, targetRole, targetIndustry, targetCompanies) {
        try {
          const analysisHash = generateAnalysisHash(resumeText, targetRole, targetIndustry, targetCompanies);
          const cachedResume = await storage.getResumeByHash(userId, analysisHash);
          if (cachedResume && cachedResume.rmsScore !== null && cachedResume.overallInsights && cachedResume.sectionAnalysis) {
            console.log("\u2705 Returning cached resume analysis");
            return {
              rmsScore: cachedResume.rmsScore,
              skillsScore: cachedResume.skillsScore || 0,
              experienceScore: cachedResume.experienceScore || 0,
              keywordsScore: cachedResume.keywordsScore || 0,
              educationScore: cachedResume.educationScore || 0,
              certificationsScore: cachedResume.certificationsScore || 0,
              overallInsights: cachedResume.overallInsights,
              sectionAnalysis: cachedResume.sectionAnalysis,
              gaps: cachedResume.gaps || [],
              analysisHash
            };
          }
          console.log("\u{1F504} Generating new resume analysis (no cache found)");
          const prompt = `You are a senior career coach and hiring expert. Perform a DEEP, THOROUGH, COMPREHENSIVE resume analysis. Be brutally honest, highly specific, and provide actionable resources for every gap found.

ANALYSIS REQUIREMENTS:
1. Base ALL analysis on the TARGET ROLE specified. Be role-specific \u2014 no generic advice.
2. MINIMUM 6 SPECIFIC STRENGTHS and MINIMUM 6 SPECIFIC GAPS per section.
3. Every gap MUST include 1-2 resource links to close it.
4. BE EXTREMELY SPECIFIC \u2014 reference exact tools, years of experience, technologies, certifications, job titles, metrics.
5. Write a comprehensive career fit assessment (3-4 sentences) comparing the candidate to an ideal candidate for this role.
6. Estimate how long until the candidate would be competitive if they act on all recommendations.
7. KEYWORD SECTION: List specific keywords present in the resume AND specific keywords that are missing but critical for ATS/hiring.

Resume Text:
${resumeText}

Target Role: ${targetRole || "General Career Development"}
Target Industry: ${targetIndustry || "Not specified"}
Target Companies: ${targetCompanies || "Not specified"}

Return this exact JSON structure (no markdown, no extra text):
{
  "rmsScore": <integer 1-100>,
  "skillsScore": <integer 1-100>,
  "experienceScore": <integer 1-100>,
  "keywordsScore": <integer 1-100>,
  "educationScore": <integer 1-100>,
  "certificationsScore": <integer 1-100>,
  "overallInsights": {
    "scoreExplanation": "<3-4 sentences explaining the score holistically \u2014 what it means, why, and the biggest factors>",
    "strengthsOverview": "<2-3 sentences summarizing top competitive advantages this candidate has for the target role>",
    "weaknessesOverview": "<2-3 sentences summarizing the most critical gaps preventing success in the target role>",
    "careerFitAssessment": "<3-4 sentences comparing this candidate to an ideal candidate for the role \u2014 be specific about alignment and misalignment>",
    "competitivePositioning": "<2 sentences on where this candidate stands vs. typical applicants for this role>",
    "timeToReady": "<Estimated time to become competitive if all gaps are addressed, e.g., '3-6 months with focused effort'>",
    "keyRecommendations": [
      "<Top priority recommendation #1 \u2014 specific and actionable>",
      "<Top priority recommendation #2>",
      "<Top priority recommendation #3>",
      "<Top priority recommendation #4>"
    ]
  },
  "sectionAnalysis": {
    "skills": {
      "score": <integer 1-100>,
      "explanation": "<3-4 sentence detailed analysis of how the candidate's skills stack up against what the target role actually requires. Be specific about skill level, gaps, and relevance.>",
      "strengths": [
        "<Specific strength 1 \u2014 name exact technology/skill and evidence from resume>",
        "<Specific strength 2>",
        "<Specific strength 3>",
        "<Specific strength 4>",
        "<Specific strength 5>",
        "<Specific strength 6>"
      ],
      "gaps": [
        "<Specific gap 1 \u2014 name exactly what's missing and why it matters for the target role>",
        "<Specific gap 2>",
        "<Specific gap 3>",
        "<Specific gap 4>",
        "<Specific gap 5>",
        "<Specific gap 6>"
      ],
      "improvements": [
        "<Specific, actionable improvement step 1>",
        "<Specific improvement step 2>",
        "<Specific improvement step 3>"
      ],
      "resources": [
        { "title": "<Course/resource to close the biggest skills gap>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid/Subscription>" },
        { "title": "<Second resource for a different skills gap>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid/Subscription>" }
      ]
    },
    "experience": {
      "score": <integer 1-100>,
      "explanation": "<3-4 sentence detailed analysis of how the candidate's work history, depth, and relevance compares to requirements for the target role.>",
      "strengths": [
        "<Specific experience strength 1 \u2014 reference actual role/company/achievement from resume>",
        "<Specific experience strength 2>",
        "<Specific experience strength 3>",
        "<Specific experience strength 4>",
        "<Specific experience strength 5>",
        "<Specific experience strength 6>"
      ],
      "gaps": [
        "<Specific experience gap 1 \u2014 what type of experience is missing and why it matters>",
        "<Specific experience gap 2>",
        "<Specific experience gap 3>",
        "<Specific experience gap 4>",
        "<Specific experience gap 5>",
        "<Specific experience gap 6>"
      ],
      "improvements": [
        "<How to gain/demonstrate this experience>",
        "<How to reframe or quantify existing experience better>",
        "<Specific project or portfolio idea to bridge the gap>"
      ],
      "resources": [
        { "title": "<Resource to build relevant experience or showcase it>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" },
        { "title": "<Portfolio/project resource>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free>" }
      ]
    },
    "keywords": {
      "score": <integer 1-100>,
      "explanation": "<3-4 sentence analysis of ATS keyword optimization \u2014 how well the resume uses industry-relevant language, keyword density, and section-specific terminology.>",
      "presentKeywords": ["<keyword found in resume 1>", "<keyword 2>", "<keyword 3>", "<keyword 4>", "<keyword 5>", "<keyword 6>", "<keyword 7>", "<keyword 8>"],
      "missingKeywords": ["<critical missing keyword 1>", "<missing keyword 2>", "<missing keyword 3>", "<missing keyword 4>", "<missing keyword 5>", "<missing keyword 6>", "<missing keyword 7>", "<missing keyword 8>"],
      "strengths": [
        "<Keyword strength 1 \u2014 which keywords are used effectively and where>",
        "<Keyword strength 2>",
        "<Keyword strength 3>",
        "<Keyword strength 4>",
        "<Keyword strength 5>",
        "<Keyword strength 6>"
      ],
      "gaps": [
        "<Missing keyword gap 1 \u2014 which keywords are absent and how that hurts ATS/reader>",
        "<Gap 2>",
        "<Gap 3>",
        "<Gap 4>",
        "<Gap 5>",
        "<Gap 6>"
      ],
      "improvements": [
        "<Where to add which keyword>",
        "<How to rephrase a bullet to include missing terms>",
        "<ATS optimization tip specific to the target role>"
      ],
      "resources": [
        { "title": "Jobscan - ATS Keyword Optimizer", "provider": "Jobscan", "url": "https://www.jobscan.co/", "cost": "Free trial" },
        { "title": "LinkedIn Learning - Resume Writing", "provider": "LinkedIn", "url": "https://www.linkedin.com/learning/", "cost": "Subscription" }
      ]
    },
    "education": {
      "score": <integer 1-100>,
      "explanation": "<3-4 sentence analysis of how the candidate's educational background aligns with typical requirements and expectations for the target role and industry.>",
      "strengths": [
        "<Education strength 1 \u2014 specific degree, institution, or relevant coursework>",
        "<Strength 2>",
        "<Strength 3>",
        "<Strength 4>",
        "<Strength 5>",
        "<Strength 6>"
      ],
      "gaps": [
        "<Education gap 1 \u2014 what degree, certification, or coursework is typically expected but missing>",
        "<Gap 2>",
        "<Gap 3>",
        "<Gap 4>",
        "<Gap 5>",
        "<Gap 6>"
      ],
      "improvements": [
        "<Specific course or certification to pursue>",
        "<Online program that would strengthen this section>",
        "<How to frame existing education better>"
      ],
      "resources": [
        { "title": "<Most relevant online course or degree program for this role>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" },
        { "title": "<Second recommended educational resource>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" }
      ]
    },
    "certifications": {
      "score": <integer 1-100>,
      "explanation": "<2-3 sentence analysis of certifications held vs. certifications typically expected or valued for the target role.>",
      "strengths": [
        "<Certification strength 1 \u2014 specific cert and its relevance>",
        "<Strength 2>",
        "<Strength 3>"
      ],
      "gaps": [
        "<Missing certification 1 \u2014 name the cert and why it matters for the role>",
        "<Gap 2>",
        "<Gap 3>",
        "<Gap 4>"
      ],
      "improvements": [
        "<Specific certification to pursue with timeline>",
        "<How to prepare for the cert exam>"
      ],
      "resources": [
        { "title": "<Most important certification to get for this role>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Exam cost>" },
        { "title": "<Prep course for that certification>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" }
      ]
    }
  },
  "gaps": [
    {
      "category": "<Specific gap category name \u2014 e.g., 'Cloud Infrastructure Experience', 'Data Visualization Skills'>",
      "priority": "high",
      "impact": <integer 5-20>,
      "rationale": "<2-3 sentences explaining exactly why this gap exists, why it matters for the target role, and what a competitive candidate would have instead.>",
      "resources": [
        { "title": "<Primary resource to close this gap>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" },
        { "title": "<Secondary resource or alternative path>", "provider": "<Provider>", "url": "<verified URL>", "cost": "<Free/Paid>" }
      ]
    }
  ]
}

NOTES ON SCORING:
- 85-100: Exceptional \u2014 top-tier candidate, highly competitive
- 70-84: Strong \u2014 solid candidate with minor gaps
- 55-69: Moderate \u2014 meets some requirements, meaningful gaps
- 40-54: Weak \u2014 significant gaps requiring focused effort
- Below 40: Major gap \u2014 career transition or significant upskilling needed
- Be honest and realistic \u2014 inflated scores don't help the user.

VERIFIED RESOURCE URLS (use ONLY these or general platform homepages):
- Coursera Python: https://www.coursera.org/specializations/python
- Coursera Data Analytics: https://www.coursera.org/professional-certificates/google-data-analytics
- Coursera Machine Learning: https://www.coursera.org/learn/machine-learning
- Coursera Project Management: https://www.coursera.org/professional-certificates/google-project-management
- Coursera Browse: https://www.coursera.org/browse
- Udemy Python: https://www.udemy.com/course/complete-python-bootcamp/
- Udemy JavaScript: https://www.udemy.com/course/the-complete-javascript-course/
- Udemy General: https://www.udemy.com/
- freeCodeCamp: https://www.freecodecamp.org/
- Kaggle Learn: https://www.kaggle.com/learn
- AWS Training: https://aws.amazon.com/training/digital/
- Azure Training: https://learn.microsoft.com/en-us/training/
- Google Cloud: https://cloud.google.com/training
- LinkedIn Learning: https://www.linkedin.com/learning/
- edX: https://www.edx.org/
- Khan Academy: https://www.khanacademy.org/
- PMI Training: https://www.pmi.org/learning/training-development
- Codecademy: https://www.codecademy.com/
- Jobscan ATS: https://www.jobscan.co/
- LeetCode: https://leetcode.com/
- HackerRank: https://www.hackerrank.com/
- Glassdoor Interview Prep: https://www.glassdoor.com/Interview/index.htm
- Udacity: https://www.udacity.com/
- Pluralsight: https://www.pluralsight.com/
- MIT OpenCourseWare: https://ocw.mit.edu/
- Google Digital Garage: https://learndigital.withgoogle.com/digitalgarage
- HubSpot Academy: https://academy.hubspot.com/
- Salesforce Trailhead: https://trailhead.salesforce.com/
- DataCamp: https://www.datacamp.com/

NEVER invent URLs. If unsure, use https://www.coursera.org/browse or https://www.linkedin.com/learning/

Provide 5-7 items in the "gaps" array, covering the most impactful deficiencies.`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are an expert career counselor specializing in gap analysis. Your job is to identify specific gaps between a candidate's current resume and their target role requirements. Be honest about missing skills and experience. Provide actionable recommendations with real resources."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 6e3,
            temperature: 0.3
          });
          const analysis = JSON.parse(response.choices[0].message.content || "{}");
          return { ...analysis, analysisHash };
        } catch (error) {
          console.error("Resume analysis error:", error);
          throw new Error("Failed to analyze resume");
        }
      }
      async generateCareerRoadmap(phase, userProfile, resumeAnalysis) {
        console.log(`Generating AI-powered career roadmap for phase: ${phase}`);
        try {
          const topSkillGaps = resumeAnalysis?.gaps?.slice(0, 3).map((g) => g.category).join(", ") || "None identified";
          const specificStrengths = resumeAnalysis?.sectionAnalysis?.skills?.strengths?.slice(0, 3).join("; ") || "Professional skills";
          const phaseInstructions = {
            "30_days": `
DIFFICULTY LEVEL: EASY - Quick Wins & Immediate Actions
Create 4-6 HIGHLY SPECIFIC, ACTIONABLE tasks that can be completed in 1-2 hours each. NO generic advice.

REQUIRED ACTION TYPES (choose from these):
\u2705 Resume Optimization:
   - "Update resume to highlight [SPECIFIC SKILL from their resume] for [TARGET COMPANY] [TARGET ROLE] positions"
   - "Add quantified metrics to [SPECIFIC EXPERIENCE] section (e.g., 'increased efficiency by X%')"
   
\u2705 LinkedIn Quick Wins:
   - "Update LinkedIn headline to '[TARGET ROLE] specializing in [THEIR TOP SKILL]'"
   - "Write a LinkedIn post about [SPECIFIC PROJECT/EXPERIENCE from resume] with #[INDUSTRY] hashtags"

\u2705 Local/School Networking (if location/school provided):
   - "Reach out to 3 [SCHOOL] alumni working at [TARGET COMPANY] via LinkedIn"
   - "Attend [LOCATION]-based [INDUSTRY] meetup this week (search Eventbrite/Meetup.com)"

\u2705 Immediate Job Applications:
   - "Apply to 5 [TARGET ROLE] positions at [TARGET COMPANIES] this week"
   - "Set up job alerts for '[TARGET ROLE]' in [LOCATION] on LinkedIn, Indeed, Glassdoor"

\u2705 Fast Skill Development:
   - "Complete [SPECIFIC SKILL GAP] tutorial on YouTube/FreeCodeCamp (2-3 hours max)"
   - "Practice [SKILL] for 30 minutes daily using [FREE RESOURCE]"

PERSONALIZATION RULES:
- Reference their ACTUAL location for networking events
- Name SPECIFIC companies from their target list
- Address their TOP 1-2 skill gaps only (not all gaps)
- Leverage their school alumni network if school is provided
- Use their existing strengths to get quick wins
`,
            "3_months": `
DIFFICULTY LEVEL: MEDIUM - Skill Building & Consistent Systems
Create 4-6 MEDIUM-EFFORT tasks requiring weekly commitment. Build on 1-month foundation.

REQUIRED ACTION TYPES (choose from these):
\u2705 Structured Skill Development:
   - "Complete [SPECIFIC CERTIFICATION] for [SKILL GAP] on Coursera/Udemy (8-12 weeks, 3-5 hours/week)"
   - "Build a [SPECIFIC PROJECT] using [TECHNOLOGY] to demonstrate [SKILL GAP] mastery"

\u2705 Portfolio Development:
   - "Create a GitHub portfolio showcasing [SKILL] project solving [INDUSTRY]-specific problem"
   - "Write 2 technical blog posts about [THEIR STRENGTH] on Medium/Dev.to"

\u2705 Strategic Networking:
   - "Conduct 2 informational interviews per week with [TARGET ROLE] professionals at [TARGET COMPANIES]"
   - "Join [INDUSTRY] Slack/Discord community and actively contribute 3x/week"
   - "Attend [LOCATION] [INDUSTRY] conferences or workshops (if available)"

\u2705 Application System:
   - "Apply to 10 jobs per week, tracking applications in spreadsheet with follow-up dates"
   - "Customize cover letter template specifically for [TOP 3 TARGET COMPANIES]"

\u2705 Interview Preparation:
   - "Practice [TARGET ROLE] interview questions using Pramp/Interviewing.io (2x/week)"
   - "Record and review 3 mock interviews focusing on [SKILL GAP] questions"

PERSONALIZATION RULES:
- Address 2-3 of their key skill gaps with specific certifications/courses
- Reference location-based events, meetups, or conferences
- Suggest projects relevant to their target industry
- Build on strengths identified in resume analysis
- Name specific tools/technologies needed for target role
`,
            "6_months": `
DIFFICULTY LEVEL: ADVANCED - High-Impact Career Positioning
Create 4-6 AMBITIOUS, CAREER-DEFINING goals. These should be transformative, not incremental.

REQUIRED ACTION TYPES (choose from these):
\u2705 Advanced Credentials:
   - "Complete [ADVANCED BOOTCAMP/CERTIFICATION] in [MAJOR SKILL GAP] (3-6 months intensive)"
   - "Earn [INDUSTRY-SPECIFIC CERTIFICATION] required by [TARGET COMPANIES]"

\u2705 Leadership & Thought Leadership:
   - "Lead an open-source project in [TECHNOLOGY] with 50+ GitHub stars"
   - "Speak at [LOCATION] tech meetup or [INDUSTRY] conference about [EXPERTISE AREA]"
   - "Publish comprehensive guide/tutorial on [SKILL] reaching 1000+ readers"

\u2705 Major Portfolio Achievement:
   - "Build and launch a full-scale [PROJECT TYPE] solving [INDUSTRY PROBLEM]"
   - "Contribute to 3+ major open-source projects in [TECHNOLOGY ECOSYSTEM]"

\u2705 Strategic Career Positioning:
   - "Build mentorship relationship with senior [TARGET ROLE] at [TARGET COMPANY]"
   - "Develop specialized expertise in [EMERGING SKILL] to differentiate from competitors"
   - "Create a personal brand as [TARGET ROLE] expert in [NICHE AREA]"

\u2705 Target Company Strategy:
   - "Establish contact with hiring managers at top 3 target companies: [LIST COMPANIES]"
   - "Attend [TARGET COMPANY] recruiting events, open houses, or tech talks"
   - "Build relationships with 5+ employees at [TOP TARGET COMPANY] through informational interviews"

PERSONALIZATION RULES:
- Focus on closing their TOP 3 skill gaps completely
- Suggest industry-recognized certifications for their target role
- Reference specific technologies/tools used at target companies
- Leverage their location for major conferences/events
- Build thought leadership in their specific niche
- Create differentiation based on their unique strengths
`
          };
          const prompt = `You are an expert career coach creating a HIGHLY PERSONALIZED ${phase.replace("_", " ")} career roadmap.

USER PROFILE:
- Target Role: ${userProfile?.targetRole || "Career advancement"}
- Target Industries: ${userProfile?.industries?.join(", ") || "General"}
- Location: ${userProfile?.location || "Not specified"}
- Education: ${userProfile?.major || "Not specified"} at ${userProfile?.school || "Not specified"}
- Graduation Year: ${userProfile?.gradYear || "Not specified"}
- Target Companies: ${userProfile?.targetCompanies?.join(", ") || "Various"}

${resumeAnalysis ? `RESUME ANALYSIS:
- Overall Resume Score: ${resumeAnalysis.rmsScore}/100
- Top 3 Skill Gaps to Address: ${topSkillGaps}
- Key Strengths to Leverage: ${specificStrengths}
- Skills Analysis: ${resumeAnalysis.sectionAnalysis?.skills?.explanation || "Not available"}
- Experience Level: ${resumeAnalysis.sectionAnalysis?.experience?.explanation || "Not available"}
` : ""}

${phase.replace("_", " ").toUpperCase()} PHASE REQUIREMENTS:
${phaseInstructions[phase]}

CRITICAL PERSONALIZATION REQUIREMENTS:
1. **Location-Specific**: If location is provided, include local networking events, meetups, or job opportunities
2. **School-Specific**: If school is provided, mention alumni networks, career services, or campus recruiting
3. **Company-Specific**: Reference their ACTUAL target companies by name in action items
4. **Skill-Specific**: Address their TOP skill gaps identified in resume analysis
5. **Role-Specific**: Every action must clearly advance them toward their specific target role
6. **Progressive Difficulty**: Ensure actions match the difficulty level for this phase
7. **Measurable Outcomes**: Include specific metrics, timelines, or deliverables

AVOID GENERIC ACTIONS LIKE:
\u274C "Update your resume" \u2192 \u2705 "Update resume to highlight Python automation projects for Google SWE roles"
\u274C "Network with people" \u2192 \u2705 "Connect with 5 Microsoft alumni from Stanford on LinkedIn this week"
\u274C "Learn a new skill" \u2192 \u2705 "Complete AWS Solutions Architect certification to close cloud infrastructure gap"

Return JSON in this structure:
{
  "title": "Specific, personalized title mentioning their target role or key goal",
  "description": "Brief description explaining what this plan will accomplish for THEIR specific situation",
  "actions": [
    {
      "title": "Ultra-specific action with company/skill/location names",
      "description": "Step-by-step instructions with concrete details, timelines, and resources",
      "rationale": "Why THIS specific action matters for THEIR career goals and gap closure",
      "icon": "\u{1F4C4}",
      "completed": false
    }
  ]
}

Generate 4-6 actions. Each action MUST be unique to this user and this phase.`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: "You are an expert career coach who creates personalized, actionable career development plans. Always respond with valid JSON."
              },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            max_completion_tokens: 2e3,
            temperature: 0.6
          });
          const rawContent = response.choices[0].message.content;
          if (!rawContent || rawContent.trim() === "") {
            throw new Error("Empty response from OpenAI");
          }
          const aiRoadmap = JSON.parse(rawContent);
          const validateActions = (actions, phase2) => {
            return actions.filter((action) => {
              const text2 = (action.title + " " + action.description).toLowerCase();
              if (phase2 === "30_days") {
                if (text2.includes("certification") || text2.includes("bootcamp") || text2.includes("long-term")) {
                  return false;
                }
              }
              if (phase2 === "3_months") {
                if (text2.includes("multi-year") || text2.includes("advanced bootcamp")) {
                  return false;
                }
              }
              if (phase2 === "6_months") {
                if (text2.includes("resume") || text2.includes("linkedin")) {
                  return false;
                }
              }
              return true;
            });
          };
          const validatedActions = validateActions(aiRoadmap.actions || [], phase);
          const actionsWithIds = validatedActions.map((action) => ({
            ...action,
            id: randomUUID(),
            completed: false
          }));
          return {
            title: aiRoadmap.title || `${phase.replace("_", " ")} Career Plan`,
            description: aiRoadmap.description || `Personalized career development plan`,
            actions: actionsWithIds,
            subsections: []
          };
        } catch (error) {
          console.error("AI roadmap generation failed, using fallback:", error);
          const phaseName = phase.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
          const targetRole = userProfile?.targetRole || "your target role";
          return {
            title: `${phaseName} Plan for ${targetRole}`,
            description: `A structured career plan tailored for advancing toward ${targetRole}`,
            actions: [
              {
                id: randomUUID(),
                title: `Update Resume for ${targetRole} Positions`,
                description: "Tailor your resume to highlight relevant experience and skills for your target role",
                rationale: "A targeted resume significantly increases interview opportunities",
                icon: "\u{1F4C4}",
                completed: false
              },
              {
                id: randomUUID(),
                title: "Optimize LinkedIn Profile",
                description: "Update headline, summary, and skills to attract recruiters in your target industry",
                rationale: "LinkedIn optimization increases visibility by 40%",
                icon: "\u{1F4BC}",
                completed: false
              },
              {
                id: randomUUID(),
                title: `Research ${userProfile?.industries?.[0] || "Target"} Companies`,
                description: "Identify and research 15-20 companies that align with your career goals",
                rationale: "Targeted applications have 3x higher success rates",
                icon: "\u{1F50D}",
                completed: false
              }
            ],
            subsections: []
          };
        }
      }
      async tailorResume(baseResumeText, jobDescription, targetKeywords, userProfile) {
        try {
          const prompt = `CRITICAL ANTI-FABRICATION RULES - NEVER VIOLATE:
1. DO NOT fabricate, invent, or add ANY information not present in the original resume
2. DO NOT add skills, experiences, projects, or achievements the candidate doesn't have
3. DO NOT remove any existing information from the resume
4. ONLY rephrase, reword, and reorganize EXISTING content to better match the job description
5. You may highlight relevant experiences more prominently, but cannot create new ones
6. Keyword optimization means using the EXISTING content with job-relevant terminology, not inventing qualifications

Your ONLY job is to reword and reorganize the candidate's REAL experiences to be more relevant to this specific job posting.

FORMATTING REQUIREMENTS:
- Use proper line breaks between sections (use \\n)
- Put section headers in ALL CAPS (e.g., PROFESSIONAL SUMMARY, EXPERIENCE, EDUCATION, SKILLS)
- Each section header should be on its own line
- Add a blank line before each section header
- Format contact information clearly at the top
- Use bullet points or clear line breaks for list items

Resume: ${baseResumeText}
Job: ${jobDescription}
Keywords: ${targetKeywords.join(", ")}

Provide JSON:
{
  "tailoredContent": "Updated resume text with ONLY reworded existing content. Use \\n for line breaks. Format with clear sections like:\\n\\nName\\nContact Info\\n\\nPROFESSIONAL SUMMARY\\nYour summary here\\n\\nEXPERIENCE\\nJob 1\\nDetails\\n\\nJob 2\\nDetails\\n\\nEDUCATION\\nDegree details\\n\\nSKILLS\\nSkill list",
  "jobSpecificScore": 85,
  "keywordsCovered": ["keyword1", "keyword2"],
  "remainingGaps": [{"skill": "Python", "importance": "high", "resources": [{"title": "Course Name", "provider": "Provider Name", "url": "", "cost": "Free"}]}],
  "diffJson": [{"type": "modify", "section": "skills", "original": "old", "new": "new", "reason": "keyword optimization"}]
}

CRITICAL REQUIREMENT: For any resources in remainingGaps, use ONLY these REAL, VERIFIED URLs:
- Python: https://www.coursera.org/specializations/python
- JavaScript: https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/
- Data Science: https://www.coursera.org/professional-certificates/google-data-analytics
- AWS: https://aws.amazon.com/training/digital/
- Project Management: https://www.coursera.org/professional-certificates/google-project-management
- General Skills: https://www.linkedin.com/learning/
- Free Resources: https://www.khanacademy.org/
If no specific match, use https://www.coursera.org/browse or https://www.edx.org/`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a professional resume writer." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          });
          return JSON.parse(response.choices[0].message.content || "{}");
        } catch (error) {
          console.error("Resume tailoring error:", error);
          throw new Error("Failed to tailor resume");
        }
      }
      async generateCoverLetter(resumeText, jobDescription, company, role) {
        try {
          const prompt = `Write a professional cover letter for this application:
      
Resume: ${resumeText}
Job: ${jobDescription}
Company: ${company}
Role: ${role}

Create a compelling 3-4 paragraph cover letter.`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a professional career coach who writes compelling cover letters." },
              { role: "user", content: prompt }
            ]
          });
          return response.choices[0].message.content || "";
        } catch (error) {
          console.error("Cover letter generation error:", error);
          throw new Error("Failed to generate cover letter");
        }
      }
      async optimizeLinkedInProfile(currentProfile, targetRole, targetIndustries) {
        try {
          const prompt = `Optimize this LinkedIn profile for ${targetRole} in ${targetIndustries.join(", ")}:
      
Current: ${currentProfile}

Provide JSON:
{
  "headline": "Optimized headline",
  "about": "Optimized about section",
  "skills": ["skill1", "skill2"],
  "improvements": ["suggestion1", "suggestion2"]
}`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a LinkedIn optimization expert." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          });
          return JSON.parse(response.choices[0].message.content || "{}");
        } catch (error) {
          console.error("LinkedIn optimization error:", error);
          throw new Error("Failed to optimize LinkedIn profile");
        }
      }
      async generateCareerInsights({ resumeText, targetRole, experience }) {
        try {
          const prompt = `Provide career insights for this professional:
      
Resume: ${resumeText}
Target Role: ${targetRole}
Experience: ${experience}

Provide JSON with career recommendations and insights.`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are an expert career coach." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          });
          return JSON.parse(response.choices[0].message.content || "{}");
        } catch (error) {
          console.error("Career insights error:", error);
          throw new Error("Failed to generate career insights");
        }
      }
      async generateSalaryNegotiationStrategy({ currentSalary, targetSalary, jobRole, location, yearsExperience, resumeText }) {
        try {
          const prompt = `Analyze this person's resume and create personalized salary negotiation advice:

RESUME: ${resumeText || "Resume not provided"}

SALARY DETAILS:
- Current: ${currentSalary ? `$${currentSalary.toLocaleString()}` : "Not disclosed"}
- Target: $${targetSalary.toLocaleString()}  
- Role: ${jobRole}
- Location: ${location}
- Experience: ${yearsExperience} years

Create a personalized salary negotiation strategy based on their specific skills, achievements, and experience shown in their resume. Begin with: "Based on your experience as a ${jobRole}, here's my personalized advice for negotiating your salary increase to $${targetSalary.toLocaleString()}..."

Write as natural conversation. Reference specific skills or achievements from their resume. Include market research for their role in ${location}. Give concrete talking points based on their actual background.`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              {
                role: "system",
                content: `You are a friendly career coach having a conversation. Write your entire response as natural flowing text, like you're talking to someone face-to-face. Use "you" and "your" throughout. Write in complete sentences and paragraphs only. Never use JSON, never use structured data, never use brackets or quotes. Start every response with "Based on your experience as a ${jobRole}, here's my advice for negotiating your salary increase..." and continue with natural conversational advice.`
              },
              { role: "user", content: prompt }
            ],
            max_completion_tokens: 2e3,
            temperature: 0.7,
            top_p: 0.9
          });
          let content = response.choices[0].message.content || "Unable to generate negotiation strategy at this time.";
          if (content.includes("{") || content.includes("[") || content.includes('"') || content.includes('":')) {
            console.log("AI returned structured data, converting to natural language");
            let naturalContent = content;
            if (content.trim().startsWith("{")) {
              try {
                const parsed = JSON.parse(content);
                const values = [];
                const extractAllValues = (obj) => {
                  if (typeof obj === "string" && obj.length > 5) {
                    values.push(obj);
                  } else if (Array.isArray(obj)) {
                    obj.forEach(extractAllValues);
                  } else if (typeof obj === "object" && obj !== null) {
                    Object.values(obj).forEach(extractAllValues);
                  }
                };
                extractAllValues(parsed);
                naturalContent = values.join(" ");
              } catch (e) {
                naturalContent = content.replace(/[{}"\[\],]/g, " ").replace(/[a-z_]+:/gi, " ").replace(/\s+/g, " ");
              }
            }
            naturalContent = naturalContent.replace(/\s+/g, " ").replace(/\.\s*/g, ". ").replace(/([.!?])\s*/g, "$1 ").trim();
            if (!naturalContent.toLowerCase().includes("based on your experience")) {
              naturalContent = `Based on your experience as a ${jobRole}, here's my advice for negotiating your salary increase. ${naturalContent}`;
            }
            content = naturalContent;
          }
          content = content.replace(/^[^a-zA-Z]*/, "").replace(/\s+/g, " ").trim();
          return content;
        } catch (error) {
          console.error("Salary negotiation error:", error);
          throw new Error("Failed to generate salary negotiation strategy");
        }
      }
      async updateResumeFromRoadmap({ resumeText, completedTasks }) {
        try {
          const prompt = `Update this resume based on completed roadmap tasks:
      
Resume: ${resumeText}
Completed Tasks: ${JSON.stringify(completedTasks)}

Provide JSON:
{
  "updatedResumeText": "Updated resume text",
  "changesApplied": ["List of changes"],
  "newSkillsAdded": ["skill1", "skill2"],
  "enhancedSections": ["section1", "section2"]
}`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a professional resume writer." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" }
          });
          const content = response.choices[0].message.content;
          if (!content) throw new Error("No response from OpenAI");
          return JSON.parse(content);
        } catch (error) {
          console.error("Resume update error:", error);
          throw new Error("Failed to update resume from roadmap");
        }
      }
      async generateInterviewQuestions(jobTitle, company, category, count = 10, resumeText) {
        try {
          const resumeSection = resumeText?.trim() ? `

The candidate has provided their resume:
<resume>
${resumeText.trim()}
</resume>

Personalize the questions to this specific resume. Include:
- At least 2 questions that reference a specific role, project, or skill listed on the resume
- At least 1 question that probes a gap or weak area evident from the resume (missing experience, short tenures, skill gaps for a ${jobTitle} role)
- The remaining questions should be role/behavioral questions appropriate for a ${jobTitle} that a candidate with this background would face
An interviewer who has read this resume carefully is conducting the interview.` : "";
          const prompt = `Generate ${count} ${category} interview questions for a ${jobTitle} position at ${company}.${resumeSection}

For each question, provide:
1. The question itself
2. Category: ${category}
3. Difficulty level (beginner/intermediate/advanced)
4. 3-4 answer tips to help the candidate prepare

Categories:
- behavioral: Questions about past experiences, teamwork, leadership, problem-solving
- technical: Role-specific technical questions and coding challenges
- situational: Hypothetical scenarios and problem-solving questions
- company: Company-specific questions about culture, values, and industry knowledge

Format as JSON array:
{
  "questions": [
    {
      "question": "Tell me about a time you had to work with a difficult team member.",
      "category": "${category}",
      "difficulty": "intermediate",
      "tips": [
        "Focus on your actions and problem-solving approach",
        "Show emotional intelligence and professionalism",
        "Highlight the positive outcome or learning",
        "Avoid speaking negatively about others"
      ]
    }
  ]
}

Make questions specific to ${jobTitle} role and ${company} when possible.`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are an expert interview coach and hiring manager." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.7
          });
          const result = JSON.parse(response.choices[0].message.content || '{"questions": []}');
          const questions = (result.questions || []).map((q, index) => ({
            ...q,
            id: `q-${Date.now()}-${index}`
          }));
          return questions;
        } catch (error) {
          console.error("Interview questions generation error:", error);
          throw new Error("Failed to generate interview questions");
        }
      }
      async generatePrepResources(jobTitle, company, skills = []) {
        try {
          const prompt = `Generate relevant preparation resources for a ${jobTitle} interview at ${company}.

Focus on skills: ${skills.join(", ") || "general interview skills"}

CRITICAL REQUIREMENT:
- Only use the verified resource URLs listed below.
- If no exact match exists, link to the platform's main catalog.
- NEVER invent or hallucinate URLs.

VERIFIED RESOURCE URLS:
- Coursera: https://www.coursera.org/
- Udemy: https://www.udemy.com/
- LinkedIn Learning: https://www.linkedin.com/learning/
- YouTube: https://www.youtube.com/
- LeetCode: https://leetcode.com/
- HackerRank: https://www.hackerrank.com/
- Khan Academy: https://www.khanacademy.org/
- Educative: https://www.educative.io/
- AWS Training: https://aws.amazon.com/training/digital/
- Azure Learning: https://learn.microsoft.com/en-us/training/
- Google Cloud Training: https://cloud.google.com/training

Provide 8\u201312 diverse, high-quality resources in this JSON structure:
{
  "resources": [
    {
      "title": "System Design Interview Prep",
      "type": "course",
      "url": "https://www.educative.io/courses/grokking-the-system-design-interview",
      "description": "Comprehensive system design patterns and interview questions",
      "duration": "8 hours",
      "provider": "Educative",
      "rating": 4.5
    }
  ]
}`;
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: "You are a career coach who curates the best learning resources. Always respond with valid JSON only." },
              { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.3
          });
          const result = JSON.parse(response.choices[0].message.content || '{"resources": []}');
          const allowedDomains = [
            "coursera.org",
            "udemy.com",
            "linkedin.com",
            "youtube.com",
            "leetcode.com",
            "hackerrank.com",
            "khanacademy.org",
            "educative.io",
            "aws.amazon.com",
            "cloud.google.com",
            "microsoft.com"
          ];
          const safeResources = (result.resources || []).map((r, index) => {
            const isAllowed = allowedDomains.some((domain) => r.url && r.url.includes(domain));
            return {
              ...r,
              id: `r-${Date.now()}-${index}`,
              url: isAllowed ? r.url : "https://www.coursera.org/"
              // fallback safe URL
            };
          });
          return safeResources;
        } catch (error) {
          console.error("Prep resources generation error:", error);
          throw new Error("Failed to generate preparation resources");
        }
      }
    };
    aiService = new AIService();
  }
});

// server/openai-service.ts
import OpenAI2 from "openai";
var openai2, OpenAIProjectService, openaiProjectService;
var init_openai_service = __esm({
  "server/openai-service.ts"() {
    "use strict";
    openai2 = new OpenAI2({ apiKey: process.env.OPENAI_API_KEY });
    OpenAIProjectService = class {
      // ▼ Flexible category → project type
      getProjectType(category) {
        const normalized = category.toLowerCase().trim();
        const typeMappings = [
          { pattern: /data\s*(science|analysis)|analytics/, type: "data-analysis" },
          { pattern: /web\s*dev|frontend|backend|software|programming|coding/, type: "coding" },
          { pattern: /machine\s*learning|ml|ai|artificial\s*intelligence/, type: "ai-development" },
          { pattern: /nursing|healthcare|medical|patient\s*care|clinical/, type: "clinical-practice" },
          { pattern: /teach|educat|pedagogy|lesson\s*plan|curriculum/, type: "education" },
          { pattern: /business|management|admin|leadership/, type: "business" },
          { pattern: /design|art|creative|ui|ux|graphic/, type: "creative" },
          { pattern: /research|academic|writing|communication/, type: "research" },
          { pattern: /teamwork|collab|presentation|public\s*speaking/, type: "soft-skills" }
        ];
        for (const mapping of typeMappings) {
          if (mapping.pattern.test(normalized)) return mapping.type;
        }
        if (normalized.includes("+") || normalized.includes("and")) {
          const parts = normalized.split(/[+and]/).map((part) => part.trim());
          const types = parts.map((part) => this.getProjectType(part));
          return types.includes("coding") ? "coding" : types[0] || "general";
        }
        if (normalized.length <= 3) return "general";
        if (normalized.endsWith("ing")) return normalized.slice(0, -3);
        return normalized.includes("-") ? normalized : "general-skills";
      }
      // ▼ Robust JSON parsing and normalization with step-by-step instructions
      async generateDetailedProject(request) {
        const prompt = `You are an expert career coach. The user is a ${request.userBackground} who wants to become a ${request.targetRole}. Their resume analysis shows they lack "${request.skillGap}" skills.

Create a step-by-step practice project that will help them build this skill. Each step must include:
- A clear title
- Time estimate
- Description of what to do
- Concrete tasks
- Resources or links to use
- A deliverable to produce

Return JSON only in this schema (do not rename keys):

{
  "title": "string",
  "description": "string", 
  "targetSkill": "string",
  "skillCategory": "string",
  "difficulty": "${request.difficultyLevel}",
  "estimatedHours": number,
  "projectType": "design|development|research|analysis",
  "instructions": {
    "overview": "string",
    "prerequisites": ["string"],
    "detailed_steps": [
      {
        "step": number,
        "title": "string",
        "duration": "string",
        "description": "string",
        "tasks": ["string"],
        "resources": ["string"],
        "deliverable": "string"
      }
    ],
    "success_criteria": ["string"],
    "resources": [
      {
        "title": "string",
        "url": "string",
        "type": "string",
        "description": "string"
      }
    ]
  },
  "deliverables": ["string"],
  "evaluationCriteria": ["string"],
  "exampleArtifacts": ["string"],
  "tags": ["string"]
}`;
        try {
          console.log("Starting OpenAI request for project generation...");
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 45e3);
          const response = await openai2.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are a helpful assistant. Return ONLY valid JSON with no markdown formatting or extra text."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500
          }, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          console.log("OpenAI response received successfully");
          let content = response.choices[0].message.content || "{}";
          console.log("Raw OpenAI response:", content.length > 200 ? `${content.substring(0, 200)}...` : content);
          const jsonStart = content.indexOf("{");
          const jsonEnd = content.lastIndexOf("}");
          if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
            throw new Error("Invalid JSON response - missing boundaries");
          }
          content = content.slice(jsonStart, jsonEnd + 1).replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          if (content.startsWith("json\n")) {
            content = content.substring(5);
          }
          let projectData;
          try {
            projectData = JSON.parse(content);
            if (!projectData.title && projectData.projectTitle) {
              projectData.title = projectData.projectTitle;
            }
            if (!projectData.difficultyLevel && projectData.difficulty) {
              projectData.difficultyLevel = projectData.difficulty;
            }
            if (!projectData.skillCategory && projectData.category) {
              projectData.skillCategory = projectData.category;
            }
            if (!projectData.title || typeof projectData.title !== "string") {
              throw new Error("Missing or invalid title in response");
            }
            if (!projectData.instructions?.detailed_steps) {
              projectData.instructions = {
                overview: projectData.instructions?.overview || `Hands-on project to develop ${request.skillGap} skills.`,
                prerequisites: projectData.instructions?.prerequisites || [],
                detailed_steps: [
                  {
                    step: 1,
                    title: `Research ${request.skillGap}`,
                    duration: "1 hour",
                    description: `Explore ${request.skillGap} requirements for ${request.targetRole}`,
                    tasks: [`Read 2\u20133 articles about ${request.skillGap}`],
                    resources: [],
                    deliverable: `Short notes document`
                  },
                  {
                    step: 2,
                    title: `Practical Application`,
                    duration: "3 hours",
                    description: `Create a small demo applying ${request.skillGap} in context`,
                    tasks: [`Build a small example project`],
                    resources: [],
                    deliverable: `Working demo or prototype`
                  }
                ],
                success_criteria: ["Demonstrates skill application"],
                resources: []
              };
            }
          } catch (parseError) {
            console.error("JSON parse failed:", {
              error: parseError,
              content: content.length > 200 ? `${content.substring(0, 200)}...` : content
            });
            projectData = {
              title: `${request.skillGap} Practice Project`,
              description: `Develop ${request.skillGap} skills through hands-on exercises`,
              targetSkill: request.skillGap,
              difficulty: request.difficultyLevel,
              estimatedHours: 12,
              instructions: {
                overview: `Hands-on project to develop ${request.skillGap} skills.`,
                prerequisites: [],
                detailed_steps: [
                  {
                    step: 1,
                    title: `Research ${request.skillGap}`,
                    duration: "1 hour",
                    description: `Explore ${request.skillGap} requirements for ${request.targetRole}`,
                    tasks: [`Read 2\u20133 articles about ${request.skillGap}`],
                    resources: [],
                    deliverable: `Short notes document`
                  },
                  {
                    step: 2,
                    title: `Practical Application`,
                    duration: "3 hours",
                    description: `Create a small demo applying ${request.skillGap} in context`,
                    tasks: [`Build a small example project`],
                    resources: [],
                    deliverable: `Working demo or prototype`
                  }
                ],
                success_criteria: ["Demonstrates skill application"],
                resources: []
              },
              deliverables: [`Completed ${request.skillGap} project`],
              evaluationCriteria: ["Demonstrates core competencies"],
              tags: [request.skillGap.toLowerCase()]
            };
          }
          return {
            title: projectData.title,
            description: projectData.description,
            targetRole: request.targetRole,
            targetSkill: projectData.targetSkill || request.skillGap,
            skillCategory: projectData.skillCategory || request.skillCategory,
            difficultyLevel: projectData.difficultyLevel || request.difficultyLevel,
            estimatedHours: projectData.estimatedHours || 12,
            projectType: projectData.projectType || this.getProjectType(request.skillCategory),
            instructions: projectData.instructions,
            deliverables: projectData.deliverables || [],
            skillsGained: [],
            relevanceToRole: `Develops ${request.skillGap} skills needed for ${request.targetRole} role`,
            evaluationCriteria: projectData.evaluationCriteria || [],
            exampleArtifacts: projectData.exampleArtifacts || [],
            datasetUrl: null,
            templateUrl: null,
            repositoryUrl: null,
            tutorialUrl: null,
            portfolioTemplate: null,
            tags: projectData.tags || [request.skillGap.toLowerCase()],
            isActive: true
          };
        } catch (error) {
          console.error("Error generating project with OpenAI:", error);
          if (error instanceof Error && error.name === "AbortError") {
            throw new Error("OpenAI request timed out after 45 seconds");
          }
          throw new Error(`Failed to generate AI-powered project: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      async generateMultipleProjects(requests) {
        const projects = await Promise.allSettled(
          requests.map((request) => this.generateDetailedProject(request))
        );
        return projects.filter((result) => result.status === "fulfilled").map((result) => result.value);
      }
      // NEW: Role-based project generation following the exact format from requirements
      async generateProjectsFromRole(request) {
        const projectCount = request.count || 2;
        const prompt = `Generate ${projectCount} comprehensive, portfolio-ready micro-project${projectCount > 1 ? "s" : ""} for students/early-career professionals targeting the ${request.targetRole} role.

Each project must be:
- Realistic to complete in 1-2 weeks (8-12 hours/week)
- Producing tangible deliverables for portfolio/resume
- Tied to real-world datasets, APIs, or tools
- Demonstrating skills directly relevant to ${request.targetRole}

For each project, provide COMPREHENSIVE details in this EXACT schema:

{
  "projects": [
    {
      "title": "Clear, resume-friendly title",
      "description": "2-3 sentence overview of the project",
      "targetRole": "${request.targetRole}",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedHours": 10-40,
      "projectType": "data-analysis|coding|design|research|business",
      
      "whyEmployersLove": [
        "Demonstrates X skill - critical for modern Y",
        "Shows full-stack capabilities: A + B",
        "Proves you can handle Z"
      ],
      
      "techStack": {
        "frontend": ["React", "TypeScript", "Tailwind CSS"],
        "backend": ["Node.js", "Express", "PostgreSQL"]
      },
      
      "coreFeatures": [
        {
          "title": "Feature Name",
          "details": [
            "Specific implementation detail",
            "Another important aspect"
          ]
        }
      ],
      
      "implementationPlan": [
        {
          "week": 1,
          "title": "Setup & Basic Infrastructure",
          "tasks": [
            "Task description with tech/approach",
            "Another specific task"
          ]
        }
      ],
      
      "skillsMastered": {
        "technicalSkills": ["Skill 1", "Skill 2"],
        "systemDesign": ["Pattern 1", "Approach 2"],
        "bestPractices": ["Practice 1", "Practice 2"]
      },
      
      "deliverables": [
        {
          "stepNumber": 1,
          "instruction": "Download the dataset from Kaggle",
          "resourceLinks": [
            {"title": "Titanic Dataset", "url": "https://www.kaggle.com/c/titanic", "type": "dataset"}
          ]
        }
      ],
      
      "resourcesProvided": [
        "Complete starter template with boilerplate",
        "Step-by-step tutorial document",
        "Example solution repository"
      ],
      
      "skillsGained": ["Python", "Pandas", "Data Visualization"],
      "relevanceToRole": "Why this project matters for ${request.targetRole}"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. Include ALL sections above - whyEmployersLove, techStack, coreFeatures, implementationPlan, skillsMastered, resourcesProvided
2. techStack should have both frontend AND backend (even if backend is simple Node.js + API)
3. implementationPlan should have 2-4 weeks of structured tasks
4. resourceLinks must have REAL, working URLs (Kaggle, GitHub, official docs, MDN, etc.)
5. Be specific and actionable - no vague descriptions
6. Make it portfolio-worthy and impressive to hiring managers

Return ONLY valid JSON with no markdown formatting.`;
        try {
          console.log(`Generating ${projectCount} role-based projects for ${request.targetRole}...`);
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6e4);
          const response = await openai2.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert career coach and project designer. Create realistic, portfolio-ready micro-projects with specific, actionable deliverables and real resource links. Return ONLY valid JSON with no markdown formatting."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" },
            max_tokens: 3e3
          }, {
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          let content = response.choices[0].message.content || "{}";
          const jsonData = JSON.parse(content);
          if (!jsonData.projects || !Array.isArray(jsonData.projects)) {
            throw new Error("Invalid response format: missing projects array");
          }
          console.log(`Successfully generated ${jsonData.projects.length} projects`);
          return jsonData.projects.map((project) => ({
            title: project.title,
            description: project.description,
            targetRole: project.targetRole || request.targetRole,
            targetSkill: null,
            skillCategory: null,
            difficultyLevel: project.difficulty || "intermediate",
            estimatedHours: project.estimatedHours || 20,
            projectType: project.projectType || "general",
            deliverables: project.deliverables || [],
            skillsGained: project.skillsGained || [],
            relevanceToRole: project.relevanceToRole || "",
            // Store comprehensive project data in instructions field
            instructions: {
              whyEmployersLove: project.whyEmployersLove || [],
              techStack: project.techStack || { frontend: [], backend: [] },
              coreFeatures: project.coreFeatures || [],
              implementationPlan: project.implementationPlan || [],
              skillsMastered: project.skillsMastered || { technicalSkills: [], systemDesign: [], bestPractices: [] },
              resourcesProvided: project.resourcesProvided || []
            },
            evaluationCriteria: project.evaluationCriteria || [],
            exampleArtifacts: project.exampleArtifacts || [],
            datasetUrl: null,
            templateUrl: null,
            repositoryUrl: null,
            tutorialUrl: null,
            portfolioTemplate: null,
            tags: [request.targetRole.toLowerCase().replace(/\s+/g, "-"), project.difficulty],
            isActive: true
          }));
        } catch (error) {
          console.error("Error generating role-based projects:", error);
          throw new Error(`Failed to generate projects: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }
      async enhanceExistingProject(projectTitle, currentInstructions) {
        const prompt = `Enhance the following micro-internship project with more detailed, step-by-step instructions:

Project Title: ${projectTitle}
Current Instructions: ${JSON.stringify(currentInstructions, null, 2)}

Make the instructions more comprehensive by:
1. Adding specific tools and resources to use
2. Including templates and examples
3. Providing step-by-step tasks with time estimates
4. Adding success criteria and evaluation methods
5. Including real-world resources and links

Respond with enhanced instructions JSON in the same format, but with much more detail and actionable guidance.`;
        try {
          const response = await openai2.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "You are an expert instructional designer who creates detailed, actionable project instructions. Enhance existing project instructions to be comprehensive and immediately actionable."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            response_format: { type: "json_object" }
          });
          return JSON.parse(response.choices[0].message.content || "{}");
        } catch (error) {
          console.error("Error enhancing project instructions:", error);
          return currentInstructions;
        }
      }
    };
    openaiProjectService = new OpenAIProjectService();
  }
});

// server/micro-projects.ts
var micro_projects_exports = {};
__export(micro_projects_exports, {
  MicroProjectsService: () => MicroProjectsService,
  microProjectsService: () => microProjectsService
});
var MicroProjectsService, microProjectsService;
var init_micro_projects = __esm({
  "server/micro-projects.ts"() {
    "use strict";
    init_storage();
    init_ai();
    init_openai_service();
    MicroProjectsService = class {
      realDatasets = /* @__PURE__ */ new Map();
      projectTemplates = /* @__PURE__ */ new Map();
      constructor() {
        this.initializeRealResources();
      }
      initializeRealResources() {
        this.realDatasets.set("data-analysis", [
          {
            title: "NYC Open Data - 311 Service Requests",
            description: "Real NYC 311 service request data for analysis practice",
            url: "https://data.cityofnewyork.us/Social-Services/311-Service-Requests-from-2010-to-Present/erm2-nwe9",
            type: "csv",
            size: "~2GB",
            license: "Public Domain"
          },
          {
            title: "Kaggle - Customer Churn Dataset",
            description: "Telecommunications customer churn data for predictive modeling",
            url: "https://www.kaggle.com/datasets/blastchar/telco-customer-churn",
            type: "csv",
            size: "950KB",
            license: "CC0: Public Domain"
          },
          {
            title: "World Bank Open Data API",
            description: "Economic indicators and development data from World Bank",
            url: "https://datahelpdesk.worldbank.org/knowledgebase/articles/889392",
            type: "api",
            license: "CC BY 4.0"
          }
        ]);
        this.realDatasets.set("web-development", [
          {
            title: "JSONPlaceholder API",
            description: "Free fake REST API for testing and prototyping",
            url: "https://jsonplaceholder.typicode.com/",
            type: "api",
            license: "Open Source"
          },
          {
            title: "REST Countries API",
            description: "Free API with country data including flags, currencies, languages",
            url: "https://restcountries.com/",
            type: "api",
            license: "Open Source"
          },
          {
            title: "The Cat API",
            description: "Free public API for cat images and facts",
            url: "https://thecatapi.com/",
            type: "api",
            license: "Public"
          }
        ]);
        this.realDatasets.set("machine-learning", [
          {
            title: "UCI Iris Dataset",
            description: "Classic dataset for classification problems",
            url: "https://archive.ics.uci.edu/dataset/53/iris",
            type: "csv",
            size: "5KB",
            license: "CC BY 4.0"
          },
          {
            title: "Boston Housing Dataset",
            description: "Housing prices for regression analysis",
            url: "https://www.kaggle.com/datasets/vikrishnan/boston-house-prices",
            type: "csv",
            size: "25KB",
            license: "Public Domain"
          },
          {
            title: "MNIST Handwritten Digits",
            description: "Dataset of 70,000 handwritten digits for image classification",
            url: "https://www.kaggle.com/datasets/hojjatk/mnist-dataset",
            type: "csv",
            size: "~50MB",
            license: "CC BY-SA 3.0"
          }
        ]);
        this.projectTemplates.set("web-development", [
          {
            title: "React Dashboard Template",
            description: "Modern dashboard with charts and data visualization",
            templateUrl: "https://github.com/creativetimofficial/material-dashboard-react",
            difficulty: "intermediate",
            technologies: ["React", "Material-UI", "Chart.js"]
          },
          {
            title: "Express REST API Starter",
            description: "Clean REST API template with authentication",
            templateUrl: "https://github.com/hagopj13/node-express-boilerplate",
            difficulty: "beginner",
            technologies: ["Node.js", "Express", "MongoDB", "JWT"]
          }
        ]);
        this.projectTemplates.set("data-analysis", [
          {
            title: "Jupyter Data Analysis Template",
            description: "Complete data analysis workflow template",
            templateUrl: "https://github.com/microsoft/Data-Science-For-Beginners/tree/main/4-Data-Science-Lifecycle",
            difficulty: "beginner",
            technologies: ["Python", "Pandas", "Matplotlib", "Jupyter"]
          }
        ]);
      }
      async analyzeSkillGaps(userId, resumeId, jobMatchId, targetRole) {
        try {
          let missingSkills = [];
          let skillCategories = [];
          let analysisSource = "manual";
          if (jobMatchId) {
            const jobMatch = await storage.getJobMatchById(jobMatchId);
            if (jobMatch && jobMatch.skillsGaps) {
              missingSkills = jobMatch.skillsGaps;
              analysisSource = "job-match";
            }
          } else if (resumeId) {
            const resume = await storage.getResumeById(resumeId);
            if (resume && resume.gaps) {
              const gaps = typeof resume.gaps === "string" ? JSON.parse(resume.gaps) : resume.gaps;
              missingSkills = Array.isArray(gaps) ? gaps.map((gap) => gap.skill || gap.area).filter(Boolean) : [];
              analysisSource = "resume-only";
            }
          }
          if (missingSkills.length === 0 && targetRole) {
            missingSkills = await this.generateSkillGapsForRole(targetRole);
            analysisSource = "ai-generated";
          }
          skillCategories = this.categorizeSkills(missingSkills);
          const skillGapData = {
            userId,
            resumeId,
            jobMatchId,
            targetRole,
            missingSkills,
            skillCategories,
            analysisSource,
            priorityLevel: "high"
          };
          const analysisId = await storage.createSkillGapAnalysis(skillGapData);
          return {
            ...skillGapData,
            id: analysisId,
            createdAt: /* @__PURE__ */ new Date()
          };
        } catch (error) {
          console.error("Error analyzing skill gaps:", error);
          throw error;
        }
      }
      async generateMicroProjectsForSkillGaps(skillGapAnalysisId) {
        try {
          const analysis = await storage.getSkillGapAnalysisById(skillGapAnalysisId);
          if (!analysis) {
            throw new Error("Skill gap analysis not found");
          }
          const projects = [];
          const skillsToAddress = analysis.missingSkills.slice(0, 5);
          for (const skill of skillsToAddress) {
            const skillProjects = await this.generateProjectsForSkill(skill);
            projects.push(...skillProjects);
          }
          const createdProjects = await Promise.all(
            projects.map((project) => this.storeProject(project))
          );
          return createdProjects;
        } catch (error) {
          console.error("Error generating micro-projects:", error);
          throw error;
        }
      }
      async generateSkillGapsForRole(targetRole) {
        try {
          const prompt = `For a ${targetRole} role, what are the 5 most important technical skills that candidates often lack? 
      
      Return only a JSON array of skill names, no additional text.
      Focus on concrete, learnable skills that can be practiced through hands-on projects.
      
      Example format: ["Python", "SQL", "Data Visualization", "API Development", "Version Control"]`;
          const response = await aiService.generateText(prompt);
          try {
            return JSON.parse(response.trim());
          } catch {
            const skills = response.match(/"([^"]+)"/g);
            return skills ? skills.map((s) => s.replace(/"/g, "")) : ["Programming", "Problem Solving"];
          }
        } catch (error) {
          console.error("Error generating skill gaps:", error);
          return ["Programming", "Problem Solving"];
        }
      }
      categorizeSkills(skills) {
        const categories = /* @__PURE__ */ new Set();
        for (const skill of skills) {
          const skillLower = skill.toLowerCase();
          if (skillLower.match(/programming|python|javascript|java|sql|react|node|html|css|git|api|database/)) {
            categories.add("technical");
          } else if (skillLower.match(/data|analysis|visualization|statistics|excel|tableau|pandas/)) {
            categories.add("data-analysis");
          } else if (skillLower.match(/design|ui|ux|figma|photoshop|branding/)) {
            categories.add("design");
          } else if (skillLower.match(/communication|leadership|management|teamwork|presentation/)) {
            categories.add("soft-skills");
          } else {
            categories.add("technical");
          }
        }
        return Array.from(categories);
      }
      async generateProjectsForSkill(skill) {
        try {
          const skillCategory = this.getSkillCategory(skill);
          const datasets = this.realDatasets.get(skillCategory) || [];
          const templates = this.projectTemplates.get(skillCategory) || [];
          const prompt = `Create a micro-project to help someone learn ${skill}. This should be a practical, hands-on project that can be completed in 2-4 hours.

      Project Requirements:
      - Must use real data or resources (not fake/mock data)
      - Should produce a portfolio-ready artifact 
      - Include step-by-step instructions
      - Specify clear deliverables and evaluation criteria
      - Appropriate for someone new to ${skill}

      Available real resources:
      ${datasets.map((d) => `- ${d.title}: ${d.url}`).join("\n")}
      ${templates.map((t) => `- ${t.title}: ${t.templateUrl}`).join("\n")}

      Return a JSON object with this structure:
      {
        "title": "Project title (50 chars max)",
        "description": "What the student will build and learn",
        "instructions": {
          "overview": "Brief project overview",
          "steps": ["Step 1", "Step 2", "Step 3", "..."],
          "resources": ["Resource 1", "Resource 2", "..."]
        },
        "deliverables": ["Deliverable 1", "Deliverable 2", "..."],
        "evaluationCriteria": ["Criterion 1", "Criterion 2", "..."],
        "estimatedHours": 2-4,
        "datasetUrl": "URL to real dataset if applicable",
        "templateUrl": "URL to starter template if applicable"
      }`;
          const response = await aiService.generateText(prompt);
          try {
            const projectData = JSON.parse(response);
            return [{
              title: projectData.title || `${skill} Practice Project`,
              description: projectData.description || `Build practical skills in ${skill}`,
              targetRole: "General",
              targetSkill: skill,
              skillCategory,
              difficultyLevel: "beginner",
              estimatedHours: projectData.estimatedHours || 3,
              projectType: this.getProjectType(skillCategory),
              instructions: projectData.instructions,
              deliverables: projectData.deliverables || ["Completed project", "Reflection writeup"],
              skillsGained: [skill],
              relevanceToRole: `Develops ${skill} skills applicable to multiple roles`,
              evaluationCriteria: projectData.evaluationCriteria || ["Functionality", "Code quality", "Documentation"],
              datasetUrl: projectData.datasetUrl,
              templateUrl: projectData.templateUrl,
              repositoryUrl: templates[0]?.templateUrl,
              tutorialUrl: null,
              portfolioTemplate: null,
              exampleArtifacts: [],
              tags: [skill.toLowerCase().replace(" ", "-"), skillCategory],
              isActive: true
            }];
          } catch (parseError) {
            console.error("Error parsing project JSON:", parseError);
            return this.generateFallbackProject(skill, skillCategory);
          }
        } catch (error) {
          console.error(`Error generating project for ${skill}:`, error);
          return this.generateFallbackProject(skill, "technical");
        }
      }
      generateFallbackProject(skill, category) {
        const datasets = this.realDatasets.get(category) || [];
        const fallbackDataset = datasets[0];
        return [{
          title: `${skill} Hands-On Project`,
          description: `Build practical experience with ${skill} through a real-world project using authentic data and tools.`,
          targetRole: "General",
          targetSkill: skill,
          skillCategory: category,
          difficultyLevel: "beginner",
          estimatedHours: 3,
          projectType: this.getProjectType(category),
          instructions: {
            overview: `Learn ${skill} by working with real data and building something tangible.`,
            steps: [
              "Set up your development environment",
              "Explore the provided dataset/resources",
              "Follow the tutorial to build your solution",
              "Test and document your work",
              "Create a portfolio writeup"
            ],
            resources: fallbackDataset ? [fallbackDataset.url] : []
          },
          deliverables: ["Working solution", "Portfolio documentation", "Code repository"],
          skillsGained: [skill],
          relevanceToRole: `Develops foundational ${skill} skills`,
          evaluationCriteria: ["Completeness", "Functionality", "Documentation quality"],
          datasetUrl: fallbackDataset?.url,
          templateUrl: null,
          repositoryUrl: null,
          tutorialUrl: null,
          portfolioTemplate: null,
          exampleArtifacts: [],
          tags: [skill.toLowerCase().replace(" ", "-"), category],
          isActive: true
        }];
      }
      getSkillCategory(skill) {
        const skillLower = skill.toLowerCase();
        if (skillLower.match(/data|analysis|visualization|statistics|excel|tableau|pandas/)) {
          return "data-analysis";
        } else if (skillLower.match(/react|node|javascript|html|css|web|frontend|backend/)) {
          return "web-development";
        } else if (skillLower.match(/machine learning|ml|ai|tensorflow|python.*analysis/)) {
          return "machine-learning";
        } else {
          return "technical";
        }
      }
      getProjectType(category) {
        switch (category) {
          case "data-analysis":
            return "data-analysis";
          case "web-development":
            return "coding";
          case "machine-learning":
            return "coding";
          case "design":
            return "design";
          default:
            return "coding";
        }
      }
      async storeProject(projectData) {
        const projectId = await storage.createMicroProject(projectData);
        return {
          ...projectData,
          id: projectId,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
      }
      async getRecommendedProjectsForUser(userId) {
        try {
          const activeResume = await storage.getActiveResume(userId);
          if (!activeResume?.gaps) {
            return [];
          }
          const gaps = typeof activeResume.gaps === "string" ? JSON.parse(activeResume.gaps) : activeResume.gaps;
          const improvementAreas = Array.isArray(gaps) ? gaps.map((gap) => gap.category).filter(Boolean) : [];
          if (improvementAreas.length === 0) {
            return [];
          }
          const projects = await storage.getMicroProjectsBySkills(improvementAreas);
          const completions = await storage.getProjectCompletionsByUser(userId);
          const completedProjectIds = new Set(completions.map((c) => c.projectId));
          return projects.filter((p) => !completedProjectIds.has(p.id));
        } catch (error) {
          console.error("Error getting recommended projects:", error);
          return [];
        }
      }
      async startProject(userId, projectId) {
        try {
          await storage.createProjectCompletion({
            userId,
            projectId,
            status: "in_progress",
            progressPercentage: 0,
            startedAt: /* @__PURE__ */ new Date()
          });
          const project = await storage.getMicroProjectById(projectId);
          if (project) {
            await storage.createActivity(
              userId,
              "project_started",
              "Project Started",
              `Started working on: ${project.title}`
            );
          }
        } catch (error) {
          console.error("Error starting project:", error);
          throw error;
        }
      }
      async updateProjectProgress(userId, projectId, progressPercentage, timeSpent) {
        try {
          const completion = await storage.getProjectCompletion(userId, projectId);
          if (!completion) {
            throw new Error("Project completion not found");
          }
          await storage.updateProjectCompletion(completion.id, {
            progressPercentage: Math.min(100, Math.max(0, progressPercentage)),
            timeSpent: timeSpent || completion.timeSpent,
            updatedAt: /* @__PURE__ */ new Date()
          });
          const project = await storage.getMicroProjectById(projectId);
          if (project) {
            if (progressPercentage === 100) {
              await storage.createActivity(
                userId,
                "project_completed",
                "Project Completed",
                `Completed: ${project.title}`
              );
            } else if (progressPercentage >= 50 && (completion.progressPercentage || 0) < 50) {
              await storage.createActivity(
                userId,
                "project_milestone",
                "Project Progress",
                `Reached 50% progress on: ${project.title}`
              );
            }
          }
        } catch (error) {
          console.error("Error updating project progress:", error);
          throw error;
        }
      }
      async completeProject(userId, projectId, artifactUrls, reflectionNotes, selfAssessment) {
        try {
          const completion = await storage.getProjectCompletion(userId, projectId);
          if (!completion) {
            throw new Error("Project completion not found");
          }
          await storage.updateProjectCompletion(completion.id, {
            status: "completed",
            progressPercentage: 100,
            completedAt: /* @__PURE__ */ new Date(),
            artifactUrls,
            reflectionNotes,
            selfAssessment,
            updatedAt: /* @__PURE__ */ new Date()
          });
          if (artifactUrls.length > 0) {
            const project = await storage.getMicroProjectById(projectId);
            if (project) {
              await storage.createPortfolioArtifact({
                userId,
                completionId: completion.id,
                title: `${project.title} - Portfolio`,
                description: project.description,
                artifactType: project.projectType,
                fileUrl: artifactUrls[0],
                skillsDemonstrated: [project.targetSkill],
                tags: project.tags || [],
                isPublic: false,
                isFeatured: false
              });
            }
          }
        } catch (error) {
          console.error("Error completing project:", error);
          throw error;
        }
      }
      // NEW: Generate projects based on target role
      async generateProjectsForRole(userId, targetRole, count = 2, difficulty = "intermediate") {
        try {
          console.log(`Generating ${count} ${difficulty} projects for user ${userId}, role: ${targetRole}`);
          const projectsData = await openaiProjectService.generateProjectsFromRole({
            targetRole,
            count
          });
          const storedProjects = await Promise.all(
            projectsData.map(async (projectData) => {
              const projectWithUser = { ...projectData, userId };
              const projectId = await storage.createMicroProject(projectWithUser);
              return {
                ...projectWithUser,
                id: projectId,
                createdAt: /* @__PURE__ */ new Date(),
                updatedAt: /* @__PURE__ */ new Date()
              };
            })
          );
          console.log(`Successfully generated and stored ${storedProjects.length} role-based projects`);
          return storedProjects;
        } catch (error) {
          console.error("Error generating role-based projects:", error);
          throw error;
        }
      }
      // AI-Powered Project Generation Methods (LEGACY - kept for backward compatibility)
      async generateAIPoweredProjects(userId) {
        try {
          const activeResume = await storage.getActiveResume(userId);
          if (!activeResume?.gaps) {
            console.log("No resume analysis found for user:", userId);
            return [];
          }
          const gaps = typeof activeResume.gaps === "string" ? JSON.parse(activeResume.gaps) : activeResume.gaps;
          const improvementAreas = Array.isArray(gaps) ? gaps.map((gap) => gap.category).filter(Boolean) : [];
          console.log("Found resume improvement areas:", improvementAreas);
          if (!improvementAreas || improvementAreas.length === 0) {
            console.log("Improvement areas array is empty for user:", userId);
            return [];
          }
          const userBackground = this.extractUserBackground(activeResume);
          const user = await storage.getUser(userId);
          const targetRole = user?.targetRole || "Product Manager";
          const topSkill = improvementAreas[0];
          const projectRequest = {
            skillGap: topSkill,
            skillCategory: this.getSkillCategory(topSkill),
            userBackground,
            targetRole,
            difficultyLevel: this.getDifficultyForSkill(topSkill)
          };
          console.log("Generating AI-powered project for skill:", topSkill);
          console.log("Project request details:", projectRequest);
          let generatedProject;
          try {
            generatedProject = await openaiProjectService.generateDetailedProject(projectRequest);
          } catch (error) {
            console.log("AI generation failed, using fallback project");
            const fallbackProject = {
              title: `${topSkill} Skills Practice`,
              description: `Learn ${topSkill} through hands-on exercises and real-world scenarios.`,
              targetRole,
              targetSkill: topSkill,
              skillCategory: projectRequest.skillCategory,
              difficultyLevel: projectRequest.difficultyLevel,
              estimatedHours: 10,
              projectType: "practice",
              instructions: [`Complete exercises in ${topSkill}`, "Practice with real scenarios", "Create portfolio deliverables"],
              deliverables: [`${topSkill} project report`, "Portfolio examples"],
              skillsGained: [topSkill],
              relevanceToRole: `Addresses ${topSkill} gap for ${targetRole} role`,
              evaluationCriteria: ["Quality of deliverables", "Skill demonstration"],
              exampleArtifacts: ["Project documentation"],
              datasetUrl: null,
              templateUrl: null,
              repositoryUrl: null,
              tutorialUrl: null,
              portfolioTemplate: null,
              tags: [topSkill.toLowerCase()],
              isActive: true
            };
            const projectId = await storage.createMicroProject(fallbackProject);
            return [{
              ...fallbackProject,
              id: projectId,
              createdAt: /* @__PURE__ */ new Date(),
              updatedAt: /* @__PURE__ */ new Date()
            }];
          }
          console.log("Successfully generated project:", generatedProject.title);
          const generatedProjects = [generatedProject];
          const storedProjects = await Promise.all(
            generatedProjects.map(async (projectData) => {
              const projectId = await storage.createMicroProject(projectData);
              return {
                ...projectData,
                id: projectId,
                createdAt: /* @__PURE__ */ new Date(),
                updatedAt: /* @__PURE__ */ new Date()
              };
            })
          );
          console.log(`Successfully generated ${storedProjects.length} AI-powered projects`);
          return storedProjects;
        } catch (error) {
          console.error("Error generating AI-powered projects:", error);
          return [];
        }
      }
      extractUserBackground(resume) {
        if (!resume || !resume.extractedText) {
          return "Professional with technical background";
        }
        const text2 = resume.extractedText.toLowerCase();
        if (text2.includes("data scientist") || text2.includes("machine learning")) {
          return "Data Scientist";
        } else if (text2.includes("software engineer") || text2.includes("developer")) {
          return "Software Engineer";
        } else if (text2.includes("analyst") || text2.includes("analytics")) {
          return "Data Analyst";
        } else if (text2.includes("researcher")) {
          return "Researcher";
        } else {
          return "Professional with technical background";
        }
      }
      getDifficultyForSkill(skill) {
        const skillLower = skill.toLowerCase();
        if (skillLower.includes("strategy") || skillLower.includes("leadership") || skillLower.includes("go-to-market")) {
          return "advanced";
        }
        if (skillLower.includes("product management") || skillLower.includes("agile") || skillLower.includes("scrum")) {
          return "intermediate";
        }
        return "intermediate";
      }
    };
    microProjectsService = new MicroProjectsService();
  }
});

// server/networking.ts
var networking_exports = {};
__export(networking_exports, {
  fetchEvents: () => fetchEvents,
  fetchForums: () => fetchForums,
  fetchSocialGroups: () => fetchSocialGroups,
  generateSearchKeywords: () => generateSearchKeywords,
  getNetworkingRecommendations: () => getNetworkingRecommendations
});
import OpenAI3 from "openai";
function cacheKey(role, industries, location) {
  return [role, ...industries, location].join("|").toLowerCase();
}
function pruneCache() {
  const now = Date.now();
  for (const [k, v] of resultCache) {
    if (v.expiresAt < now) resultCache.delete(k);
  }
}
async function generateSearchKeywords(profile) {
  const contextParts = [
    `Target role: ${profile.targetRole}`,
    profile.industries.length ? `Industries of interest: ${profile.industries.join(", ")}` : "",
    profile.background ? `Background (may include school year, major, university, company, experience level): ${profile.background}` : "",
    profile.topGaps.length ? `Skills to develop: ${profile.topGaps.slice(0, 4).join(", ")}` : "",
    profile.resumeText ? `Resume excerpt: ${profile.resumeText.slice(0, 600)}` : ""
  ].filter(Boolean).join("\n");
  const prompt = `You are a career expert generating search keywords for networking recommendations.

User profile:
${contextParts}

From the background description and resume excerpt, extract whatever is relevant (major/field, school or company, experience level, career stage) to inform the keywords. Do NOT ask for missing information \u2014 work with what's provided.

Generate two search keyword phrases:

1. GROUP/COMMUNITY keywords: For LinkedIn groups, Reddit, Discord, and Slack. Topic/role focused \u2014 NO location. Use professional terminology relevant to their career stage and field.

2. EVENT keywords: For Eventbrite and Meetup event searches. Topic/role focused \u2014 NO location (location is appended separately by the backend).

Rules:
- Output ONLY keyword strings \u2014 no URLs, no descriptions, no explanations.
- Each phrase should be 3\u20136 words, suitable as a search engine query.
- Keep them specific, not generic ("machine learning engineers" > "tech professionals").

Return exactly this JSON:
{
  "groupKeywords": "3-6 word phrase for community search",
  "eventKeywords": "3-6 word phrase for event search"
}`;
  try {
    const response = await openai3.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3
    });
    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      groupKeywords: result.groupKeywords || profile.targetRole,
      eventKeywords: result.eventKeywords || profile.targetRole
    };
  } catch (err) {
    console.error("[networking] keyword generation failed:", err.message);
    return {
      groupKeywords: profile.targetRole,
      eventKeywords: profile.targetRole
    };
  }
}
async function validateUrl(url, timeoutMs = 6e3) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Pathwise/1.0)" }
    });
    clearTimeout(timer);
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}
async function searxSearch(query, timeoutMs = 1e4) {
  const base = process.env.SEARXNG_URL;
  if (!base) {
    console.warn("SEARXNG_URL not set");
    return [];
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(
      `${base}/search?q=${encodeURIComponent(query)}&format=json`,
      { signal: controller.signal, headers: { Accept: "application/json" } }
    );
    clearTimeout(timer);
    if (res.status === 403) {
      console.error("SearXNG 403 \u2014 enable json in settings.yml: search.formats: [html, json]");
      return [];
    }
    if (!res.ok) {
      console.error(`SearXNG error: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data.results || [];
  } catch (err) {
    console.error("SearXNG fetch failed:", err.message);
    return [];
  }
}
async function fetchEvents(eventKeywords, location) {
  const locSuffix = location ? ` ${location}` : "";
  const [ebResults, muResults] = await Promise.all([
    searxSearch(`site:eventbrite.com ${eventKeywords}${locSuffix}`),
    searxSearch(`site:meetup.com ${eventKeywords}${locSuffix}`)
  ]);
  const candidates = [
    ...ebResults.slice(0, 6).map((r) => ({ ...r, source: "eventbrite" })),
    ...muResults.slice(0, 6).map((r) => ({ ...r, source: "meetup" }))
  ].filter(
    (r) => r.url && (r.url.includes("eventbrite.com/e/") || r.url.includes("meetup.com/"))
  );
  const validated = await Promise.all(
    candidates.map(async (r, i) => {
      const ok = await validateUrl(r.url);
      if (!ok) return null;
      const isOnline = r.title.toLowerCase().includes("online") || r.title.toLowerCase().includes("virtual");
      return {
        id: `ev-${i}`,
        name: r.title || "Networking Event",
        description: (r.content || "").slice(0, 200),
        whyRelevant: `Found for "${eventKeywords}"${location ? ` near ${location}` : ""}.`,
        url: r.url,
        date: "See event page",
        location: isOnline ? "Online" : location || "See event page",
        isOnline,
        source: r.source
      };
    })
  );
  return validated.filter((e) => e !== null).slice(0, 5);
}
async function fetchSocialGroups(groupKeywords, targetRole, industries) {
  const encoded = encodeURIComponent(groupKeywords);
  return [
    {
      id: "sg-linkedin",
      name: `LinkedIn Groups \u2014 ${groupKeywords}`,
      platform: "LinkedIn",
      description: `Browse LinkedIn groups for ${targetRole} professionals and related communities.`,
      whyRelevant: `Connects you with peers, recruiters, and industry insiders in the ${targetRole} space${industries.length ? ` (${industries[0]})` : ""}.`,
      url: `https://www.linkedin.com/search/results/groups/?keywords=${encoded}`,
      requiresLogin: true
    }
  ];
}
async function fetchForums(groupKeywords, targetRole, topGaps) {
  const [redditResults, discordResults, slackResults] = await Promise.all([
    searxSearch(`site:reddit.com ${groupKeywords}`),
    searxSearch(`${groupKeywords} discord community server`),
    searxSearch(`${groupKeywords} slack community workspace`)
  ]);
  const gapTerm = topGaps.length ? topGaps[0] : "";
  const candidates = [
    ...redditResults.filter((r) => /reddit\.com\/r\/[a-zA-Z0-9_]+\/?$/.test(r.url)).slice(0, 6).map((r) => ({ ...r, inferredPlatform: "Reddit" })),
    ...discordResults.filter((r) => r.url.includes("discord.com") || r.url.includes("discord.gg")).slice(0, 3).map((r) => ({ ...r, inferredPlatform: "Discord" })),
    ...slackResults.filter((r) => r.url.includes("slack.com")).slice(0, 3).map((r) => ({ ...r, inferredPlatform: "Slack" }))
  ];
  const validated = await Promise.all(
    candidates.map(async (r, i) => {
      const ok = await validateUrl(r.url);
      if (!ok) return null;
      const platform = r.inferredPlatform;
      return {
        id: `fo-${i}`,
        name: r.title || `${platform} Community`,
        platform,
        description: (r.content || "").slice(0, 180),
        whyRelevant: gapTerm ? `Relevant to your gap in ${gapTerm} and your target role as a ${targetRole}.` : `A ${platform} community for ${targetRole} professionals.`,
        url: r.url
      };
    })
  );
  return validated.filter((f) => f !== null).slice(0, 6);
}
async function getNetworkingRecommendations(targetRole, industries, gaps, location, force = false, profileExtras = {}) {
  const topGaps = Array.isArray(gaps) ? gaps.filter((g) => g && (g.area || g.skill || g.description)).slice(0, 5).map((g) => g.area || g.skill || g.description || String(g)) : [];
  const key = cacheKey(targetRole, industries, location);
  if (!force) {
    const cached = resultCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[networking] cache hit for "${key}"`);
      return cached.data;
    }
  } else {
    console.log(`[networking] force refresh for "${key}"`);
  }
  const profile = {
    targetRole,
    industries,
    topGaps,
    location,
    ...profileExtras
  };
  const { groupKeywords, eventKeywords } = await generateSearchKeywords(profile);
  console.log(`[networking] keywords \u2014 group: "${groupKeywords}", events: "${eventKeywords}"`);
  const [events, socialGroups, forums] = await Promise.all([
    fetchEvents(eventKeywords, location),
    fetchSocialGroups(groupKeywords, targetRole, industries),
    fetchForums(groupKeywords, targetRole, topGaps)
  ]);
  const result = {
    events,
    socialGroups,
    forums,
    generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
    userContext: { targetRole, location, topGaps }
  };
  pruneCache();
  resultCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  console.log(`[networking] cached for "${key}" (30 min)`);
  return result;
}
var openai3, CACHE_TTL_MS, resultCache;
var init_networking = __esm({
  "server/networking.ts"() {
    "use strict";
    openai3 = new OpenAI3({ apiKey: process.env.OPENAI_API_KEY });
    CACHE_TTL_MS = 30 * 60 * 1e3;
    resultCache = /* @__PURE__ */ new Map();
  }
});

// api/index.ts
import express from "express";
import cookieParser from "cookie-parser";

// server/routes.ts
init_storage();
import { createServer } from "http";
import Stripe from "stripe";

// server/auth.ts
init_storage();
import bcrypt from "bcrypt";
import crypto2 from "crypto";
var JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "your-secret-key";
var SESSION_DURATION = 7 * 24 * 60 * 60 * 1e3;
async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}
async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}
function generateToken() {
  return crypto2.randomBytes(32).toString("hex");
}
async function createSession(userId) {
  await storage.deleteUserSessions(userId);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION);
  await storage.createSession(userId, token, expiresAt);
  return token;
}
async function authenticate(req, res, next) {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.auth_token;
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const session = await storage.getSession(token);
    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }
    const user = session.user;
    if (!user.isVerified) {
      return res.status(401).json({ error: "Email verification required" });
    }
    if (!user.isActive) {
      return res.status(401).json({ error: "Account is inactive. Contact your administrator." });
    }
    if (user.institutionId) {
      const license = await storage.getInstitutionLicense(user.institutionId);
      if (!license) {
        return res.status(401).json({ error: "Institution license has expired. Contact your administrator." });
      }
      await storage.updateUser(user.id, { lastActiveAt: /* @__PURE__ */ new Date() });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ error: "Authentication failed" });
  }
}
function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin" && req.user.role !== "institution_admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== "super_admin") {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
}
function requireFeature(featureKey) {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    const userId = req.user.id;
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    const hasActiveSubscription = (user.subscriptionTier === "paid" || user.subscriptionTier === "institutional") && (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing");
    if (hasActiveSubscription) {
      return next();
    }
    const unusedCredit = await storage.getUnusedFeatureCredit(userId, featureKey);
    if (!unusedCredit) {
      return res.status(403).json({
        error: `This feature requires either purchasing it individually or subscribing to Pathwise Unlimited.`,
        requiresUpgrade: true,
        featureKey
      });
    }
    try {
      const consumed = await storage.consumeFeatureCredit(unusedCredit.id);
      if (!consumed) {
        console.warn(`\u26A0\uFE0F Race condition detected: Credit ${unusedCredit.id} already consumed for ${featureKey} by user ${userId}`);
        return res.status(403).json({
          error: "This credit has already been used. Please purchase again to continue.",
          requiresUpgrade: true,
          featureKey
        });
      }
      console.log(`\u2705 Credit consumed atomically: ${featureKey} for user ${userId}`);
      return next();
    } catch (error) {
      console.error("Error consuming credit:", error);
      return res.status(500).json({ error: "Failed to process feature access" });
    }
  };
}
function requirePaidFeatures(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  const tier = req.user.subscriptionTier;
  if (tier === "paid" || tier === "institutional") {
    return next();
  }
  return res.status(403).json({
    error: "This feature requires a Pro subscription. Upgrade to access Career Roadmaps, Job Matching, Micro-Projects, and more.",
    requiresUpgrade: true
  });
}
async function logout(token) {
  await storage.deleteSession(token);
}

// server/routes.ts
init_ai();

// server/jobs.ts
var JobsService = class {
  coresignalApiKey = process.env.CORESIGNAL_API_KEY || "";
  adzunaAppId = process.env.ADZUNA_APP_ID || "";
  adzunaAppKey = process.env.ADZUNA_APP_KEY || "";
  coresignalBaseUrl = "https://api.coresignal.com/cdapi/v2";
  constructor() {
    if (this.coresignalApiKey) {
      console.log("CoreSignal API credentials loaded successfully");
    } else {
      console.warn("CoreSignal API key not found.");
    }
    if (this.adzunaAppId && this.adzunaAppKey) {
      console.log("Adzuna API credentials loaded successfully (backup)");
    } else {
      console.warn("Adzuna API credentials not found for fallback.");
    }
    console.log("Job matching system initialized with AI-powered skill extraction and compatibility scoring");
  }
  async searchJobs(params, userSkills) {
    let jobs = [];
    let totalCount = 0;
    if (!this.coresignalApiKey) {
      throw new Error("CoreSignal API key is required");
    }
    console.log("Attempting CoreSignal job search (ONLY source)...");
    try {
      const result = await this.searchWithCoreSignal(params);
      console.log(`CoreSignal returned ${result.jobs.length} jobs`);
      jobs = result.jobs;
      totalCount = result.totalCount;
    } catch (error) {
      console.error("CoreSignal API failed:", error.message);
      throw new Error(`CoreSignal API failed: ${error.message}`);
    }
    console.log("Jobs returned without AI scoring - user must click 'AI Match Analysis' for personalized insights");
    return { jobs, totalCount };
  }
  async searchWithCoreSignal(params) {
    const baseUrl = "https://api.coresignal.com";
    const endpoints = [
      `${baseUrl}/cdapi/v2/job_base/search/filter`,
      // CORRECT v2 endpoint
      `${baseUrl}/cdapi/v2/job_base/search/es_dsl`
      // Alternative Elasticsearch DSL endpoint
    ];
    const filterSearchBody = {};
    if (params.query) {
      filterSearchBody.title = params.query;
    }
    if (params.location) {
      filterSearchBody.location = params.location;
    }
    if (params.contractType) {
      filterSearchBody.employment_type = params.contractType;
    }
    filterSearchBody.application_active = true;
    const esSearchBody = {
      "query": {
        "bool": {
          "must": [
            {
              "term": {
                "application_active": true
              }
            }
          ]
        }
      },
      "size": Math.min(params.resultsPerPage || 20, 100),
      "from": ((params.page || 1) - 1) * (params.resultsPerPage || 20)
    };
    if (params.query) {
      esSearchBody.query.bool.must.push({
        "match": {
          "title": params.query
          // Use "title" field as per docs
        }
      });
    }
    if (params.location) {
      esSearchBody.query.bool.must.push({
        "match": {
          "location": params.location
          // Use "location" field as per docs
        }
      });
    }
    console.log("CoreSignal API Key Present:", !!this.coresignalApiKey);
    const endpointBodies = [
      { endpoint: endpoints[0], body: filterSearchBody, type: "filter" },
      { endpoint: endpoints[1], body: esSearchBody, type: "es_dsl" }
    ];
    for (const { endpoint, body, type } of endpointBodies) {
      try {
        console.log(`
=== Trying CoreSignal ${type} endpoint: ${endpoint} ===`);
        console.log(`${type} search body:`, JSON.stringify(body, null, 2));
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "ApiKey": this.coresignalApiKey,
            // CORRECT header name per docs
            "User-Agent": "Pathwise-Jobs/1.0"
          },
          body: JSON.stringify(body)
        });
        console.log(`CoreSignal Response Status: ${response.status} ${response.statusText}`);
        console.log(`CoreSignal Response Headers:`, Object.fromEntries(response.headers.entries()));
        if (response.ok) {
          const data = await response.json();
          console.log(`
*** CoreSignal SUCCESS with endpoint: ${endpoint} ***`);
          console.log("Full Response Keys:", Object.keys(data));
          console.log("Response Structure:", JSON.stringify(data, null, 2).substring(0, 500) + "...");
          const jobIds = Array.isArray(data) ? data : Object.values(data);
          console.log(`CoreSignal returned ${jobIds.length} job IDs`);
          if (jobIds.length > 0) {
            console.log("Sample job IDs:", jobIds.slice(0, 5));
            const jobDetails = [];
            const idsToFetch = jobIds.slice(0, 3);
            console.log(`Fetching ${idsToFetch.length} job details in parallel...`);
            const collectPromises = idsToFetch.map(async (jobId) => {
              try {
                const collectResponse = await fetch(`https://api.coresignal.com/cdapi/v2/job_base/collect/${jobId}`, {
                  method: "GET",
                  headers: {
                    "accept": "application/json",
                    "ApiKey": this.coresignalApiKey
                  }
                });
                if (collectResponse.ok) {
                  const jobData = await collectResponse.json();
                  return { success: true, data: jobData, jobId };
                } else {
                  console.log(`Failed to collect job ${jobId}: ${collectResponse.status}`);
                  return { success: false, jobId, status: collectResponse.status };
                }
              } catch (error) {
                console.log(`Error collecting job ${jobId}:`, error.message);
                return { success: false, jobId, error: error.message };
              }
            });
            const results = await Promise.allSettled(collectPromises);
            results.forEach((result) => {
              if (result.status === "fulfilled" && result.value.success) {
                jobDetails.push(result.value.data);
              }
            });
            console.log(`Successfully collected ${jobDetails.length} job details`);
            const transformedJobs = jobDetails.map((job, index) => {
              return {
                id: job.id?.toString() || `coresignal-${Date.now()}-${index}`,
                title: job.title || "Job Title Not Available",
                company: {
                  display_name: job.company_name || "Company Not Listed"
                },
                location: {
                  display_name: job.location || "Location Not Specified"
                },
                description: job.description || "No description available",
                salary_min: job.salary_min || null,
                salary_max: job.salary_max || null,
                contract_type: job.employment_type || "Not specified",
                created: job.created || (/* @__PURE__ */ new Date()).toISOString(),
                redirect_url: job.url || `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title || params.query || "")}`,
                source: "CoreSignal API",
                requiredSkills: this.extractSkillsFromDescription(job.description || ""),
                niceToHaveSkills: []
              };
            });
            console.log(`Successfully transformed ${transformedJobs.length} CoreSignal jobs`);
            return {
              jobs: transformedJobs,
              totalCount: jobIds.length
              // Total IDs available
            };
          } else {
            console.log("No jobs found in response - 0 job IDs returned");
            continue;
          }
        } else {
          const errorText = await response.text();
          console.log(`CoreSignal endpoint ${endpoint} failed:`);
          console.log(`Status: ${response.status}`);
          console.log(`Error body:`, errorText);
          continue;
        }
      } catch (error) {
        console.log(`CoreSignal endpoint ${endpoint} threw error:`, error.message);
        console.log(`Error stack:`, error.stack);
        continue;
      }
    }
    throw new Error(`CoreSignal API completely failed. Tried ${endpoints.length} endpoints. Check API key and endpoint URLs.`);
  }
  async searchWithAdzuna(params) {
    const countries = ["gb", "ca", "au", "us"];
    for (const country of countries) {
      try {
        const baseUrl = `https://api.adzuna.com/v1/api/jobs/${country}/search`;
        const searchParams = new URLSearchParams({
          app_id: this.adzunaAppId,
          app_key: this.adzunaAppKey,
          results_per_page: (params.resultsPerPage || 15).toString(),
          page: (params.page || 1).toString()
        });
        if (params.query) {
          searchParams.append("what", params.query);
        }
        if (params.location) {
          searchParams.append("where", params.location);
        }
        if (params.maxDistance) {
          searchParams.append("distance", params.maxDistance.toString());
        }
        if (params.salaryMin) {
          searchParams.append("salary_min", params.salaryMin.toString());
        }
        if (params.salaryMax) {
          searchParams.append("salary_max", params.salaryMax.toString());
        }
        if (params.contractType) {
          searchParams.append("contract_type", params.contractType);
        }
        console.log(`Trying Adzuna ${country.toUpperCase()}:`, `${baseUrl}?${searchParams}`);
        const response = await fetch(`${baseUrl}?${searchParams}`, {
          headers: {
            "User-Agent": "Pathwise-Job-Matching/1.0",
            "Accept": "application/json"
          }
        });
        if (response.ok) {
          const data = await response.json();
          console.log(`Adzuna ${country.toUpperCase()} success:`, data?.results?.length || 0, "jobs found");
          if (data.results && data.results.length > 0) {
            const transformedJobs = data.results.map((job) => ({
              id: job.id,
              title: job.title,
              company: { display_name: job.company.display_name || job.company },
              location: { display_name: job.location.display_name || job.location },
              description: job.description,
              salary_min: job.salary_min,
              salary_max: job.salary_max,
              contract_type: job.contract_type,
              created: job.created,
              redirect_url: job.redirect_url,
              // This is the REAL job application URL!
              source: `Adzuna ${country.toUpperCase()}`,
              requiredSkills: this.extractSkillsFromDescription(job.description || ""),
              niceToHaveSkills: []
            }));
            return {
              jobs: transformedJobs,
              totalCount: data.count || transformedJobs.length
            };
          }
        } else {
          console.log(`Adzuna ${country.toUpperCase()} failed:`, response.status);
        }
      } catch (error) {
        console.log(`Adzuna ${country.toUpperCase()} error:`, error.message);
        continue;
      }
    }
    throw new Error("All Adzuna country endpoints failed");
  }
  generateSampleJobs(params) {
    const query = params.query || "Software Engineer";
    const location = params.location || "United States";
    const limit = params.resultsPerPage || 20;
    const sampleJobTemplates = [
      {
        id: "1",
        title: `Senior ${query}`,
        company: { display_name: "TechCorp Inc" },
        location: { display_name: location },
        description: `We are seeking an experienced ${query} to join our innovative team. You will work on cutting-edge projects using the latest technologies. Requirements include strong problem-solving skills, experience with modern development practices, and excellent communication abilities.`,
        salary_min: 8e4,
        salary_max: 12e4,
        contract_type: "permanent",
        created: (/* @__PURE__ */ new Date()).toISOString(),
        redirect_url: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`,
        source: "Generated (External APIs Unavailable)",
        requiredSkills: this.getRequiredSkillsForRole(query),
        niceToHaveSkills: this.getNiceToHaveSkillsForRole(query)
      },
      {
        id: "2",
        title: `${query} - Entry Level`,
        company: { display_name: "StartupCo" },
        location: { display_name: location },
        description: `Join our growing team as a ${query}! Perfect opportunity for new graduates or career changers. We offer mentorship, training, and growth opportunities. Looking for candidates with basic knowledge in relevant technologies and eagerness to learn.`,
        salary_min: 6e4,
        salary_max: 85e3,
        contract_type: "permanent",
        created: new Date(Date.now() - 864e5).toISOString(),
        redirect_url: `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}`,
        source: "Generated (External APIs Unavailable)",
        requiredSkills: this.getRequiredSkillsForRole(query, "entry"),
        niceToHaveSkills: this.getNiceToHaveSkillsForRole(query, "entry")
      },
      {
        id: "3",
        title: `Lead ${query}`,
        company: { display_name: "Enterprise Solutions LLC" },
        location: { display_name: location },
        description: `Leadership role for an experienced ${query}. You will lead a team of developers, architect solutions, and drive technical decisions. Requires 5+ years of experience, strong leadership skills, and deep technical expertise.`,
        salary_min: 12e4,
        salary_max: 18e4,
        contract_type: "permanent",
        created: new Date(Date.now() - 1728e5).toISOString(),
        redirect_url: `https://www.glassdoor.com/Jobs/${encodeURIComponent(query)}-jobs-SRCH_KO0,${query.length}.htm`,
        source: "Generated (External APIs Unavailable)",
        requiredSkills: this.getRequiredSkillsForRole(query, "senior"),
        niceToHaveSkills: this.getNiceToHaveSkillsForRole(query, "senior")
      }
    ];
    const variations = [];
    for (let i = 0; i < Math.min(limit, 15); i++) {
      const template = sampleJobTemplates[i % sampleJobTemplates.length];
      variations.push({
        ...template,
        id: (i + 1).toString(),
        title: template.title + (i > 2 ? ` (${Math.floor(i / 3) + 1})` : ""),
        company: { display_name: template.company.display_name + (i > 2 ? ` ${Math.floor(i / 3) + 1}` : "") }
      });
    }
    return variations;
  }
  getRequiredSkillsForRole(role, level = "mid") {
    const roleSkills = {
      "data science": {
        entry: ["Python", "SQL", "Statistics", "Excel"],
        mid: ["Python", "SQL", "Machine Learning", "Pandas", "NumPy", "Statistics"],
        senior: ["Python", "SQL", "Machine Learning", "Deep Learning", "MLOps", "Cloud Platforms", "Leadership"]
      },
      "software engineer": {
        entry: ["Programming", "Git", "Problem Solving", "Basic Algorithms"],
        mid: ["JavaScript", "React", "Node.js", "Databases", "APIs", "Testing"],
        senior: ["System Design", "Microservices", "Cloud Architecture", "DevOps", "Leadership", "Mentoring"]
      },
      "product manager": {
        entry: ["Communication", "Analytics", "User Research", "Agile"],
        mid: ["Product Strategy", "Data Analysis", "A/B Testing", "Stakeholder Management", "Roadmapping"],
        senior: ["Strategic Planning", "P&L Management", "Team Leadership", "Market Analysis", "Go-to-Market"]
      }
    };
    const normalizedRole = role.toLowerCase();
    for (const [key, levels] of Object.entries(roleSkills)) {
      if (normalizedRole.includes(key)) {
        return levels[level] || levels.mid;
      }
    }
    return level === "entry" ? ["Communication", "Problem Solving", "Teamwork", "Learning Ability"] : level === "senior" ? ["Leadership", "Strategic Thinking", "Project Management", "Communication", "Domain Expertise"] : ["Problem Solving", "Communication", "Technical Skills", "Collaboration"];
  }
  getNiceToHaveSkillsForRole(role, level = "mid") {
    const roleSkills = {
      "data science": {
        entry: ["R", "Tableau", "Power BI", "Jupyter"],
        mid: ["R", "Spark", "Tableau", "Docker", "AWS", "TensorFlow"],
        senior: ["Kubernetes", "Airflow", "Spark", "Advanced Statistics", "Business Strategy"]
      },
      "software engineer": {
        entry: ["HTML/CSS", "Command Line", "IDEs", "Basic Frameworks"],
        mid: ["TypeScript", "Docker", "AWS", "GraphQL", "MongoDB"],
        senior: ["Kubernetes", "Terraform", "System Design", "Architecture Patterns"]
      },
      "product manager": {
        entry: ["SQL", "Figma", "Jira", "Basic Coding"],
        mid: ["SQL", "Python", "Figma", "Customer Interviews", "Metrics"],
        senior: ["Advanced Analytics", "Business Intelligence", "Technical Background"]
      }
    };
    const normalizedRole = role.toLowerCase();
    for (const [key, levels] of Object.entries(roleSkills)) {
      if (normalizedRole.includes(key)) {
        return levels[level] || levels.mid;
      }
    }
    return ["Industry Knowledge", "Certifications", "Additional Languages", "Tools Expertise"];
  }
  calculateCompatibilityScore(job, userSkills, params) {
    let score = 0;
    const weights = {
      requiredSkills: 0.4,
      niceToHaveSkills: 0.2,
      titleMatch: 0.2,
      locationMatch: 0.1,
      experienceMatch: 0.1
    };
    const requiredSkills = job.requiredSkills || this.extractSkillsFromDescription(job.description);
    const requiredMatches = this.countSkillMatches(userSkills, requiredSkills);
    const requiredScore = requiredSkills.length > 0 ? requiredMatches / requiredSkills.length * 100 : 50;
    score += requiredScore * weights.requiredSkills;
    const niceToHaveSkills = job.niceToHaveSkills || [];
    const niceToHaveMatches = this.countSkillMatches(userSkills, niceToHaveSkills);
    const niceToHaveScore = niceToHaveSkills.length > 0 ? niceToHaveMatches / niceToHaveSkills.length * 100 : 0;
    score += niceToHaveScore * weights.niceToHaveSkills;
    const titleScore = this.calculateTitleMatch(job.title, params.query || "");
    score += titleScore * weights.titleMatch;
    const locationScore = this.calculateLocationMatch(job.location?.display_name || "", params.location || "");
    score += locationScore * weights.locationMatch;
    const experienceScore = 75;
    score += experienceScore * weights.experienceMatch;
    return Math.round(Math.min(100, Math.max(0, score)));
  }
  // Get user's resume from storage
  async getUserResume(userId) {
    if (!this.storage) return null;
    try {
      const activeResume = await this.storage.getActiveResume(userId);
      return activeResume?.extractedText || null;
    } catch (error) {
      console.log("Failed to get user resume:", error);
      return null;
    }
  }
  // Calculate AI-powered compatibility score using OpenAI directly
  async calculateAICompatibilityScore(job, userResume, userSkills) {
    try {
      const OpenAI4 = __require("openai");
      const openai4 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `Analyze the compatibility between this candidate and job posting. Provide a realistic compatibility score.

CANDIDATE RESUME:
${userResume.substring(0, 2e3)}...

CANDIDATE SKILLS: ${userSkills.join(", ")}

JOB POSTING:
Title: ${job.title}
Company: ${job.company?.display_name || "Not specified"}
Description: ${job.description?.substring(0, 1e3) || "No description provided"}...

Analyze the match quality and provide a JSON response:
{
  "score": <number between 1-100>,
  "keyStrengths": [<2-3 main strengths that match>],
  "mainConcerns": [<1-2 main gaps or concerns>]
}

Be realistic - most matches are 40-80%, perfect matches (90%+) are rare.`;
      const response = await openai4.chat.completions.create({
        model: "gpt-5",
        // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });
      const result = JSON.parse(response.choices[0].message.content || "{}");
      const score = Math.round(Math.min(100, Math.max(1, result.score || 50)));
      console.log(`AI scored job "${job.title}": ${score}% - Strengths: ${result.keyStrengths?.join(", ") || "None"}`);
      return score;
    } catch (error) {
      console.log("AI scoring failed:", error);
      return this.calculateCompatibilityScore(job, userSkills, {});
    }
  }
  extractSkillsFromDescription(description) {
    const commonSkills = [
      "JavaScript",
      "Python",
      "Java",
      "React",
      "Node.js",
      "SQL",
      "AWS",
      "Docker",
      "TypeScript",
      "Git",
      "HTML",
      "CSS",
      "MongoDB",
      "PostgreSQL",
      "Machine Learning",
      "Data Science",
      "TensorFlow",
      "Pandas",
      "NumPy",
      "R",
      "Tableau",
      "Excel",
      "Leadership",
      "Communication",
      "Project Management",
      "Agile",
      "Scrum"
    ];
    return commonSkills.filter(
      (skill) => description.toLowerCase().includes(skill.toLowerCase())
    );
  }
  countSkillMatches(userSkills, jobSkills) {
    if (!userSkills || !jobSkills) return 0;
    return jobSkills.reduce((matches, jobSkill) => {
      const hasMatch = userSkills.some(
        (userSkill) => userSkill.toLowerCase().includes(jobSkill.toLowerCase()) || jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      );
      return matches + (hasMatch ? 1 : 0);
    }, 0);
  }
  calculateTitleMatch(jobTitle, searchQuery) {
    if (!searchQuery) return 50;
    const jobTitleLower = jobTitle.toLowerCase();
    const queryLower = searchQuery.toLowerCase();
    if (jobTitleLower.includes(queryLower)) return 100;
    if (queryLower.includes(jobTitleLower)) return 90;
    const jobWords = jobTitleLower.split(/\s+/);
    const queryWords = queryLower.split(/\s+/);
    const commonWords = jobWords.filter((word) => queryWords.includes(word));
    return Math.min(100, commonWords.length / Math.max(jobWords.length, queryWords.length) * 100);
  }
  calculateLocationMatch(jobLocation, searchLocation) {
    if (!searchLocation) return 50;
    const jobLocationLower = jobLocation.toLowerCase();
    const searchLocationLower = searchLocation.toLowerCase();
    if (jobLocationLower.includes(searchLocationLower) || searchLocationLower.includes(jobLocationLower)) {
      return 100;
    }
    if (jobLocationLower.includes("remote") || searchLocationLower.includes("remote")) {
      return 90;
    }
    return 30;
  }
  async getJobDetails(jobId) {
    try {
      const url = `https://api.adzuna.com/v1/api/jobs/us/details/${jobId}`;
      const searchParams = new URLSearchParams({
        app_id: this.adzunaAppId,
        app_key: this.adzunaAppKey
      });
      const response = await fetch(`${url}?${searchParams}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Adzuna API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Job details error:", error);
      throw new Error("Failed to get job details");
    }
  }
  async getSalaryStats(params) {
    try {
      const baseUrl = "https://api.adzuna.com/v1/api/jobs/us/salary";
      const searchParams = new URLSearchParams({
        app_id: this.adzunaAppId,
        app_key: this.adzunaAppKey
      });
      if (params.title) {
        searchParams.append("what", params.title);
      }
      if (params.location) {
        searchParams.append("where", params.location);
      }
      const response = await fetch(`${baseUrl}?${searchParams}`);
      if (!response.ok) {
        throw new Error(`Adzuna API error: ${response.status}`);
      }
      const data = await response.json();
      return {
        min: data.min || 0,
        max: data.max || 0,
        median: data.median || 0
      };
    } catch (error) {
      console.error("Salary stats error:", error);
      return null;
    }
  }
  // Placeholder for future CoreSignal integration
  async searchCoreSignalJobs(params) {
    console.log("CoreSignal integration not yet implemented");
    return [];
  }
  // Placeholder for future USAJobs integration
  async searchUSAJobs(params) {
    console.log("USAJobs integration not yet implemented");
    return [];
  }
  // AI-powered skill extraction using OpenAI
  async extractSkillsFromResume(resumeText) {
    try {
      const { aiService: aiService2 } = await Promise.resolve().then(() => (init_ai(), ai_exports));
      const prompt = `Extract the technical and professional skills from this resume text. Return only a JSON array of skills, no additional text.
      
      Focus on:
      - Programming languages and frameworks
      - Tools and technologies 
      - Professional skills and certifications
      - Domain expertise
      
      Resume text:
      ${resumeText}
      
      Return format: ["skill1", "skill2", "skill3"]`;
      const response = await aiService2.generateText(prompt);
      try {
        const skills = JSON.parse(response.trim());
        return Array.isArray(skills) ? skills : [];
      } catch {
        const skillMatches = response.match(/"([^"]+)"/g);
        return skillMatches ? skillMatches.map((s) => s.replace(/"/g, "")) : [];
      }
    } catch (error) {
      console.error("Error extracting skills:", error);
      return [];
    }
  }
};
var jobsService = new JobsService();

// server/beyond-jobs.ts
var BeyondJobsService = class {
  coresignalApiKey = process.env.CORESIGNAL_API_KEY || "";
  constructor() {
    console.log("Beyond Jobs service initialized with working sources:");
    console.log("- GitHub SimplifyJobs (Internships) \u2705");
    console.log("- VolunteerConnector (Volunteer) \u2705");
    if (this.coresignalApiKey) console.log("- CoreSignal (Internships) \u2705");
    else console.log("- CoreSignal \u274C (API key missing - using GitHub only for internships)");
  }
  async searchOpportunities(params) {
    const opportunities2 = [];
    const limit = params.limit || 5;
    const sources = [];
    if (!params.type || params.type === "all" || params.type === "internship") {
      sources.push(this.fetchGitHubInternships());
      if (this.coresignalApiKey) {
        sources.push(this.fetchCoreSignalInternships(params));
      }
    }
    if (!params.type || params.type === "all" || params.type === "volunteer") {
      sources.push(this.fetchVolunteerConnector(params));
    }
    const results = await Promise.allSettled(sources);
    results.forEach((r) => {
      if (r.status === "fulfilled") opportunities2.push(...r.value);
      else console.error("Source failed:", r.reason);
    });
    console.log(`Total opportunities fetched: ${opportunities2.length}`);
    let filtered = opportunities2.sort(() => 0.5 - Math.random());
    if (params.type && params.type !== "all") {
      filtered = filtered.filter((o) => o.type === params.type);
    }
    if (params.remote !== void 0) {
      filtered = filtered.filter((o) => o.remote === params.remote);
    }
    if (params.location) {
      const normalize = (loc) => loc.toLowerCase().replace(/\bnyc\b/g, "new york").replace(/\bny\b/g, "new york").replace(/\bsf\b/g, "san francisco").replace(/\bla\b/g, "los angeles").replace(/\bdc\b/g, "washington");
      const queryLoc = normalize(params.location);
      filtered = filtered.filter(
        (o) => o.location && normalize(o.location).includes(queryLoc)
      );
      console.log(`After location filter (${params.location}): ${filtered.length} opportunities`);
    }
    console.log(`Final result: ${filtered.length} opportunities (limit ${limit})`);
    return filtered.slice(0, limit);
  }
  /** --- GitHub SimplifyJobs Internships --- */
  async fetchGitHubInternships() {
    try {
      const res = await fetch(
        "https://raw.githubusercontent.com/SimplifyJobs/Summer2026-Internships/dev/.github/scripts/listings.json",
        { headers: { "User-Agent": "Pathwise-BeyondJobs/1.0" } }
      );
      if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
      const data = await res.json();
      const listings = Array.isArray(data) ? data : [];
      const active = listings.filter((l) => l && l.active !== false);
      return active.map((l) => ({
        id: `github-${l.id || Math.random().toString(36).slice(2)}`,
        title: l.title || `${l.company_name} Internship`,
        organization: l.company_name || "Company",
        location: l.locations?.join(", ") || "Various",
        type: "internship",
        duration: l.season || l.terms?.join(", ") || "Summer 2026",
        url: l.url || l.application_link || "#",
        description: this.cleanDescription(l.terms?.join(", ") || "Software engineering internship opportunity"),
        remote: l.locations?.some((loc) => loc.toLowerCase().includes("remote")) || false,
        source: "github"
      }));
    } catch (err) {
      console.error("GitHub internships error:", err.message);
      return [];
    }
  }
  /** --- CoreSignal Internships (Premium API) --- */
  async fetchCoreSignalInternships(params) {
    try {
      const body = {
        title: params.keyword || "internship",
        application_active: true
      };
      if (params.location) body.location = params.location;
      const searchRes = await fetch(
        "https://api.coresignal.com/cdapi/v2/job_base/search/filter",
        {
          method: "POST",
          headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
            "ApiKey": this.coresignalApiKey
            // Capital K is critical
          },
          body: JSON.stringify(body)
        }
      );
      if (!searchRes.ok) {
        throw new Error(`CoreSignal search failed: ${searchRes.status}`);
      }
      const ids = await searchRes.json();
      const jobIds = Array.isArray(ids) ? ids.slice(0, 5) : [];
      if (jobIds.length === 0) {
        console.log("CoreSignal returned no job IDs for query:", body);
        return [];
      }
      console.log(`CoreSignal found ${jobIds.length} internship IDs, fetching details...`);
      const details = await Promise.all(
        jobIds.map(async (id) => {
          const collectRes = await fetch(
            `https://api.coresignal.com/cdapi/v2/job_base/collect/${id}`,
            {
              headers: {
                "accept": "application/json",
                "ApiKey": this.coresignalApiKey
              }
            }
          );
          return collectRes.ok ? await collectRes.json() : null;
        })
      );
      const validJobs = details.filter(Boolean);
      console.log(`CoreSignal successfully fetched ${validJobs.length} internship details`);
      return validJobs.map((job) => ({
        id: `coresignal-${job.id}`,
        title: job.title || "Internship",
        organization: job.company_name || "Company",
        location: job.location || "Remote",
        type: "internship",
        duration: job.employment_type || "Varies",
        url: job.url || "#",
        description: this.cleanDescription(job.description || ""),
        remote: job.remote_allowed || job.location?.toLowerCase().includes("remote") || false,
        source: "coresignal"
      }));
    } catch (err) {
      console.error("CoreSignal internships error:", err.message);
      return [];
    }
  }
  /** --- VolunteerConnector (Free API with 968+ opportunities) --- */
  async fetchVolunteerConnector(params) {
    try {
      const searchParams = new URLSearchParams();
      if (params.keyword) searchParams.append("q", params.keyword);
      const res = await fetch(
        `https://www.volunteerconnector.org/api/search/?${searchParams}`,
        { headers: { "Accept": "application/json" } }
      );
      if (!res.ok) throw new Error(`VolunteerConnector returned ${res.status}`);
      const data = await res.json();
      const opportunities2 = data.results || [];
      console.log(`VolunteerConnector returned ${opportunities2.length} volunteer opportunities`);
      return opportunities2.slice(0, 10).map((opp) => ({
        id: `vol-${opp.id}`,
        title: opp.title || "Volunteer Opportunity",
        organization: opp.organization?.name || "Organization",
        location: opp.audience?.regions?.join(", ") || "Various",
        type: "volunteer",
        duration: opp.dates || "Ongoing",
        url: opp.organization?.url || `https://www.volunteerconnector.org/opportunity/${opp.id}`,
        description: this.cleanDescription(opp.description || ""),
        remote: !!opp.remote_or_online,
        source: "volunteer-connector"
      }));
    } catch (err) {
      console.error("VolunteerConnector error:", err.message);
      return [];
    }
  }
  /** Utility: Clean HTML from descriptions */
  cleanDescription(desc2) {
    if (!desc2) return "No description available";
    let cleaned = desc2.replace(/<[^>]*>/g, "").trim();
    if (cleaned.length > 200) cleaned = cleaned.substring(0, 197) + "...";
    return cleaned || "No description available";
  }
  /** AI-powered ranking using GPT */
  async getAIRanking(opportunities2, userSkills, resumeGaps, openaiService) {
    try {
      const gapCategories = resumeGaps.map((gap) => gap.category || gap).filter(Boolean);
      const prompt = `You are a career advisor analyzing experiential opportunities for a student.

Student's Skills: ${userSkills.join(", ") || "General skills"}
Resume Gaps: ${gapCategories.join(", ") || "None identified"}

Analyze these opportunities and rank them by relevance (0-100 score). For each opportunity, provide:
1. A relevance score (0-100)
2. A 1-2 sentence explanation

Opportunities:
${opportunities2.map((opp, i) => `
${i + 1}. ${opp.title} (${opp.type})
   Organization: ${opp.organization}
   Description: ${opp.description}
   Location: ${opp.location}
`).join("\n")}

Respond in JSON with this format:
{ "rankings": [ { "opportunityIndex": 0, "relevanceScore": 85, "matchReason": "..." } ] }`;
      const response = await openaiService.generateText(prompt);
      const rankings = JSON.parse(response).rankings;
      return opportunities2.map((opp, index) => {
        const ranking = rankings.find((r) => r.opportunityIndex === index);
        return {
          ...opp,
          relevanceScore: ranking?.relevanceScore || 50,
          matchReason: ranking?.matchReason || "Potentially relevant opportunity"
        };
      }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error("AI ranking error:", error.message);
      return opportunities2.map((opp) => ({
        ...opp,
        relevanceScore: 50,
        matchReason: "Ranked by source diversity"
      }));
    }
  }
};
var beyondJobsService = new BeyondJobsService();

// server/objectStorage.ts
init_db();
init_schema();
import { createClient } from "@supabase/supabase-js";
import { randomUUID as randomUUID2 } from "crypto";
import { eq as eq3 } from "drizzle-orm";

// server/objectAcl.ts
init_db();
init_schema();
import { eq as eq2 } from "drizzle-orm";
function isPermissionAllowed(requested, granted) {
  if (requested === "read" /* READ */) {
    return ["read" /* READ */, "write" /* WRITE */].includes(granted);
  }
  return granted === "write" /* WRITE */;
}
function createObjectAccessGroup(group) {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}
async function canAccessObjectByPolicy({
  userId,
  aclPolicy,
  requestedPermission
}) {
  if (!aclPolicy) return false;
  if (aclPolicy.visibility === "public" && requestedPermission === "read" /* READ */) {
    return true;
  }
  if (!userId) return false;
  if (aclPolicy.owner === userId) return true;
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (await accessGroup.hasMember(userId) && isPermissionAllowed(requestedPermission, rule.permission)) {
      return true;
    }
  }
  return false;
}
async function setObjectAclPolicy(objectPath, aclPolicy) {
  await db.insert(fileMetadata).values({
    objectPath,
    ownerUserId: aclPolicy.owner,
    visibility: aclPolicy.visibility,
    uploadStatus: "completed"
  }).onConflictDoUpdate({
    target: fileMetadata.objectPath,
    set: { visibility: aclPolicy.visibility }
  });
}
async function getObjectAclPolicy(objectPath) {
  const [row] = await db.select().from(fileMetadata).where(eq2(fileMetadata.objectPath, objectPath)).limit(1);
  if (!row) return null;
  return {
    owner: row.ownerUserId,
    visibility: row.visibility
  };
}

// server/objectStorage.ts
function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for file storage. Find these in your Supabase project \u2192 Settings \u2192 API."
    );
  }
  return createClient(url, key);
}
function getBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || "resumes";
}
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectForbiddenError = class _ObjectForbiddenError extends Error {
  constructor() {
    super("Access denied");
    this.name = "ObjectForbiddenError";
    Object.setPrototypeOf(this, _ObjectForbiddenError.prototype);
  }
};
var ObjectStorageService = class {
  /**
   * Generates a signed upload URL for direct client-side upload to Supabase Storage.
   *
   * The object path embeds the owner's userId to prevent cross-user path collisions.
   * A `pending` DB record is created immediately; call `markUploadCompleted` after
   * confirming the file arrived.
   *
   * @param userId  Authenticated user's ID (from the session).
   * @returns       `{ signedUrl, objectPath }` — return both to the client so it can
   *                send objectPath back when creating the resume record.
   */
  async getObjectEntityUploadURL(userId) {
    const supabase = getSupabaseClient();
    const objectPath = `uploads/${userId}/${randomUUID2()}`;
    const { data, error } = await supabase.storage.from(getBucket()).createSignedUploadUrl(objectPath);
    if (error) {
      throw new Error(`Failed to create signed upload URL: ${error.message}`);
    }
    return { signedUrl: data.signedUrl, objectPath };
  }
  /**
   * Creates a `pending` ownership record in `file_metadata`.
   * Must be called before the signed URL is returned to the client.
   */
  async createPendingUploadRecord(params) {
    await db.insert(fileMetadata).values({
      objectPath: params.objectPath,
      ownerUserId: params.ownerUserId,
      visibility: "private",
      originalFilename: params.originalFilename,
      mimeType: params.mimeType ?? null,
      fileSizeBytes: params.fileSizeBytes ?? null,
      uploadStatus: "pending"
    }).onConflictDoUpdate({
      target: fileMetadata.objectPath,
      set: { uploadStatus: "pending" }
    });
  }
  /**
   * Transitions a `pending` record to `completed` once the client confirms upload.
   * Abandoned `pending` records do not imply a completed upload.
   */
  async markUploadCompleted(objectPath) {
    await db.update(fileMetadata).set({ uploadStatus: "completed" }).where(eq3(fileMetadata.objectPath, objectPath));
  }
  /**
   * Marks a record as `failed` (e.g. client reported upload error).
   */
  async markUploadFailed(objectPath) {
    await db.update(fileMetadata).set({ uploadStatus: "failed" }).where(eq3(fileMetadata.objectPath, objectPath));
  }
  /**
   * Generates a short-lived signed download URL (15-minute TTL).
   * Does NOT enforce ACL — callers must check ownership first.
   */
  async getSignedDownloadURL(objectPath) {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.storage.from(getBucket()).createSignedUrl(objectPath, 900);
    if (error) throw new Error(`Failed to sign download URL: ${error.message}`);
    return data.signedUrl;
  }
  /**
   * Downloads an object to the HTTP response.
   * Checks ownership via `file_metadata` before serving.
   * Pass `requestingUserId` to enforce private-object access control.
   */
  async downloadObject(objectPath, res, requestingUserId, cacheTtlSec = 3600) {
    try {
      const aclPolicy = await getObjectAclPolicy(objectPath);
      const allowed = await canAccessObjectByPolicy({
        userId: requestingUserId,
        aclPolicy,
        requestedPermission: "read" /* READ */
      });
      if (!allowed) {
        if (!res.headersSent) {
          res.status(403).json({ error: "Access denied" });
        }
        return;
      }
      const isPublic = aclPolicy?.visibility === "public";
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.storage.from(getBucket()).download(objectPath);
      if (error) throw new ObjectNotFoundError();
      const buffer = Buffer.from(await data.arrayBuffer());
      res.set({
        "Content-Type": data.type || "application/octet-stream",
        "Content-Length": buffer.length,
        "Cache-Control": `${isPublic ? "public" : "private"}, max-age=${cacheTtlSec}`
      });
      res.end(buffer);
    } catch (error) {
      console.error("Error downloading file:", error);
      if (!res.headersSent) {
        if (error instanceof ObjectNotFoundError) {
          res.status(404).json({ error: "Object not found" });
        } else if (error instanceof ObjectForbiddenError) {
          res.status(403).json({ error: "Access denied" });
        } else {
          res.status(500).json({ error: "Error downloading file" });
        }
      }
    }
  }
  /**
   * Sets an ACL policy for an object path (writes to `file_metadata`).
   */
  async trySetObjectEntityAclPolicy(objectPath, aclPolicy) {
    await setObjectAclPolicy(objectPath, aclPolicy);
    return objectPath;
  }
  /**
   * Checks whether a user can access an object entity.
   */
  async canAccessObjectEntity({
    userId,
    objectPath,
    requestedPermission
  }) {
    const aclPolicy = await getObjectAclPolicy(objectPath);
    return canAccessObjectByPolicy({
      userId,
      aclPolicy,
      requestedPermission: requestedPermission ?? "read" /* READ */
    });
  }
  /**
   * Verifies that an objectPath legitimately belongs to a user.
   * Path format: uploads/{userId}/{uuid}
   */
  static isOwnerPath(objectPath, userId) {
    return objectPath.startsWith(`uploads/${userId}/`);
  }
};

// server/email.ts
import { Resend } from "resend";
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || "Pathwise <noreply@pathwise.nyc>";
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY not found in environment variables. Set it in Vercel \u2192 Project \u2192 Settings \u2192 Environment Variables."
    );
  }
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}
var EmailService = class {
  getBaseUrl() {
    if (process.env.APP_URL) {
      return process.env.APP_URL;
    }
    return "http://localhost:5000";
  }
  async sendEmailVerification(data) {
    try {
      const { client, fromEmail } = getResendClient();
      const verificationUrl = `${this.getBaseUrl()}/verify-email?token=${data.token}`;
      const displayName = data.institutionName || "Pathwise";
      const logoUrl = "https://pathwise.nyc/pathwise-logo.png";
      const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#0f172a;padding:28px 40px;">
              <img src="${logoUrl}" alt="Pathwise" width="48" height="48" style="display:block;border-radius:10px;" />
              <p style="margin:10px 0 0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Pathwise</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <h1 style="margin:0 0 20px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">Confirm your email address</h1>
              <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.6;">
                Welcome to ${displayName}! Please verify your email address to activate your account and get started.
              </p>

              <!-- CTA button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#4f46e5;">
                    <a href="${verificationUrl}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#4f46e5;letter-spacing:0.1px;">
                      Verify email address
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Plain-text URL fallback -->
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">Button not working? Copy and paste this link into your browser:</p>
              <p style="margin:0 0 28px;font-size:12px;color:#4f46e5;word-break:break-all;">${verificationUrl}</p>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
              </table>

              <!-- Security note -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-left:3px solid #e2e8f0;border-radius:0 6px 6px 0;padding:14px 16px;">
                <tr>
                  <td style="font-size:13px;color:#64748b;line-height:1.6;">
                    <strong style="color:#475569;">Note:</strong> This link expires in <strong>24 hours</strong>. If you didn't create a Pathwise account, you can safely ignore this email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                This email was sent by Pathwise &middot; <a href="https://pathwise.nyc" style="color:#94a3b8;text-decoration:underline;">pathwise.nyc</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
      const text2 = `Welcome to ${displayName}!

Please verify your email address to activate your Pathwise account:
${verificationUrl}

This link expires in 24 hours.

If you didn't create a Pathwise account, you can safely ignore this email.

---
Pathwise \xB7 https://pathwise.nyc`;
      await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: `Verify your email for Pathwise`,
        html,
        text: text2
      });
      return true;
    } catch (error) {
      console.error("\u274C Failed to send email verification:", error);
      return false;
    }
  }
  async sendInvitation(data) {
    try {
      const { client, fromEmail } = getResendClient();
      const invitationUrl = `${this.getBaseUrl()}/register?token=${data.token}`;
      const result = await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: `You're invited to join ${data.institutionName} on Pathwise`,
        html: `
          <p><strong>${data.inviterName}</strong> invited you to join <strong>${data.institutionName}</strong> on Pathwise as a ${data.role}.</p>
          <p><a href="${invitationUrl}" style="color:#667eea;">Accept Invitation</a></p>
        `
      });
      console.log(`\u2705 Invitation email sent to ${data.email}: ${result.data?.id}`);
      return true;
    } catch (error) {
      console.error("\u274C Failed to send invitation email:", error);
      return false;
    }
  }
  async sendLicenseUsageNotification(data) {
    try {
      const { client, fromEmail } = getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: data.adminEmail,
        subject: `License usage alert for ${data.institutionName}`,
        html: `
          <p>${data.institutionName} has used ${data.usedSeats}/${data.totalSeats} seats (${data.usagePercentage}%).</p>
          <p>Please monitor your usage or consider upgrading.</p>
        `
      });
      return true;
    } catch (error) {
      console.error("\u274C Failed to send license usage notification:", error);
      return false;
    }
  }
  async sendContactForm(data) {
    try {
      const { client, fromEmail } = getResendClient();
      const fullName = `${data.firstName} ${data.lastName}`;
      const subject = `[${data.category}] New contact form submission from ${fullName}`;
      const userLine = data.userId ? `<p><strong>User ID:</strong> ${data.userId}</p>` : "";
      await client.emails.send({
        from: fromEmail,
        to: "contact@pathwise.nyc",
        replyTo: data.email,
        subject,
        html: `
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Category:</strong> ${data.category}</p>
          ${userLine}
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;">${data.message}</p>
        `,
        text: `Name: ${fullName}
Email: ${data.email}
Category: ${data.category}${data.userId ? `
User ID: ${data.userId}` : ""}

Message:
${data.message}`
      });
      return true;
    } catch (error) {
      console.error("\u274C Failed to send contact form email:", error);
      return false;
    }
  }
  async sendPasswordReset(data) {
    try {
      const { client, fromEmail } = getResendClient();
      const resetUrl = `${this.getBaseUrl()}/reset-password?token=${data.token}`;
      const logoUrl = "https://pathwise.nyc/pathwise-logo.png";
      const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <!-- Card -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#0f172a;padding:28px 40px;">
              <img src="${logoUrl}" alt="Pathwise" width="48" height="48" style="display:block;border-radius:10px;" />
              <p style="margin:10px 0 0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Pathwise</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">Reset your password</h1>
              <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.6;">
                Hi ${data.userName},
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.6;">
                Someone (hopefully you) requested a password reset for your Pathwise account. Click the button below to choose a new password. If you didn't make this request, you can safely ignore this email \u2014 your password won't change.
              </p>

              <!-- CTA button (table-based for Outlook compatibility) -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#4f46e5;">
                    <a href="${resetUrl}"
                       target="_blank"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#4f46e5;letter-spacing:0.1px;">
                      Set new password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Plain-text URL fallback -->
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">Button not working? Copy and paste this link into your browser:</p>
              <p style="margin:0 0 28px;font-size:12px;color:#4f46e5;word-break:break-all;">${resetUrl}</p>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
              </table>

              <!-- Security note -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-left:3px solid #e2e8f0;border-radius:0 6px 6px 0;padding:14px 16px;margin:0 0 0 0;">
                <tr>
                  <td style="font-size:13px;color:#64748b;line-height:1.6;">
                    <strong style="color:#475569;">Security notice:</strong> This link expires in <strong>1 hour</strong>. If you didn't request a password reset, no action is needed \u2014 your password remains unchanged and your account is secure.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                This email was sent by Pathwise &middot; <a href="https://pathwise.nyc" style="color:#94a3b8;text-decoration:underline;">pathwise.nyc</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
      const text2 = `Hi ${data.userName},

Someone (hopefully you) requested a password reset for your Pathwise account.

Click the link below to set a new password:
${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.

---
Pathwise \xB7 https://pathwise.nyc`;
      await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: "Reset your Pathwise password",
        html,
        text: text2
      });
      return true;
    } catch (error) {
      console.error("\u274C Failed to send password reset email:", error);
      return false;
    }
  }
  async sendWelcomeEmail(data) {
    try {
      const { client, fromEmail } = getResendClient();
      const logoUrl = "https://pathwise.nyc/pathwise-logo.png";
      const donateUrl = "https://donate.stripe.com/00wdR8ab1gSxbQygjLak001";
      const features = [
        { name: "Resume Analysis", desc: "Get a detailed score and a section-by-section breakdown of your resume, with specific improvements, gaps to fix, and recommended resources." },
        { name: "Job Match Analysis", desc: "Paste a job posting and see how well you match, complete with a match score, a tailored resume, and a custom cover letter for that specific role." },
        { name: "Career Match", desc: "Upload your resume and receive a ranked list of careers that fit your background, each with a score and a thorough explanation of why it's a strong match." },
        { name: "Career Roadmap", desc: "Get a structured 3-6 month plan to reach your target role, with milestones, skills to build, and curated resources along the way." },
        { name: "Micro-Projects", desc: "Receive portfolio project ideas tailored to your goals, complete with datasets, tutorials, and starter code to help you build them." },
        { name: "Mock Interview", desc: "Practice a realistic video interview that asks questions aloud, then critiques both what you said and how you said it (pacing, filler words, structure, and more)." },
        { name: "Salary Negotiation", desc: "Get a market-grounded negotiation strategy, an honest assessment of your leverage, and a ready-to-use script or email." },
        { name: "Networking", desc: "Discover niche networking opportunities for your field, including local events, LinkedIn groups, and online communities." },
        { name: "Resume <-> CV Converter", desc: "Convert your resume into a CV or condense a CV into a focused resume, and export it as a Word document." }
      ];
      const featureRows = features.map(
        (f) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0f172a;">${f.name}</p>
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">${f.desc}</p>
            </td>
          </tr>`
      ).join("");
      const featureText = features.map((f) => `\u2022 ${f.name} \u2014 ${f.desc}`).join("\n\n");
      const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:#0f172a;padding:28px 40px;">
              <img src="${logoUrl}" alt="Pathwise" width="48" height="48" style="display:block;border-radius:10px;" />
              <p style="margin:10px 0 0;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">Pathwise</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">Hi ${data.firstName},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Thank you for registering for Pathwise NYC. We're genuinely glad you're here.
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.6;">
                Our mission is simple: to bring you one step closer to closing the gap between where you are now and the career of your dreams. Everything we build is aimed at making your job search and career development clearer, faster, and less overwhelming.
              </p>

              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#0f172a;">Here's everything you can do with Pathwise:</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                ${featureRows}
              </table>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr><td style="border-top:1px solid #e2e8f0;"></td></tr>
              </table>

              <p style="margin:0 0 16px;font-size:14px;color:#475569;line-height:1.6;">
                We're committed to keeping Pathwise free and accessible. If you believe in what we're building and want to help us keep it that way, you can support us here:
              </p>

              <!-- Donate button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#0f172a;">
                    <a href="${donateUrl}"
                       target="_blank"
                       style="display:inline-block;padding:12px 28px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#0f172a;letter-spacing:0.1px;">
                      Support Pathwise
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 20px;font-size:14px;color:#475569;line-height:1.6;">
                Every contribution, big or small, helps us keep these tools free for job seekers everywhere.
              </p>

              <p style="margin:0;font-size:14px;color:#475569;line-height:1.6;">
                Have a question, an issue, or an idea to make Pathwise better? Just email us at
                <a href="mailto:contact@pathwise.nyc" style="color:#4f46e5;text-decoration:none;">contact@pathwise.nyc</a> \u2014 we read every message.
              </p>

              <p style="margin:20px 0 0;font-size:15px;color:#0f172a;font-weight:500;line-height:1.6;">
                Welcome aboard, and here's to closing the gap.<br />
                <span style="font-weight:400;color:#64748b;">The Pathwise NYC Team</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                This email was sent by Pathwise &middot; <a href="https://pathwise.nyc" style="color:#94a3b8;text-decoration:underline;">pathwise.nyc</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
      const text2 = `Hi ${data.firstName},

Thank you for registering for Pathwise NYC. We're genuinely glad you're here.

Our mission is simple: to bring you one step closer to closing the gap between where you are now and the career of your dreams. Everything we build is aimed at making your job search and career development clearer, faster, and less overwhelming.

Here's everything you can do with Pathwise:

${featureText}

We're committed to keeping Pathwise free and accessible. If you believe in what we're building and want to help us keep it that way, you can support us here:
${donateUrl}

Every contribution, big or small, helps us keep these tools free for job seekers everywhere.

Have a question, an issue, or an idea to make Pathwise better? Just email us at contact@pathwise.nyc \u2014 we read every message.

Welcome aboard, and here's to closing the gap.

The Pathwise NYC Team

---
Pathwise \xB7 https://pathwise.nyc`;
      await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: "Welcome to Pathwise NYC \u2014 let's close the gap to your dream career",
        html,
        text: text2
      });
      console.log(`\u2705 Welcome email sent to ${data.email}`);
      return true;
    } catch (error) {
      console.error("\u274C Failed to send welcome email:", error);
      return false;
    }
  }
  async sendAdminWelcome(data) {
    try {
      const { client, fromEmail } = getResendClient();
      const loginUrl = `${this.getBaseUrl()}/login`;
      await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: `Welcome to Pathwise (${data.institutionName})`,
        html: `
          <p>Welcome to Pathwise! Your institution <strong>${data.institutionName}</strong> is now active.</p>
          <p><strong>Login:</strong> ${data.email}</p>
          <p><strong>Temp Password:</strong> ${data.password}</p>
          <p>Seats: ${data.studentLimit}<br>License Ends: ${data.licenseEndDate}</p>
          <p><a href="${loginUrl}" style="color:#667eea;">Login Now</a></p>
        `
      });
      console.log(`\u2705 Admin welcome email sent to ${data.email}`);
      return true;
    } catch (error) {
      console.error("\u274C Failed to send admin welcome email:", error);
      return false;
    }
  }
};
var emailService = new EmailService();

// server/routes.ts
init_schema();
import crypto3 from "crypto";
import { z as z3 } from "zod";
import { fromZodError } from "zod-validation-error";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
function parseResumeContentToDocx(resumeText) {
  const paragraphs = [];
  const lines = resumeText.split("\n").map((line) => line.trim()).filter((line) => line.length > 0);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isSectionHeader = line === line.toUpperCase() && line.length > 2 && line.length < 50 || /^(PROFESSIONAL SUMMARY|SUMMARY|EXPERIENCE|EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS|ACHIEVEMENTS|CONTACT|OBJECTIVE)/i.test(line);
    if (isSectionHeader) {
      paragraphs.push(
        new Paragraph({
          text: line,
          heading: HeadingLevel.HEADING_2,
          spacing: {
            before: 200,
            after: 100
          }
        })
      );
    } else {
      paragraphs.push(
        new Paragraph({
          text: line,
          spacing: {
            after: 100
          }
        })
      );
    }
  }
  return paragraphs;
}
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validationResult = registerSchema.safeParse(req.body);
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.message });
      }
      const { email, password, school, major, gradYear, invitationToken, selectedPlan } = req.body;
      const firstName = req.body.firstName || "";
      const lastName = req.body.lastName || "";
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.isActive) {
        return res.status(400).json({ error: "User already exists" });
      }
      if (existingUser && !existingUser.isActive) {
        const reactivatedUser = await storage.activateUser(existingUser.id);
        const token = generateToken();
        await storage.createSession(reactivatedUser.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3));
        return res.status(200).json({
          message: "User reactivated successfully",
          user: reactivatedUser,
          token
        });
      }
      let invitation = null;
      let institutionId = null;
      let userRole = "student";
      let subscriptionTier = "free";
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
        subscriptionTier = "institutional";
        if (userRole === "student") {
          const seatInfo = await storage.checkSeatAvailability(institutionId);
          if (!seatInfo.available) {
            return res.status(400).json({
              error: "No available seats. Please contact your administrator."
            });
          }
        }
      } else {
        const domain = email.split("@")[1];
        const institution = await storage.getInstitutionByDomain(domain);
        if (institution) {
          institutionId = institution.id;
          subscriptionTier = "institutional";
          const seatInfo = await storage.checkSeatAvailability(institutionId);
          if (!seatInfo.available) {
            return res.status(400).json({
              error: "No available seats. Please contact your administrator."
            });
          }
        } else {
          institutionId = null;
          userRole = "student";
          subscriptionTier = selectedPlan === "paid" ? "paid" : "free";
        }
      }
      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        institutionId,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: userRole,
        school,
        major,
        gradYear,
        subscriptionTier,
        subscriptionStatus: subscriptionTier === "paid" ? "incomplete" : "active",
        isActive: !!(invitation || subscriptionTier === "paid"),
        isVerified: !!(invitation || subscriptionTier === "paid")
      });
      if (invitation) {
        await storage.claimInvitation(invitationToken, user.id);
      }
      if (userRole === "student" && institutionId) {
        const license = await storage.getInstitutionLicense(institutionId);
        if (license && license.licenseType === "per_student") {
          await storage.updateLicenseUsage(license.id, license.usedSeats + 1);
          const seatInfo = await storage.checkSeatAvailability(institutionId);
          if (license.licensedSeats && seatInfo.usedSeats >= license.licensedSeats * 0.8) {
            const institution = await storage.getInstitution(institutionId);
            const adminUsers = await storage.getInstitutionUsers(institutionId);
            const admins = adminUsers.filter((u) => u.role === "admin");
            for (const admin of admins) {
              await emailService.sendLicenseUsageNotification({
                adminEmail: admin.email,
                institutionName: institution?.name || "Unknown Institution",
                usedSeats: seatInfo.usedSeats,
                totalSeats: seatInfo.totalSeats || 0,
                usagePercentage: Math.round(seatInfo.usedSeats / (seatInfo.totalSeats || 1) * 100)
              });
            }
          }
        }
      }
      console.log(`\u2705 User registered successfully: ${user.id} (${userRole}) for institution ${institutionId}`);
      await storage.createActivity(
        user.id,
        "account_created",
        "Welcome to Pathwise!",
        "Your account is ready to use."
      );
      if (subscriptionTier === "paid") {
        if (!stripe) {
          return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." });
        }
        if (!process.env.STRIPE_PRICE_ID) {
          return res.status(500).json({ error: "Stripe Price ID is not configured. Please add STRIPE_PRICE_ID to your environment variables." });
        }
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        await storage.updateUser(user.id, { stripeCustomerId: customer.id });
        const referer = req.get("referer") || "http://localhost:5000";
        const url = new URL(referer);
        const baseUrl = `${url.protocol}//${url.host}`;
        const session = await stripe.checkout.sessions.create({
          customer: customer.id,
          mode: "subscription",
          payment_method_types: ["card"],
          line_items: [
            {
              price: process.env.STRIPE_PRICE_ID,
              quantity: 1
            }
          ],
          success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}/register`,
          metadata: {
            userId: user.id
          },
          allow_promotion_codes: true
          // Enable promo code field in Stripe checkout
        });
        void emailService.sendWelcomeEmail({ email: user.email, firstName });
        return res.status(201).json({
          message: "Registration successful! Redirecting to payment...",
          user: { ...user, password: void 0 },
          requiresPayment: true,
          checkoutUrl: session.url,
          requiresVerification: false
        });
      }
      if (invitation) {
        const token = generateToken();
        await storage.createSession(user.id, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3));
        if (userRole === "student") {
          void emailService.sendWelcomeEmail({ email: user.email, firstName });
        }
        return res.status(201).json({
          message: "Registration successful! You can now log in.",
          user: { ...user, password: void 0 },
          token,
          requiresVerification: false
        });
      }
      const verificationToken = generateToken();
      const verificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      await storage.createEmailVerification({
        email: user.email,
        token: verificationToken,
        expiresAt: verificationExpiresAt,
        isUsed: false
      });
      let institutionDisplayName = "Pathwise";
      if (institutionId) {
        const inst = await storage.getInstitution(institutionId);
        if (inst) institutionDisplayName = inst.name;
      }
      await emailService.sendEmailVerification({
        email: user.email,
        token: verificationToken,
        institutionName: institutionDisplayName
      });
      void emailService.sendWelcomeEmail({ email: user.email, firstName });
      return res.status(201).json({
        message: "Account created! Please check your email to verify your address.",
        requiresVerification: true,
        email: user.email
      });
    } catch (error) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
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
      await storage.createActivity(
        user.id,
        "user_login",
        "Logged In",
        `Welcome back, ${user.firstName}!`
      );
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: false,
        // Set to true in production with HTTPS
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3
        // 7 days
      });
      res.json({
        user: { ...user, password: void 0 },
        token
      });
    } catch (error) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", authenticate, async (req, res) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.auth_token;
      if (token) {
        await logout(token);
      }
      res.clearCookie("auth_token");
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
  app2.get("/api/auth/me", authenticate, async (req, res) => {
    res.json(req.user);
  });
  app2.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({
          message: "If an account with that email exists, you will receive a password reset link shortly."
        });
      }
      const resetToken = generateToken();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1e3);
      await storage.createPasswordResetToken({
        userId: user.id,
        token: resetToken,
        expiresAt,
        isUsed: false
      });
      await emailService.sendPasswordReset({
        email: user.email,
        token: resetToken,
        userName: user.firstName
      });
      res.json({
        message: "If an account with that email exists, you will receive a password reset link shortly."
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Failed to process password reset request" });
    }
  });
  app2.get("/api/auth/reset-password/:token", async (req, res) => {
    try {
      const { token } = req.params;
      if (!token) {
        return res.status(400).json({ error: "Token is required" });
      }
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
  app2.post("/api/auth/reset-password", async (req, res) => {
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
      const resetToken = await storage.getPasswordResetToken(token);
      if (!resetToken) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      const hashedPassword = await hashPassword(password);
      await storage.updateUser(resetToken.userId, {
        password: hashedPassword
      });
      await storage.markPasswordResetTokenAsUsed(token);
      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  app2.post("/api/promo-codes/validate", async (req, res) => {
    try {
      const { code } = req.body;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "Promo code is required" });
      }
      const promoCode = await storage.getPromoCodeByCode(code.trim().toUpperCase());
      if (!promoCode) {
        return res.status(404).json({ error: "Invalid or expired promo code" });
      }
      if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
        return res.status(400).json({ error: "Promo code has reached maximum uses" });
      }
      return res.json({
        valid: true,
        type: promoCode.type,
        code: promoCode.code
      });
    } catch (error) {
      console.error("Promo code validation error:", error);
      res.status(500).json({ error: "Failed to validate promo code" });
    }
  });
  app2.patch("/api/users/settings", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const settingsSchema = z3.object({
        firstName: z3.string().min(1).optional(),
        lastName: z3.string().min(1).optional(),
        school: z3.string().optional(),
        major: z3.string().optional(),
        gradYear: z3.number().int().min(2e3).max(2040).optional(),
        targetRole: z3.string().optional(),
        location: z3.string().optional(),
        remoteOk: z3.boolean().optional()
      });
      const validated = settingsSchema.parse(updateData);
      const updatedUser = await storage.updateUser(userId, validated);
      res.json(updatedUser);
    } catch (error) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Update settings error:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  });
  app2.get("/api/admin/env-check", async (req, res) => {
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
  app2.get("/api/admin/institutions", authenticate, requireSuperAdmin, async (req, res) => {
    try {
      const institutions2 = await storage.listInstitutions();
      const institutionsWithDetails = await Promise.all(
        institutions2.map(async (inst) => {
          const license = await storage.getInstitutionLicense(inst.id);
          const users2 = await storage.getInstitutionUsers(inst.id, true);
          const seatInfo = license ? await storage.checkSeatAvailability(inst.id) : null;
          return {
            ...inst,
            license: license ? {
              ...license,
              seatInfo
            } : null,
            activeUsers: users2.length
          };
        })
      );
      res.json(institutionsWithDetails);
    } catch (error) {
      console.error("Error listing institutions:", error);
      res.status(500).json({ error: "Failed to list institutions" });
    }
  });
  app2.delete("/api/admin/institutions/:id", authenticate, requireSuperAdmin, async (req, res) => {
    try {
      const institution = await storage.getInstitution(req.params.id);
      if (!institution) {
        return res.status(404).json({ error: "Institution not found" });
      }
      await storage.deleteInstitution(req.params.id);
      res.json({ message: "Institution deleted successfully" });
    } catch (error) {
      console.error("Error deleting institution:", error);
      res.status(500).json({ error: "Failed to delete institution" });
    }
  });
  app2.post("/api/admin/onboard-institution", authenticate, requireSuperAdmin, async (req, res) => {
    try {
      const onboardSchema = z3.object({
        name: z3.string().min(1),
        adminEmail: z3.string().email(),
        studentLimit: z3.number().int().positive(),
        licenseStart: z3.string(),
        licenseEnd: z3.string()
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
        isActive: true
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
        isActive: true
      });
      const tempPassword = crypto3.randomBytes(16).toString("base64").slice(0, 12);
      const hashedPassword = await hashPassword(tempPassword);
      const adminUser = await storage.createUser({
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        institutionId: institution.id,
        isVerified: true,
        isActive: true,
        subscriptionTier: "institutional"
      });
      const emailSent = await emailService.sendAdminWelcome({
        email: adminEmail,
        password: tempPassword,
        institutionName: name,
        studentLimit,
        licenseEndDate: new Date(licenseEnd).toLocaleDateString()
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
    } catch (error) {
      if (error.name === "ZodError") {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.toString() });
      }
      console.error("Error onboarding institution:", error);
      res.status(500).json({ error: "Failed to onboard institution" });
    }
  });
  app2.post("/api/institutions", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Only super admins can create institutions" });
      }
      const institutionData = insertInstitutionSchema.parse(req.body);
      const institution = await storage.createInstitution(institutionData);
      res.json(institution);
    } catch (error) {
      console.error("Error creating institution:", error);
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/institutions/:id", authenticate, async (req, res) => {
    try {
      const institution = await storage.getInstitution(req.params.id);
      if (!institution) {
        return res.status(404).json({ error: "Institution not found" });
      }
      if (req.user.role !== "super_admin" && req.user.institutionId !== institution.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(institution);
    } catch (error) {
      console.error("Error fetching institution:", error);
      res.status(500).json({ error: "Failed to fetch institution" });
    }
  });
  app2.post("/api/institutions/:id/license", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Only super admins can create licenses" });
      }
      const licenseData = insertLicenseSchema.parse({
        ...req.body,
        institutionId: req.params.id
      });
      const license = await storage.createLicense(licenseData);
      res.json(license);
    } catch (error) {
      console.error("Error creating license:", error);
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/institutions/:id/license", authenticate, async (req, res) => {
    try {
      const license = await storage.getInstitutionLicense(req.params.id);
      if (!license) {
        return res.status(404).json({ error: "No active license found" });
      }
      if (req.user.role !== "super_admin" && req.user.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const seatInfo = await storage.checkSeatAvailability(req.params.id);
      res.json({
        ...license,
        seatInfo
      });
    } catch (error) {
      console.error("Error fetching license:", error);
      res.status(500).json({ error: "Failed to fetch license" });
    }
  });
  app2.post("/api/institutions/:id/invite", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can send invitations" });
      }
      if (req.user.role === "admin" && req.user.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const { email, role = "student" } = inviteUserSchema.parse({
        ...req.body,
        institutionId: req.params.id
      });
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists" });
      }
      const seatInfo = await storage.checkSeatAvailability(req.params.id);
      if (!seatInfo.available && role === "student") {
        return res.status(400).json({
          error: "No available seats. Please upgrade your license or deactivate inactive users."
        });
      }
      const token = crypto3.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
      const invitation = await storage.createInvitation({
        institutionId: req.params.id,
        email,
        role,
        invitedBy: req.user.id,
        token,
        expiresAt
      });
      const institution = await storage.getInstitution(req.params.id);
      const emailSent = await emailService.sendInvitation({
        email,
        token,
        institutionName: institution?.name || "Unknown Institution",
        inviterName: `${req.user.firstName} ${req.user.lastName}`,
        role
      });
      if (!emailSent) {
        console.warn("Failed to send invitation email - this is likely due to Resend requiring domain verification for production use");
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
    } catch (error) {
      console.error("Error sending invitation:", error);
      res.status(400).json({ error: error.message });
    }
  });
  app2.get("/api/institutions/:id/users", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can view user lists" });
      }
      if (req.user.role === "admin" && req.user.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const users2 = await storage.getInstitutionUsers(req.params.id);
      const invitations2 = await storage.getInstitutionInvitations(req.params.id);
      const license = await storage.getInstitutionLicense(req.params.id);
      const seatInfo = await storage.checkSeatAvailability(req.params.id);
      res.json({
        users: users2.map((user) => ({
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
        invitations: invitations2.map((inv) => ({
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
    } catch (error) {
      console.error("Error fetching institution users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.get("/api/institutions/:institutionId/users/:userId/details", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can view student details" });
      }
      if (req.user.role === "admin" && req.user.institutionId !== req.params.institutionId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const user = await storage.getUser(req.params.userId);
      if (!user || user.institutionId !== req.params.institutionId) {
        return res.status(404).json({ error: "User not found" });
      }
      const resumes2 = await storage.getUserResumes(req.params.userId);
      const activeResume = resumes2.find((r) => r.isActive);
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
    } catch (error) {
      console.error("Error fetching student details:", error);
      res.status(500).json({ error: "Failed to fetch student details" });
    }
  });
  app2.delete("/api/institutions/:id/users/:userId", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can terminate users" });
      }
      if (req.user.role === "admin" && req.user.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      if (req.user.id === req.params.userId) {
        return res.status(400).json({ error: "Cannot terminate your own account" });
      }
      const userToTerminate = await storage.getUser(req.params.userId);
      if (!userToTerminate || userToTerminate.institutionId !== req.params.id) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.deactivateUser(req.params.userId);
      await storage.deleteUserSessions(req.params.userId);
      if (userToTerminate.institutionId) {
        const license = await storage.getInstitutionLicense(userToTerminate.institutionId);
        if (license && license.licenseType === "per_student" && userToTerminate.role === "student") {
          await storage.updateLicenseUsage(license.id, Math.max(0, license.usedSeats - 1));
        }
      }
      res.json({ message: "User terminated successfully" });
    } catch (error) {
      console.error("Error terminating user:", error);
      res.status(500).json({ error: "Failed to terminate user" });
    }
  });
  app2.delete("/api/institutions/:id/invitations/:invitationId", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        return res.status(403).json({ error: "Only admins can cancel invitations" });
      }
      if (req.user.role === "admin" && req.user.institutionId !== req.params.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const invitation = await storage.getInvitation(req.params.invitationId);
      if (!invitation || invitation.institutionId !== req.params.id) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      if (invitation.status !== "pending") {
        return res.status(400).json({ error: "Can only cancel pending invitations" });
      }
      await storage.cancelInvitation(req.params.invitationId);
      res.json({ message: "Invitation cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling invitation:", error);
      res.status(500).json({ error: "Failed to cancel invitation" });
    }
  });
  app2.post("/api/verify-email", async (req, res) => {
    try {
      const { token } = verifyEmailSchema.parse(req.body);
      const verification = await storage.getEmailVerification(token);
      if (!verification) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }
      const user = await storage.getUserByEmail(verification.email);
      if (user) {
        await storage.updateUser(user.id, { isVerified: true });
        await storage.activateUser(user.id);
        await storage.markEmailVerificationUsed(token);
        if (user.institutionId) {
          const license = await storage.getInstitutionLicense(user.institutionId);
          if (license && license.licenseType === "per_student") {
            await storage.updateLicenseUsage(license.id, license.usedSeats + 1);
            const seatInfo = await storage.checkSeatAvailability(user.institutionId);
            if (license.licensedSeats && seatInfo.usedSeats >= license.licensedSeats * 0.8) {
              const institution = await storage.getInstitution(user.institutionId);
              const adminUsers = await storage.getInstitutionUsers(user.institutionId);
              const admins = adminUsers.filter((u) => u.role === "admin");
              for (const admin of admins) {
                await emailService.sendLicenseUsageNotification({
                  adminEmail: admin.email,
                  institutionName: institution?.name || "Unknown Institution",
                  usedSeats: seatInfo.usedSeats,
                  totalSeats: seatInfo.totalSeats || 0,
                  usagePercentage: Math.round(seatInfo.usedSeats / (seatInfo.totalSeats || 1) * 100)
                });
              }
            }
          }
        }
        res.json({ message: "Email verified successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(400).json({ error: error.message });
    }
  });
  app2.post("/api/resumes/upload", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const { contentType, fileSizeBytes, originalFilename } = req.body;
      const allowedTypes = [
        "application/pdf",
        "text/plain",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      if (contentType && !allowedTypes.includes(contentType)) {
        return res.status(400).json({ error: "Only PDF, plain text (.txt), and DOCX files are allowed." });
      }
      const MAX_BYTES = 10 * 1024 * 1024;
      if (fileSizeBytes && fileSizeBytes > MAX_BYTES) {
        return res.status(400).json({ error: "File must be 10 MB or smaller." });
      }
      const objectStorage = new ObjectStorageService();
      const { signedUrl, objectPath } = await objectStorage.getObjectEntityUploadURL(userId);
      await objectStorage.createPendingUploadRecord({
        objectPath,
        ownerUserId: userId,
        originalFilename: originalFilename || "resume",
        mimeType: contentType ?? null,
        fileSizeBytes: fileSizeBytes ?? null
      });
      res.json({ uploadURL: signedUrl, objectPath });
    } catch (error) {
      console.error("Resume upload URL error:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });
  app2.post("/api/resumes", authenticate, async (req, res) => {
    try {
      console.log("=== POST /api/resumes CALLED ===");
      console.log("User ID:", req.user?.id);
      console.log("Request body:", {
        fileName: req.body.fileName,
        filePath: req.body.filePath,
        extractedTextLength: req.body.extractedText?.length,
        hasTargetRole: !!req.body.targetRole
      });
      const { fileName, filePath, extractedText, targetRole, targetIndustry, targetCompanies } = req.body;
      if (!extractedText) {
        console.log("ERROR: extractedText is missing or empty");
        return res.status(400).json({ error: "extractedText is required" });
      }
      const resume = await storage.createResume({
        userId: req.user.id,
        fileName: fileName || "resume.txt",
        filePath: filePath || "/text-input",
        extractedText
      });
      await storage.createActivity(
        req.user.id,
        "resume_uploaded",
        "Resume Uploaded",
        `Uploaded new resume: ${fileName || "resume.txt"}`
      );
      if (extractedText && targetRole) {
        try {
          const analysis = await aiService.analyzeResume(
            req.user.id,
            extractedText,
            targetRole,
            targetIndustry,
            targetCompanies
          );
          console.log("AI Analysis Response:", JSON.stringify(analysis, null, 2));
          let finalRmsScore = analysis.rmsScore;
          if (!finalRmsScore || finalRmsScore === 0) {
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
            targetRole,
            targetIndustry,
            targetCompanies,
            analysisHash: analysis.analysisHash
          });
          await storage.createResumeAnalysisHistory({
            userId: req.user.id,
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
          await storage.createActivity(
            req.user.id,
            "resume_analyzed",
            "Resume Analysis Complete",
            `Your resume scored ${finalRmsScore}/100`
          );
        } catch (aiError) {
          console.error("AI analysis error:", aiError);
        }
      }
      console.log("=== Resume created successfully ===");
      console.log("Resume ID:", resume.id);
      res.status(201).json(resume);
    } catch (error) {
      console.error("Resume creation error:", error);
      res.status(500).json({ error: "Failed to create resume" });
    }
  });
  app2.post("/api/resumes/:id/analyze", authenticate, requireFeature("resume_analysis"), async (req, res) => {
    try {
      const { id } = req.params;
      const { targetRole, targetIndustry, targetCompanies } = req.body;
      if (!targetRole) {
        return res.status(400).json({ error: "targetRole is required" });
      }
      const resumes2 = await storage.getUserResumes(req.user.id);
      const resume = resumes2.find((r) => r.id === id);
      if (!resume) {
        return res.status(404).json({ error: "Resume not found" });
      }
      if (!resume.extractedText) {
        return res.status(400).json({ error: "Resume has no text content" });
      }
      try {
        const analysis = await aiService.analyzeResume(
          req.user.id,
          resume.extractedText,
          targetRole,
          targetIndustry,
          targetCompanies
        );
        console.log("AI Re-Analysis Response:", JSON.stringify(analysis, null, 2));
        let finalRmsScore = analysis.rmsScore;
        if (!finalRmsScore || finalRmsScore === 0) {
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
          targetRole,
          targetIndustry,
          targetCompanies,
          analysisHash: analysis.analysisHash
        });
        await storage.createResumeAnalysisHistory({
          userId: req.user.id,
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
        await storage.createActivity(
          req.user.id,
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
  app2.get("/api/resumes", authenticate, async (req, res) => {
    try {
      const resumes2 = await storage.getUserResumes(req.user.id);
      res.json(resumes2);
    } catch (error) {
      console.error("Get resumes error:", error);
      res.status(500).json({ error: "Failed to get resumes" });
    }
  });
  app2.get("/api/resumes/active", authenticate, async (req, res) => {
    try {
      const resume = await storage.getActiveResume(req.user.id);
      res.json(resume || null);
    } catch (error) {
      console.error("Get active resume error:", error);
      res.status(500).json({ error: "Failed to get active resume" });
    }
  });
  app2.get("/api/resume-analysis-history", authenticate, async (req, res) => {
    try {
      const { targetRole, targetIndustry, startDate, endDate } = req.query;
      const filters = {};
      if (targetRole) filters.targetRole = targetRole;
      if (targetIndustry) filters.targetIndustry = targetIndustry;
      if (startDate) filters.startDate = new Date(startDate);
      if (endDate) filters.endDate = new Date(endDate);
      const history = await storage.getUserResumeAnalysisHistory(req.user.id, filters);
      res.json(history);
    } catch (error) {
      console.error("Get resume analysis history error:", error);
      res.status(500).json({ error: "Failed to get resume analysis history" });
    }
  });
  app2.get("/api/institutions/:institutionId/users/:userId/resume-analysis-history", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin" && req.user.role !== "institution_admin") {
        return res.status(403).json({ error: "Only admins can view user analysis history" });
      }
      if ((req.user.role === "admin" || req.user.role === "institution_admin") && req.user.institutionId !== req.params.institutionId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const user = await storage.getUser(req.params.userId);
      if (!user || user.institutionId !== req.params.institutionId) {
        return res.status(404).json({ error: "User not found" });
      }
      const history = await storage.getUserResumeAnalysisHistory(req.params.userId);
      res.json({
        history,
        aiSummary: user.aiSummary,
        aiSummaryGeneratedAt: user.aiSummaryGeneratedAt
      });
    } catch (error) {
      console.error("Error fetching user analysis history:", error);
      res.status(500).json({ error: "Failed to fetch user analysis history" });
    }
  });
  app2.post("/api/institutions/:institutionId/users/:userId/generate-summary", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin" && req.user.role !== "institution_admin") {
        return res.status(403).json({ error: "Only admins can generate student summaries" });
      }
      if ((req.user.role === "admin" || req.user.role === "institution_admin") && req.user.institutionId !== req.params.institutionId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const user = await storage.getUser(req.params.userId);
      if (!user || user.institutionId !== req.params.institutionId) {
        return res.status(404).json({ error: "Student not found" });
      }
      const history = await storage.getUserResumeAnalysisHistory(req.params.userId);
      if (history.length === 0) {
        return res.status(400).json({ error: "No resume analysis history available for this student" });
      }
      const analysisData = history.map((h) => ({
        date: h.createdAt,
        targetRole: h.targetRole,
        rmsScore: h.rmsScore,
        strengths: h.overallInsights?.strengths || [],
        improvements: h.overallInsights?.improvements || [],
        sectionAnalysis: h.sectionAnalysis
      }));
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
      const OpenAI4 = (await import("openai")).default;
      const openai4 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
      const openaiResponse = await openai4.chat.completions.create({
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
      await storage.updateUserSummary(req.params.userId, summary);
      res.json({
        summary,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (error) {
      console.error("Error generating AI summary:", error);
      res.status(500).json({ error: "Failed to generate summary" });
    }
  });
  app2.post("/api/institutions/:institutionId/generate-group-insights", authenticate, async (req, res) => {
    try {
      if (req.user.role !== "admin" && req.user.role !== "super_admin" && req.user.role !== "institution_admin") {
        return res.status(403).json({ error: "Only admins can generate group insights" });
      }
      if ((req.user.role === "admin" || req.user.role === "institution_admin") && req.user.institutionId !== req.params.institutionId) {
        return res.status(403).json({ error: "Access denied" });
      }
      const students = await storage.getInstitutionUsers(req.params.institutionId, true);
      if (students.length === 0) {
        return res.status(400).json({ error: "No students found in this institution" });
      }
      const studentInsights = await Promise.all(
        students.map(async (student) => {
          const history = await storage.getUserResumeAnalysisHistory(student.id);
          if (history.length === 0) {
            return null;
          }
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
      const validInsights = studentInsights.filter((insight) => insight !== null);
      if (validInsights.length === 0) {
        return res.status(400).json({ error: "No students have resume analyses yet" });
      }
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
      const OpenAI4 = (await import("openai")).default;
      const openai4 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
      const openaiResponse = await openai4.chat.completions.create({
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
        max_completion_tokens: 2e3
      });
      const groupInsights = openaiResponse.choices[0].message.content || "Unable to generate group insights";
      res.json({
        insights: groupInsights,
        generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
        studentsAnalyzed: validInsights.length,
        totalStudents: students.length
      });
    } catch (error) {
      console.error("Error generating group insights:", error);
      res.status(500).json({ error: "Failed to generate group insights" });
    }
  });
  app2.post("/api/roadmaps/generate", authenticate, requireFeature("career_roadmap_generator"), async (req, res) => {
    try {
      const { phase } = req.body;
      if (!["30_days", "3_months", "6_months"].includes(phase)) {
        return res.status(400).json({ error: "Invalid phase" });
      }
      const activeResume = await storage.getActiveResume(req.user.id);
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
        };
      }
      const roadmapData = await aiService.generateCareerRoadmap(
        phase,
        req.user,
        resumeAnalysis
      );
      const roadmap = await storage.createRoadmap({
        userId: req.user.id,
        phase,
        title: roadmapData.title,
        description: roadmapData.description,
        actions: roadmapData.actions
      });
      await storage.createActivity(
        req.user.id,
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
  app2.get("/api/roadmaps", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const roadmaps2 = await storage.getUserRoadmaps(req.user.id);
      res.json(roadmaps2);
    } catch (error) {
      console.error("Get roadmaps error:", error);
      res.status(500).json({ error: "Failed to get roadmaps" });
    }
  });
  app2.put("/api/roadmaps/:id/progress", authenticate, requirePaidFeatures, async (req, res) => {
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
  app2.post("/api/roadmaps/:id/tasks/:taskId/complete", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { id: roadmapId, taskId } = req.params;
      const userId = req.user.id;
      const roadmap = await storage.updateTaskCompletion(roadmapId, taskId, userId, true);
      res.json(roadmap);
    } catch (error) {
      console.error("Task completion error:", error);
      res.status(500).json({ error: "Failed to mark task as complete" });
    }
  });
  app2.delete("/api/roadmaps/:id/tasks/:taskId/complete", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { id: roadmapId, taskId } = req.params;
      const userId = req.user.id;
      const roadmap = await storage.updateTaskCompletion(roadmapId, taskId, userId, false);
      res.json(roadmap);
    } catch (error) {
      console.error("Task uncomplete error:", error);
      res.status(500).json({ error: "Failed to mark task as incomplete" });
    }
  });
  app2.get("/api/roadmaps/:id/completion-status", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { id: roadmapId } = req.params;
      const userId = req.user.id;
      const completionStatus = await storage.getTaskCompletionStatus(roadmapId, userId);
      res.json(completionStatus);
    } catch (error) {
      console.error("Get completion status error:", error);
      res.status(500).json({ error: "Failed to get completion status" });
    }
  });
  app2.put("/api/roadmaps/:id/actions/:actionId/complete", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { id: roadmapId, actionId } = req.params;
      const userId = req.user.id;
      const roadmap = await storage.updateActionCompletion(roadmapId, actionId, userId, true);
      res.json(roadmap);
    } catch (error) {
      console.error("Legacy action completion error:", error);
      res.status(500).json({ error: "Failed to mark action as complete" });
    }
  });
  app2.get("/api/jobs/search", async (req, res) => {
    try {
      const {
        query = "software engineer",
        location = "United States",
        page = "1",
        limit = "20"
      } = req.query;
      console.log("Job search params:", { query, location, page, limit });
      let userSkills = [];
      try {
        if (req.user?.id) {
          const activeResume = await storage.getActiveResume(req.user.id);
          if (activeResume?.extractedText) {
          }
        }
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
        query,
        location,
        page: parseInt(page),
        resultsPerPage: parseInt(limit)
      }, userSkills);
      console.log("Jobs found:", jobsData.jobs.length);
      if (jobsData.jobs.length > 0 && jobsData.jobs[0].compatibilityScore) {
        console.log("Sample compatibility scores:", jobsData.jobs.slice(0, 3).map((j) => ({ title: j.title, score: j.compatibilityScore })));
      }
      if (req.user?.id) {
        await storage.createActivity(
          req.user.id,
          "job_search_performed",
          "Job Search",
          `Searched for "${query}" in ${location} - found ${jobsData.jobs.length} results`
        );
      }
      res.json({
        jobs: jobsData.jobs,
        totalCount: jobsData.totalCount,
        page: parseInt(page),
        limit: parseInt(limit)
      });
    } catch (error) {
      console.error("Job search error:", error);
      res.status(500).json({ error: "Failed to search jobs" });
    }
  });
  app2.post("/api/jobs/extract-from-url", authenticate, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        const title = titleMatch ? titleMatch[1].split("|")[0].split("-")[0].trim() : "";
        const description = descriptionMatch ? descriptionMatch[1] : "";
        const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        res.json({
          title: title || "Job Position",
          company: "Company Name",
          description: description || textContent.substring(0, 2e3),
          url
        });
      } catch (fetchError) {
        return res.status(400).json({
          error: "Unable to extract job details from URL. Please enter details manually."
        });
      }
    } catch (error) {
      console.error("URL extraction error:", error);
      res.status(500).json({ error: "Failed to extract job details" });
    }
  });
  app2.post("/api/jobs/extract-from-url", authenticate, async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch URL: ${response.status}`);
        }
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descriptionMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        const title = titleMatch ? titleMatch[1].split("|")[0].split("-")[0].trim() : "";
        const description = descriptionMatch ? descriptionMatch[1] : "";
        const textContent = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "").replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        res.json({
          title: title || "Job Position",
          company: "Company Name",
          description: description || textContent.substring(0, 2e3),
          url
        });
      } catch (fetchError) {
        return res.status(400).json({
          error: "Unable to extract job details from URL. Please enter details manually."
        });
      }
    } catch (error) {
      console.error("URL extraction error:", error);
      res.status(500).json({ error: "Failed to extract job details" });
    }
  });
  app2.post("/api/jobs/analyze-match", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { jobData } = req.body;
      if (!jobData) {
        return res.status(400).json({ error: "Job data is required" });
      }
      const activeResume = await storage.getActiveResume(req.user.id);
      if (!activeResume?.extractedText) {
        return res.status(400).json({ error: "No active resume found. Please upload a resume first." });
      }
      const matchAnalysis = await aiService.analyzeJobMatch(activeResume.extractedText, jobData);
      res.json(matchAnalysis);
    } catch (error) {
      console.error("Job match analysis error:", error);
      res.status(500).json({ error: "Failed to analyze job match" });
    }
  });
  app2.post("/api/jobs/generate-cover-letter", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { jobData } = req.body;
      if (!jobData) {
        return res.status(400).json({ error: "Job data is required" });
      }
      const activeResume = await storage.getActiveResume(req.user.id);
      if (!activeResume?.extractedText) {
        return res.status(400).json({ error: "No active resume found. Please upload a resume first." });
      }
      const coverLetter = await aiService.generateCoverLetter(
        activeResume.extractedText,
        jobData.description || "",
        jobData.company?.display_name || jobData.company || "the company",
        jobData.title || "the position"
      );
      res.json({ coverLetter });
    } catch (error) {
      console.error("Cover letter generation error:", error);
      res.status(500).json({ error: "Failed to generate cover letter" });
    }
  });
  app2.post("/api/jobs/match-analysis", authenticate, requireFeature("job_match_assistant"), async (req, res) => {
    try {
      console.log("Match analysis request received from user:", req.user?.id);
      const { jobId, jobData } = req.body;
      if (!jobData) {
        console.log("Missing job data in request");
        return res.status(400).json({ error: "Job data is required" });
      }
      console.log("Job data received:", { title: jobData.title, company: jobData.company?.display_name });
      const activeResume = await storage.getActiveResume(req.user.id);
      console.log("Active resume found:", !!activeResume?.extractedText);
      if (!activeResume?.extractedText) {
        return res.status(400).json({ error: "No active resume found. Please upload a resume first." });
      }
      console.log("Calling AI service for match analysis...");
      const matchAnalysis = await aiService.analyzeJobMatch(activeResume.extractedText, jobData);
      console.log("AI analysis completed successfully");
      res.json(matchAnalysis);
    } catch (error) {
      console.error("Job match analysis error:", error);
      res.status(500).json({ error: "Failed to analyze job match" });
    }
  });
  app2.get("/api/jobs/matches", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const jobMatches2 = await storage.getUserJobMatches(req.user.id, limit);
      res.json(jobMatches2);
    } catch (error) {
      console.error("Get job matches error:", error);
      res.status(500).json({ error: "Failed to get job matches" });
    }
  });
  app2.get("/api/jobs/analyses", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const analyses = await storage.getUserJobAnalyses(req.user.id, limit);
      res.json(analyses);
    } catch (error) {
      console.error("Get job analyses error:", error);
      res.status(500).json({ error: "Failed to get job analyses" });
    }
  });
  app2.get("/api/jobs/tailored-resumes", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const tailoredResumes2 = await storage.getTailoredResumes(req.user.id, limit);
      res.json(tailoredResumes2);
    } catch (error) {
      console.error("Get tailored resumes error:", error);
      res.status(500).json({ error: "Failed to get tailored resumes" });
    }
  });
  app2.get("/api/jobs/cover-letters", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const coverLetters2 = await storage.getUserCoverLetters(req.user.id, limit);
      res.json(coverLetters2);
    } catch (error) {
      console.error("Get cover letters error:", error);
      res.status(500).json({ error: "Failed to get cover letters" });
    }
  });
  app2.get("/api/beyond-jobs/search", authenticate, async (req, res) => {
    try {
      const {
        type,
        location,
        keyword,
        remote,
        limit
      } = req.query;
      const opportunities2 = await beyondJobsService.searchOpportunities({
        type,
        location,
        keyword,
        remote: remote === "true",
        limit: limit ? parseInt(limit) : 5
      });
      res.json({ opportunities: opportunities2, totalCount: opportunities2.length });
    } catch (error) {
      console.error("Beyond Jobs search error:", error);
      res.status(500).json({ error: "Failed to search opportunities" });
    }
  });
  app2.post("/api/beyond-jobs/ai-rank", authenticate, async (req, res) => {
    try {
      const { opportunities: opportunities2 } = req.body;
      const activeResume = await storage.getActiveResume(req.user.id);
      if (!activeResume) {
        return res.status(400).json({ error: "No active resume found" });
      }
      const userSkills = activeResume.extractedText ? aiService.extractSkills(activeResume.extractedText) : [];
      const resumeGaps = activeResume.gaps || [];
      const rankedOpportunities = await beyondJobsService.getAIRanking(
        opportunities2,
        userSkills,
        resumeGaps,
        aiService
      );
      res.json({ opportunities: rankedOpportunities });
    } catch (error) {
      console.error("AI ranking error:", error);
      res.status(500).json({ error: "Failed to rank opportunities" });
    }
  });
  app2.post("/api/beyond-jobs/save", authenticate, async (req, res) => {
    try {
      const { opportunityData } = req.body;
      const savedOpportunity = await storage.saveOpportunity(req.user.id, opportunityData);
      res.json(savedOpportunity);
    } catch (error) {
      console.error("Save opportunity error:", error);
      res.status(500).json({ error: "Failed to save opportunity" });
    }
  });
  app2.get("/api/beyond-jobs/saved", authenticate, async (req, res) => {
    try {
      const saved = await storage.getSavedOpportunities(req.user.id);
      res.json(saved);
    } catch (error) {
      console.error("Get saved opportunities error:", error);
      res.status(500).json({ error: "Failed to get saved opportunities" });
    }
  });
  app2.get("/api/copilot/tailored-resumes", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      console.log("Fetching tailored resumes for user:", userId);
      const tailoredResumes2 = await storage.getTailoredResumes(userId);
      console.log("Retrieved tailored resumes count:", tailoredResumes2.length);
      console.log("First resume:", tailoredResumes2[0] ? { id: tailoredResumes2[0].id, jobTitle: tailoredResumes2[0].jobTitle, company: tailoredResumes2[0].company } : "none");
      res.json(tailoredResumes2);
    } catch (error) {
      console.error("Error fetching tailored resumes:", error);
      res.status(500).json({ error: "Failed to fetch tailored resumes" });
    }
  });
  app2.post("/api/copilot/cover-letter", authenticate, async (req, res) => {
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
  app2.post("/api/copilot/salary-negotiation", authenticate, requireFeature("salary_negotiator"), async (req, res) => {
    try {
      const { currentSalary, targetSalary, jobRole, location, yearsExperience } = req.body;
      if (!targetSalary || !jobRole) {
        return res.status(400).json({ error: "targetSalary and jobRole are required" });
      }
      const resume = await storage.getActiveResume(req.user.id);
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
  app2.post("/api/copilot/update-resume-from-roadmap", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const resume = await storage.getActiveResume(userId);
      if (!resume?.extractedText) {
        return res.status(400).json({ error: "Resume required for auto-update" });
      }
      const roadmaps2 = await storage.getUserRoadmaps(userId);
      const completedTasks = roadmaps2.filter((r) => r.progress === 100);
      if (completedTasks.length === 0) {
        return res.status(400).json({ error: "No completed roadmap tasks to sync with resume" });
      }
      const updatedResume = await aiService.updateResumeFromRoadmap({
        resumeText: resume.extractedText,
        completedTasks: completedTasks.map((task) => ({
          title: task.title,
          description: task.description || void 0,
          actions: task.actions
        }))
      });
      res.json(updatedResume);
    } catch (error) {
      console.error("Error updating resume from roadmap:", error);
      res.status(500).json({ error: "Failed to update resume from roadmap" });
    }
  });
  app2.post("/api/jobs/tailor-resume", authenticate, requireFeature("job_match_assistant"), async (req, res) => {
    try {
      const { jobData, baseResumeId, jobAnalysisId } = req.body;
      if (!jobData) {
        return res.status(400).json({ error: "Job data is required" });
      }
      const resume = baseResumeId ? (await storage.getUserResumes(req.user.id)).find((r) => r?.id === baseResumeId) : await storage.getActiveResume(req.user.id);
      if (!resume?.extractedText) {
        return res.status(400).json({ error: "Resume text not available. Please upload a resume first." });
      }
      const targetKeywords = jobData.description?.split(/\s+/).filter((word) => word.length > 3).slice(0, 20) || [];
      const tailoredResult = await aiService.tailorResume(
        resume.extractedText,
        jobData.description || "",
        targetKeywords,
        req.user
      );
      const resumeParagraphs = parseResumeContentToDocx(tailoredResult.tailoredContent);
      const doc = new Document({
        sections: [{
          properties: {},
          children: resumeParagraphs
        }]
      });
      const docxBuffer = await Packer.toBuffer(doc);
      const jobMatchData = {
        userId: req.user.id,
        externalJobId: jobData.id || `external-${Date.now()}`,
        title: jobData.title || "Job Position",
        company: jobData.company?.display_name || jobData.company || "Company",
        location: jobData.location || "",
        description: jobData.description || "",
        requirements: jobData.requirements || "",
        salary: jobData.salary?.display || "",
        compatibilityScore: tailoredResult.jobSpecificScore || 0,
        matchReasons: [],
        skillsGaps: [],
        source: "job_matching"
      };
      console.log("Creating job match with data:", { ...jobMatchData, description: jobMatchData.description?.slice(0, 100) + "..." });
      const jobMatch = await storage.createJobMatch(jobMatchData);
      console.log("Job match created:", { id: jobMatch.id, title: jobMatch.title });
      const tailoredResumeData = {
        userId: req.user.id,
        baseResumeId: resume.id,
        jobMatchId: jobMatch.id,
        jobAnalysisId: jobAnalysisId || null,
        jobTitle: jobData.title || "Job Position",
        jobCompany: jobData.company?.display_name || jobData.company || "Company",
        tailoredContent: tailoredResult.tailoredContent,
        diffJson: tailoredResult.diffJson,
        jobSpecificScore: tailoredResult.jobSpecificScore,
        keywordsCovered: tailoredResult.keywordsCovered,
        remainingGaps: tailoredResult.remainingGaps
      };
      console.log("Creating tailored resume with data:", { userId: tailoredResumeData.userId, baseResumeId: tailoredResumeData.baseResumeId, jobMatchId: tailoredResumeData.jobMatchId });
      const tailoredResumeRecord = await storage.createTailoredResume(tailoredResumeData);
      console.log("Tailored resume created:", { id: tailoredResumeRecord.id, userId: tailoredResumeRecord.userId });
      await storage.createActivity(
        req.user.id,
        "resume_tailored",
        "Resume Tailored",
        `Resume optimized for ${jobData.company?.display_name || "Company"} - ${jobData.title}`
      );
      res.status(201).json({
        id: tailoredResumeRecord.id,
        jobMatchId: jobMatch.id,
        tailoredContent: tailoredResult.tailoredContent,
        jobSpecificScore: tailoredResult.jobSpecificScore,
        keywordsCovered: tailoredResult.keywordsCovered,
        remainingGaps: tailoredResult.remainingGaps,
        diffJson: tailoredResult.diffJson,
        docxBuffer: docxBuffer.toString("base64"),
        jobTitle: jobData.title,
        companyName: jobData.company?.display_name || "Company"
      });
    } catch (error) {
      console.error("Resume tailoring error:", error);
      res.status(500).json({ error: "Failed to tailor resume" });
    }
  });
  app2.post("/api/applications", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const applicationData = req.body;
      console.log("Raw application data:", applicationData);
      const processedData = {
        ...applicationData,
        userId: req.user.id,
        appliedDate: applicationData.appliedDate ? new Date(applicationData.appliedDate) : /* @__PURE__ */ new Date()
      };
      console.log("Processed application data:", {
        ...processedData,
        appliedDate: processedData.appliedDate?.toISOString?.() || processedData.appliedDate
      });
      const application = await storage.createApplication(processedData);
      await storage.createActivity(
        req.user.id,
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
  app2.get("/api/applications", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const applications2 = await storage.getUserApplications(req.user.id);
      res.json(applications2);
    } catch (error) {
      console.error("Get applications error:", error);
      res.status(500).json({ error: "Failed to get applications" });
    }
  });
  app2.put("/api/applications/:id/status", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { id } = req.params;
      const { status, responseDate } = req.body;
      const application = await storage.updateApplicationStatus(
        id,
        status,
        responseDate ? new Date(responseDate) : void 0
      );
      res.json(application);
    } catch (error) {
      console.error("Update application status error:", error);
      res.status(500).json({ error: "Failed to update application status" });
    }
  });
  app2.post("/api/ai/career-analysis", async (req, res) => {
    try {
      const { systemPrompt, userPrompt } = req.body;
      if (!systemPrompt || !userPrompt) {
        return res.status(400).json({ error: "Missing prompt data" });
      }
      const OpenAI4 = (await import("openai")).default;
      const openai4 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
      const { maxTokens } = req.body;
      const completion = await openai4.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: typeof maxTokens === "number" ? maxTokens : 3e3,
        temperature: 0.7
      });
      const analysis = completion.choices[0]?.message?.content || "";
      res.json({ analysis });
    } catch (error) {
      console.error("Career analysis error:", error);
      res.status(500).json({ error: "Failed to generate career analysis" });
    }
  });
  app2.post("/api/ai/chat-resume-score", authenticate, async (req, res) => {
    try {
      const { resumeText, targetRole, targetIndustry, targetCompanies, preferredLocation, background } = req.body;
      if (!resumeText) {
        return res.status(400).json({ error: "Resume text is required" });
      }
      const userId = req.user.id;
      const analysis = await aiService.analyzeResume(
        userId,
        resumeText,
        targetRole,
        targetIndustry,
        targetCompanies
      );
      let resume = await storage.getActiveResume(userId);
      if (!resume) {
        resume = await storage.createResume({
          userId,
          fileName: "Chat Resume",
          filePath: "chat://inline",
          extractedText: resumeText,
          isActive: true
        });
      }
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
        analysisHash: { hash: analysis.analysisHash, method: "chat", source: "chat-flow" }
      });
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
          overallInsights: analysis.overallInsights,
          sectionAnalysis: analysis.sectionAnalysis,
          gaps: analysis.gaps,
          targetRole: targetRole || null,
          targetIndustry: targetIndustry || null
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
        gaps: analysis.gaps
      });
    } catch (error) {
      console.error("Chat resume score error:", error);
      res.status(500).json({ error: "Failed to generate resume score" });
    }
  });
  app2.post("/api/ai/cover-letter", authenticate, async (req, res) => {
    try {
      const { jobDescription, company, role } = req.body;
      const activeResume = await storage.getActiveResume(req.user.id);
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
  app2.post("/api/ai/linkedin-optimize", authenticate, async (req, res) => {
    try {
      const { currentProfile } = req.body;
      const optimization = await aiService.optimizeLinkedInProfile(
        currentProfile,
        req.user.targetRole || "Professional",
        req.user.industries || []
      );
      res.json(optimization);
    } catch (error) {
      console.error("LinkedIn optimization error:", error);
      res.status(500).json({ error: "Failed to optimize LinkedIn profile" });
    }
  });
  app2.get("/api/activities", authenticate, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const activities2 = await storage.getUserActivities(req.user.id, limit);
      res.json(activities2);
    } catch (error) {
      console.error("Get activities error:", error);
      res.status(500).json({ error: "Failed to get activities" });
    }
  });
  app2.get("/api/achievements", authenticate, async (req, res) => {
    try {
      const achievements2 = await storage.getUserAchievements(req.user.id);
      res.json(achievements2);
    } catch (error) {
      console.error("Get achievements error:", error);
      res.status(500).json({ error: "Failed to get achievements" });
    }
  });
  app2.get("/api/dashboard/stats", authenticate, async (req, res) => {
    try {
      const [
        activeResume,
        applications2,
        roadmaps2,
        achievements2,
        activities2,
        jobMatches2
      ] = await Promise.all([
        storage.getActiveResume(req.user.id),
        storage.getUserApplications(req.user.id),
        storage.getUserRoadmaps(req.user.id),
        storage.getUserAchievements(req.user.id),
        storage.getUserActivities(req.user.id, 5),
        storage.getUserJobMatches(req.user.id, 10)
      ]);
      const rmsScoreImprovement = activeResume?.rmsScore ? Math.max(0, activeResume.rmsScore - 45) : 0;
      const applicationStats = {
        total: applications2.length,
        pending: applications2.filter((app3) => app3.status === "applied").length,
        interviewing: applications2.filter((app3) => ["interview_scheduled", "interviewed"].includes(app3.status)).length,
        rejected: applications2.filter((app3) => app3.status === "rejected").length,
        offers: applications2.filter((app3) => app3.status === "offered").length
      };
      const today = /* @__PURE__ */ new Date();
      let currentStreak = 0;
      const recentDays = 30;
      for (let i = 0; i < recentDays; i++) {
        const dayToCheck = new Date(today);
        dayToCheck.setDate(today.getDate() - i);
        const dayStart = new Date(dayToCheck.setHours(0, 0, 0, 0));
        const dayEnd = new Date(dayToCheck.setHours(23, 59, 59, 999));
        const hasActivity = activities2.some((activity) => {
          const activityDate = new Date(activity.createdAt);
          return activityDate >= dayStart && activityDate <= dayEnd;
        });
        if (hasActivity) {
          currentStreak++;
        } else if (i > 0) {
          break;
        }
      }
      const activeRoadmap = roadmaps2.find((r) => r.isActive === true) || roadmaps2[0];
      const phaseLabels = {
        "30_days": "30-Day Career Advancement Plan",
        "3_months": "3-Month Foundation Building",
        "6_months": "6-Month Career Transformation"
      };
      const currentPhase = activeRoadmap ? {
        title: activeRoadmap.title || phaseLabels[activeRoadmap.phase] || "30-Day Career Advancement Plan",
        progress: activeRoadmap.progress || 0,
        phase: activeRoadmap.phase || "30_days"
      } : null;
      const aiInsights = activeResume?.gaps && Array.isArray(activeResume.gaps) ? {
        topRecommendations: [...activeResume.gaps].map((gap) => ({
          // Normalize the gap data structure
          category: gap.category || "General Improvement",
          rationale: gap.rationale || gap.recommendation || gap.description || "No details provided",
          priority: (gap.priority || "medium").toLowerCase(),
          impact: Number(gap.impact) || 0
        })).sort((a, b) => {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          const aScore = (priorityWeight[a.priority] || 1) * (a.impact || 0);
          const bScore = (priorityWeight[b.priority] || 1) * (b.impact || 0);
          return bScore - aScore;
        }).slice(0, 2)
        // Get top 2 recommendations
      } : null;
      const currentRoadmapTasks = activeRoadmap && activeRoadmap.subsections ? activeRoadmap.subsections.flatMap(
        (subsection) => (subsection.tasks || []).map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          status: task.completed ? "completed" : "pending",
          completed: task.completed,
          priority: task.priority || "medium",
          dueDate: task.dueDate,
          icon: task.icon || "clock"
        }))
      ).slice(0, 3) : [];
      const stats = {
        rmsScore: activeResume?.rmsScore || 0,
        rmsScoreImprovement,
        applicationsCount: applications2.length,
        pendingApplications: applicationStats.pending,
        interviewingCount: applicationStats.interviewing,
        applicationStats,
        roadmapProgress: roadmaps2.length > 0 ? Math.round(roadmaps2.reduce((sum, r) => sum + (r.progress || 0), 0) / roadmaps2.length) : 0,
        currentPhase,
        currentRoadmapTasks,
        achievementsCount: achievements2.length,
        recentActivities: activities2,
        topJobMatches: jobMatches2.slice(0, 5),
        streak: Math.max(1, currentStreak),
        totalActivities: activities2.length,
        aiInsights,
        weeklyProgress: {
          applicationsThisWeek: applications2.filter((app3) => {
            const weekAgo = /* @__PURE__ */ new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(app3.appliedDate) > weekAgo;
          }).length,
          activitiesThisWeek: activities2.filter((activity) => {
            const weekAgo = /* @__PURE__ */ new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return new Date(activity.createdAt) > weekAgo;
          }).length
        }
      };
      if (req.user) {
        req.user.streak = stats.streak;
        req.user.unreadNotifications = Math.min(9, stats.totalActivities);
      }
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ error: "Failed to get dashboard stats" });
    }
  });
  app2.post("/api/interview-prep/generate-questions", authenticate, requireFeature("interview_prep_assistant"), async (req, res) => {
    try {
      const { applicationId, category, count = 10 } = req.body;
      if (!applicationId || !category) {
        return res.status(400).json({ error: "Application ID and category are required" });
      }
      const applications2 = await storage.getUserApplications(req.user.id);
      const application = applications2.find((app3) => app3.id === applicationId);
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
  app2.get("/api/interview-prep/questions", authenticate, async (req, res) => {
    try {
      const { applicationId, category } = req.query;
      if (!applicationId) {
        return res.status(400).json({ error: "Application ID is required" });
      }
      const applications2 = await storage.getUserApplications(req.user.id);
      const application = applications2.find((app3) => app3.id === applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      res.json([]);
    } catch (error) {
      console.error("Get interview questions error:", error);
      res.status(500).json({ error: "Failed to get interview questions" });
    }
  });
  app2.get("/api/interview-prep/resources", authenticate, async (req, res) => {
    try {
      const { applicationId } = req.query;
      if (!applicationId) {
        return res.status(400).json({ error: "Application ID is required" });
      }
      const applications2 = await storage.getUserApplications(req.user.id);
      const application = applications2.find((app3) => app3.id === applicationId);
      if (!application) {
        return res.status(404).json({ error: "Application not found" });
      }
      let skills = [];
      if (application.jobMatchId) {
        try {
          const jobMatches2 = await storage.getUserJobMatches(req.user.id);
          const jobMatch = jobMatches2.find((jm) => jm.id === application.jobMatchId);
          if (jobMatch && jobMatch.requirements) {
            const commonSkills = ["JavaScript", "Python", "SQL", "React", "Node.js", "AWS", "Docker", "Git"];
            skills = commonSkills.filter(
              (skill) => jobMatch.requirements?.toLowerCase().includes(skill.toLowerCase())
            );
          }
        } catch (error) {
          console.error("Error fetching job match for skills:", error);
        }
      }
      console.log(`Generating resources for ${application.position} at ${application.company} with skills:`, skills);
      const resources2 = await aiService.generatePrepResources(
        application.position,
        application.company,
        skills
      );
      console.log("OpenAI returned resources:", JSON.stringify(resources2, null, 2));
      res.json(resources2);
    } catch (error) {
      console.error("Get prep resources error:", error);
      res.status(500).json({ error: "Failed to get preparation resources" });
    }
  });
  const MOCK_INTERVIEW_QUESTION_COUNT = 9;
  app2.post("/api/mock-interview/generate-questions", authenticate, async (req, res) => {
    try {
      const { role, category = "behavioral", resumeText } = req.body;
      if (!role) return res.status(400).json({ error: "Role is required" });
      const perType = Math.floor(MOCK_INTERVIEW_QUESTION_COUNT / 3);
      const remainder = MOCK_INTERVIEW_QUESTION_COUNT - perType * 3;
      let questions;
      if (category === "mix") {
        const [behavioral, technical, situational] = await Promise.all([
          aiService.generateInterviewQuestions(role, "a leading company", "behavioral", perType + remainder, resumeText),
          aiService.generateInterviewQuestions(role, "a leading company", "technical", perType, resumeText),
          aiService.generateInterviewQuestions(role, "a leading company", "situational", perType, resumeText)
        ]);
        questions = [...behavioral, ...technical, ...situational];
      } else {
        questions = await aiService.generateInterviewQuestions(role, "a leading company", category, MOCK_INTERVIEW_QUESTION_COUNT, resumeText);
      }
      res.json(questions);
    } catch (err) {
      console.error("Mock interview generate-questions error:", err.message);
      res.status(500).json({ error: err.message || "Failed to generate questions" });
    }
  });
  app2.post("/api/mock-interview/speak", authenticate, async (req, res) => {
    try {
      const { text: text2 } = req.body;
      if (!text2) return res.status(400).json({ error: "text is required" });
      const { default: OpenAI4 } = await import("openai");
      const openai4 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai4.audio.speech.create({
        model: "tts-1",
        voice: "onyx",
        input: String(text2).slice(0, 4096)
      });
      const buffer = Buffer.from(await response.arrayBuffer());
      res.set("Content-Type", "audio/mpeg");
      res.set("Cache-Control", "no-store");
      res.send(buffer);
    } catch (err) {
      console.error("Mock interview speak error:", err.message);
      res.status(500).json({ error: err.message || "TTS failed" });
    }
  });
  app2.post("/api/mock-interview/transcribe", authenticate, async (req, res) => {
    try {
      const { audio, mimeType = "audio/webm" } = req.body;
      if (!audio) return res.status(400).json({ error: "Audio data is required" });
      const { default: OpenAI4, toFile } = await import("openai");
      const openai4 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
      const audioBuffer = Buffer.from(audio, "base64");
      const ext = mimeType.includes("mp4") ? "mp4" : mimeType.includes("ogg") ? "ogg" : "webm";
      const audioFile = await toFile(audioBuffer, `answer.${ext}`, { type: mimeType });
      const response = await openai4.audio.transcriptions.create({
        file: audioFile,
        model: "whisper-1",
        response_format: "verbose_json",
        timestamp_granularities: ["word"]
      });
      res.json({ text: response.text || "", words: response.words || [] });
    } catch (err) {
      console.error("Mock interview transcribe error:", err.message);
      res.status(500).json({ error: err.message || "Transcription failed" });
    }
  });
  app2.post("/api/mock-interview/critique", authenticate, async (req, res) => {
    try {
      const { role, answers, resumeText } = req.body;
      if (!answers?.length) return res.status(400).json({ error: "Answers are required" });
      const FILLERS = ["um", "uh", "like", "you know", "basically", "literally", "right", "so", "kind of", "sort of", "i mean", "actually"];
      const enriched = answers.map((a, i) => {
        const wordCount = a.transcript.trim().split(/\s+/).filter(Boolean).length;
        const wpm = a.durationSeconds > 5 ? Math.round(wordCount / (a.durationSeconds / 60)) : 0;
        const lower = a.transcript.toLowerCase();
        const fillerCounts = {};
        for (const f of FILLERS) {
          const matches = lower.match(new RegExp(`\\b${f}\\b`, "g"));
          if (matches?.length) fillerCounts[f] = matches.length;
        }
        const totalFillers = Object.values(fillerCounts).reduce((s, n) => s + n, 0);
        const longPauses = [];
        if (Array.isArray(a.words) && a.words.length > 1) {
          for (let j = 1; j < a.words.length; j++) {
            const gap = a.words[j].start - a.words[j - 1].end;
            if (gap >= 2) longPauses.push(Math.round(gap * 10) / 10);
          }
        }
        return { number: i + 1, question: a.question, transcript: a.transcript, durationSeconds: a.durationSeconds, wordCount, wpm, fillerCounts, totalFillers, longPauses };
      });
      const systemPrompt = `You are a senior interview coach and hiring manager with 15+ years of experience at top-tier companies. Your critiques are honest, detailed, and evidence-based \u2014 you cite specific phrases from the transcript.

Your content analysis goes beyond surface-level feedback. For every answer you ask:
1. Did the candidate actually answer what was asked, or did they pivot to something easier?
2. Is the claim specific and verifiable (names, numbers, timelines, outcomes) or vague and generic?
3. Would a skeptical hiring manager find this answer memorable or forgettable?
4. What is missing that a strong candidate would have included?

Format: Use markdown with ## for section headers, ### for sub-headers, **bold** for key terms, and - for bullets. Quote specific phrases from the transcript in "quotes" when praising or critiquing them. Be direct \u2014 do not soften valid criticism with filler praise.

Important: This analysis is based on transcript text and timing data only. Do NOT assess tone, vocal energy, confidence, or body language.`;
      const answersSummary = enriched.map((a) => `---
## Question ${a.number}: "${a.question}"
Duration: ${a.durationSeconds}s | Words: ${a.wordCount} | WPM: ${a.wpm > 0 ? a.wpm : "N/A"}
Filler words: ${a.totalFillers > 0 ? Object.entries(a.fillerCounts).map(([k, v]) => `"${k}" \xD7${v}`).join(", ") : "none detected"}
Long pauses (>2s): ${a.longPauses.length > 0 ? a.longPauses.map((p) => `${p}s`).join(", ") : "none"}
Transcript: "${a.transcript || "(no speech detected)"}"`).join("\n\n");
      const resumeContext = resumeText?.trim() ? `

Candidate's resume (use it to assess whether answers match their stated background and call out any inconsistencies or missed opportunities to reference real experience):
<resume>
${resumeText.trim()}
</resume>` : "";
      const userPrompt = `The candidate is practicing for a **${role || "General"}** interview.${resumeContext}

${answersSummary}

---

## Instructions

For EACH question, provide the following two sections. Be thorough and evidence-based \u2014 quote phrases from the transcript.

---

### Q[N] \u2014 Content Analysis

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
- Give 2\u20133 concrete, specific things a top-10% candidate would have said that this candidate did not. Be prescriptive \u2014 not "add more detail" but "state the business impact in dollars or percentage improvement."

**6. Overall Content Score: X/10**
- One sentence justifying the score.

---

### Q[N] \u2014 Delivery *(transcript-based metrics only)*
- **Pace:** ${enriched[0]?.wpm > 0 ? "Comment on WPM. Ideal 120\u2013160; <100 is too slow; >180 is rushed." : "Answer too brief to compute WPM reliably."}
- **Fillers:** Note total count and which words were most frequent. Under 3/min acceptable; 5+/min distracting.
- **Length:** Flag if too short (<60s \u2014 insufficient depth), appropriate (60\u2013180s), or rambling (>180s \u2014 needs editing).
- **Pauses:** Note any gaps >2s. Were they before key points (thoughtful) or mid-sentence (hesitant)?

---

After analyzing all questions, provide:

## \u{1F3AF} Overall Session Assessment

### Strengths (2\u20133)
For each: name the strength, quote or cite the answer where it appeared, and explain why it works.

### Critical Areas to Improve (2\u20133)
For each: name the specific problem, cite which answers it appeared in, and give ONE concrete, actionable fix the candidate can practice today.

### Prioritized Practice Drill
Identify the single biggest weakness across the session and prescribe a specific drill:
- What to practice (exact exercise or method)
- How often / for how long
- What "good" looks like so they know when they've improved

### Hiring Manager Perspective
In 2\u20133 sentences: if this were a real interview, what would a hiring manager's gut reaction be after hearing these answers? Would the candidate advance to the next round? What single thing is holding them back?

---

> *This critique is based on transcript text and timing data only. Tone, vocal energy, and confidence assessment are not included.*`;
      const { default: OpenAI4 } = await import("openai");
      const openai4 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await openai4.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 6e3,
        temperature: 0.4
      });
      const critique = completion.choices[0]?.message?.content || "Unable to generate critique.";
      res.json({ critique });
    } catch (err) {
      console.error("Mock interview critique error:", err.message);
      res.status(500).json({ error: err.message || "Failed to generate critique" });
    }
  });
  app2.post("/api/skill-gaps", authenticate, async (req, res) => {
    try {
      const validatedData = insertSkillGapAnalysisSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      if (!validatedData.resumeId && !validatedData.jobMatchId) {
        return res.status(400).json({ error: "Either resumeId or jobMatchId is required" });
      }
      const { microProjectsService: microProjectsService2 } = await Promise.resolve().then(() => (init_micro_projects(), micro_projects_exports));
      const analysis = await microProjectsService2.analyzeSkillGaps(
        req.user.id,
        validatedData.resumeId,
        validatedData.jobMatchId,
        validatedData.targetRole
      );
      res.status(201).json(analysis);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error analyzing skill gaps:", error);
      res.status(500).json({ error: "Failed to analyze skill gaps" });
    }
  });
  app2.get("/api/skill-gaps", authenticate, async (req, res) => {
    try {
      const analyses = await storage.getSkillGapAnalysesByUser(req.user.id);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching skill gap analyses:", error);
      res.status(500).json({ error: "Failed to fetch skill gap analyses" });
    }
  });
  app2.get("/api/skill-gaps/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getSkillGapAnalysisById(id);
      if (!analysis) {
        return res.status(404).json({ error: "Skill gap analysis not found" });
      }
      if (analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching skill gap analysis:", error);
      res.status(500).json({ error: "Failed to fetch skill gap analysis" });
    }
  });
  app2.patch("/api/skill-gaps/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getSkillGapAnalysisById(id);
      if (!analysis) {
        return res.status(404).json({ error: "Skill gap analysis not found" });
      }
      if (analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      const updates = insertSkillGapAnalysisSchema.partial().parse(req.body);
      res.json({ message: "Update endpoint not yet implemented" });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error updating skill gap analysis:", error);
      res.status(500).json({ error: "Failed to update skill gap analysis" });
    }
  });
  app2.delete("/api/skill-gaps/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getSkillGapAnalysisById(id);
      if (!analysis) {
        return res.status(404).json({ error: "Skill gap analysis not found" });
      }
      if (analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied" });
      }
      res.status(204).json({ message: "Delete endpoint not yet implemented" });
    } catch (error) {
      console.error("Error deleting skill gap analysis:", error);
      res.status(500).json({ error: "Failed to delete skill gap analysis" });
    }
  });
  app2.post("/api/micro-projects/generate", authenticate, requireFeature("micro_project_generator"), async (req, res) => {
    try {
      const { skillGapAnalysisId } = req.body;
      if (!skillGapAnalysisId) {
        return res.status(400).json({ error: "Skill gap analysis ID is required" });
      }
      const analysis = await storage.getSkillGapAnalysisById(skillGapAnalysisId);
      if (!analysis || analysis.userId !== req.user.id) {
        return res.status(403).json({ error: "Access denied to skill gap analysis" });
      }
      const { microProjectsService: microProjectsService2 } = await Promise.resolve().then(() => (init_micro_projects(), micro_projects_exports));
      const projects = await microProjectsService2.generateMicroProjectsForSkillGaps(skillGapAnalysisId);
      res.status(201).json(projects);
    } catch (error) {
      console.error("Error generating micro-projects:", error);
      res.status(500).json({ error: "Failed to generate micro-projects" });
    }
  });
  app2.get("/api/micro-projects", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { skills, limit = 20, offset = 0 } = req.query;
      const userId = req.user.id;
      let projects;
      if (skills) {
        const skillsArray = Array.isArray(skills) ? skills : [skills];
        projects = await storage.getMicroProjectsBySkills(skillsArray, userId);
      } else {
        projects = await storage.getMicroProjectsByUser(userId, Number(limit), Number(offset));
      }
      res.json(projects);
    } catch (error) {
      console.error("Error fetching micro-projects:", error);
      res.status(500).json({ error: "Failed to fetch micro-projects" });
    }
  });
  app2.get("/api/micro-projects/recommended", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { microProjectsService: microProjectsService2 } = await Promise.resolve().then(() => (init_micro_projects(), micro_projects_exports));
      const projects = await microProjectsService2.getRecommendedProjectsForUser(req.user.id);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching recommended projects:", error);
      res.status(500).json({ error: "Failed to fetch recommended projects" });
    }
  });
  app2.post("/api/micro-projects/generate-from-role", authenticate, requireFeature("micro_project_generator"), async (req, res) => {
    try {
      const { targetRole, count, difficulty } = req.body;
      if (!targetRole || typeof targetRole !== "string") {
        return res.status(400).json({ error: "Target role is required" });
      }
      const projectCount = count && typeof count === "number" && count >= 1 && count <= 3 ? count : 2;
      const projectDifficulty = difficulty && ["beginner", "intermediate", "advanced"].includes(difficulty) ? difficulty : "intermediate";
      const { microProjectsService: microProjectsService2 } = await Promise.resolve().then(() => (init_micro_projects(), micro_projects_exports));
      console.log(`Generating ${projectCount} ${projectDifficulty} projects for role: ${targetRole}`);
      const newProjects = await microProjectsService2.generateProjectsForRole(req.user.id, targetRole, projectCount, projectDifficulty);
      if (newProjects.length > 0) {
        await storage.createActivity(
          req.user.id,
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
  app2.post("/api/micro-projects/generate-ai", authenticate, requireFeature("micro_project_generator"), async (req, res) => {
    try {
      const { microProjectsService: microProjectsService2 } = await Promise.resolve().then(() => (init_micro_projects(), micro_projects_exports));
      console.log(`Generating single AI project for user ${req.user.id}`);
      const newProjects = await microProjectsService2.generateAIPoweredProjects(req.user.id);
      if (newProjects.length > 0) {
        await storage.createActivity(
          req.user.id,
          "ai_project_generated",
          "AI Project Generated",
          `Generated new practice project: ${newProjects[0].title}`
        );
      }
      if (newProjects.length === 0) {
        return res.status(200).json({
          message: "Generated fallback project",
          projects: [{
            id: "fallback-" + Date.now(),
            title: "Product Management Fundamentals Practice",
            description: "Learn core PM skills through hands-on exercises with user stories, roadmaps, and stakeholder alignment.",
            targetSkill: "Product Management",
            difficulty: "intermediate",
            estimatedHours: 10,
            tags: ["product management"],
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
  app2.get("/api/micro-projects/:id", authenticate, requirePaidFeatures, async (req, res) => {
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
  app2.patch("/api/micro-projects/:id", requireAdmin, async (req, res) => {
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
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error updating micro-project:", error);
      res.status(500).json({ error: "Failed to update micro-project" });
    }
  });
  app2.delete("/api/micro-projects/clear", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      await storage.clearAllMicroProjects(userId);
      await storage.clearAllProjectCompletions(userId);
      res.json({ message: "All projects cleared successfully" });
    } catch (error) {
      console.error("Error clearing all micro-projects:", error);
      res.status(500).json({ error: "Failed to clear all projects" });
    }
  });
  app2.delete("/api/micro-projects/:id", requireAdmin, async (req, res) => {
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
  app2.post("/api/micro-projects/:projectId/start", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { microProjectsService: microProjectsService2 } = await Promise.resolve().then(() => (init_micro_projects(), micro_projects_exports));
      await microProjectsService2.startProject(req.user.id, projectId);
      res.json({ message: "Project started successfully" });
    } catch (error) {
      console.error("Error starting project:", error);
      res.status(500).json({ error: "Failed to start project" });
    }
  });
  app2.put("/api/micro-projects/:projectId/progress", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { progressPercentage, timeSpent } = req.body;
      if (progressPercentage < 0 || progressPercentage > 100) {
        return res.status(400).json({ error: "Progress percentage must be between 0 and 100" });
      }
      const { microProjectsService: microProjectsService2 } = await Promise.resolve().then(() => (init_micro_projects(), micro_projects_exports));
      await microProjectsService2.updateProjectProgress(
        req.user.id,
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
  app2.post("/api/micro-projects/:projectId/complete", authenticate, requirePaidFeatures, async (req, res) => {
    try {
      const { projectId } = req.params;
      const { artifactUrls, reflectionNotes, selfAssessment } = req.body;
      if (!artifactUrls || artifactUrls.length === 0) {
        return res.status(400).json({ error: "At least one artifact URL is required" });
      }
      const project = await storage.getMicroProjectById(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      const { microProjectsService: microProjectsService2 } = await Promise.resolve().then(() => (init_micro_projects(), micro_projects_exports));
      await microProjectsService2.completeProject(
        req.user.id,
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
  app2.get("/api/project-completions", authenticate, async (req, res) => {
    try {
      const completions = await storage.getProjectCompletionsByUser(req.user.id);
      res.json(completions);
    } catch (error) {
      console.error("Error fetching project completions:", error);
      res.status(500).json({ error: "Failed to fetch project completions" });
    }
  });
  app2.patch("/api/project-completions/:id", authenticate, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const existingCompletion = await storage.getProjectCompletionsByUser(req.user.id);
      const completion = existingCompletion.find((c) => c.id === id);
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
  app2.post("/api/portfolio-artifacts", authenticate, async (req, res) => {
    try {
      const validatedData = insertPortfolioArtifactSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      const artifactId = await storage.createPortfolioArtifact(validatedData);
      res.status(201).json({ id: artifactId, message: "Portfolio artifact created successfully" });
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      console.error("Error creating portfolio artifact:", error);
      res.status(500).json({ error: "Failed to create portfolio artifact" });
    }
  });
  app2.get("/api/portfolio-artifacts", authenticate, async (req, res) => {
    try {
      const artifacts = await storage.getPortfolioArtifactsByUser(req.user.id);
      res.json(artifacts);
    } catch (error) {
      console.error("Error fetching portfolio artifacts:", error);
      res.status(500).json({ error: "Failed to fetch portfolio artifacts" });
    }
  });
  let stripe = null;
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-09-30.clover"
    });
  }
  app2.post("/api/stripe/create-checkout-session", authenticate, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." });
    }
    if (!process.env.STRIPE_PRICE_ID) {
      return res.status(500).json({ error: "Stripe Price ID is not configured. Please add STRIPE_PRICE_ID to your environment variables." });
    }
    try {
      const user = req.user;
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }
      const referer = req.get("referer") || "http://localhost:5000";
      const url = new URL(referer);
      const baseUrl = `${url.protocol}//${url.host}`;
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID,
            quantity: 1
          }
        ],
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard?purchase=cancelled`,
        metadata: {
          userId: user.id
        },
        allow_promotion_codes: true
      });
      res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout session error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });
  app2.post("/api/stripe/purchase-feature", authenticate, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured. Please add STRIPE_SECRET_KEY to your environment variables." });
    }
    try {
      const user = req.user;
      const { featureKey } = req.body;
      if (!featureKey || !(featureKey in FEATURE_CATALOG)) {
        return res.status(400).json({ error: "Invalid feature key" });
      }
      const feature = FEATURE_CATALOG[featureKey];
      const unusedCredit = await storage.getUnusedFeatureCredit(user.id, featureKey);
      if (unusedCredit) {
        return res.status(400).json({
          error: "You already have an unused credit for this feature. Please use it before purchasing again."
        });
      }
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: user.id
          }
        });
        customerId = customer.id;
        await storage.updateUser(user.id, { stripeCustomerId: customerId });
      }
      const referer = req.get("referer") || "http://localhost:5000";
      const url = new URL(referer);
      const baseUrl = `${url.protocol}//${url.host}`;
      const priceIdEnvKey = `STRIPE_PRICE_ID_${featureKey.split("_").map(
        (word) => word.charAt(0).toUpperCase() + word.slice(1)
      ).join("_")}`;
      const priceId = process.env[priceIdEnvKey];
      if (!priceId) {
        return res.status(500).json({
          error: `Stripe Price ID not configured for ${feature.name}. Please add ${priceIdEnvKey} to environment variables.`
        });
      }
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "payment",
        // One-time payment
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            // Use actual Stripe Price ID
            quantity: 1
          }
        ],
        success_url: `${baseUrl}/dashboard?purchase=success&feature=${featureKey}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/dashboard?purchase=cancelled`,
        metadata: {
          userId: user.id,
          featureKey,
          purchaseType: "feature"
        }
      });
      res.json({ url: session.url });
    } catch (error) {
      console.error("Stripe feature purchase error:", error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });
  app2.post("/api/stripe/webhook", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    const sig = req.headers["stripe-signature"];
    if (!sig) {
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }
    let event;
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      const rawBody = req.body;
      if (webhookSecret) {
        event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
      } else {
        console.warn("\u26A0\uFE0F  STRIPE_WEBHOOK_SECRET not set \u2014 skipping signature verification (dev only)");
        const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : JSON.stringify(rawBody);
        event = JSON.parse(bodyStr);
      }
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata?.userId;
          const purchaseType = session.metadata?.purchaseType;
          if (userId) {
            if (purchaseType === "feature") {
              const featureKey = session.metadata?.featureKey;
              const paymentIntentId = session.payment_intent;
              const checkoutSessionId = session.id;
              if (featureKey && featureKey in FEATURE_CATALOG) {
                const feature = FEATURE_CATALOG[featureKey];
                const existingPurchase = await storage.findPurchaseByStripeRefs(userId, paymentIntentId, checkoutSessionId);
                if (existingPurchase) {
                  console.log(`\u2139\uFE0F Webhook: Feature purchase already recorded: ${featureKey} for user ${userId}`);
                } else {
                  await storage.createUserPurchasedFeature({
                    userId,
                    featureKey,
                    stripeProductId: feature.stripeProductId,
                    stripePaymentIntentId: paymentIntentId,
                    stripeCheckoutSessionId: checkoutSessionId,
                    amountPaid: feature.price
                  });
                  console.log(`\u2705 Feature purchase completed: ${featureKey} for user ${userId}`);
                }
              }
            } else {
              const subscriptionId = session.subscription;
              if (subscriptionId) {
                await storage.updateUser(userId, {
                  stripeSubscriptionId: subscriptionId,
                  subscriptionStatus: "trialing",
                  subscriptionTier: "paid"
                });
                console.log(`\u2705 Subscription created for user ${userId} (status: trialing, tier: paid - full access granted)`);
              }
            }
          }
          break;
        }
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          const customerId = subscription.customer;
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (user) {
            let subscriptionStatus = "active";
            if (subscription.status === "trialing") {
              subscriptionStatus = "trialing";
            } else if (subscription.status === "past_due") {
              subscriptionStatus = "past_due";
            } else if (subscription.status === "canceled" || subscription.status === "unpaid") {
              subscriptionStatus = "canceled";
            } else if (subscription.status === "incomplete" || subscription.status === "incomplete_expired") {
              subscriptionStatus = "incomplete";
            } else if (subscription.status === "active") {
              subscriptionStatus = "active";
            }
            await storage.updateUser(user.id, {
              subscriptionStatus,
              subscriptionTier: subscriptionStatus === "active" || subscriptionStatus === "trialing" ? "paid" : "free"
            });
            console.log(`\u2705 Subscription updated for user ${user.id}: ${subscriptionStatus}`);
          }
          break;
        }
        case "customer.subscription.deleted": {
          const subscription = event.data.object;
          const customerId = subscription.customer;
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (user) {
            await storage.updateUser(user.id, {
              subscriptionStatus: "canceled",
              subscriptionTier: "free",
              stripeSubscriptionId: null
            });
            console.log(`\u2705 Subscription canceled for user ${user.id}, downgraded to free tier`);
          }
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object;
          const customerId = invoice.customer;
          const user = await storage.getUserByStripeCustomerId(customerId);
          if (user) {
            await storage.updateUser(user.id, {
              subscriptionStatus: "past_due",
              subscriptionTier: "free"
              // Downgrade access immediately
            });
            console.log(`\u26A0\uFE0F Payment failed for user ${user.id}, status set to past_due`);
          }
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      res.json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err.message);
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }
  });
  app2.post("/api/stripe/verify-and-login", async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }
      const userId = session.metadata?.userId;
      if (!userId) {
        return res.status(400).json({ error: "User ID not found in session" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      await storage.updateUser(userId, {
        stripeSubscriptionId: session.subscription,
        subscriptionStatus: "active",
        subscriptionTier: "paid"
      });
      const token = generateToken();
      await storage.createSession(userId, token, new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3));
      console.log(`\u2705 User ${userId} logged in after payment completion`);
      res.json({
        user: { ...user, password: void 0, subscriptionStatus: "active" },
        token
      });
    } catch (err) {
      console.error("Verify and login error:", err.message);
      res.status(500).json({ error: err.message || "Failed to verify payment" });
    }
  });
  app2.post("/api/stripe/verify-session", authenticate, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    try {
      const { sessionId } = req.body;
      const userId = req.user.id;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }
      const session = await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ["line_items", "line_items.data.price.product"]
      });
      if (session.payment_status !== "paid") {
        return res.status(400).json({ error: "Payment not completed" });
      }
      if (session.metadata?.userId !== userId) {
        return res.status(403).json({ error: "Session does not belong to this user" });
      }
      const purchaseType = session.metadata?.purchaseType;
      const paymentIntentId = session.payment_intent;
      if (purchaseType === "feature" || session.mode === "payment") {
        let featureKey = session.metadata?.featureKey;
        let priceId = null;
        if (session.line_items && session.line_items.data.length > 0) {
          const lineItem = session.line_items.data[0];
          priceId = lineItem.price?.id || null;
          if (priceId) {
            for (const [key, feature2] of Object.entries(FEATURE_CATALOG)) {
              if (feature2.stripeProductId === priceId) {
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
        const feature = FEATURE_CATALOG[featureKey];
        const existingPurchase = await storage.findPurchaseByStripeRefs(userId, paymentIntentId, sessionId);
        if (existingPurchase) {
          console.log(`\u2139\uFE0F Feature purchase already recorded: ${featureKey} for user ${userId} (payment: ${paymentIntentId}, session: ${sessionId})`);
          return res.json({ success: true, message: "Feature purchase already confirmed", featureKey, duplicate: true });
        }
        await storage.createUserPurchasedFeature({
          userId,
          featureKey,
          stripeProductId: feature.stripeProductId,
          stripePaymentIntentId: paymentIntentId,
          stripeCheckoutSessionId: sessionId,
          amountPaid: feature.price
        });
        console.log(`\u2705 Feature purchase recorded: ${featureKey} for user ${userId}`);
        res.json({ success: true, message: "Feature purchase confirmed", featureKey });
      } else {
        await storage.updateUser(userId, {
          stripeSubscriptionId: session.subscription,
          subscriptionTier: "paid",
          subscriptionStatus: "active"
        });
        console.log(`\u2705 Subscription activated for existing user ${userId}`);
        res.json({ success: true, message: "Subscription activated successfully" });
      }
    } catch (err) {
      console.error("Verify session error:", err.message);
      res.status(500).json({ error: err.message || "Failed to verify payment" });
    }
  });
  app2.post("/api/stripe/cancel-subscription", authenticate, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(400).json({ error: "No active subscription found" });
      }
      await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true
      });
      await storage.updateUser(userId, {
        subscriptionTier: "free",
        subscriptionStatus: "canceled"
      });
      console.log(`\u2705 Subscription canceled for user ${userId}`);
      res.json({ success: true, message: "Subscription canceled successfully" });
    } catch (err) {
      console.error("Cancel subscription error:", err.message);
      res.status(500).json({ error: err.message || "Failed to cancel subscription" });
    }
  });
  app2.post("/api/stripe/billing-portal", authenticate, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(400).json({ error: "No Stripe customer found" });
      }
      const baseUrl = process.env.APP_URL || "http://localhost:5000";
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${baseUrl}/dashboard`
      });
      console.log(`\u2705 Billing portal created for user ${userId}`);
      res.json({ url: session.url });
    } catch (err) {
      console.error("Billing portal error:", err.message);
      res.status(500).json({ error: err.message || "Failed to create billing portal" });
    }
  });
  app2.get("/api/user/purchased-features", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const purchasedFeatures = await storage.getUserPurchasedFeatures(userId);
      res.json(purchasedFeatures);
    } catch (err) {
      console.error("Error fetching purchased features:", err.message);
      res.status(500).json({ error: err.message || "Failed to fetch purchased features" });
    }
  });
  app2.get("/api/user/feature-access", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      const unusedCredits = await storage.getUserUnusedCredits(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const hasActiveSubscription = (user.subscriptionTier === "paid" || user.subscriptionTier === "institutional") && (user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing");
      const featureAccess = {};
      const creditCounts = {};
      for (const key in FEATURE_CATALOG) {
        const featureKey = key;
        if (hasActiveSubscription) {
          featureAccess[featureKey] = true;
          creditCounts[featureKey] = -1;
        } else {
          const credits = unusedCredits.filter((f) => f.featureKey === featureKey);
          featureAccess[featureKey] = credits.length > 0;
          creditCounts[featureKey] = credits.length;
        }
      }
      res.json({
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        hasActiveSubscription,
        purchasedFeatures: unusedCredits.map((f) => f.featureKey),
        featureAccess,
        creditCounts
      });
    } catch (err) {
      console.error("Feature access error:", err.message);
      res.status(500).json({ error: err.message || "Failed to fetch feature access" });
    }
  });
  app2.delete("/api/users/delete-account", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (stripe && user.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(user.stripeSubscriptionId);
          console.log(`\u2705 Stripe subscription canceled for user ${userId}`);
        } catch (err) {
          console.error("Error canceling Stripe subscription:", err.message);
        }
      }
      await storage.deleteUser(userId);
      console.log(`\u2705 User account deleted: ${userId}`);
      res.json({ success: true, message: "Account deleted successfully" });
    } catch (err) {
      console.error("Delete account error:", err.message);
      res.status(500).json({ error: err.message || "Failed to delete account" });
    }
  });
  app2.get("/api/tours/status", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const completedTours = await storage.getUserCompletedTours(userId);
      res.json({
        completedTours: completedTours.map((t) => t.tourId)
      });
    } catch (err) {
      console.error("Get tour status error:", err.message);
      res.status(500).json({ error: err.message || "Failed to fetch tour status" });
    }
  });
  app2.post("/api/tours/complete", authenticate, async (req, res) => {
    try {
      const userId = req.user.id;
      const { tourId } = req.body;
      if (!tourId || typeof tourId !== "string") {
        return res.status(400).json({ error: "Tour ID is required" });
      }
      const existingCompletion = await storage.getTourCompletion(userId, tourId);
      if (existingCompletion) {
        return res.json({
          message: "Tour already completed",
          completion: existingCompletion
        });
      }
      const completion = await storage.completeTour(userId, tourId);
      res.json({
        message: "Tour marked as completed",
        completion
      });
    } catch (err) {
      console.error("Complete tour error:", err.message);
      res.status(500).json({ error: err.message || "Failed to mark tour as completed" });
    }
  });
  const contactRateMap = /* @__PURE__ */ new Map();
  app2.post("/api/contact", async (req, res) => {
    try {
      if (req.body.honeypot || req.body.website) {
        return res.json({ message: "Contact form submitted successfully" });
      }
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
      const now = Date.now();
      const entry = contactRateMap.get(ip);
      if (entry && now < entry.resetAt) {
        if (entry.count >= 5) {
          return res.status(429).json({ error: "Too many requests. Please wait before submitting again." });
        }
        entry.count++;
      } else {
        contactRateMap.set(ip, { count: 1, resetAt: now + 60 * 60 * 1e3 });
      }
      const body = req.body;
      let firstName, lastName, email, category, message;
      if (body.firstName !== void 0 || body.lastName !== void 0) {
        const newSchema = z3.object({
          firstName: z3.string().min(1, "First name is required"),
          lastName: z3.string().min(1, "Last name is required"),
          email: z3.string().email("Please enter a valid email address"),
          category: z3.enum(["Support issue", "Feature suggestion", "Other"]),
          message: z3.string().min(10, "Message must be at least 10 characters"),
          honeypot: z3.string().optional()
        });
        const result = newSchema.safeParse(body);
        if (!result.success) {
          return res.status(400).json({ error: fromZodError(result.error).message });
        }
        ({ firstName, lastName, email, category, message } = result.data);
      } else {
        const legacySchema = z3.object({
          name: z3.string().min(2),
          email: z3.string().email(),
          subject: z3.string().min(5),
          message: z3.string().min(10)
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
      let userId;
      try {
        const token = req.headers.authorization?.replace("Bearer ", "") || req.cookies?.auth_token;
        if (token) {
          const session = await storage.getSession(token);
          if (session) userId = session.userId;
        }
      } catch {
      }
      const success = await emailService.sendContactForm({ firstName, lastName, email, category, message, userId });
      if (!success) {
        return res.status(500).json({ error: "Failed to send email. Please try again later." });
      }
      res.json({ message: "Contact form submitted successfully" });
    } catch (err) {
      console.error("Contact form error:", err.message);
      res.status(500).json({ error: err.message || "Failed to send contact form" });
    }
  });
  app2.post("/api/networking/recommendations", authenticate, async (req, res) => {
    try {
      const user = req.user;
      const activeResume = await storage.getActiveResume(user.id);
      const gaps = activeResume?.gaps ?? [];
      const industries = user.industries || [];
      const {
        force = false,
        intakeRole,
        intakeBackground,
        intakeLocation,
        intakeResumeText
      } = req.body;
      const targetRole = intakeRole || user.targetRole || activeResume?.targetRole || "professional";
      const location = intakeLocation || user.location || "";
      const { getNetworkingRecommendations: getNetworkingRecommendations2 } = await Promise.resolve().then(() => (init_networking(), networking_exports));
      const recommendations = await getNetworkingRecommendations2(
        targetRole,
        industries,
        Array.isArray(gaps) ? gaps : [],
        location,
        !!force,
        {
          background: intakeBackground,
          resumeText: intakeResumeText
        }
      );
      res.json(recommendations);
    } catch (err) {
      console.error("Networking recommendations error:", err.message);
      res.status(500).json({ error: err.message || "Failed to generate networking recommendations" });
    }
  });
  app2.post("/api/ai/convert-resume-cv", async (req, res) => {
    try {
      const { text: text2, direction } = req.body;
      if (!text2 || typeof text2 !== "string" || text2.trim().length < 30) {
        return res.status(400).json({ error: "Please provide document text (at least 30 characters)." });
      }
      if (direction !== "resume-to-cv" && direction !== "cv-to-resume") {
        return res.status(400).json({ error: "Direction must be 'resume-to-cv' or 'cv-to-resume'." });
      }
      const OpenAI4 = (await import("openai")).default;
      const openai4 = new OpenAI4({ apiKey: process.env.OPENAI_API_KEY });
      const isResumeToCv = direction === "resume-to-cv";
      const systemPrompt = isResumeToCv ? `You are an expert academic CV writer. Your job is to reformat a resume into a proper academic CV structure.

CRITICAL HONESTY RULES \u2014 DO NOT BREAK THESE:
1. Do NOT invent, fabricate, or assume ANY information not in the source document.
2. Do NOT add publications, grants, research, awards, presentations, or patents unless they appear in the source.
3. For sections where you have no source data, add a clear placeholder like: [Add your publications here] or [Add your teaching experience here].
4. Do NOT expand on or embellish any experience, dates, titles, or accomplishments beyond what is stated.
5. If the source is a simple resume with no academic content, restructure what exists into CV format and clearly label the placeholder sections.

CV FORMAT STRUCTURE (use ALL sections \u2014 mark empty ones with placeholders):
CURRICULUM VITAE
[Full Name from source]
[Contact info from source]

SUMMARY / RESEARCH INTERESTS
[Reformat from resume summary or objective. If none: Add your research interests or professional summary here.]

EDUCATION
[All education from source, reverse chronological. Include degree, institution, year, GPA if listed.]

ACADEMIC / PROFESSIONAL EXPERIENCE
[All experience from source in CV style \u2014 full dates, institution name, title, bullet-point responsibilities.]

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
[All skills from source \u2014 technical skills, languages, tools, certifications.]

PROFESSIONAL MEMBERSHIPS
[PLACEHOLDER: Add professional associations or memberships here.]

REFERENCES
[PLACEHOLDER: Available upon request. Add 3 references with name, title, institution, email, phone.]

FORMAT RULES:
- Plain text with section headers in ALL CAPS
- CV has no page limit \u2014 include all detail from the source
- Start your response directly with the CV content, no preamble` : `You are an expert resume writer. Your job is to condense a CV into a focused 1\u20132 page resume.

CRITICAL HONESTY RULES \u2014 DO NOT BREAK THESE:
1. Do NOT invent, fabricate, or add ANY information not in the source CV.
2. Do NOT add skills, accomplishments, or experiences not in the source.
3. Only remove or condense \u2014 never expand beyond what is in the source.

RESUME FORMAT (1\u20132 pages, prioritize recent and most relevant):

[Full Name]
[Contact info \u2014 email, phone, location, LinkedIn if present]

PROFESSIONAL SUMMARY
[2\u20133 sentence summary from the CV's most impressive and relevant points. Only use what is in the CV.]

EXPERIENCE
[Top 3\u20135 most recent/relevant positions. For each: Job Title | Company | Start \u2013 End date | 3\u20135 bullet points. Condense verbose CV descriptions into tight, action-verb-led bullets. Quantify impact where the CV already provides numbers \u2014 do not invent numbers.]

EDUCATION
[Highest degree first. Include degree, institution, year. Omit thesis details unless very brief.]

SKILLS
[Consolidated list of technical skills, tools, languages from the CV.]

CERTIFICATIONS
[Only if present in the source CV.]

PUBLICATIONS (condensed)
[If 1\u20133 publications, list them. If more than 3, note "X peer-reviewed publications \u2014 see full CV." Omit if none.]

FORMAT RULES:
- Plain text, section headers in ALL CAPS
- Action verbs to start every bullet (Led, Built, Designed, Managed, etc.)
- Start your response directly with the resume content, no preamble`;
      const completion = await openai4.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Source document to convert:

${text2.trim()}` }
        ],
        max_tokens: 4e3,
        temperature: 0.3
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
        docxBuffer: docxBuffer.toString("base64")
      });
    } catch (error) {
      console.error("CV converter error:", error);
      res.status(500).json({ error: "Failed to convert document." });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// api/index.ts
var app = express();
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: false, limit: "15mb" }));
app.use(cookieParser());
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
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
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "\u2026";
      console.log(logLine);
    }
  });
  next();
});
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message });
  console.error(err);
});
var routesReady;
function ensureRoutes() {
  if (!routesReady) {
    routesReady = registerRoutes(app).then(() => {
    });
  }
  return routesReady;
}
async function handler(req, res) {
  await ensureRoutes();
  app(req, res);
}
export {
  handler as default
};

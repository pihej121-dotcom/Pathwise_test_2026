import { Resend } from "resend";

export interface EmailVerificationData {
  email: string;
  token: string;
  institutionName?: string;
}

export interface InvitationEmailData {
  email: string;
  token: string;
  institutionName: string;
  inviterName: string;
  role: string;
}

export interface LicenseNotificationData {
  adminEmail: string;
  institutionName: string;
  usedSeats: number;
  totalSeats: number;
  usagePercentage: number;
}

export interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  category: string;
  message: string;
  userId?: number;
}

export interface PasswordResetData {
  email: string;
  token: string;
  userName: string;
}

export interface AdminWelcomeData {
  email: string;
  password: string;
  institutionName: string;
  studentLimit: number;
  licenseEndDate: string;
}

export interface WelcomeEmailData {
  email: string;
  firstName: string;
}

/* ✅ 1. Clean, Railway-friendly Resend client setup */
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || "Pathwise <noreply@pathwise.nyc>";

  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY not found in environment variables. Please set it in Railway."
    );
  }

  return {
    client: new Resend(apiKey),
    fromEmail,
  };
}

/* ✅ 2. Main EmailService */
export class EmailService {
  private getBaseUrl(): string {
    // Detect Railway or production
    if (process.env.RAILWAY_ENVIRONMENT || process.env.NODE_ENV === "production") {
      return "https://pathwise.nyc"; // <-- use your live domain
    }

    // Development fallback
    return process.env.REPLIT_DOMAINS
      ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`
      : "http://localhost:5000";
  }

  async sendEmailVerification(data: EmailVerificationData): Promise<boolean> {
    try {
      const { client, fromEmail } = getResendClient();
      const verificationUrl = `${this.getBaseUrl()}/verify-email?token=${data.token}`;
      const displayName = data.institutionName || "Pathwise";

      // Logo served as static asset; hardcoded to production domain for email clients.
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

      const text = `Welcome to ${displayName}!

Please verify your email address to activate your Pathwise account:
${verificationUrl}

This link expires in 24 hours.

If you didn't create a Pathwise account, you can safely ignore this email.

---
Pathwise · https://pathwise.nyc`;

      await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: `Verify your email for Pathwise`,
        html,
        text,
      });

      return true;
    } catch (error) {
      console.error("❌ Failed to send email verification:", error);
      return false;
    }
  }

  async sendInvitation(data: InvitationEmailData): Promise<boolean> {
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
        `,
      });

      console.log(`✅ Invitation email sent to ${data.email}: ${result.data?.id}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send invitation email:", error);
      return false;
    }
  }

  async sendLicenseUsageNotification(data: LicenseNotificationData): Promise<boolean> {
    try {
      const { client, fromEmail } = getResendClient();
      await client.emails.send({
        from: fromEmail,
        to: data.adminEmail,
        subject: `License usage alert for ${data.institutionName}`,
        html: `
          <p>${data.institutionName} has used ${data.usedSeats}/${data.totalSeats} seats (${data.usagePercentage}%).</p>
          <p>Please monitor your usage or consider upgrading.</p>
        `,
      });
      return true;
    } catch (error) {
      console.error("❌ Failed to send license usage notification:", error);
      return false;
    }
  }

  async sendContactForm(data: ContactFormData): Promise<boolean> {
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
        text: `Name: ${fullName}\nEmail: ${data.email}\nCategory: ${data.category}${data.userId ? `\nUser ID: ${data.userId}` : ""}\n\nMessage:\n${data.message}`,
      });
      return true;
    } catch (error) {
      console.error("❌ Failed to send contact form email:", error);
      return false;
    }
  }

  async sendPasswordReset(data: PasswordResetData): Promise<boolean> {
    try {
      const { client, fromEmail } = getResendClient();
      const resetUrl = `${this.getBaseUrl()}/reset-password?token=${data.token}`;

      // Logo is served as a static asset at the production domain.
      // public/pathwise-logo.png is copied to dist by Vite at build time.
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
                Someone (hopefully you) requested a password reset for your Pathwise account. Click the button below to choose a new password. If you didn't make this request, you can safely ignore this email — your password won't change.
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
                    <strong style="color:#475569;">Security notice:</strong> This link expires in <strong>1 hour</strong>. If you didn't request a password reset, no action is needed — your password remains unchanged and your account is secure.
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

      const text = `Hi ${data.userName},

Someone (hopefully you) requested a password reset for your Pathwise account.

Click the link below to set a new password:
${resetUrl}

This link expires in 1 hour.

If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.

---
Pathwise · https://pathwise.nyc`;

      await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: "Reset your Pathwise password",
        html,
        text,
      });
      return true;
    } catch (error) {
      console.error("❌ Failed to send password reset email:", error);
      return false;
    }
  }

  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
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
        { name: "Resume <-> CV Converter", desc: "Convert your resume into a CV or condense a CV into a focused resume, and export it as a Word document." },
      ];

      const featureRows = features
        .map(
          (f) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">
              <p style="margin:0 0 2px;font-size:14px;font-weight:600;color:#0f172a;">${f.name}</p>
              <p style="margin:0;font-size:13px;color:#64748b;line-height:1.5;">${f.desc}</p>
            </td>
          </tr>`
        )
        .join("");

      const featureText = features
        .map((f) => `• ${f.name} — ${f.desc}`)
        .join("\n\n");

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
                <a href="mailto:contact@pathwise.nyc" style="color:#4f46e5;text-decoration:none;">contact@pathwise.nyc</a> — we read every message.
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

      const text = `Hi ${data.firstName},

Thank you for registering for Pathwise NYC. We're genuinely glad you're here.

Our mission is simple: to bring you one step closer to closing the gap between where you are now and the career of your dreams. Everything we build is aimed at making your job search and career development clearer, faster, and less overwhelming.

Here's everything you can do with Pathwise:

${featureText}

We're committed to keeping Pathwise free and accessible. If you believe in what we're building and want to help us keep it that way, you can support us here:
${donateUrl}

Every contribution, big or small, helps us keep these tools free for job seekers everywhere.

Have a question, an issue, or an idea to make Pathwise better? Just email us at contact@pathwise.nyc — we read every message.

Welcome aboard, and here's to closing the gap.

The Pathwise NYC Team

---
Pathwise · https://pathwise.nyc`;

      await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: "Welcome to Pathwise NYC — let's close the gap to your dream career",
        html,
        text,
      });

      console.log(`✅ Welcome email sent to ${data.email}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error);
      return false;
    }
  }

  async sendAdminWelcome(data: AdminWelcomeData): Promise<boolean> {
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
        `,
      });

      console.log(`✅ Admin welcome email sent to ${data.email}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send admin welcome email:", error);
      return false;
    }
  }
}

export const emailService = new EmailService();


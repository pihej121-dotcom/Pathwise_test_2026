import { Resend } from "resend";

export interface EmailVerificationData {
  email: string;
  token: string;
  institutionName: string;
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
  name: string;
  email: string;
  subject: string;
  message: string;
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

      await client.emails.send({
        from: fromEmail,
        to: data.email,
        subject: `Verify your email for ${data.institutionName}`,
        html: `
          <p>Welcome to <strong>${data.institutionName}</strong> on Pathwise!</p>
          <p>Please verify your email by clicking below:</p>
          <a href="${verificationUrl}" style="color:#667eea;">Verify Email</a>
        `,
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
      await client.emails.send({
        from: fromEmail,
        to: "patrick@pathwise.nyc",
        replyTo: data.email,
        subject: `Contact Form: ${data.subject}`,
        html: `
          <p><strong>From:</strong> ${data.name} (${data.email})</p>
          <p><strong>Message:</strong><br>${data.message}</p>
        `,
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


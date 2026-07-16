import { Resend } from 'resend';

/**
 * Returns a Resend client configured from the RESEND_API_KEY environment variable.
 * Works in any hosting environment (Vercel, Railway, Replit, local dev).
 */
export function getResendClient(): { client: Resend; fromEmail: string } {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set.');
  }
  const fromEmail =
    process.env.RESEND_FROM_EMAIL || 'Pathwise <noreply@pathwise.nyc>';
  return { client: new Resend(apiKey), fromEmail };
}

// Legacy async wrapper kept for backward compatibility with email.ts callers
// that use `await getUncachableResendClient()`.
export async function getUncachableResendClient(): Promise<{ client: Resend; fromEmail: string }> {
  return getResendClient();
}

import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { CheckCircle2, MailOpen, XCircle, Loader2 } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const email = params.get("email");

  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">(
    token ? "verifying" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      setStatus("verifying");
      try {
        const res = await fetch("/api/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || "Verification failed. The link may have expired.");
          setStatus("error");
        } else {
          setStatus("success");
        }
      } catch {
        setErrorMessage("Something went wrong. Please try again.");
        setStatus("error");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card className="shadow-md border border-border/60">
          <CardHeader className="flex flex-col items-center text-center space-y-2 pt-8 pb-4">
            <Logo size="lg" className="mb-1" />
          </CardHeader>

          <CardContent className="pt-2 pb-8 text-center">
            {status === "verifying" && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Verifying your email…</p>
              </div>
            )}

            {status === "idle" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <MailOpen className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Check your inbox</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We've sent a verification link to{" "}
                    {email ? (
                      <span className="font-medium text-foreground">{email}</span>
                    ) : (
                      "your email address"
                    )}
                    . Click the link to activate your account.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  The link expires in 24 hours. Check your spam folder if you don't see it.
                </p>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="mt-1">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Email verified!</h2>
                  <p className="text-sm text-muted-foreground">
                    Your account is now active. You can sign in and start using Pathwise.
                  </p>
                </div>
                <Link href="/login">
                  <Button className="mt-1">Sign in to your account</Button>
                </Link>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="w-7 h-7 text-destructive" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-1">Verification failed</h2>
                  <p className="text-sm text-muted-foreground">{errorMessage}</p>
                </div>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="mt-1">
                    Back to sign in
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Logo } from "@/components/Logo";
import { ArrowLeft } from "lucide-react";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract invitation token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken =
    urlParams.get("invitationToken") || urlParams.get("token");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !password) return;

    try {
      setError("");
      setIsSubmitting(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          confirmPassword: password,
          invitationToken: invitationToken || undefined,
          selectedPlan: invitationToken ? undefined : "free",
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Registration failed");

      if (result.token) {
        localStorage.setItem("auth_token", result.token);
        window.location.href = "/";
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </Link>

        <Card className="shadow-md border border-border/60">
          <CardHeader className="flex flex-col items-center text-center space-y-2 pt-8 pb-4">
            <Logo size="lg" className="mb-1" />
            <p className="text-sm text-muted-foreground tracking-wide">
              From{" "}
              <span className="text-primary font-medium">Uncertainty</span> to{" "}
              <span className="text-primary font-medium">Opportunity</span>
            </p>
            <div className="pt-4">
              <CardTitle className="text-lg font-semibold">
                Create your account
              </CardTitle>
              <CardDescription className="text-sm">
                {invitationToken
                  ? "Complete your registration"
                  : "Free to get started"}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-2 pb-8">
            <form onSubmit={onSubmit} className="space-y-4">
              {invitationToken && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription>
                    ✅ You're registering with an invitation.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || !firstName || !email || !password}
              >
                {isSubmitting ? "Creating account…" : "Create account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


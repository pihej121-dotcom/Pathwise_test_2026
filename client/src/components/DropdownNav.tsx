import { useState } from "react";
import { useLocation } from "wouter";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  LogOut,
  LogIn,
  UserPlus,
  Menu,
  Moon,
  Sun,
  Heart,
  KeyRound,
} from "lucide-react";

export function DropdownNav() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.email) return;
    setMenuOpen(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });
      if (!res.ok) throw new Error();
      toast({
        title: "Check your email",
        description: "We've sent a link to reset your password.",
      });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Couldn't send the reset email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : "Guest";

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-card border-b border-border z-40 px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">

          {/* Logo */}
          <div className="flex items-center space-x-2">
            <Logo size="sm" />
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Theme toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="w-9 h-9 p-0"
            >
              {theme === "dark" ? (
                <Heart className="h-4 w-4" />
              ) : theme === "pink" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Dropdown */}
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center space-x-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback>
                      {getInitials(user?.firstName, user?.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">
                    {displayName}
                  </span>
                  <Menu className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback>
                        {getInitials(user?.firstName, user?.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email || "Not signed in"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {user ? (
                  <>
                    <DropdownMenuItem onClick={handleChangePassword} data-testid="button-change-password">
                      <KeyRound className="w-4 h-4 mr-2" />
                      Change password
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="text-red-500"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() => {
                        setLocation("/register");
                        setMenuOpen(false);
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        setLocation("/login");
                        setMenuOpen(false);
                      }}
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </div>
      </div>

      <div className="h-16" />
    </>
  );
}

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";

export function Sidebar() {
  const { user, logout } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  const displayName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col h-screen">
      
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col items-center text-center space-y-1">
          <Logo size="md" />
        </div>
      </div>

      {/* Spacer to push logout to bottom */}
      <div className="flex-1" />

      {/* User + Logout */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gradient-to-br from-accent to-primary text-white font-semibold text-sm">
              {getInitials(user?.firstName, user?.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-medium text-foreground truncate"
              data-testid="user-name"
            >
              {displayName || "User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {user?.major || "Student"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

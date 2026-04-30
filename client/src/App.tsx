import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TourProvider } from "@/contexts/TourContext";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

// Pages
import ChatHome from "@/pages/ChatHome";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import Checkout from "@/pages/Checkout";
import CheckoutSuccess from "@/pages/CheckoutSuccess";
import ResumeUpload from "@/pages/ResumeUpload";
import ResumeAnalysis from "@/pages/ResumeAnalysis";
import CareerRoadmap from "@/pages/CareerRoadmap";
import JobAnalysis from "@/pages/JobAnalysis";
import MicroProjects from "@/pages/MicroProjects";
import { AICopilot } from "@/pages/AICopilot";
import Applications from "@/pages/Applications";
import { InterviewPrep } from "@/pages/InterviewPrep";
import AdminDashboard from "@/pages/AdminDashboard";
import SuperAdminDashboard from "@/pages/SuperAdminDashboard";
import InstitutionAdminDashboard from "@/pages/InstitutionAdminDashboard";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, adminOnly = false, institutionAdminOnly = false, superAdminOnly = false, studentOnly = false }: { component: () => JSX.Element, adminOnly?: boolean, institutionAdminOnly?: boolean, superAdminOnly?: boolean, studentOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    return <Login />;
  }
  
  const userRole = user.role;
  
  if (superAdminOnly && userRole !== "super_admin") {
    return <NotFound />;
  }
  
  if (institutionAdminOnly && userRole !== "institution_admin") {
    return <NotFound />;
  }
  
  if (adminOnly && userRole !== "admin" && userRole !== "institution_admin" && userRole !== "super_admin") {
    return <NotFound />;
  }
  
  if (studentOnly && userRole !== "student") {
    return <NotFound />;
  }
  
  return <Component />;
}

function RoleBasedHome() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }
  
  // If not authenticated, show new chat-based home
  if (!user) {
    return <ChatHome />;
  }
  
  const userRole = user.role;
  
  if (userRole === "super_admin") {
    return <SuperAdminDashboard />;
  }
  
  if (userRole === "institution_admin") {
    return <InstitutionAdminDashboard />;
  }
  
  if (userRole === "admin") {
    return <AdminDashboard />;
  }
  
  return <ChatHome />;
}

function PublicRoute({ component: Component }: { component: () => JSX.Element }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (user) {
    return <RoleBasedHome />;
  }
  
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/login" component={() => <PublicRoute component={Login} />} />
      <Route path="/register" component={() => <PublicRoute component={Register} />} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/checkout/success" component={CheckoutSuccess} />
      <Route path="/terms" component={TermsOfService} />
      <Route path="/chat" component={ChatHome} />
      
      {/* Role-based home route */}
      <Route path="/" component={RoleBasedHome} />
      
      {/* Student routes - all accessible from unified dashboard */}
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} studentOnly />} />
      <Route path="/resume-upload" component={() => <ProtectedRoute component={() => <ResumeUpload />} studentOnly />} />
      <Route path="/resume" component={() => <ProtectedRoute component={() => <ResumeAnalysis />} studentOnly />} />
      <Route path="/roadmap" component={() => <ProtectedRoute component={() => <CareerRoadmap />} studentOnly />} />
      <Route path="/jobs" component={() => <ProtectedRoute component={() => <JobAnalysis />} studentOnly />} />
      <Route path="/micro-projects" component={() => <ProtectedRoute component={() => <MicroProjects />} studentOnly />} />
      <Route path="/ai-copilot" component={() => <ProtectedRoute component={() => <AICopilot />} studentOnly />} />
      <Route path="/applications" component={() => <ProtectedRoute component={() => <Applications />} studentOnly />} />
      <Route path="/interview-prep" component={() => <ProtectedRoute component={() => <InterviewPrep />} studentOnly />} />
      
      {/* Super Admin routes */}
      <Route path="/admin/dashboard" component={() => <ProtectedRoute component={SuperAdminDashboard} superAdminOnly />} />
      <Route path="/super-admin" component={() => <ProtectedRoute component={SuperAdminDashboard} superAdminOnly />} />
      
      {/* Institution Admin routes */}
      <Route path="/institution/dashboard" component={() => <ProtectedRoute component={InstitutionAdminDashboard} institutionAdminOnly />} />
      <Route path="/institution-admin" component={() => <ProtectedRoute component={InstitutionAdminDashboard} institutionAdminOnly />} />
      
      {/* Regular Admin routes */}
      <Route path="/admin" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
      <Route path="/admin-dashboard" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
      <Route path="/admin/users" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
      <Route path="/admin/invitations" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
      <Route path="/admin/license" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
      <Route path="/admin/settings" component={() => <ProtectedRoute component={AdminDashboard} adminOnly />} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TourProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </TourProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

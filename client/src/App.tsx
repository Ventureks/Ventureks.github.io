import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Contractors from "@/pages/contractors";
import Tasks from "@/pages/tasks";
import Offers from "@/pages/offers";
import Emails from "@/pages/emails";
import EmailSettings from "@/pages/email-settings";
import Support from "@/pages/support";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Ładowanie...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <Dashboard />} />
      <Route path="/dashboard" component={() => <Dashboard />} />
      <Route path="/contractors" component={() => <Contractors />} />
      <Route path="/tasks" component={() => <Tasks />} />
      <Route path="/offers" component={() => <Offers />} />
      <Route path="/emails" component={() => <Emails />} />
      <Route path="/email-settings" component={() => <EmailSettings />} />
      <Route path="/support" component={() => <Support />} />
      <Route path="/analytics" component={() => <Analytics />} />
      <Route path="/settings" component={() => <Settings />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="crm-theme">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "next-themes";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";
import Index from "./pages/Index";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import CreateDrill from "./pages/CreateDrill";
import EditDrill from "./pages/EditDrill";
import Library from "./pages/Library";
import Community from "./pages/Community";
import DrillDetail from "./pages/DrillDetail";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import Notifications from "./pages/Notifications";
import Collections from "./pages/Collections";
import Admin from "./pages/Admin";
import AccountSettings from "./pages/AccountSettings";
import Referrals from "./pages/Referrals";
import SessionBuilder from "./pages/SessionBuilder";
import SessionDetail from "./pages/SessionDetail";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import NotFound from "./pages/NotFound";
import SportLanding from "./pages/SportLanding";
import { CookieConsent } from "@/components/CookieConsent";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary level="app">
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <CookieConsent />
              <Routes>
                <Route path="/" element={<RouteErrorBoundary><Index /></RouteErrorBoundary>} />
                <Route path="/register" element={<RouteErrorBoundary><Register /></RouteErrorBoundary>} />
                <Route path="/login" element={<RouteErrorBoundary><Login /></RouteErrorBoundary>} />
                <Route path="/forgot-password" element={<RouteErrorBoundary><ForgotPassword /></RouteErrorBoundary>} />
                <Route path="/reset-password" element={<RouteErrorBoundary><ResetPassword /></RouteErrorBoundary>} />
                <Route path="/verify-email" element={<RouteErrorBoundary><VerifyEmail /></RouteErrorBoundary>} />
                <Route path="/dashboard" element={<RouteErrorBoundary><Dashboard /></RouteErrorBoundary>} />
                <Route path="/create" element={<RouteErrorBoundary><CreateDrill /></RouteErrorBoundary>} />
                <Route path="/drill/:id/edit" element={<RouteErrorBoundary><EditDrill /></RouteErrorBoundary>} />
                <Route path="/library" element={<RouteErrorBoundary><Library /></RouteErrorBoundary>} />
                <Route path="/community" element={<RouteErrorBoundary><Community /></RouteErrorBoundary>} />
                <Route path="/drill/:id" element={<RouteErrorBoundary><DrillDetail /></RouteErrorBoundary>} />
                <Route path="/search" element={<RouteErrorBoundary><Search /></RouteErrorBoundary>} />
                <Route path="/profile/:id" element={<RouteErrorBoundary><Profile /></RouteErrorBoundary>} />
                <Route path="/feed" element={<RouteErrorBoundary><Feed /></RouteErrorBoundary>} />
                <Route path="/notifications" element={<RouteErrorBoundary><Notifications /></RouteErrorBoundary>} />
                <Route path="/collections" element={<RouteErrorBoundary><Collections /></RouteErrorBoundary>} />
                <Route path="/collections/:id" element={<RouteErrorBoundary><Collections /></RouteErrorBoundary>} />
                <Route path="/admin" element={<RouteErrorBoundary><Admin /></RouteErrorBoundary>} />
                <Route path="/settings" element={<RouteErrorBoundary><AccountSettings /></RouteErrorBoundary>} />
                <Route path="/referrals" element={<RouteErrorBoundary><Referrals /></RouteErrorBoundary>} />
                <Route path="/sessions/create" element={<RouteErrorBoundary><SessionBuilder /></RouteErrorBoundary>} />
                <Route path="/sessions/:id" element={<RouteErrorBoundary><SessionDetail /></RouteErrorBoundary>} />
                <Route path="/sessions/:id/edit" element={<RouteErrorBoundary><SessionBuilder /></RouteErrorBoundary>} />
                <Route path="/terms" element={<RouteErrorBoundary><Terms /></RouteErrorBoundary>} />
                <Route path="/privacy" element={<RouteErrorBoundary><Privacy /></RouteErrorBoundary>} />
                <Route path="/cookies" element={<RouteErrorBoundary><Cookies /></RouteErrorBoundary>} />
                <Route path="/field-hockey" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/football" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/basketball" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/volleyball" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/floorball" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/tennis" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/ice-hockey" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/rugby" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/handball" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                <Route path="/fitness" element={<RouteErrorBoundary><SportLanding /></RouteErrorBoundary>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;

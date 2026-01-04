import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import FAQ from "./pages/FAQ";
import Privacy from "./pages/Privacy";
import SessionLaunch from "./pages/SessionLaunch";
import Terms from "./pages/Terms";
import Disclaimer from "./pages/Disclaimer";
import Intake from "./pages/Intake";
import Schedule from "./pages/Schedule";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SessionAssessor from "./pages/SessionAssessor";
import SessionStudent from "./pages/SessionStudent";
import ParentPortal from "./pages/ParentPortal";
import SessionReport from "./pages/SessionReport";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/intake" element={<Intake />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/login" element={<Login />} />
          <Route path="/portal" element={<ParentPortal />} />
          
{/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/session" element={<SessionLaunch />} />
          
          {/* Session Routes - Split Screen System */}
          <Route path="/session/:id/assessor" element={<SessionAssessor />} />
          <Route path="/session/:id/student" element={<SessionStudent />} />
          <Route path="/session/:id/report" element={<SessionReport />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

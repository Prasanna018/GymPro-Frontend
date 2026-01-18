import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import Store from "./pages/Store";
import Payments from "./pages/Payments";
import Reminders from "./pages/Reminders";
import Attendance from "./pages/Attendance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MemberDashboard from "./pages/MemberDashboard";
import MemberStore from "./pages/MemberStore";
import MemberAttendance from "./pages/MemberAttendance";
import MemberPayments from "./pages/MemberPayments";
import MemberProfile from "./pages/MemberProfile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Owner Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/members" element={<Members />} />
            <Route path="/dashboard/store" element={<Store />} />
            <Route path="/dashboard/payments" element={<Payments />} />
            <Route path="/dashboard/reminders" element={<Reminders />} />
            <Route path="/dashboard/attendance" element={<Attendance />} />
            <Route path="/dashboard/reports" element={<Reports />} />
            <Route path="/dashboard/settings" element={<Settings />} />
            
            {/* Member Routes */}
            <Route path="/member" element={<MemberDashboard />} />
            <Route path="/member/store" element={<MemberStore />} />
            <Route path="/member/attendance" element={<MemberAttendance />} />
            <Route path="/member/payments" element={<MemberPayments />} />
            <Route path="/member/profile" element={<MemberProfile />} />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

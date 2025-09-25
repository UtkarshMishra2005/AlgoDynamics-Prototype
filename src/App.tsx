import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoleSelection from "./pages/RoleSelection";
import AuthPage from "./pages/auth/AuthPage";
import FarmerDashboard from "./pages/dashboard/FarmerDashboard";
import InspectorDashboard from "./pages/dashboard/InspectorDashboard";
import DistributorDashboard from "./pages/dashboard/DistributorDashboard";
import RetailerDashboard from "./pages/dashboard/RetailerDashboard";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelection />} />
          <Route path="/auth/:role" element={<AuthPage />} />
          <Route path="/dashboard/farmer" element={
            <ProtectedRoute>
              <FarmerDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/inspector" element={
            <ProtectedRoute>
              <InspectorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/distributor" element={
            <ProtectedRoute>
              <DistributorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/retailer" element={
            <ProtectedRoute>
              <RetailerDashboard />
            </ProtectedRoute>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

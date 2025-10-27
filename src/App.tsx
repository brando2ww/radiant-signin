import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Plans from "./pages/Plans";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import Transactions from "./pages/Transactions";
import CreditCards from "./pages/CreditCards";
import CRM from "./pages/CRM";
import LeadDetail from "./pages/LeadDetail";
import Settings from "./pages/Settings";
import Evaluations from "./pages/Evaluations";
import PublicEvaluation from "./pages/PublicEvaluation";
import PublicMenu from "./pages/PublicMenu";
import Delivery from "./pages/Delivery";
import InstallApp from "./pages/InstallApp";
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
            <Route path="/" element={<Index />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/plans" 
              element={
                <ProtectedRoute>
                  <Plans />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/calendar" 
              element={
                <ProtectedRoute>
                  <Calendar />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/tasks" 
              element={
                <ProtectedRoute>
                  <Tasks />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/transactions" 
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/credit-cards" 
              element={
                <ProtectedRoute>
                  <CreditCards />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crm" 
              element={
                <ProtectedRoute>
                  <CRM />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/crm/lead/:id" 
              element={
                <ProtectedRoute>
                  <LeadDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/avaliacoes" 
              element={
                <ProtectedRoute>
                  <Evaluations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/delivery" 
              element={
                <ProtectedRoute>
                  <Delivery />
                </ProtectedRoute>
              } 
            />
            {/* Public routes - no authentication required */}
            <Route path="/avaliar/:userId" element={<PublicEvaluation />} />
            <Route path="/cardapio/:userId" element={<PublicMenu />} />
            <Route path="/instalar-app" element={<InstallApp />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

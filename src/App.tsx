import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { ShoppingCartProvider } from "@/components/ShoppingCart";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AdminErrorBoundary } from "@/components/admin/AdminErrorBoundary";
import Index from "./pages/Index";
import AuthDebug from "./pages/AuthDebug";
import Auth from "./pages/Auth";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Products from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import CookiePolicy from "./pages/CookiePolicy";
import Warranty from "./pages/Warranty";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route path="/auth-debug" element={<AuthDebug />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/dashboard" element={
      <ProtectedRoute>
        <CustomerDashboard />
      </ProtectedRoute>
    } />
    <Route path="/admin/*" element={
      <ProtectedRoute>
        <AdminErrorBoundary>
          <AdminDashboard />
        </AdminErrorBoundary>
      </ProtectedRoute>
    } />
    <Route path="/products" element={<Products />} />
    <Route path="/products/:id" element={<ProductDetail />} />
    <Route path="/projects" element={<Projects />} />
    <Route path="/projects/:id" element={<ProjectDetail />} />
    <Route path="/about" element={<About />} />
    <Route path="/services" element={<Services />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    <Route path="/terms-of-service" element={<TermsOfService />} />
    <Route path="/cookie-policy" element={<CookiePolicy />} />
    <Route path="/warranty" element={<Warranty />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ShoppingCartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppRoutes />
              </TooltipProvider>
            </ShoppingCartProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;

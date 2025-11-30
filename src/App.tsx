
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { WardrobeProvider } from "@/context/WardrobeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import ErrorBoundary from "./ErrorBoundary";
import HomeLayout from "./layouts/HomeLayout";
import Dashboard from "./pages/Dashboard";
import Closet from "./pages/Closet";
import Outfits from "./pages/Outfits";
import Trends from "./pages/Trends";
import CommunityFeedback from "./pages/CommunityFeedback";
import AddItem from "./pages/AddItem";
import ItemDetails from "./pages/ItemDetails";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import PersonaSetup from "./pages/PersonaSetup";
import Store from "./pages/Store";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AIChatbot from "./pages/AIChatbot";
import AIOutfitSuggestions from "./pages/AIOutfitSuggestions";
import ColorPalette from "./pages/ColorPalette";


const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wardrobe-teal mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-wardrobe-teal mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" replace /> : <>{children}</>;
};

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <WardrobeProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <HomeLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Dashboard />} />
                  <Route path="/closet" element={<Closet />} />
                  <Route path="/outfits" element={<Outfits />} />
                  <Route path="/trends" element={<Trends />} />
                  <Route path="/feedback" element={<CommunityFeedback />} />
                  <Route path="/add-item" element={<AddItem />} />
                  <Route path="/item/:id" element={<ItemDetails />} />
                  <Route path="/ai-chat" element={<AIChatbot />} />
                  <Route path="/ai-outfits" element={<AIOutfitSuggestions />} />
                  <Route path="/colors" element={<ColorPalette />} />
                  <Route path="/persona-setup" element={<PersonaSetup />} />
                  <Route path="/store" element={<Store />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/signup" element={
                  <PublicRoute>
                    <Signup />
                  </PublicRoute>
                } />
                <Route path="/forgot-password" element={
                  <PublicRoute>
                    <ForgotPassword />
                  </PublicRoute>
                } />
                <Route path="/reset-password" element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WardrobeProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

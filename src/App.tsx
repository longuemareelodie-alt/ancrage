import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import PremiumRoute from "@/components/PremiumRoute";
import PageTransition from "@/components/PageTransition";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Emotions from "./pages/Emotions";
import EmotionDetail from "./pages/EmotionDetail";
import Comprendre from "./pages/Comprendre";
import Avancer from "./pages/Avancer";
import AllerPlusLoin from "./pages/AllerPlusLoin";
import Parcours from "./pages/Parcours";
import Auth from "./pages/Auth";
import Profil from "./pages/Profil";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import CGV from "./pages/CGV";
import Confidentialite from "./pages/Confidentialite";
import MentionsLegales from "./pages/MentionsLegales";
import PaymentSuccess from "./pages/PaymentSuccess";
import Checkin from "./pages/Checkin";
import Historique from "./pages/Historique";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/emotions" element={<ProtectedRoute><PageTransition><Emotions /></PageTransition></ProtectedRoute>} />
        <Route path="/emotion/:emotion" element={<ProtectedRoute><PageTransition><EmotionDetail /></PageTransition></ProtectedRoute>} />
        <Route path="/checkin" element={<ProtectedRoute><PageTransition><Checkin /></PageTransition></ProtectedRoute>} />
        <Route path="/historique" element={<PremiumRoute><PageTransition><Historique /></PageTransition></PremiumRoute>} />
        <Route path="/comprendre" element={<PremiumRoute><PageTransition><Comprendre /></PageTransition></PremiumRoute>} />
        <Route path="/avancer" element={<PremiumRoute><PageTransition><Avancer /></PageTransition></PremiumRoute>} />
        <Route path="/aller-plus-loin" element={<PageTransition><AllerPlusLoin /></PageTransition>} />
        <Route path="/parcours" element={<PremiumRoute><PageTransition><Parcours /></PageTransition></PremiumRoute>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/payment-success" element={<ProtectedRoute><PageTransition><PaymentSuccess /></PageTransition></ProtectedRoute>} />
        <Route path="/profil" element={<PageTransition><Profil /></PageTransition>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/cgv" element={<PageTransition><CGV /></PageTransition>} />
        <Route path="/confidentialite" element={<PageTransition><Confidentialite /></PageTransition>} />
        <Route path="/mentions-legales" element={<PageTransition><MentionsLegales /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AnimatedRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { forwardRef, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import PremiumRoute from "@/components/PremiumRoute";
import SubscriptionRoute from "@/components/SubscriptionRoute";
import PaidRoute from "@/components/PaidRoute";
import PageTransition from "@/components/PageTransition";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import ScrollToHash from "@/components/ScrollToHash";
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
import PostFlow from "./pages/PostFlow";
import Paywall from "./pages/Paywall";
import Comparison from "./pages/Comparison";
import Unsubscribe from "./pages/Unsubscribe";
import Emergency from "./pages/Emergency";
import Sante from "./pages/Sante";
import SanteRendezVous from "./pages/SanteRendezVous";
import SanteMedicaments from "./pages/SanteMedicaments";
import SanteFicheMedicale from "./pages/SanteFicheMedicale";
import SanteRessources from "./pages/SanteRessources";
import FicheUrgencePublique from "./pages/FicheUrgencePublique";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <>
      <ScrollToHash />
      <TopNav />
      <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/dashboard" element={<ProtectedRoute><PageTransition><Dashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/emotions" element={<ProtectedRoute><PageTransition><Emotions /></PageTransition></ProtectedRoute>} />
        <Route path="/emotion/:emotion" element={<ProtectedRoute><PageTransition><EmotionDetail /></PageTransition></ProtectedRoute>} />
        <Route path="/checkin" element={<PremiumRoute><PageTransition><Checkin /></PageTransition></PremiumRoute>} />
        <Route path="/historique" element={<SubscriptionRoute><PageTransition><Historique /></PageTransition></SubscriptionRoute>} />
        <Route path="/comprendre" element={<SubscriptionRoute><PageTransition><Comprendre /></PageTransition></SubscriptionRoute>} />
        <Route path="/avancer" element={<SubscriptionRoute><PageTransition><Avancer /></PageTransition></SubscriptionRoute>} />
        <Route path="/aller-plus-loin" element={<PageTransition><AllerPlusLoin /></PageTransition>} />
        <Route path="/parcours" element={<PremiumRoute><PageTransition><Parcours /></PageTransition></PremiumRoute>} />
        <Route path="/post-flow" element={<ProtectedRoute><PageTransition><PostFlow /></PageTransition></ProtectedRoute>} />
        <Route path="/paywall" element={<PageTransition><Paywall /></PageTransition>} />
        <Route path="/comparaison" element={<PageTransition><Comparison /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/payment-success" element={<ProtectedRoute><PageTransition><PaymentSuccess /></PageTransition></ProtectedRoute>} />
        <Route path="/profil" element={<PremiumRoute><PageTransition><Profil /></PageTransition></PremiumRoute>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/cgv" element={<PageTransition><CGV /></PageTransition>} />
        <Route path="/confidentialite" element={<PageTransition><Confidentialite /></PageTransition>} />
        <Route path="/mentions-legales" element={<PageTransition><MentionsLegales /></PageTransition>} />
        <Route path="/urgence" element={<ProtectedRoute><PageTransition><Emergency /></PageTransition></ProtectedRoute>} />
        <Route path="/sante" element={<PaidRoute><PageTransition><Sante /></PageTransition></PaidRoute>} />
        <Route path="/sante/rendez-vous" element={<SubscriptionRoute><PageTransition><SanteRendezVous /></PageTransition></SubscriptionRoute>} />
        <Route path="/sante/medicaments" element={<SubscriptionRoute><PageTransition><SanteMedicaments /></PageTransition></SubscriptionRoute>} />
        <Route path="/sante/fiche-medicale" element={<SubscriptionRoute><PageTransition><SanteFicheMedicale /></PageTransition></SubscriptionRoute>} />
        <Route path="/sante/ressources" element={<PaidRoute><PageTransition><SanteRessources /></PageTransition></PaidRoute>} />
        <Route path="/fiche-urgence/:token" element={<PageTransition><FicheUrgencePublique /></PageTransition>} />
        <Route path="/unsubscribe" element={<PageTransition><Unsubscribe /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
      </AnimatePresence>
      <BottomNav />
    </>
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

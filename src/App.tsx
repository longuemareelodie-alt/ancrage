import { forwardRef, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "@/components/ProtectedRoute";
import PaidRoute from "@/components/PaidRoute";
import AdminRoute from "@/components/AdminRoute";
import PageTransition from "@/components/PageTransition";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import ScrollToHash from "@/components/ScrollToHash";
import { RouteTransitionProvider } from "@/components/RouteTransition";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Emotions from "./pages/Emotions";
import EmotionDetail from "./pages/EmotionDetail";
import Comprendre from "./pages/Comprendre";
import Avancer from "./pages/Avancer";
import AllerPlusLoin from "./pages/AllerPlusLoin";
import Parcours from "./pages/Parcours";
import Initiation7j from "./pages/Initiation7j";
import Auth from "./pages/Auth";
import Profil from "./pages/Profil";
import ProfilStyle from "./pages/ProfilStyle";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import ActivationCompte from "./pages/ActivationCompte";
import NotFound from "./pages/NotFound";
import CGV from "./pages/CGV";
import Confidentialite from "./pages/Confidentialite";
import MentionsLegales from "./pages/MentionsLegales";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
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
import CalmeEnClair from "./pages/CalmeEnClair";
import Danger from "./pages/Danger";
import PremiumActivationLogPage from "./pages/admin/PremiumActivationLog";
import PremiumAuditListPage from "./pages/admin/PremiumAuditList";
import WebhookAnomaliesPage from "./pages/admin/WebhookAnomalies";
import PendingEmailsAdminPage from "./pages/admin/PendingEmails";

const queryClient = new QueryClient();

/**
 * AnimatePresence (framer-motion) attaches a ref to its direct child to
 * coordinate exit animations. `<Routes>` from react-router is a function
 * component and cannot receive refs, which triggers the warning:
 *   "Function components cannot be given refs."
 *
 * We wrap it in a `forwardRef` div so the ref lands on a real DOM node.
 */
const RoutesWrapper = forwardRef<HTMLDivElement, { children: ReactNode }>(
  ({ children }, ref) => (
    <div ref={ref} className="contents">
      {children}
    </div>
  ),
);
RoutesWrapper.displayName = "RoutesWrapper";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <RouteTransitionProvider>
      <ScrollToHash />
      <TopNav />
      <AnimatePresence mode="wait">
        <RoutesWrapper key={location.pathname}>
          <Routes location={location}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/dashboard" element={<PaidRoute><PageTransition><Dashboard /></PageTransition></PaidRoute>} />
        <Route path="/calme" element={<PaidRoute><PageTransition><CalmeEnClair /></PageTransition></PaidRoute>} />
        <Route path="/emotions" element={<PaidRoute><PageTransition><Emotions /></PageTransition></PaidRoute>} />
        <Route path="/emotion/:emotion" element={<PaidRoute><PageTransition><EmotionDetail /></PageTransition></PaidRoute>} />
        <Route path="/checkin" element={<PageTransition><Checkin /></PageTransition>} />
        <Route path="/historique" element={<PaidRoute><PageTransition><Historique /></PageTransition></PaidRoute>} />
        <Route path="/comprendre" element={<PaidRoute><PageTransition><Comprendre /></PageTransition></PaidRoute>} />
        <Route path="/avancer" element={<PaidRoute><PageTransition><Avancer /></PageTransition></PaidRoute>} />
        <Route path="/aller-plus-loin" element={<PageTransition><AllerPlusLoin /></PageTransition>} />
        <Route path="/parcours" element={<PaidRoute><PageTransition><Parcours /></PageTransition></PaidRoute>} />
        <Route path="/initiation-7-jours" element={<PageTransition><Initiation7j /></PageTransition>} />
        <Route path="/post-flow" element={<ProtectedRoute><PageTransition><PostFlow /></PageTransition></ProtectedRoute>} />
        <Route path="/paywall" element={<PageTransition><Paywall /></PageTransition>} />
        <Route path="/comparaison" element={<PageTransition><Comparison /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/payment-success" element={<ProtectedRoute><PageTransition><PaymentSuccess /></PageTransition></ProtectedRoute>} />
        <Route path="/payment-pending" element={<ProtectedRoute><PageTransition><PaymentPending /></PageTransition></ProtectedRoute>} />
        <Route path="/profil" element={<PaidRoute><PageTransition><Profil /></PageTransition></PaidRoute>} />
        <Route path="/profil/style" element={<PaidRoute><PageTransition><ProfilStyle /></PageTransition></PaidRoute>} />
        <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
        <Route path="/set-password" element={<PageTransition><SetPassword /></PageTransition>} />
        <Route path="/activation-compte" element={<PageTransition><ActivationCompte /></PageTransition>} />
        <Route path="/cgv" element={<PageTransition><CGV /></PageTransition>} />
        <Route path="/confidentialite" element={<PageTransition><Confidentialite /></PageTransition>} />
        <Route path="/mentions-legales" element={<PageTransition><MentionsLegales /></PageTransition>} />
        <Route path="/urgence" element={<PaidRoute><PageTransition><Emergency /></PageTransition></PaidRoute>} />
        <Route path="/danger" element={<PageTransition><Danger /></PageTransition>} />
        <Route path="/sante" element={<PaidRoute><PageTransition><Sante /></PageTransition></PaidRoute>} />
        <Route path="/sante/rendez-vous" element={<PaidRoute><PageTransition><SanteRendezVous /></PageTransition></PaidRoute>} />
        <Route path="/sante/medicaments" element={<PaidRoute><PageTransition><SanteMedicaments /></PageTransition></PaidRoute>} />
        <Route path="/sante/fiche-medicale" element={<PaidRoute><PageTransition><SanteFicheMedicale /></PageTransition></PaidRoute>} />
        <Route path="/sante/ressources" element={<PaidRoute><PageTransition><SanteRessources /></PageTransition></PaidRoute>} />
        <Route path="/fiche-urgence/:token" element={<PageTransition><FicheUrgencePublique /></PageTransition>} />
        <Route path="/unsubscribe" element={<PageTransition><Unsubscribe /></PageTransition>} />
        <Route path="/admin/premium-log" element={<AdminRoute><PageTransition><PremiumActivationLogPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/premium-audit" element={<AdminRoute><PageTransition><PremiumAuditListPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/webhook-anomalies" element={<AdminRoute><PageTransition><WebhookAnomaliesPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/pending-emails" element={<AdminRoute><PageTransition><PendingEmailsAdminPage /></PageTransition></AdminRoute>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </RoutesWrapper>
      </AnimatePresence>
      <BottomNav />
    </RouteTransitionProvider>
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

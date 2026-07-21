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

import GuidedTour from "@/components/GuidedTour";
import RestartTourButton from "@/components/RestartTourButton";
import DiscoveryBadge from "@/components/DiscoveryBadge";
import { DiscoveryProvider } from "@/contexts/DiscoveryContext";
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
import ProfilStyle from "./pages/ProfilStyle";
import Parametres from "./pages/Parametres";
import ResetPassword from "./pages/ResetPassword";
import SetPassword from "./pages/SetPassword";
import ActivationCompte from "./pages/ActivationCompte";
import NotFound from "./pages/NotFound";
import CGV from "./pages/CGV";
import Confidentialite from "./pages/Confidentialite";
import MentionsLegales from "./pages/MentionsLegales";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentPending from "./pages/PaymentPending";
import PaymentCanceled from "./pages/PaymentCanceled";
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
import SanteProfilsFamiliaux from "./pages/SanteProfilsFamiliaux";
import SanteRessources from "./pages/SanteRessources";
import FicheUrgencePublique from "./pages/FicheUrgencePublique";
import CalmeEnClair from "./pages/CalmeEnClair";
import PackSanteFamilial from "./pages/PackSanteFamilial";
import ChargeMentale from "./pages/ChargeMentale";
import Danger from "./pages/Danger";
import PremiumActivationLogPage from "./pages/admin/PremiumActivationLog";
import PremiumAuditListPage from "./pages/admin/PremiumAuditList";
import WebhookAnomaliesPage from "./pages/admin/WebhookAnomalies";
import PendingEmailsAdminPage from "./pages/admin/PendingEmails";
import AmbassadorPayoutsPage from "./pages/admin/AmbassadorPayouts";
import LiesAutrementHome from "./pages/lies/LiesAutrementHome";
import LsfHome from "./pages/lies/LsfHome";
import LsfTheme from "./pages/lies/LsfTheme";
import SignesNouveaux from "./pages/lies/SignesNouveaux";
import LsfFlashcards from "./pages/lies/LsfFlashcards";
import RessourcesPage from "./pages/lies/RessourcesPage";
import CrisePage from "./pages/lies/CrisePage";
import JournalPage from "./pages/lies/JournalPage";
import CommunautePage from "./pages/lies/CommunautePage";
import ActivitesPage from "./pages/lies/ActivitesPage";
import FeelingsHome from "./pages/feelings/FeelingsHome";
import FeelingsHistory from "./pages/feelings/FeelingsHistory";
import CommunauteModeration from "./pages/admin/CommunauteModeration";
import AncrageLayout from "./pages/ancrage/AncrageLayout";
import AncrageAccueil from "./pages/ancrage/Accueil";
import AncrageEnfants from "./pages/ancrage/Enfants";
import AncrageDocuments from "./pages/ancrage/Documents";
import AncrageIA from "./pages/ancrage/IA";
import AncrageProfil from "./pages/ancrage/Profil";
import PortraitTransformation from "./pages/PortraitTransformation";
import LivreReconstruction from "./pages/LivreReconstruction";
import FriseEvolution from "./pages/FriseEvolution";
import MonImpact from "./pages/MonImpact";
import AmbassadriceContrat from "./pages/AmbassadriceContrat";
import OAuthConsent from "./pages/OAuthConsent";
import { useEffect } from "react";
import { captureReferralCodeFromUrl } from "@/lib/referralTracking";
import Budget from "./pages/Budget";
import Coffre from "./pages/Coffre";
import Organisation from "./pages/Organisation";
import Statistiques from "./pages/Statistiques";
import Famille from "./pages/Famille";

const queryClient = new QueryClient();

const ReferralCapture = () => {
  useEffect(() => {
    captureReferralCodeFromUrl();
  }, []);
  return null;
};

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
      <DiscoveryBadge />
      
      <GuidedTour />
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
        
        <Route path="/post-flow" element={<ProtectedRoute><PageTransition><PostFlow /></PageTransition></ProtectedRoute>} />
        <Route path="/paywall" element={<PageTransition><Paywall /></PageTransition>} />
        <Route path="/pack-sante-familial" element={<PageTransition><PackSanteFamilial /></PageTransition>} />
        <Route path="/charge-mentale" element={<PageTransition><ChargeMentale /></PageTransition>} />
        <Route path="/comparaison" element={<PageTransition><Comparison /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><Auth /></PageTransition>} />
        <Route path="/payment-success" element={<PageTransition><PaymentSuccess /></PageTransition>} />
        <Route path="/payment-pending" element={<PageTransition><PaymentPending /></PageTransition>} />
        <Route path="/payment-canceled" element={<PageTransition><PaymentCanceled /></PageTransition>} />
        <Route path="/profil" element={<PaidRoute><PageTransition><Profil /></PageTransition></PaidRoute>} />
        <Route path="/profil/style" element={<PaidRoute><PageTransition><ProfilStyle /></PageTransition></PaidRoute>} />
        <Route path="/parametres" element={<PageTransition><Parametres /></PageTransition>} />
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
        <Route path="/sante/profils-familiaux" element={<PaidRoute><PageTransition><SanteProfilsFamiliaux /></PageTransition></PaidRoute>} />
        <Route path="/sante/ressources" element={<PaidRoute><PageTransition><SanteRessources /></PageTransition></PaidRoute>} />
        <Route path="/fiche-urgence/:token" element={<PageTransition><FicheUrgencePublique /></PageTransition>} />
        <Route path="/unsubscribe" element={<PageTransition><Unsubscribe /></PageTransition>} />
        <Route path="/admin/premium-log" element={<AdminRoute><PageTransition><PremiumActivationLogPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/premium-audit" element={<AdminRoute><PageTransition><PremiumAuditListPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/webhook-anomalies" element={<AdminRoute><PageTransition><WebhookAnomaliesPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/pending-emails" element={<AdminRoute><PageTransition><PendingEmailsAdminPage /></PageTransition></AdminRoute>} />
        <Route path="/admin/communaute-moderation" element={<AdminRoute><PageTransition><CommunauteModeration /></PageTransition></AdminRoute>} />
        <Route path="/admin/ambassador-payouts" element={<AdminRoute><PageTransition><AmbassadorPayoutsPage /></PageTransition></AdminRoute>} />
        <Route path="/lies-autrement" element={<PaidRoute><PageTransition><LiesAutrementHome /></PageTransition></PaidRoute>} />
        <Route path="/lies-autrement/lsf" element={<PaidRoute><PageTransition><LsfHome /></PageTransition></PaidRoute>} />
        <Route path="/lies-autrement/lsf/:themeSlug" element={<PaidRoute><PageTransition><LsfTheme /></PageTransition></PaidRoute>} />
        <Route path="/lies-autrement/signes-nouveaux" element={<PaidRoute><PageTransition><SignesNouveaux /></PageTransition></PaidRoute>} />
        <Route path="/lies-autrement/lsf-flashcards" element={<PaidRoute><PageTransition><LsfFlashcards /></PageTransition></PaidRoute>} />
        <Route path="/signes" element={<PaidRoute><PageTransition><SignesNouveaux /></PageTransition></PaidRoute>} />
        <Route path="/lies-autrement/ressources" element={<PaidRoute><PageTransition><RessourcesPage /></PageTransition></PaidRoute>} />
        <Route path="/lies-autrement/crise" element={<PaidRoute><PageTransition><CrisePage /></PageTransition></PaidRoute>} />
        <Route path="/lies-autrement/journal" element={<PaidRoute><PageTransition><JournalPage /></PageTransition></PaidRoute>} />
        <Route path="/lies-autrement/communaute" element={<ProtectedRoute><PageTransition><CommunautePage /></PageTransition></ProtectedRoute>} />
        <Route path="/lies-autrement/activites" element={<PaidRoute><PageTransition><ActivitesPage /></PageTransition></PaidRoute>} />
        <Route path="/comment-tu-te-sens" element={<PaidRoute><PageTransition><FeelingsHome /></PageTransition></PaidRoute>} />
        <Route path="/comment-tu-te-sens/historique" element={<PaidRoute><PageTransition><FeelingsHistory /></PageTransition></PaidRoute>} />
        <Route path="/ancrage" element={<AncrageLayout />}>
          <Route index element={<AncrageAccueil />} />
          <Route path="enfants" element={<AncrageEnfants />} />
          <Route path="documents" element={<AncrageDocuments />} />
          <Route path="ia" element={<AncrageIA />} />
          <Route path="profil" element={<AncrageProfil />} />
        </Route>
        <Route path="/portrait-transformation" element={<PaidRoute><PageTransition><PortraitTransformation /></PageTransition></PaidRoute>} />
        <Route path="/livre-reconstruction" element={<PaidRoute><PageTransition><LivreReconstruction /></PageTransition></PaidRoute>} />
        <Route path="/frise-evolution" element={<PaidRoute><PageTransition><FriseEvolution /></PageTransition></PaidRoute>} />
        <Route path="/mon-impact" element={<PaidRoute><PageTransition><MonImpact /></PageTransition></PaidRoute>} />
        <Route path="/ambassadrice/contrat" element={<PaidRoute><PageTransition><AmbassadriceContrat /></PageTransition></PaidRoute>} />
        <Route path="/budget" element={<PaidRoute><PageTransition><Budget /></PageTransition></PaidRoute>} />
        <Route path="/coffre" element={<PaidRoute><PageTransition><Coffre /></PageTransition></PaidRoute>} />
        <Route path="/organisation" element={<PaidRoute><PageTransition><Organisation /></PageTransition></PaidRoute>} />
        <Route path="/statistiques" element={<PaidRoute><PageTransition><Statistiques /></PageTransition></PaidRoute>} />
        <Route path="/famille" element={<PaidRoute><PageTransition><Famille /></PageTransition></PaidRoute>} />
        <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Routes>
        </RoutesWrapper>
      </AnimatePresence>
      <RestartTourButton />
      <BottomNav />
    </RouteTransitionProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DiscoveryProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ReferralCapture />
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DiscoveryProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/emotions" element={<Emotions />} />
            <Route path="/emotion/:emotion" element={<EmotionDetail />} />
            <Route path="/comprendre" element={<Comprendre />} />
            <Route path="/avancer" element={<Avancer />} />
            <Route path="/aller-plus-loin" element={<AllerPlusLoin />} />
            <Route path="/parcours" element={<Parcours />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profil" element={<Profil />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/cgv" element={<CGV />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/mentions-legales" element={<MentionsLegales />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

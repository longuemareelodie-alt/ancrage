import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index";
import Emotions from "./pages/Emotions";
import EmotionDetail from "./pages/EmotionDetail";
import AllerPlusLoin from "./pages/AllerPlusLoin";
import Parcours from "./pages/Parcours";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/emotions" element={<Emotions />} />
          <Route path="/emotion/:emotion" element={<EmotionDetail />} />
          <Route path="/aller-plus-loin" element={<AllerPlusLoin />} />
          <Route path="/parcours" element={<Parcours />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

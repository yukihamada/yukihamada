import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { ChatProvider } from "@/contexts/ChatContext";
import ScrollToTop from "@/components/ScrollToTop";
import MusicPlayer from "@/components/MusicPlayer";
import AudioVisualBackground from "@/components/AudioVisualBackground";
import { AIChatSection } from "@/components/AIChatSection";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import ChatAdmin from "./pages/ChatAdmin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <MusicPlayerProvider>
        <ChatProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <AudioVisualBackground />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/admin/chat" element={<ChatAdmin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MusicPlayer />
              <AIChatSection />
            </BrowserRouter>
          </TooltipProvider>
        </ChatProvider>
      </MusicPlayerProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

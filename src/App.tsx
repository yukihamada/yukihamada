import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MusicPlayerProvider } from "@/contexts/MusicPlayerContext";
import { TTSPlayerProvider } from "@/contexts/TTSPlayerContext";
import { ChatProvider } from "@/contexts/ChatContext";
import { UIVisibilityProvider } from "@/contexts/UIVisibilityContext";
import { ReducedMotionProvider } from "@/contexts/ReducedMotionContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToTop from "@/components/ScrollToTop";
import MusicPlayer from "@/components/MusicPlayer";
import TTSFloatingPlayer from "@/components/TTSFloatingPlayer";
import OrganicBackground from "@/components/OrganicBackground";
import { AIChatSection } from "@/components/AIChatSection";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import AdminDashboard from "./pages/AdminDashboard";
import Newsletter from "./pages/Newsletter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <ReducedMotionProvider>
        <LanguageProvider>
          <MusicPlayerProvider>
            <TTSPlayerProvider>
              <ChatProvider>
                <UIVisibilityProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <ScrollToTop />
                      <OrganicBackground />
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route path="/blog/:slug" element={<BlogPost />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/community" element={<Community />} />
                        <Route path="/community/:topicId" element={<Community />} />
                        <Route path="/newsletter" element={<Newsletter />} />
                        {/* Admin routes */}
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route path="/admin/blog" element={<AdminDashboard />} />
                        <Route path="/admin/chat" element={<AdminDashboard />} />
                        <Route path="/blog-admin" element={<AdminDashboard />} />
                        <Route path="/chat-admin" element={<AdminDashboard />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <MusicPlayer />
                      <TTSFloatingPlayer />
                      <AIChatSection />
                    </BrowserRouter>
                  </TooltipProvider>
                  </UIVisibilityProvider>
                </ChatProvider>
              </TTSPlayerProvider>
            </MusicPlayerProvider>
          </LanguageProvider>
          </ReducedMotionProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>
);

export default App;

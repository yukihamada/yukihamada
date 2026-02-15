import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import EnablerSection from '@/components/EnablerSection';
import TimelineSection from '@/components/TimelineSection';
import InvestmentsSection from '@/components/InvestmentsSection';
import BlogSection from '@/components/BlogSection';
import ProjectsSection from '@/components/ProjectsSection';
import AIToolsSection from '@/components/AIToolsSection';
import HobbiesSection from '@/components/HobbiesSection';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
const Index = () => {

  useEffect(() => {
    // Enable dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  const handleMusicPlay = () => {
    // Dispatch a custom event to trigger music play
    window.dispatchEvent(new CustomEvent('toggleMusicPlayer'));
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO url="https://yukihamada.jp" />
      <Navigation />
      <main className="relative z-10">
        <HeroSection onMusicPlay={handleMusicPlay} />
        <ProjectsSection />
        <EnablerSection />
        <TimelineSection />
        <InvestmentsSection />
        <BlogSection />
        <AIToolsSection />
        <HobbiesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;

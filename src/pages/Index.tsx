import { useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import EnablerSection from '@/components/EnablerSection';
import TimelineSection from '@/components/TimelineSection';
import InvestmentsSection from '@/components/InvestmentsSection';
import BlogSection from '@/components/BlogSection';
import HobbiesSection from '@/components/HobbiesSection';
import Footer from '@/components/Footer';
import OrganicBackground from '@/components/OrganicBackground';
import MusicPlayer from '@/components/MusicPlayer';

const Index = () => {
  useEffect(() => {
    // Enable dark mode by default
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <OrganicBackground />
      <Navigation />
      <main className="relative z-10">
        <HeroSection />
        <EnablerSection />
        <TimelineSection />
        <InvestmentsSection />
        <BlogSection />
        <HobbiesSection />
      </main>
      <Footer />
      <MusicPlayer />
    </div>
  );
};

export default Index;

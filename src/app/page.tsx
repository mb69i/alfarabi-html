import HeroSection from '@/components/sections/HeroSection';
import CalendarSection from '@/components/sections/CalendarSection';
import NewsSection from '@/components/sections/NewsSection';
import ClassesSection from '@/components/sections/ClassesSection';
import StatsSection from '@/components/sections/StatsSection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <CalendarSection />
      <NewsSection />
      <ClassesSection />
      <Footer />
    </>
  );
}

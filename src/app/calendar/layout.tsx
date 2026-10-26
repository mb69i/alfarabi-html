import Footer from '@/components/Footer';

export default function CalendarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}

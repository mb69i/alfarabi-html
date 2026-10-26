import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-arabic",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Alfarabi University — AI Engineering Department",
  description:
    "The official digital platform of Al-Farabi University's Artificial Intelligence Engineering department. Explore programs, events, student portfolios, and more.",
  keywords: ["Alfarabi University", "AI Engineering", "Artificial Intelligence", "University Platform", "جامعة الفارابي"],
  openGraph: {
    title: "Alfarabi University — AI Engineering",
    description: "Premium digital platform for Al-Farabi University's AI Engineering Department.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cairo.variable} suppressHydrationWarning>
        <div className="noise-overlay" aria-hidden="true" />
        <AuthProvider>
          <LanguageProvider>
            <SmoothScrollProvider>
              <Navbar />
              <main>{children}</main>
            </SmoothScrollProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

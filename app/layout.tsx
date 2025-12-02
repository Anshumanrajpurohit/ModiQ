import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { CartProvider } from "@/context/CartContext";
import { SiteAnnouncement } from "@/components/SiteAnnouncement";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ModiQ Hardware",
  description: "Premium hinges, channels, and modular systems for modern interiors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-[#FFFFFF] text-[#4A4A4A] antialiased`}
      >
        <CartProvider>
          <Navbar />
          <main className="mx-auto mt-24 max-w-6xl px-6 pb-24">
            {children}
          </main>
          <Footer />
          <FloatingWhatsApp />
          <SiteAnnouncement />
        </CartProvider>
      </body>
    </html>
  );
}

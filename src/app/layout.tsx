import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Smart Hydroponics Guide",
    template: "%s | Smart Hydroponics Guide",
  },
  description: "Your ultimate guide to smart, modern, and efficient hydroponics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header />
        <main className="flex-grow container mx-auto px-6 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}

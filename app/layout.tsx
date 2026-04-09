import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plagiarism Detection",
  description: "Plagiarism Detection",
};

import { StoreProvider } from "./store/StoreProvider";
import { Header } from "@/components/layout/Header";

import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body cz-shortcut-listen="true" className="min-h-full flex flex-col bg-slate-50">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Toaster />
        </StoreProvider>
      </body>
    </html>
  );
}


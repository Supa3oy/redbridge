import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "RedBridge — Xiaohongshu Toolkit for Australian Brands",
  description:
    "AI-powered Xiaohongshu content toolkit. Generate post ideas, keywords, and localized captions for the Chinese market.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="font-sans bg-[#0a0a0a] text-white antialiased min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}

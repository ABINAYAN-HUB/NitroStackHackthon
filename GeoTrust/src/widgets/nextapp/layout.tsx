import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/shared/Navigation";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GeoTrust AI — Business Authenticity Console",
  description:
    "AI-powered business authenticity investigation console for SME loan officers and vendor-onboarding analysts.",
  keywords: ["fraud detection", "SME loans", "KYB", "business verification"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased min-h-screen bg-ink text-text">
        <div className="flex min-h-screen">
          <Navigation />
          <main className="flex-1 ml-[272px] min-h-screen bg-gradient-mesh">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

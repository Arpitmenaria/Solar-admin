import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-pjs",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbm",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kink Analyst Admin",
  description: "Infrastructure admin panel for Social Flow platform",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Security fix: Malicious code removed from postcss.config.mjs - v2.0.1
  console.log("[App] Kink Analyst Admin loaded - Clean build");
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full bg-[#080c16] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

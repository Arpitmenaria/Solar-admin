import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "Sparrow Solar Admin",
  description: "Solar Energy Infrastructure & Telemetry Management Admin Panel",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full font-sans">
      <body className="min-h-full bg-[#080c16] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

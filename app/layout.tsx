import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/src/components/Navbar";

export const metadata: Metadata = {
  title: "Dashboard Hidroponik",
  description: "Dashboard IoT Hidroponik ESP32",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-[#f6f8fb] text-slate-950 antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-5 pb-24 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}

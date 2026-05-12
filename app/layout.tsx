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
      <body className="bg-slate-100 text-slate-900">
        <Navbar />
        <main className="mx-auto max-w-7xl p-4">{children}</main>
      </body>
    </html>
  );
}
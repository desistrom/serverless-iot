"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Bell,
  LayoutDashboard,
  LineChart,
  Menu,
  SlidersHorizontal,
  Sprout,
  X,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/history", label: "Grafik", icon: LineChart },
  { href: "/alerts", label: "Alert", icon: Bell },
  { href: "/settings", label: "Threshold", icon: SlidersHorizontal },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Sprout size={22} />
            </span>
            <span>
              <span className="block text-base font-bold leading-tight">
                Hidroponik
              </span>
              <span className="block text-xs font-medium text-slate-500">
                Monitoring ESP32
              </span>
            </span>
          </Link>

          <button
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
            className="grid size-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
          >
            {open ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        <div className="mt-3 hidden gap-2 lg:flex lg:justify-end">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                  active
                    ? "bg-slate-950 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                }`}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </div>

        {open && (
          <div className="mt-3 grid gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-lg lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}

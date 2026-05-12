"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import RelayControl from "@/src/components/RelayControl";
import RealtimeSensorCards from "@/src/components/RealtimeSensorCards";
import { Gauge, Power } from "lucide-react";

export default function OverviewPage() {
  const [mode, setMode] = useState<"manual" | "auto">("manual");

  async function fetchMode() {
    const { data } = await supabase
      .from("devices")
      .select("control_mode")
      .eq("id", DEVICE_ID)
      .single();

    if (data) setMode(data.control_mode);
  }

  async function updateMode(nextMode: "manual" | "auto") {
    setMode(nextMode);

    await supabase
      .from("devices")
      .update({
        control_mode: nextMode,
        updated_at: new Date().toISOString(),
      })
      .eq("id", DEVICE_ID);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchMode();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <Gauge size={17} />
              Dashboard Realtime
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Overview Sensor Hidroponik
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Pantau kondisi nutrisi, suhu, kelembapan, cahaya, dan kontrol relay
              dari satu layar yang siap dipakai di mobile.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
              <Power size={16} />
              Mode Kontrol
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => updateMode("manual")}
                className={`min-h-11 rounded-lg px-4 text-sm font-bold transition ${
                  mode === "manual"
                    ? "bg-slate-950 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                Manual
              </button>

              <button
                onClick={() => updateMode("auto")}
                className={`min-h-11 rounded-lg px-4 text-sm font-bold transition ${
                  mode === "auto"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-white text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                Otomatis
              </button>
            </div>
          </div>
        </div>
      </section>

      <RealtimeSensorCards />

      <RelayControl />
    </div>
  );
}

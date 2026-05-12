"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import { LineChart as LineChartIcon } from "lucide-react";
import type { SensorHistory } from "@/src/components/HistoryChart";

const HistoryChart = dynamic(() => import("@/src/components/HistoryChart"), {
  ssr: false,
  loading: () => (
    <div className="grid h-[320px] place-items-center text-sm font-medium text-slate-500 sm:h-[420px]">
      Memuat grafik...
    </div>
  ),
});

export default function HistoryPage() {
  const [data, setData] = useState<SensorHistory[]>([]);

  async function fetchHistory() {
    const { data } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .order("created_at", { ascending: true })
      .limit(100);

    setData(data ?? []);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchHistory();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-indigo-700">
          <LineChartIcon size={17} />
          Riwayat Sensor
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Grafik Riwayat Sensor
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Tren 100 data terakhir untuk nutrisi, suhu, kelembapan, dan cahaya.
        </p>
      </section>

      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
        <HistoryChart data={data} />
      </div>
    </div>
  );
}

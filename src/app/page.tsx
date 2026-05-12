"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import SensorPollingCards from "@/src/components/SensorCard";
import RelayControl from "@/src/components/RelayControl";
import RealtimeSensorCards from "@/src/components/RealtimeSensorCards";

type SensorReading = {
  tds: number;
  water_temp: number;
  air_temp: number;
  humidity: number;
  light_intensity: number;
  created_at: string;
};

export default function OverviewPage() {
  const [sensor, setSensor] = useState<SensorReading | null>(null);
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
    fetchMode();
  }, []);

  async function fetchLatestSensor() {
    const { data } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (data) setSensor(data);
  }

  useEffect(() => {
    fetchLatestSensor();

    const channel = supabase
      .channel("sensor-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "sensor_readings",
          filter: `device_id=eq.${DEVICE_ID}`,
        },
        (payload) => {
          setSensor(payload.new as SensorReading);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview Sensor Realtime</h1>

      <SensorPollingCards/>

      <RealtimeSensorCards />

      <RelayControl />

      <p className="text-sm text-slate-500">
        Update terakhir: {sensor?.created_at ?? "-"}
      </p>
      <div className="rounded-2xl bg-white p-5 shadow">
        <h2 className="mb-4 text-xl font-bold">Mode Kontrol</h2>

        <div className="flex gap-3">
            <button
            onClick={() => updateMode("manual")}
            className={`rounded-xl px-5 py-3 font-bold ${
                mode === "manual"
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
            >
            Manual
            </button>

            <button
            onClick={() => updateMode("auto")}
            className={`rounded-xl px-5 py-3 font-bold ${
                mode === "auto"
                ? "bg-green-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
            >
            Otomatis
            </button>
        </div>

        <p className="mt-3 text-sm text-slate-500">
            Mode aktif: <b>{mode === "manual" ? "Manual" : "Otomatis"}</b>
        </p>
        </div>
    </div>
  );
}
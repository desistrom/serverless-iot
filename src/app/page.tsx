"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import SensorCard from "@/src/components/SensorCard";
import RelayControl from "@/src/components/RelayControl";

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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <SensorCard title="TDS" value={sensor?.tds ?? "-"} unit="ppm" />
        <SensorCard title="Suhu Air" value={sensor?.water_temp ?? "-"} unit="°C" />
        <SensorCard title="Suhu Udara" value={sensor?.air_temp ?? "-"} unit="°C" />
        <SensorCard title="Kelembapan" value={sensor?.humidity ?? "-"} unit="%" />
        <SensorCard title="Cahaya" value={sensor?.light_intensity ?? "-"} />
      </div>

      <RelayControl />

      <p className="text-sm text-slate-500">
        Update terakhir: {sensor?.created_at ?? "-"}
      </p>
    </div>
  );
}
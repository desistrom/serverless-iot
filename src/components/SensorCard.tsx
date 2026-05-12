"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";

type SensorReading = {
  tds: number;
  water_temp: number;
  air_temp: number;
  humidity: number;
  light_intensity: number;
  created_at: string;
};

export default function SensorPollingCards() {
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

    const interval = setInterval(() => {
      fetchLatestSensor();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
      <Card title="TDS" value={sensor?.tds ?? "-"} unit="ppm" />
      <Card title="Suhu Air" value={sensor?.water_temp ?? "-"} unit="°C" />
      <Card title="Suhu Udara" value={sensor?.air_temp ?? "-"} unit="°C" />
      <Card title="Kelembapan" value={sensor?.humidity ?? "-"} unit="%" />
      <Card title="Cahaya" value={sensor?.light_intensity ?? "-"} unit="" />
    </div>
  );
}

function Card({
  title,
  value,
  unit,
}: {
  title: string;
  value: string | number;
  unit: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold">
        {value} {unit}
      </h2>
    </div>
  );
}
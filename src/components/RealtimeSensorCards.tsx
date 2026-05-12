"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";

type SensorReading = {
  id: string;
  device_id: string;
  tds: number;
  water_temp: number;
  air_temp: number;
  humidity: number;
  light_intensity: number;
  created_at: string;
};

type Threshold = {
  min_tds: number;
  max_tds: number;
  min_water_temp: number;
  max_water_temp: number;
  min_air_temp: number;
  max_air_temp: number;
  min_humidity: number;
  max_humidity: number;
  min_light_intensity: number;
  max_light_intensity: number;
};

type CardItem = {
  key: keyof SensorReading;
  title: string;
  value: number | string;
  unit: string;
  min?: number;
  max?: number;
};

export default function RealtimeSensorCards() {
  const [sensor, setSensor] = useState<SensorReading | null>(null);
  const [threshold, setThreshold] = useState<Threshold | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchInitialData() {
    setLoading(true);

    const [sensorResult, thresholdResult] = await Promise.all([
      supabase
        .from("sensor_readings")
        .select("*")
        .eq("device_id", DEVICE_ID)
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),

      supabase
        .from("threshold_settings")
        .select("*")
        .eq("device_id", DEVICE_ID)
        .single(),
    ]);

    if (sensorResult.data) setSensor(sensorResult.data);
    if (thresholdResult.data) setThreshold(thresholdResult.data);

    setLoading(false);
  }

  useEffect(() => {
    fetchInitialData();

    const channel = supabase
      .channel(`sensor-readings-${DEVICE_ID}`)
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

  const cards: CardItem[] = useMemo(
    () => [
      {
        key: "tds",
        title: "TDS",
        value: sensor?.tds ?? "-",
        unit: "ppm",
        min: threshold?.min_tds,
        max: threshold?.max_tds,
      },
      {
        key: "water_temp",
        title: "Suhu Air",
        value: sensor?.water_temp ?? "-",
        unit: "°C",
        min: threshold?.min_water_temp,
        max: threshold?.max_water_temp,
      },
      {
        key: "air_temp",
        title: "Suhu Udara",
        value: sensor?.air_temp ?? "-",
        unit: "°C",
        min: threshold?.min_air_temp,
        max: threshold?.max_air_temp,
      },
      {
        key: "humidity",
        title: "Kelembapan",
        value: sensor?.humidity ?? "-",
        unit: "%",
        min: threshold?.min_humidity,
        max: threshold?.max_humidity,
      },
      {
        key: "light_intensity",
        title: "Cahaya",
        value: sensor?.light_intensity ?? "-",
        unit: "",
        min: threshold?.min_light_intensity,
        max: threshold?.max_light_intensity,
      },
    ],
    [sensor, threshold]
  );

  if (loading) {
    return <p className="text-slate-500">Memuat data sensor...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        {cards.map((card) => (
          <SensorCard key={card.key} item={card} />
        ))}
      </div>

      <p className="text-sm text-slate-500">
        Update terakhir:{" "}
        {sensor?.created_at
          ? new Date(sensor.created_at).toLocaleString("id-ID")
          : "-"}
      </p>
    </div>
  );
}

function SensorCard({ item }: { item: CardItem }) {
  const value = typeof item.value === "number" ? item.value : null;

  const isWarning =
    value !== null &&
    ((item.min !== undefined && value < item.min) ||
      (item.max !== undefined && value > item.max));

  return (
    <div
      className={`rounded-2xl border p-5 shadow transition ${
        isWarning
          ? "border-red-300 bg-red-50 text-red-800"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <p className="text-sm font-medium opacity-70">{item.title}</p>

      <h2 className="mt-2 text-3xl font-bold">
        {item.value}{" "}
        {item.unit && <span className="text-base font-medium">{item.unit}</span>}
      </h2>

      <p className="mt-3 text-xs opacity-70">
        Normal: {item.min ?? "-"} - {item.max ?? "-"} {item.unit}
      </p>

      {isWarning && (
        <p className="mt-2 text-sm font-semibold">
          ⚠️ Nilai melewati threshold
        </p>
      )}
    </div>
  );
}
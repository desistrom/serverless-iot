"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import {
  Activity,
  Droplets,
  Gauge,
  Sun,
  Thermometer,
  TriangleAlert,
} from "lucide-react";

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
  accent: string;
  icon: typeof Gauge;
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
    const timer = window.setTimeout(() => {
      fetchInitialData();
    }, 0);

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
      window.clearTimeout(timer);
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
        accent: "text-emerald-700 bg-emerald-50",
        icon: Gauge,
      },
      {
        key: "water_temp",
        title: "Suhu Air",
        value: sensor?.water_temp ?? "-",
        unit: "°C",
        min: threshold?.min_water_temp,
        max: threshold?.max_water_temp,
        accent: "text-sky-700 bg-sky-50",
        icon: Droplets,
      },
      {
        key: "air_temp",
        title: "Suhu Udara",
        value: sensor?.air_temp ?? "-",
        unit: "°C",
        min: threshold?.min_air_temp,
        max: threshold?.max_air_temp,
        accent: "text-rose-700 bg-rose-50",
        icon: Thermometer,
      },
      {
        key: "humidity",
        title: "Kelembapan",
        value: sensor?.humidity ?? "-",
        unit: "%",
        min: threshold?.min_humidity,
        max: threshold?.max_humidity,
        accent: "text-indigo-700 bg-indigo-50",
        icon: Activity,
      },
      {
        key: "light_intensity",
        title: "Cahaya",
        value: sensor?.light_intensity ?? "-",
        unit: "",
        min: threshold?.min_light_intensity,
        max: threshold?.max_light_intensity,
        accent: "text-amber-700 bg-amber-50",
        icon: Sun,
      },
    ],
    [sensor, threshold]
  );

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-500 shadow-sm">
        Memuat data sensor...
      </div>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Sensor Aktif</h2>
          <p className="text-sm text-slate-500">Nilai terakhir dibandingkan threshold.</p>
        </div>
        <p className="hidden text-xs font-medium text-slate-400 sm:block">
          {sensor?.created_at
            ? new Date(sensor.created_at).toLocaleString("id-ID")
            : "-"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <SensorCard key={card.key} item={card} />
        ))}
      </div>

      <p className="text-xs font-medium text-slate-500 sm:hidden">
        Update terakhir:{" "}
        {sensor?.created_at
          ? new Date(sensor.created_at).toLocaleString("id-ID")
          : "-"}
      </p>
    </section>
  );
}

function SensorCard({ item }: { item: CardItem }) {
  const Icon = item.icon;
  const value = typeof item.value === "number" ? item.value : null;

  const isWarning =
    value !== null &&
    ((item.min !== undefined && value < item.min) ||
      (item.max !== undefined && value > item.max));

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm transition ${
        isWarning
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{item.title}</p>
        <span
          className={`grid size-9 place-items-center rounded-lg ${
            isWarning ? "bg-red-100 text-red-700" : item.accent
          }`}
        >
          {isWarning ? <TriangleAlert size={18} /> : <Icon size={18} />}
        </span>
      </div>

      <h3 className="mt-4 text-3xl font-bold tracking-tight">
        {item.value}{" "}
        {item.unit && <span className="text-base font-semibold text-slate-500">{item.unit}</span>}
      </h3>

      <p className="mt-3 text-xs font-medium text-slate-500">
        Normal: {item.min ?? "-"} - {item.max ?? "-"} {item.unit}
      </p>

      {isWarning && (
        <p className="mt-2 text-sm font-bold">
          Nilai melewati threshold
        </p>
      )}
    </div>
  );
}

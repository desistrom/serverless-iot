"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import { Save, SlidersHorizontal } from "lucide-react";

type ThresholdForm = {
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

const fields: Array<{
  key: keyof ThresholdForm;
  label: string;
  unit: string;
}> = [
  { key: "min_tds", label: "Minimum TDS", unit: "ppm" },
  { key: "max_tds", label: "Maximum TDS", unit: "ppm" },
  { key: "min_water_temp", label: "Minimum Suhu Air", unit: "°C" },
  { key: "max_water_temp", label: "Maximum Suhu Air", unit: "°C" },
  { key: "min_air_temp", label: "Minimum Suhu Udara", unit: "°C" },
  { key: "max_air_temp", label: "Maximum Suhu Udara", unit: "°C" },
  { key: "min_humidity", label: "Minimum Kelembapan", unit: "%" },
  { key: "max_humidity", label: "Maximum Kelembapan", unit: "%" },
  { key: "min_light_intensity", label: "Minimum Cahaya", unit: "lux" },
  { key: "max_light_intensity", label: "Maximum Cahaya", unit: "lux" },
];

export default function SettingsPage() {
  const [form, setForm] = useState<ThresholdForm>({
    min_tds: 560,
    max_tds: 1200,
    min_water_temp: 18,
    max_water_temp: 30,
    min_air_temp: 20,
    max_air_temp: 35,
    min_humidity: 50,
    max_humidity: 85,
    min_light_intensity: 300,
    max_light_intensity: 10000,
  });

  async function fetchSettings() {
    const { data } = await supabase
      .from("threshold_settings")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .single();

    if (data) setForm(data);
  }

  async function saveSettings() {
    await supabase.from("threshold_settings").upsert({
      ...form,
      device_id: DEVICE_ID,
      updated_at: new Date().toISOString(),
    });

    alert("Setting threshold berhasil disimpan");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchSettings();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  function handleChange(key: keyof ThresholdForm, value: string) {
    setForm((prev) => ({
      ...prev,
      [key]: Number(value),
    }));
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <SlidersHorizontal size={17} />
          Batas Aman
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Setting Threshold
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Atur batas minimum dan maximum untuk pemicu alert sensor.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:p-5">
        {fields.map((field) => (
          <label key={field.key} className="space-y-2">
            <span className="text-sm font-semibold text-slate-600">
              {field.label}
            </span>
            <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-100">
            <input
              type="number"
              value={form[field.key] ?? ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              className="min-h-12 w-full border-0 px-3 text-base font-semibold text-slate-950 outline-none"
            />
              <span className="grid min-w-14 place-items-center bg-slate-50 px-3 text-sm font-bold text-slate-500">
                {field.unit}
              </span>
            </div>
          </label>
        ))}
      </div>

      <button
        onClick={saveSettings}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
      >
        <Save size={18} />
        Simpan Threshold
      </button>
    </div>
  );
}

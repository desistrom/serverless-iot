"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";

export default function SettingsPage() {
  const [form, setForm] = useState<any>({
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
    fetchSettings();
  }, []);

  function handleChange(key: string, value: string) {
    setForm((prev: any) => ({
      ...prev,
      [key]: Number(value),
    }));
  }

  const fields = [
    ["min_tds", "Minimum TDS"],
    ["max_tds", "Maximum TDS"],
    ["min_water_temp", "Minimum Suhu Air"],
    ["max_water_temp", "Maximum Suhu Air"],
    ["min_air_temp", "Minimum Suhu Udara"],
    ["max_air_temp", "Maximum Suhu Udara"],
    ["min_humidity", "Minimum Kelembapan"],
    ["max_humidity", "Maximum Kelembapan"],
    ["min_light_intensity", "Minimum Cahaya"],
    ["max_light_intensity", "Maximum Cahaya"],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Setting Threshold</h1>

      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-white p-5 shadow md:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className="space-y-1">
            <span className="text-sm text-slate-500">{label}</span>
            <input
              type="number"
              value={form[key] ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
              className="w-full rounded-xl border p-3"
            />
          </label>
        ))}
      </div>

      <button
        onClick={saveSettings}
        className="rounded-xl bg-green-600 px-6 py-3 font-bold text-white"
      >
        Simpan Threshold
      </button>
    </div>
  );
}
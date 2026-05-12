"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HistoryPage() {
  const [data, setData] = useState<any[]>([]);

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
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Grafik Riwayat Sensor</h1>

      <div className="rounded-2xl bg-white p-5 shadow">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="created_at"
              tickFormatter={(v) => new Date(v).toLocaleTimeString("id-ID")}
            />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="tds" name="TDS" />
            <Line type="monotone" dataKey="water_temp" name="Suhu Air" />
            <Line type="monotone" dataKey="air_temp" name="Suhu Udara" />
            <Line type="monotone" dataKey="humidity" name="Kelembapan" />
            <Line type="monotone" dataKey="light_intensity" name="Cahaya" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SensorHistory = {
  id?: string;
  device_id?: string;
  tds: number;
  water_temp: number;
  air_temp: number;
  humidity: number;
  light_intensity: number;
  created_at: string;
};

export default function HistoryChart({ data }: { data: SensorHistory[] }) {
  return (
    <div className="h-[320px] sm:h-[420px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="created_at"
            tickFormatter={(value) => new Date(value).toLocaleTimeString("id-ID")}
            tick={{ fontSize: 12, fill: "#64748b" }}
            minTickGap={28}
          />
          <YAxis tick={{ fontSize: 12, fill: "#64748b" }} width={36} />
          <Tooltip
            labelFormatter={(value) =>
              new Date(String(value)).toLocaleString("id-ID")
            }
            contentStyle={{
              borderRadius: 8,
              borderColor: "#e2e8f0",
              boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
            }}
          />
          <Line
            type="monotone"
            dataKey="tds"
            name="TDS"
            stroke="#059669"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="water_temp"
            name="Suhu Air"
            stroke="#0284c7"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="air_temp"
            name="Suhu Udara"
            stroke="#e11d48"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            name="Kelembapan"
            stroke="#4f46e5"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="light_intensity"
            name="Cahaya"
            stroke="#d97706"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

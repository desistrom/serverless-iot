"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";

type Alert = {
  id: string;
  device_id: string;
  alert_type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  ai_suggestion?: string | null;
  is_read: boolean;
  created_at: string;
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchAlerts() {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Gagal mengambil alerts:", error.message);
    }

    setAlerts(data ?? []);
    setLoading(false);
  }

  async function markAsRead(id: string) {
    const { error } = await supabase
      .from("alerts")
      .update({
        is_read: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("Gagal update alert:", error.message);
      return;
    }

    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, is_read: true } : alert
      )
    );
  }

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(() => {
        fetchAlerts();
    }, 5000);

    return () => clearInterval(interval);
    }, []);

  const unreadCount = alerts.filter((alert) => !alert.is_read).length;
  const criticalCount = alerts.filter(
    (alert) => alert.severity === "critical"
  ).length;

  if (loading) {
    return <p className="text-slate-500">Memuat data alert...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Alert</h1>
        <p className="text-slate-500">
          Monitoring kondisi krusial sistem hidroponik.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard title="Total Alert" value={alerts.length} />
        <SummaryCard title="Belum Dibaca" value={unreadCount} />
        <SummaryCard title="Critical" value={criticalCount} danger />
      </div>

      <div className="space-y-4">
        {alerts.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-slate-500 shadow">
            Belum ada alert.
          </div>
        )}

        {alerts.map((alert) => (
          <AlertCard
            key={alert.id}
            alert={alert}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 shadow ${
        danger ? "bg-red-50 text-red-800" : "bg-white text-slate-900"
      }`}
    >
      <p className="text-sm opacity-70">{title}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function AlertCard({
  alert,
  onMarkAsRead,
}: {
  alert: Alert;
  onMarkAsRead: (id: string) => void;
}) {
  const severityStyle =
    alert.severity === "critical"
      ? "bg-red-100 text-red-700 border-red-300"
      : alert.severity === "warning"
      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
      : "bg-blue-100 text-blue-700 border-blue-300";

  const parameterLabel = getParameterLabel(alert.alert_type);

  return (
    <div
      className={`rounded-2xl border p-5 shadow transition ${
        alert.is_read ? "bg-white opacity-70" : "bg-white"
      }`}
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${severityStyle}`}
            >
              {alert.severity}
            </span>

            {!alert.is_read && (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Baru
              </span>
            )}
          </div>

          <h2 className="mt-3 text-xl font-bold">{alert.title}</h2>

          <p className="mt-1 text-sm text-slate-500">
            Parameter bermasalah:{" "}
            <span className="font-semibold text-slate-700">
              {parameterLabel}
            </span>
          </p>
        </div>

        <p className="text-sm text-slate-400">
          {new Date(alert.created_at).toLocaleString("id-ID")}
        </p>
      </div>

      <p className="mt-4 text-slate-700">{alert.message}</p>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-bold text-slate-700">Saran AI</p>
        <p className="mt-1 text-sm text-slate-600">
          {alert.ai_suggestion || getFallbackSuggestion(alert.alert_type)}
        </p>
      </div>

      {!alert.is_read && (
        <button
          onClick={() => onMarkAsRead(alert.id)}
          className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-700"
        >
          Tandai Sudah Dibaca
        </button>
      )}
    </div>
  );
}

function getParameterLabel(alertType: string) {
  if (alertType.includes("tds")) return "TDS / Nutrisi";
  if (alertType.includes("water_temp")) return "Suhu Air";
  if (alertType.includes("air_temp")) return "Suhu Udara";
  if (alertType.includes("humidity")) return "Kelembapan";
  if (alertType.includes("light")) return "Cahaya";
  return "Parameter tidak diketahui";
}

function getFallbackSuggestion(alertType: string) {
  if (alertType === "tds_low") {
    return "Tambahkan nutrisi AB Mix secara bertahap, lalu ukur ulang TDS setelah larutan tercampur rata.";
  }

  if (alertType === "tds_high") {
    return "Tambahkan air bersih untuk menurunkan konsentrasi nutrisi. Hindari perubahan ekstrem secara langsung.";
  }

  if (alertType === "water_temp_high") {
    return "Kurangi paparan panas pada tandon, tambahkan aerasi, atau pindahkan tandon ke tempat lebih teduh.";
  }

  if (alertType === "water_temp_low") {
    return "Pastikan air tidak terlalu dingin. Jika perlu, gunakan heater air dengan kontrol suhu.";
  }

  if (alertType === "air_temp_high") {
    return "Tingkatkan ventilasi, gunakan kipas, atau kurangi paparan panas langsung.";
  }

  if (alertType === "air_temp_low") {
    return "Pastikan area tanaman cukup hangat dan tidak terkena angin dingin langsung.";
  }

  if (alertType === "humidity_low") {
    return "Tambahkan kelembapan dengan misting ringan atau kurangi sirkulasi udara berlebihan.";
  }

  if (alertType === "humidity_high") {
    return "Tingkatkan ventilasi agar kelembapan tidak memicu jamur.";
  }

  if (alertType === "light_low") {
    return "Tambahkan durasi pencahayaan atau dekatkan grow light sesuai kebutuhan tanaman.";
  }

  if (alertType === "light_high") {
    return "Kurangi intensitas cahaya atau tambah jarak lampu dari tanaman agar daun tidak stres.";
  }

  return "Periksa kondisi sensor dan lingkungan tanaman secara manual.";
}
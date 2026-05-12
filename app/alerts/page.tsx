"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import { Bell, CheckCircle2, CircleAlert, Sparkles, TriangleAlert } from "lucide-react";

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
    const timer = window.setTimeout(() => {
      fetchAlerts();
    }, 0);

    const interval = setInterval(() => {
      fetchAlerts();
    }, 5000);

    return () => {
      window.clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  const unreadCount = alerts.filter((alert) => !alert.is_read).length;
  const criticalCount = alerts.filter(
    (alert) => alert.severity === "critical"
  ).length;

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-500 shadow-sm">
        Memuat data alert...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <p className="flex items-center gap-2 text-sm font-semibold text-rose-700">
          <Bell size={17} />
          Notifikasi Sistem
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
          Dashboard Alert
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Monitoring kondisi krusial sistem hidroponik.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <SummaryCard title="Total Alert" value={alerts.length} icon={Bell} />
        <SummaryCard title="Belum Dibaca" value={unreadCount} icon={CircleAlert} />
        <SummaryCard title="Critical" value={criticalCount} icon={TriangleAlert} danger />
      </div>

      <div className="space-y-3">
        {alerts.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
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
  icon: Icon,
  danger = false,
}: {
  title: string;
  value: number;
  icon: typeof Bell;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${
        danger
          ? "border-red-200 bg-red-50 text-red-800"
          : "border-slate-200 bg-white text-slate-900"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold opacity-70">{title}</p>
        <span
          className={`grid size-9 place-items-center rounded-lg ${
            danger ? "bg-red-100" : "bg-slate-100 text-slate-600"
          }`}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-black tracking-tight">{value}</p>
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
      ? "bg-red-100 text-red-700 border-red-200"
      : alert.severity === "warning"
      ? "bg-amber-100 text-amber-700 border-amber-200"
      : "bg-sky-100 text-sky-700 border-sky-200";

  const parameterLabel = getParameterLabel(alert.alert_type);

  return (
    <div
      className={`rounded-lg border p-4 shadow-sm transition sm:p-5 ${
        alert.is_read
          ? "border-slate-200 bg-white opacity-75"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${severityStyle}`}
            >
              {alert.severity}
            </span>

            {!alert.is_read && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">
                Baru
              </span>
            )}
          </div>

          <h2 className="mt-3 text-lg font-bold leading-snug text-slate-950 sm:text-xl">
            {alert.title}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Parameter bermasalah:{" "}
            <span className="font-semibold text-slate-700">
              {parameterLabel}
            </span>
          </p>
        </div>

        <p className="shrink-0 text-xs font-medium text-slate-400 sm:text-sm">
          {new Date(alert.created_at).toLocaleString("id-ID")}
        </p>
      </div>

      <p className="mt-4 text-sm leading-6 text-slate-700">{alert.message}</p>

      <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <p className="flex items-center gap-2 text-sm font-bold text-slate-700">
          <Sparkles size={16} />
          Saran AI
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {alert.ai_suggestion || getFallbackSuggestion(alert.alert_type)}
        </p>
      </div>

      {!alert.is_read && (
        <button
          onClick={() => onMarkAsRead(alert.id)}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-bold text-white transition hover:bg-slate-800 sm:w-auto"
        >
          <CheckCircle2 size={17} />
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

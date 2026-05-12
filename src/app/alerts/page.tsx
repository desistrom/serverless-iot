"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);

  async function fetchAlerts() {
    const { data } = await supabase
      .from("alerts")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .order("created_at", { ascending: false })
      .limit(50);

    setAlerts(data ?? []);
  }

  useEffect(() => {
    fetchAlerts();
  }, []);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Alert</h1>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-2xl bg-white p-5 shadow">
            <div className="flex justify-between">
              <h2 className="font-bold">{alert.title}</h2>
              <span className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-700">
                {alert.severity}
              </span>
            </div>

            <p className="mt-2 text-slate-600">{alert.message}</p>

            <p className="mt-2 text-xs text-slate-400">
              {new Date(alert.created_at).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
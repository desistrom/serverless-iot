"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import { Lightbulb, Power, Waves, Zap } from "lucide-react";

type RelayState = {
  id?: string;
  device_id: string;
  relay_1: boolean;
  relay_2: boolean;
  relay_3: boolean;
  relay_4: boolean;
  updated_at?: string;
};

const relayItems = [
  { key: "relay_1", label: "Pompa Air", icon: Waves },
  { key: "relay_2", label: "Nutrisi A", icon: Zap },
  { key: "relay_3", label: "Nutrisi B", icon: Zap },
  { key: "relay_4", label: "Lampu", icon: Lightbulb },
] as const;

export default function RelayControl() {
  const [relay, setRelay] = useState<RelayState>({
    device_id: DEVICE_ID,
    relay_1: false,
    relay_2: false,
    relay_3: false,
    relay_4: false,
  });

  const [loading, setLoading] = useState(true);

  async function fetchRelayState() {
    const { data, error } = await supabase
      .from("relay_states")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .single();

    if (error) {
      console.error("Gagal mengambil relay state:", error.message);
    }

    if (data) {
      setRelay(data);
    }

    setLoading(false);
  }

  async function toggleRelay(key: keyof RelayState) {
    if (key === "id" || key === "device_id" || key === "updated_at") return;

    const newValue = !relay[key];

    setRelay((prev) => ({
      ...prev,
      [key]: newValue,
    }));

    const { error } = await supabase
      .from("relay_states")
      .upsert(
        {
          ...relay,
          [key]: newValue,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "device_id",
        }
      );

    if (error) {
      console.error("Gagal update relay:", error.message);

      setRelay((prev) => ({
        ...prev,
        [key]: !newValue,
      }));
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchRelayState();
    }, 0);

    const interval = setInterval(() => {
      fetchRelayState();
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm font-medium text-slate-500 shadow-sm">
        Memuat status relay...
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Kontrol Relay</h2>
          <p className="text-sm text-slate-500">Nyalakan atau matikan perangkat manual.</p>
        </div>
        <p className="text-xs font-medium text-slate-400">
          Update:{" "}
          {relay.updated_at
            ? new Date(relay.updated_at).toLocaleString("id-ID")
            : "-"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {relayItems.map((item) => {
          const isOn = relay[item.key];
          const Icon = item.icon;

          return (
            <button
              key={item.key}
              onClick={() => toggleRelay(item.key)}
              className={`min-h-28 rounded-lg border p-4 text-left transition active:scale-[0.99] ${
                isOn
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800 shadow-sm"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">{item.label}</p>
                  <p className="mt-2 text-2xl font-black tracking-tight">
                    {isOn ? "ON" : "OFF"}
                  </p>
                </div>
                <span
                  className={`grid size-10 place-items-center rounded-lg ${
                    isOn ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-500"
                  }`}
                >
                  {isOn ? <Power size={19} /> : <Icon size={19} />}
                </span>
              </div>

              <p className="mt-3 text-xs font-medium opacity-70">
                Ketuk untuk {isOn ? "mematikan" : "menyalakan"}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import { supabase, DEVICE_ID } from "@/src/lib/supabase";

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
  { key: "relay_1", label: "Pompa Air" },
  { key: "relay_2", label: "Pompa Nutrisi A" },
  { key: "relay_3", label: "Pompa Nutrisi B" },
  { key: "relay_4", label: "Lampu" },
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
    fetchRelayState();

    const interval = setInterval(() => {
      fetchRelayState();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <p className="text-slate-500">Memuat status relay...</p>;
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-bold">Kontrol Relay</h2>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        {relayItems.map((item) => {
          const isOn = relay[item.key];

          return (
            <button
              key={item.key}
              onClick={() => toggleRelay(item.key)}
              className={`rounded-2xl border p-5 text-left transition ${
                isOn
                  ? "border-green-300 bg-green-50 text-green-800"
                  : "border-slate-200 bg-slate-50 text-slate-700"
              }`}
            >
              <p className="text-sm font-medium opacity-70">{item.label}</p>

              <p className="mt-3 text-3xl font-bold">
                {isOn ? "ON" : "OFF"}
              </p>

              <p className="mt-2 text-xs opacity-70">
                Klik untuk {isOn ? "mematikan" : "menyalakan"}
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Update terakhir:{" "}
        {relay.updated_at
          ? new Date(relay.updated_at).toLocaleString("id-ID")
          : "-"}
      </p>
    </div>
  );
}

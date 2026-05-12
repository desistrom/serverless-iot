"use client";

import { supabase, DEVICE_ID } from "@/src/lib/supabase";
import { useEffect, useState } from "react";

type RelayState = {
  relay_1: boolean;
  relay_2: boolean;
  relay_3: boolean;
  relay_4: boolean;
};

export default function RelayControl() {
  const [relay, setRelay] = useState<RelayState>({
    relay_1: false,
    relay_2: false,
    relay_3: false,
    relay_4: false,
  });

  async function fetchRelay() {
    const { data } = await supabase
      .from("relay_states")
      .select("relay_1, relay_2, relay_3, relay_4")
      .eq("device_id", DEVICE_ID)
      .single();

    if (data) setRelay(data);
  }

  async function toggleRelay(relayNumber: number, value: boolean) {
    await supabase.from("relay_commands").insert({
      device_id: DEVICE_ID,
      relay_number: relayNumber,
      command: value,
      source: "dashboard",
      is_executed: false,
    });

    setRelay((prev) => ({
      ...prev,
      [`relay_${relayNumber}`]: value,
    }));
  }

  useEffect(() => {
    fetchRelay();
  }, []);

  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <h2 className="mb-4 text-xl font-bold">Kontrol Relay</h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((num) => {
          const key = `relay_${num}` as keyof RelayState;
          const isOn = relay[key];

          return (
            <button
              key={num}
              onClick={() => toggleRelay(num, !isOn)}
              className={`rounded-xl p-4 font-bold text-white ${
                isOn ? "bg-green-600" : "bg-slate-500"
              }`}
            >
              Relay {num}: {isOn ? "ON" : "OFF"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
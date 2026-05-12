import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const body = await req.json();

  const {
    device_id,
    relay_number,
    state,
  }: {
    device_id: string;
    relay_number: 1 | 2 | 3 | 4;
    state: boolean;
  } = body;

  const { data: device } = await supabase
    .from("devices")
    .select("id, control_mode")
    .eq("id", device_id)
    .single();

  if (!device) {
    return NextResponse.json({ error: "Device tidak ditemukan" }, { status: 404 });
  }

  if (device.control_mode !== "manual") {
    return NextResponse.json(
      { error: "Device sedang dalam mode otomatis" },
      { status: 400 }
    );
  }

  const relayColumn = `relay_${relay_number}`;

  const { error } = await supabase
    .from("relay_states")
    .upsert(
      {
        device_id,
        [relayColumn]: state,
        updated_by: "user",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "device_id",
      }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    relay_number,
    state,
  });
}
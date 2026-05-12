import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEVICE_ID = process.env.DEVICE_ID!;

type SensorReading = {
  id: string;
  device_id: string;
  tds: number;
  water_temp: number;
  air_temp: number;
  humidity: number;
  light_intensity: number;
};

export async function GET() {
  try {
    const { data: sensor, error: sensorError } = await supabase
      .from("sensor_readings")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (sensorError || !sensor) {
      return NextResponse.json(
        { error: "Data sensor tidak ditemukan" },
        { status: 404 }
      );
    }

    const { data: threshold, error: thresholdError } = await supabase
      .from("threshold_settings")
      .select("*")
      .eq("device_id", DEVICE_ID)
      .single();

    if (thresholdError || !threshold) {
      return NextResponse.json(
        { error: "Threshold tidak ditemukan" },
        { status: 404 }
      );
    }

    const alerts = [];

    if (sensor.tds < threshold.min_tds) {
      alerts.push(createAlert(sensor, "tds_low", "TDS Terlalu Rendah", `TDS ${sensor.tds} ppm di bawah batas minimum ${threshold.min_tds} ppm.`, "warning"));
    }

    if (sensor.tds > threshold.max_tds) {
      alerts.push(createAlert(sensor, "tds_high", "TDS Terlalu Tinggi", `TDS ${sensor.tds} ppm melebihi batas maksimum ${threshold.max_tds} ppm.`, "critical"));
    }

    if (sensor.water_temp < threshold.min_water_temp) {
      alerts.push(createAlert(sensor, "water_temp_low", "Suhu Air Terlalu Rendah", `Suhu air ${sensor.water_temp}°C di bawah batas minimum ${threshold.min_water_temp}°C.`, "warning"));
    }

    if (sensor.water_temp > threshold.max_water_temp) {
      alerts.push(createAlert(sensor, "water_temp_high", "Suhu Air Terlalu Tinggi", `Suhu air ${sensor.water_temp}°C melebihi batas maksimum ${threshold.max_water_temp}°C.`, "critical"));
    }

    if (sensor.air_temp < threshold.min_air_temp) {
      alerts.push(createAlert(sensor, "air_temp_low", "Suhu Udara Terlalu Rendah", `Suhu udara ${sensor.air_temp}°C di bawah batas minimum ${threshold.min_air_temp}°C.`, "warning"));
    }

    if (sensor.air_temp > threshold.max_air_temp) {
      alerts.push(createAlert(sensor, "air_temp_high", "Suhu Udara Terlalu Tinggi", `Suhu udara ${sensor.air_temp}°C melebihi batas maksimum ${threshold.max_air_temp}°C.`, "critical"));
    }

    if (sensor.humidity < threshold.min_humidity) {
      alerts.push(createAlert(sensor, "humidity_low", "Kelembapan Terlalu Rendah", `Kelembapan ${sensor.humidity}% di bawah batas minimum ${threshold.min_humidity}%.`, "warning"));
    }

    if (sensor.humidity > threshold.max_humidity) {
      alerts.push(createAlert(sensor, "humidity_high", "Kelembapan Terlalu Tinggi", `Kelembapan ${sensor.humidity}% melebihi batas maksimum ${threshold.max_humidity}%.`, "warning"));
    }

    if (sensor.light_intensity < threshold.min_light_intensity) {
      alerts.push(createAlert(sensor, "light_low", "Cahaya Terlalu Rendah", `Cahaya ${sensor.light_intensity} di bawah batas minimum ${threshold.min_light_intensity}.`, "warning"));
    }

    if (sensor.light_intensity > threshold.max_light_intensity) {
      alerts.push(createAlert(sensor, "light_high", "Cahaya Terlalu Tinggi", `Cahaya ${sensor.light_intensity} melebihi batas maksimum ${threshold.max_light_intensity}.`, "warning"));
    }

    if (alerts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Semua parameter normal",
        alerts_created: 0,
      });
    }

    const { error: insertError } = await supabase
      .from("alerts")
      .insert(alerts);

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Alert berhasil dibuat",
      alerts_created: alerts.length,
      alerts,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

function createAlert(
  sensor: SensorReading,
  alertType: string,
  title: string,
  message: string,
  severity: "info" | "warning" | "critical"
) {
  return {
    device_id: sensor.device_id,
    sensor_reading_id: sensor.id,
    alert_type: alertType,
    title,
    message,
    severity,
    is_read: false,
    is_sent_telegram: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

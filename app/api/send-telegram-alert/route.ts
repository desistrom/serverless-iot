import { NextResponse } from "next/server";

export const runtime = "nodejs";

type AlertPayload = {
  title: string;
  message: string;
  severity?: "info" | "warning" | "critical";
  parameter?: string;
  value?: string | number;
};

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

export async function POST(req: Request) {
  try {
    const body: AlertPayload = await req.json();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json(
        { error: "Telegram environment variable belum diatur" },
        { status: 500 }
      );
    }

    if (!body.title || !body.message) {
      return NextResponse.json(
        { error: "title dan message wajib diisi" },
        { status: 400 }
      );
    }

    const text = formatTelegramMessage(body);

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text,
          parse_mode: "HTML",
        }),
      }
    );

    const result = await telegramRes.json();

    if (!telegramRes.ok) {
      return NextResponse.json(
        {
          error: "Gagal mengirim Telegram",
          detail: result,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pesan Telegram berhasil dikirim",
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

function formatTelegramMessage(alert: AlertPayload) {
  const icon =
    alert.severity === "critical"
      ? "🚨"
      : alert.severity === "warning"
      ? "⚠️"
      : "ℹ️";

  return `
${icon} <b>Alert Hidroponik</b>

<b>${alert.title}</b>
${alert.parameter ? `Parameter: ${alert.parameter}` : ""}
${alert.value !== undefined ? `Nilai: ${alert.value}` : ""}

${alert.message}
`.trim();
}
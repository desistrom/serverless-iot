type RelayStatus = {
  relay_1: boolean;
  relay_2: boolean;
  relay_3: boolean;
  relay_4: boolean;
};

type Threshold = {
  min_tds: number;
  max_tds: number;
  min_water_temp: number;
  max_water_temp: number;
  min_air_temp: number;
  max_air_temp: number;
  min_humidity: number;
  max_humidity: number;
  min_light_intensity: number;
  max_light_intensity: number;
};

type SensorInput = {
  tds: number;
  water_temp: number;
  air_temp: number;
  humidity: number;
  light_intensity: number;
  relay: RelayStatus;
  threshold: Threshold;
};

export async function getHydroponicAISuggestion(input: SensorInput) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY belum diatur");
  }

  const prompt = `
You are a home hydroponic assistant expert.

Your tasks:
- Analyze hydroponic sensor data.
- Give short, practical, and safe suggestions.
- Do not give dangerous instructions.
- Do not suggest extreme changes.
- Prioritize gradual and beginner-friendly actions.
- Maximum 3 suggestion points.
- Final response MUST be in Indonesian language.

Sensor data:
- TDS: ${input.tds} ppm
- Water temperature: ${input.water_temp} °C
- Air temperature: ${input.air_temp} °C
- Humidity: ${input.humidity} %
- Light intensity: ${input.light_intensity}

Relay status:
- Water pump: ${input.relay.relay_1 ? "ON" : "OFF"}
- Nutrient pump A: ${input.relay.relay_2 ? "ON" : "OFF"}
- Nutrient pump B: ${input.relay.relay_3 ? "ON" : "OFF"}
- Lamp: ${input.relay.relay_4 ? "ON" : "OFF"}

Threshold:
- Normal TDS: ${input.threshold.min_tds} - ${input.threshold.max_tds} ppm
- Normal water temperature: ${input.threshold.min_water_temp} - ${input.threshold.max_water_temp} °C
- Normal air temperature: ${input.threshold.min_air_temp} - ${input.threshold.max_air_temp} °C
- Normal humidity: ${input.threshold.min_humidity} - ${input.threshold.max_humidity} %
- Minimum light intensity: ${input.threshold.min_light_intensity}

Required response format:

Status:
[Normal / Perlu Perhatian / Kritis] - short condition summary.

Saran:
1. ...
2. ...
3. ...
`.trim();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001",
      "X-Title": "Dashboard Hidroponik",
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      stream: false,
      messages: [
        {
          role: "system",
          content:
            `You are a hydroponic assistant for beginners.

Rules:
- Always answer in Indonesian.
- Keep suggestions short and practical.
- Maximum 3 suggestion points.
- Avoid dangerous or extreme recommendations.
- Prioritize safe and gradual actions.
- Focus on beginner-friendly hydroponic advice.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
      max_tokens: 250,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error?.message || "Gagal mengambil saran dari OpenRouter"
    );
  }

  const content = result.choices?.[0]?.message?.content;

  if (!content) {
    return [
      "Pantau ulang sensor dalam beberapa menit.",
      "Pastikan pompa, nutrisi, dan lampu bekerja normal.",
      "Periksa kondisi tanaman secara manual.",
    ];
  }

  return parseSuggestion(content);
}

function parseSuggestion(text: string): string[] {
  return text
    .split("\n")
    .map((line) =>
      line
        .replace(/^[-*\d.]+\s*/, "")
        .trim()
    )
    .filter(Boolean)
    .slice(0, 3);
}
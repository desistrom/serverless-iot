# Dashboard Hidroponik

Dashboard IoT hidroponik berbasis Next.js untuk memantau data sensor ESP32, mengatur threshold, mengontrol relay, melihat riwayat grafik, dan mengelola alert.

## Fitur

- Monitoring realtime sensor: TDS, suhu air, suhu udara, kelembapan, dan intensitas cahaya.
- Kartu sensor dengan status threshold normal atau warning.
- Kontrol relay untuk pompa air, pompa nutrisi A/B, dan lampu.
- Mode kontrol manual atau otomatis.
- Grafik riwayat 100 data sensor terakhir.
- Pengaturan threshold sensor.
- Dashboard alert dengan status dibaca/belum dibaca.
- API untuk cek alert sensor dan kirim notifikasi Telegram.
- Integrasi OpenRouter untuk saran AI hidroponik.
- Tampilan responsive dengan menu hamburger di mobile.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Recharts
- Lucide React
- OpenRouter API
- Telegram Bot API

## Struktur Project

```txt
app/
  page.tsx                         # Overview dashboard
  alerts/page.tsx                  # Daftar alert
  history/page.tsx                 # Grafik riwayat sensor
  settings/page.tsx                # Pengaturan threshold
  api/check-sensor-alert/route.ts  # Generate alert dari data sensor terbaru
  api/relay/manual/route.ts        # Endpoint kontrol relay manual
  api/send-telegram-alert/route.ts # Endpoint kirim pesan Telegram

src/
  components/
    Navbar.tsx
    RealtimeSensorCards.tsx
    RelayControl.tsx
    HistoryChart.tsx
    SensorCard.tsx
  lib/
    supabase.ts
    openrouter.ts
```

## Environment Variables

Buat file `.env.local` di root project.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_DEVICE_ID=

SUPABASE_SERVICE_ROLE_KEY=
DEVICE_ID=

TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

OPENROUTER_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Catatan:

- `NEXT_PUBLIC_*` dipakai oleh client component.
- `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, dan `OPENROUTER_API_KEY` hanya boleh dipakai di server/API route.
- `NEXT_PUBLIC_DEVICE_ID` dan `DEVICE_ID` sebaiknya berisi device yang sama.

## Database Supabase

Project ini mengasumsikan beberapa tabel Supabase:

- `devices`: menyimpan device dan `control_mode`.
- `sensor_readings`: menyimpan data sensor realtime/historis.
- `threshold_settings`: menyimpan batas normal sensor.
- `relay_states`: menyimpan status relay.
- `alerts`: menyimpan alert hasil pengecekan sensor.

Kolom yang dipakai bisa dilihat langsung dari file page dan API route di folder `app/` dan `src/components/`.

## Menjalankan Project

Install dependency:

```bash
npm install
```

Jalankan development server:

```bash
npm run dev
```

Buka:

```txt
http://localhost:3000
```

Jika port `3000` sedang dipakai, Next.js akan memilih port lain.

## Script

```bash
npm run dev      # menjalankan development server
npm run build    # build production
npm run start    # menjalankan build production
npm run lint     # menjalankan ESLint
```

## API Endpoint

### `GET /api/check-sensor-alert`

Mengambil sensor terbaru dan threshold, lalu membuat alert jika nilai sensor melewati batas.

### `POST /api/send-telegram-alert`

Mengirim pesan alert ke Telegram.

Payload contoh:

```json
{
  "title": "TDS Terlalu Tinggi",
  "message": "TDS melebihi batas maksimum.",
  "severity": "critical",
  "parameter": "TDS",
  "value": 1300
}
```

### `POST /api/relay/manual`

Endpoint kontrol relay manual. Lihat implementasi di `app/api/relay/manual/route.ts` untuk format payload yang digunakan.

## Catatan Development

- Project ini memakai Next.js 16. Ikuti panduan lokal di `node_modules/next/dist/docs/` jika ingin mengubah pola App Router, API route, CSS, atau client/server component.
- UI utama dibuat mobile-first dan memakai Tailwind utility class.
- Grafik Recharts dipisah ke client component `src/components/HistoryChart.tsx`.
- Data realtime sensor memakai Supabase channel pada `RealtimeSensorCards`.

## Verifikasi

Sebelum commit, jalankan:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

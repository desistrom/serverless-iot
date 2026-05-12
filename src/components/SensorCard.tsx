type SensorCardProps = {
  title: string;
  value: string | number;
  unit?: string;
};

export default function SensorCard({
  title,
  value,
  unit = "",
}: SensorCardProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
        {value}{" "}
        {unit && <span className="text-base font-semibold text-slate-500">{unit}</span>}
      </h2>
    </div>
  );
}

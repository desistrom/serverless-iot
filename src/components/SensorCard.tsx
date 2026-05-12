type Props = {
  title: string;
  value: string | number;
  unit?: string;
};

export default function SensorCard({ title, value, unit }: Props) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow">
      <p className="text-sm text-slate-500">{title}</p>
      <h2 className="mt-2 text-3xl font-bold">
        {value} {unit && <span className="text-lg">{unit}</span>}
      </h2>
    </div>
  );
}
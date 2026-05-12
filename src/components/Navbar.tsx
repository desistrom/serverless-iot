import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl gap-4 p-4 font-medium">
        <Link href="/">Overview</Link>
        <Link href="/history">Grafik</Link>
        <Link href="/alerts">Alert</Link>
        <Link href="/settings">Threshold</Link>
      </div>
    </nav>
  );
}
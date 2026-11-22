import Link from "next/link";

export default function AppHeader() {
  return (
    <header className="flex items-center gap-4 border-b border-foreground/10 px-6 py-3 text-sm">
      <Link href="/units" className="font-semibold">
        Turnover
      </Link>
      <nav className="flex flex-1 gap-4">
        <Link href="/units">Units</Link>
        <Link href="/team">Team</Link>
      </nav>
      <a href="/auth/logout">Log out</a>
    </header>
  );
}

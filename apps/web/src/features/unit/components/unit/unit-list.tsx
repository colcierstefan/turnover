import Link from "next/link";

export default function UnitList({
  units,
}: Readonly<{
  units: ReadonlyArray<{ id: string; name: string; address: string }>;
}>) {
  if (units.length === 0) {
    return (
      <p className="text-sm opacity-70">
        No units yet. Add your first one below.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {units.map((unit) => (
        <li key={unit.id}>
          <Link
            href={`/units/${unit.id}`}
            className="flex flex-col rounded-lg border border-foreground/10 p-4"
          >
            <span className="font-medium">{unit.name}</span>
            <span className="text-sm opacity-70">{unit.address}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

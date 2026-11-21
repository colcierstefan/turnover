import type { ReactNode } from "react";

export default function Card({
  title,
  children,
}: Readonly<{ title?: string; children: ReactNode }>) {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-foreground/10 p-4">
      {title && <h2 className="text-lg font-semibold">{title}</h2>}
      {children}
    </section>
  );
}

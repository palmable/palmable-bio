import type { HoursBlock } from "@/lib/types";
import { SectionTitle } from "./SectionTitle";

// Opening-hours table.
export function HoursBlockView({ block }: { block: HoursBlock }) {
  return (
    <section className="flex flex-col gap-3">
      {block.title ? <SectionTitle>{block.title}</SectionTitle> : null}
      <dl className="rounded-xl border border-black/5 bg-white/60 px-4 py-1 text-sm">
        {block.rows.map((row, i) => (
          <div
            key={i}
            className="flex justify-between border-b border-black/5 py-2.5 last:border-b-0"
          >
            <dt className="opacity-70">{row.day}</dt>
            <dd className="font-medium">{row.hours}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

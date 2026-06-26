import type { ContactBlock } from "@/lib/types";
import { SectionTitle } from "./SectionTitle";

// Contact details with tap-to-call / tap-to-email and a directions link.
export function ContactBlockView({ block }: { block: ContactBlock }) {
  return (
    <section className="flex flex-col gap-3">
      {block.title ? <SectionTitle>{block.title}</SectionTitle> : null}
      <div className="flex flex-col gap-2 rounded-xl border border-black/5 bg-white/60 p-4 text-sm">
        {block.address ? (
          <p className="flex gap-2">
            <span aria-hidden>📍</span>
            <span className="opacity-80">{block.address}</span>
          </p>
        ) : null}
        {block.phone ? (
          <a href={`tel:${block.phone}`} className="flex gap-2">
            <span aria-hidden>📞</span>
            <span>{block.phone}</span>
          </a>
        ) : null}
        {block.email ? (
          <a href={`mailto:${block.email}`} className="flex gap-2">
            <span aria-hidden>✉️</span>
            <span>{block.email}</span>
          </a>
        ) : null}
        {block.mapUrl ? (
          <a
            href={block.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-fit items-center gap-1 font-semibold"
            style={{ color: "var(--accent)" }}
          >
            Get directions →
          </a>
        ) : null}
      </div>
    </section>
  );
}

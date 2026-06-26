import type { LinksBlock } from "@/lib/types";
import { SectionTitle } from "./SectionTitle";

// Stack of tappable link buttons — the core "link in bio" pattern.
// `featured` links render filled with the theme accent; others are outlined.
export function LinksBlockView({ block }: { block: LinksBlock }) {
  return (
    <section className="flex flex-col gap-3">
      {block.title ? <SectionTitle>{block.title}</SectionTitle> : null}
      {block.items.map((item, i) => (
        <a
          key={i}
          href={item.href}
          className={
            item.featured
              ? "flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform active:scale-[0.98]"
              : "flex items-center justify-center gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-transform active:scale-[0.98]"
          }
          style={
            item.featured
              ? { backgroundColor: "var(--accent)" }
              : { borderColor: "var(--accent)", color: "var(--accent)" }
          }
        >
          {item.icon ? <span aria-hidden>{item.icon}</span> : null}
          {item.label}
        </a>
      ))}
    </section>
  );
}

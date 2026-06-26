import type { MenuBlock } from "@/lib/types";
import { SectionTitle } from "./SectionTitle";

// Catalog / menu list with photo, name, description and price.
// This is one of RENSEA's "killer" blocks for F&B and retail.
export function MenuBlockView({ block }: { block: MenuBlock }) {
  return (
    <section className="flex flex-col gap-3">
      {block.title ? <SectionTitle>{block.title}</SectionTitle> : null}
      <ul className="flex flex-col gap-2">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3 rounded-xl border border-black/5 bg-white/60 p-2.5"
          >
            {item.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-14 w-14 shrink-0 rounded-lg object-cover"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{item.name}</p>
              {item.description ? (
                <p className="truncate text-xs opacity-60">
                  {item.description}
                </p>
              ) : null}
            </div>
            <span
              className="shrink-0 text-sm font-semibold"
              style={{ color: "var(--accent)" }}
            >
              {item.price}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

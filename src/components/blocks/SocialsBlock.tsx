import type { SocialsBlock } from "@/lib/types";
import { SocialBrandIcon, socialIconClass } from "@/components/bio/SocialBrandIcon";

const LABELS: Record<SocialsBlock["items"][number]["platform"], string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  threads: "Threads",
  line: "LINE",
  youtube: "YouTube",
  x: "X",
  whatsapp: "WhatsApp",
};

export function SocialsBlockView({ block }: { block: SocialsBlock }) {
  return (
    <section className="flex flex-wrap justify-center gap-3">
      {block.items.map((item, i) => (
        <a
          key={i}
          href={item.href}
          aria-label={LABELS[item.platform]}
          className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm transition-transform active:scale-95 ${socialIconClass(item.platform)}`}
        >
          <SocialBrandIcon platform={item.platform} />
        </a>
      ))}
    </section>
  );
}

import type { HeaderBlock } from "@/lib/types";
import { SiteImage } from "@/components/SiteImage";

// Used when header is rendered outside BioPageView (e.g. block preview).
export function HeaderBlockView({ block }: { block: HeaderBlock }) {
  return (
    <header className="flex flex-col items-center text-center">
      {block.coverUrl ? (
        <SiteImage src={block.coverUrl} alt="" className="h-36 w-full object-cover" />
      ) : null}
      {block.avatarUrl ? (
        <SiteImage
          src={block.avatarUrl}
          alt={block.name}
          className={`h-24 w-24 rounded-full object-cover ${
            block.coverUrl ? "-mt-12 border-4 border-white shadow-md" : "mt-2"
          }`}
        />
      ) : null}
      <h1 className="mt-3 text-xl font-bold">{block.name}</h1>
      {block.tagline ? (
        <p className="mt-1 text-sm text-black/50">{block.tagline}</p>
      ) : null}
    </header>
  );
}

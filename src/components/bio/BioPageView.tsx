import type { Block, HeaderBlock, GalleryBlock, Site, SocialsBlock } from "@/lib/types";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { GalleryBlockView } from "@/components/blocks/GalleryBlock";
import { SocialsBlockView } from "@/components/blocks/SocialsBlock";
import { VerifiedBadge } from "@/components/bio/VerifiedBadge";
import { SiteImage } from "@/components/SiteImage";

function findBlock<T extends Block["type"]>(
  blocks: Block[],
  type: T
): Extract<Block, { type: T }> | undefined {
  return blocks.find((b) => b.type === type) as Extract<Block, { type: T }> | undefined;
}

function ProfileSection({ header }: { header: HeaderBlock }) {
  return (
    <div className="flex flex-col items-center px-5 pt-5 text-center">
      {header.avatarUrl ? (
        <SiteImage
          src={header.avatarUrl}
          alt={header.name}
          className="h-24 w-24 rounded-full object-cover"
        />
      ) : null}
      <h1 className="mt-3 text-xl font-bold tracking-tight">
        <span className="inline-flex items-center gap-1.5">
          {header.name}
          {header.verified ? <VerifiedBadge size={18} /> : null}
        </span>
      </h1>
      {header.tagline ? (
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-black/50">{header.tagline}</p>
      ) : null}
    </div>
  );
}

/** Public bio page layout: cover → profile → socials → notes → other blocks. */
export function BioPageView({ site }: { site: Site }) {
  const header = findBlock(site.blocks, "header");
  const socials = findBlock(site.blocks, "socials");
  const gallery = findBlock(site.blocks, "gallery");
  const galleryImages = gallery?.images.filter((img) => img.url) ?? [];
  const otherBlocks = site.blocks.filter(
    (b) => b.type !== "header" && b.type !== "socials" && b.type !== "gallery"
  );

  const themeVars = {
    "--accent": site.theme.accent,
    backgroundColor: site.theme.background,
    color: site.theme.text,
  } as React.CSSProperties;

  return (
    <main
      className="mx-auto min-h-dvh w-full max-w-md bg-white text-neutral-900"
      style={themeVars}
    >
      {header?.coverUrl ? (
        <SiteImage src={header.coverUrl} alt="" className="h-48 w-full object-cover" />
      ) : null}

      {header ? <ProfileSection header={header} /> : null}

      {socials && (socials as SocialsBlock).items.length > 0 ? (
        <div className="px-5 pt-5">
          <SocialsBlockView block={socials} />
        </div>
      ) : null}

      {gallery && galleryImages.length > 0 ? (
        <div className="px-5 pt-8 pb-4">
          <GalleryBlockView
            block={{ ...gallery, images: galleryImages }}
            variant="notes"
          />
        </div>
      ) : null}

      {otherBlocks.length > 0 ? (
        <div className="flex flex-col gap-6 px-5 pt-6 pb-12">
          {otherBlocks.map((block, i) => (
            <BlockRenderer key={i} block={block} />
          ))}
        </div>
      ) : (
        <div className="pb-8" />
      )}

      <footer className="pb-8 pt-2 text-center text-xs text-black/35">
        Made with Palmable
      </footer>
    </main>
  );
}

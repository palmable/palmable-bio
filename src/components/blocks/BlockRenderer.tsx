import type { Block } from "@/lib/types";
import { HeaderBlockView } from "./HeaderBlock";
import { LinksBlockView } from "./LinksBlock";
import { MenuBlockView } from "./MenuBlock";
import { GalleryBlockView } from "./GalleryBlock";
import { HoursBlockView } from "./HoursBlock";
import { ContactBlockView } from "./ContactBlock";
import { SocialsBlockView } from "./SocialsBlock";

// Maps a block's discriminated `type` to its view. Adding a block type means
// adding one case here plus the renderer file — nothing else changes.
export function BlockRenderer({ block }: { block: Block }) {
  switch (block.type) {
    case "header":
      return <HeaderBlockView block={block} />;
    case "links":
      return <LinksBlockView block={block} />;
    case "menu":
      return <MenuBlockView block={block} />;
    case "gallery":
      return <GalleryBlockView block={block} />;
    case "hours":
      return <HoursBlockView block={block} />;
    case "contact":
      return <ContactBlockView block={block} />;
    case "socials":
      return <SocialsBlockView block={block} />;
    default: {
      // Exhaustiveness guard: if a new BlockType is added without a case,
      // TypeScript will flag this line at build time.
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}

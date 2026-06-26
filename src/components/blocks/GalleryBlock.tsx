import type { GalleryBlock } from "@/lib/types";
import { PostNotesGrid } from "@/components/bio/PostNotesGrid";
import { SectionTitle } from "./SectionTitle";

type GalleryBlockViewProps = {
  block: GalleryBlock;
  /** "notes" renders a 2-column card grid like link-in-bio post feeds. */
  variant?: "grid" | "notes";
};

export function GalleryBlockView({ block, variant = "grid" }: GalleryBlockViewProps) {
  if (variant === "notes") {
    return <PostNotesGrid title={block.title} images={block.images} />;
  }

  return (
    <section className="flex flex-col gap-3">
      {block.title ? <SectionTitle>{block.title}</SectionTitle> : null}
      <div className="grid grid-cols-3 gap-2">
        {block.images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={img.url}
            alt={img.alt ?? ""}
            className="aspect-square w-full rounded-lg object-cover"
          />
        ))}
      </div>
    </section>
  );
}

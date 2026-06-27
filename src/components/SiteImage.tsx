import { resolveImageUrl } from "@/lib/drive-url";

type SiteImageProps = {
  src: string | undefined;
  alt?: string;
  className?: string;
};

/** Renders user-uploaded images, including Google Drive files via the media proxy. */
export function SiteImage({ src, alt = "", className }: SiteImageProps) {
  if (!src) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolveImageUrl(src)} alt={alt} className={className} />
  );
}

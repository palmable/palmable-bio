// Core domain model for Palmable Bio.
// A `Site` is one published bio page; it owns an ordered list of `Block`s.
// Each block carries its own `content` shape (the JSONB-per-block idea), so
// adding a new block type never requires touching existing ones.

export type BlockType =
  | "header"
  | "links"
  | "menu"
  | "gallery"
  | "hours"
  | "contact"
  | "socials";

export type LinkItem = {
  label: string;
  href: string;
  /** Optional emoji/icon shown before the label. */
  icon?: string;
  /** Visually emphasize this link (filled button vs. outline). */
  featured?: boolean;
};

export type MenuItem = {
  name: string;
  description?: string;
  price: string;
  imageUrl?: string;
};

export type HoursRow = {
  day: string;
  hours: string;
};

export type SocialPlatform =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "threads"
  | "line"
  | "youtube"
  | "x"
  | "whatsapp";

export type SocialItem = {
  platform: SocialPlatform;
  href: string;
};

// --- Discriminated union of blocks -----------------------------------------

export type HeaderBlock = {
  type: "header";
  name: string;
  tagline?: string;
  avatarUrl?: string;
  coverUrl?: string;
  verified?: boolean;
};

export type LinksBlock = {
  type: "links";
  title?: string;
  items: LinkItem[];
};

export type MenuBlock = {
  type: "menu";
  title?: string;
  items: MenuItem[];
};

export type GalleryImage = {
  /** Cover image URL. */
  url: string;
  alt?: string;
  /** Short title shown on the post card and detail view. */
  title?: string;
  /** Long-form post body shown in the detail view. */
  body?: string;
  /** @deprecated Use `title` — kept for older saved posts. */
  caption?: string;
  /** Optional link opened from the post detail view. */
  href?: string;
};

export type GalleryBlock = {
  type: "gallery";
  title?: string;
  images: GalleryImage[];
};

export type HoursBlock = {
  type: "hours";
  title?: string;
  rows: HoursRow[];
};

export type ContactBlock = {
  type: "contact";
  title?: string;
  phone?: string;
  email?: string;
  address?: string;
  /** Free-form map URL (e.g. Google Maps) for the "Get directions" link. */
  mapUrl?: string;
};

export type SocialsBlock = {
  type: "socials";
  items: SocialItem[];
};

export type Block =
  | HeaderBlock
  | LinksBlock
  | MenuBlock
  | GalleryBlock
  | HoursBlock
  | ContactBlock
  | SocialsBlock;

export type Theme = {
  /** Accent color used for buttons and highlights. */
  accent: string;
  /** Page background. */
  background: string;
  /** Primary text color. */
  text: string;
};

export type Site = {
  slug: string;
  title: string;
  /** Short description used for SEO/social previews. */
  description?: string;
  /** Whether the page is publicly visible. Only set when loaded for editing. */
  published?: boolean;
  theme: Theme;
  blocks: Block[];
};

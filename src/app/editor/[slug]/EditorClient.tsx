"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import type {
  Block,
  GalleryBlock,
  GalleryImage,
  HeaderBlock,
  Site,
  SocialItem,
  SocialPlatform,
  SocialsBlock,
} from "@/lib/types";
import { BioPageView } from "@/components/bio/BioPageView";
import { ImageUploadField } from "@/components/ImageUploadField";
import { saveSiteAction } from "@/app/actions";

const PLATFORMS: SocialPlatform[] = [
  "tiktok",
  "instagram",
  "threads",
  "facebook",
  "youtube",
  "x",
  "line",
  "whatsapp",
];

function findBlock<T extends Block["type"]>(
  blocks: Block[],
  type: T
): Extract<Block, { type: T }> | undefined {
  return blocks.find((b) => b.type === type) as Extract<Block, { type: T }> | undefined;
}

function mergeEditedBlocks(
  original: Block[],
  edited: {
    header: HeaderBlock;
    socials: SocialsBlock;
    gallery: GalleryBlock;
  }
): Block[] {
  let headerUsed = false;
  let socialsUsed = false;
  let galleryUsed = false;
  const out: Block[] = [];

  for (const block of original) {
    if (block.type === "header" && !headerUsed) {
      out.push(edited.header);
      headerUsed = true;
    } else if (block.type === "socials" && !socialsUsed) {
      out.push(edited.socials);
      socialsUsed = true;
    } else if (block.type === "gallery" && !galleryUsed) {
      out.push(edited.gallery);
      galleryUsed = true;
    } else if (
      block.type === "header" ||
      block.type === "socials" ||
      block.type === "gallery"
    ) {
      continue;
    } else {
      out.push(block);
    }
  }

  if (!headerUsed) out.unshift(edited.header);
  if (!socialsUsed) out.splice(1, 0, edited.socials);
  if (!galleryUsed) out.push(edited.gallery);

  return out;
}

export function EditorClient({ site }: { site: Site }) {
  const originalHeader = findBlock(site.blocks, "header");
  const originalSocials = findBlock(site.blocks, "socials");
  const originalGallery = findBlock(site.blocks, "gallery");

  const [title, setTitle] = useState(site.title);
  const [accent, setAccent] = useState(site.theme.accent);
  const [published, setPublished] = useState<boolean>(site.published ?? false);

  const [name, setName] = useState(originalHeader?.name ?? site.title);
  const [tagline, setTagline] = useState(originalHeader?.tagline ?? "");
  const [avatarUrl, setAvatarUrl] = useState(originalHeader?.avatarUrl ?? "");
  const [coverUrl, setCoverUrl] = useState(originalHeader?.coverUrl ?? "");

  const [socialItems, setSocialItems] = useState<SocialItem[]>(
    originalSocials?.items ?? [
      { platform: "tiktok", href: "https://" },
      { platform: "instagram", href: "https://" },
      { platform: "threads", href: "https://" },
      { platform: "facebook", href: "https://" },
    ]
  );
  const [notesTitle, setNotesTitle] = useState(originalGallery?.title ?? "Notes");
  const [posts, setPosts] = useState<GalleryImage[]>(() =>
    (originalGallery?.images ?? []).map((img) => ({
      ...img,
      title: img.title ?? img.caption ?? "",
      body: img.body ?? "",
    }))
  );

  const [isPending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const blocks = useMemo<Block[]>(() => {
    return mergeEditedBlocks(site.blocks, {
      header: {
        type: "header",
        name,
        tagline: tagline || undefined,
        avatarUrl: avatarUrl || undefined,
        coverUrl: coverUrl || undefined,
        verified: true,
      },
      socials: { type: "socials", items: socialItems },
      gallery: {
        type: "gallery",
        title: notesTitle,
        images: posts.filter((p) => p.url),
      },
    });
  }, [
    site.blocks,
    name,
    tagline,
    avatarUrl,
    coverUrl,
    socialItems,
    notesTitle,
    posts,
  ]);

  const previewSite: Site = { ...site, title, theme: { ...site.theme, accent }, blocks };

  function updateSocial(i: number, patch: Partial<SocialItem>) {
    setSocialItems((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeSocial(i: number) {
    setSocialItems((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addSocial() {
    setSocialItems((prev) => [...prev, { platform: "instagram", href: "https://" }]);
  }

  function updatePost(i: number, patch: Partial<(typeof posts)[number]>) {
    setPosts((prev) => prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function removePost(i: number) {
    setPosts((prev) => prev.filter((_, idx) => idx !== i));
  }
  function addPost() {
    setPosts((prev) => [...prev, { url: "", title: "", body: "" }]);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      try {
        await saveSiteAction(site.slug, {
          title,
          description: site.description,
          theme: { ...site.theme, accent },
          blocks,
          published,
        });
        setSavedAt(new Date().toLocaleTimeString());
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not save.");
      }
    });
  }

  const inputClass = "rounded-lg border px-3 py-2 text-sm";

  return (
    <div className="mx-auto grid w-full max-w-5xl gap-8 px-6 py-8 lg:grid-cols-[1fr_minmax(360px,420px)]">
      <div className="flex flex-col gap-6">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm underline opacity-60">
              ← Pages
            </Link>
            <Link
              href={published ? `/${site.slug}` : `/preview/${site.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline opacity-60"
            >
              {published ? "Open page ↗" : "Preview draft ↗"}
            </Link>
          </div>
          <div className="flex items-center gap-3">
            {savedAt ? (
              <span className="text-xs opacity-50">Saved {savedAt}</span>
            ) : null}
            <button
              onClick={save}
              disabled={isPending}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-semibold">Page settings</h2>
          <label className="flex flex-col gap-1 text-sm">
            Title
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Published (visible to the public)
          </label>
        </section>

        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-semibold">Profile</h2>
          <label className="flex flex-col gap-1 text-sm">
            Your name
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Bio
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Short bio or tags"
            />
          </label>
          <ImageUploadField
            label="Profile photo"
            slug={site.slug}
            kind="avatar"
            value={avatarUrl}
            onChange={setAvatarUrl}
          />
          <ImageUploadField
            label="Cover image"
            slug={site.slug}
            kind="cover"
            value={coverUrl}
            onChange={setCoverUrl}
            previewClassName="h-32 w-full object-cover"
          />
        </section>

        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Social links</h2>
            <button onClick={addSocial} className="rounded-lg border px-3 py-1 text-sm">
              + Add
            </button>
          </div>
          {socialItems.map((item, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
              <div className="flex gap-2">
                <select
                  className={`${inputClass} w-36`}
                  value={item.platform}
                  onChange={(e) =>
                    updateSocial(i, { platform: e.target.value as SocialPlatform })
                  }
                >
                  {PLATFORMS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <input
                  className={`${inputClass} flex-1`}
                  placeholder="https://…"
                  value={item.href}
                  onChange={(e) => updateSocial(i, { href: e.target.value })}
                />
              </div>
              <button
                onClick={() => removeSocial(i)}
                className="self-start text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </section>

        <section className="flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Posts</h2>
            <button onClick={addPost} className="rounded-lg border px-3 py-1 text-sm">
              + Add post
            </button>
          </div>
          <label className="flex flex-col gap-1 text-sm">
            Section title
            <input
              className={inputClass}
              value={notesTitle}
              onChange={(e) => setNotesTitle(e.target.value)}
            />
          </label>
          {posts.map((post, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
              <ImageUploadField
                label="Cover image"
                slug={site.slug}
                kind="post"
                value={post.url}
                onChange={(url) => updatePost(i, { url })}
                previewClassName="aspect-[3/4] w-full max-w-[140px] object-cover"
              />
              <label className="flex flex-col gap-1 text-sm">
                Title
                <input
                  className={inputClass}
                  placeholder="Post title"
                  value={post.title ?? ""}
                  onChange={(e) => updatePost(i, { title: e.target.value })}
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                Content
                <textarea
                  className={`${inputClass} min-h-32 resize-y`}
                  placeholder="Write your post…"
                  value={post.body ?? ""}
                  onChange={(e) => updatePost(i, { body: e.target.value })}
                />
              </label>
              <input
                className={inputClass}
                placeholder="Link (optional) — https://…"
                value={post.href ?? ""}
                onChange={(e) => updatePost(i, { href: e.target.value || undefined })}
              />
              <button
                onClick={() => removePost(i)}
                className="self-start text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          {posts.length === 0 ? (
            <p className="text-sm opacity-50">No posts yet — add your first one.</p>
          ) : null}
        </section>
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <p className="mb-2 text-center text-xs uppercase tracking-wider opacity-50">
          Live preview
        </p>
        <div className="mx-auto max-w-sm overflow-hidden rounded-[2rem] border-8 border-black/80 shadow-xl">
          <div className="max-h-[680px] overflow-y-auto bg-white">
            <BioPageView site={previewSite} />
          </div>
        </div>
      </div>
    </div>
  );
}

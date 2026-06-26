"use client";

import { useCallback, useEffect, useState } from "react";
import type { GalleryImage } from "@/lib/types";
import { postBody, postTitle } from "@/lib/post-utils";

type PostNotesGridProps = {
  title?: string;
  images: GalleryImage[];
};

export function PostNotesGrid({ title, images }: PostNotesGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex !== null ? images[activeIndex] : null;
  const activeTitle = active ? postTitle(active) : "";
  const activeBody = active ? postBody(active) : "";

  const close = useCallback(() => setActiveIndex(null), []);

  useEffect(() => {
    if (activeIndex === null) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [activeIndex, close]);

  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="text-base font-bold tracking-tight text-neutral-900">
          {title ?? "Notes"}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {images.map((img, i) => {
            const label = postTitle(img);
            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                className="overflow-hidden rounded-2xl border border-black/5 bg-white text-left shadow-sm transition-transform active:scale-[0.98]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.alt ?? (label || "Post")}
                  className="aspect-[3/4] w-full object-cover"
                />
                {label ? (
                  <p className="line-clamp-2 px-3 py-2.5 text-xs font-medium text-black/70">
                    {label}
                  </p>
                ) : (
                  <p className="px-3 py-2.5 text-xs text-black/35">View post</p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {active ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
          onClick={close}
          role="presentation"
        >
          <div
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={activeTitle || "Post"}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.url}
              alt={active.alt ?? (activeTitle || "Post cover")}
              className="max-h-[50vh] w-full object-cover"
            />
            <div className="flex flex-col gap-3 p-4">
              {activeTitle ? (
                <h3 className="text-lg font-bold tracking-tight text-neutral-900">
                  {activeTitle}
                </h3>
              ) : null}
              {activeBody ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-700">
                  {activeBody}
                </p>
              ) : null}
              {!activeTitle && !activeBody ? (
                <p className="text-sm text-neutral-500">No content yet.</p>
              ) : null}
              <div className="flex flex-wrap gap-2 pt-1">
                {active.href && active.href !== "https://" ? (
                  <a
                    href={active.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
                  >
                    Open link
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={close}
                  className="rounded-lg border px-4 py-2 text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useTransition } from "react";
import { deleteSiteAction } from "@/app/actions";

export function DeleteSiteButton({ slug, title }: { slug: string; title: string }) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Delete "${title}" (palmable.bio/${slug})? This permanently removes the page.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteSiteAction(slug);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="rounded-lg border border-red-500/40 px-3 py-1.5 text-red-600 disabled:opacity-50"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}

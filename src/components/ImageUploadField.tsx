"use client";

import { useRef, useState, useTransition } from "react";
import { uploadSiteImageAction } from "@/app/actions";
import type { SiteImageKind } from "@/lib/uploads";

type ImageUploadFieldProps = {
  label: string;
  slug: string;
  kind: SiteImageKind;
  value: string;
  onChange: (url: string) => void;
  previewClassName?: string;
};

export function ImageUploadField({
  label,
  slug,
  kind,
  value,
  onChange,
  previewClassName = "h-24 w-24 object-cover",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    const formData = new FormData();
    formData.set("file", file);

    startTransition(async () => {
      try {
        const url = await uploadSiteImageAction(slug, kind, formData);
        onChange(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span>{label}</span>
      {value ? (
        <div className="relative overflow-hidden rounded-lg border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className={previewClassName} />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white"
          >
            Remove
          </button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          className="rounded-lg border px-3 py-2 text-sm disabled:opacity-50"
        >
          {isPending ? "Uploading…" : value ? "Replace image" : "Upload image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={onFileSelected}
        />
      </div>
      {error ? <p className="text-red-600">{error}</p> : null}
    </div>
  );
}

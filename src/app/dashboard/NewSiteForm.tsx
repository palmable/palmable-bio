"use client";

import { useActionState } from "react";
import { createSiteAction, type CreateSiteResult } from "@/app/actions";

export function NewSiteForm() {
  const [state, action, pending] = useActionState<CreateSiteResult, FormData>(
    createSiteAction,
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border p-4">
      <h2 className="font-semibold">Create a new page</h2>
      <label className="flex flex-col gap-1 text-sm">
        Your name
        <input
          name="title"
          required
          placeholder="Siri Café"
          className="rounded-lg border px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Address (optional)
        <div className="flex items-center gap-1">
          <span className="text-sm opacity-50">palmable.bio/</span>
          <input
            name="slug"
            placeholder="siri-cafe"
            className="flex-1 rounded-lg border px-3 py-2"
          />
        </div>
      </label>
      {state?.error ? (
        <p className="text-sm text-red-600">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create page"}
      </button>
    </form>
  );
}

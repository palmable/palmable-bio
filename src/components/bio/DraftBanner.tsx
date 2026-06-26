export function DraftBanner() {
  return (
    <div
      role="status"
      className="bg-amber-500 px-4 py-2.5 text-center text-sm font-medium text-white"
    >
      Draft preview — only you can see this. Check &quot;Published&quot; in the editor to
      go live.
    </div>
  );
}

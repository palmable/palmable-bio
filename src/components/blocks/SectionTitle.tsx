// Small shared heading used across blocks for consistent section labels.
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-wider opacity-50">
      {children}
    </h2>
  );
}

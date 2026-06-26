/** Instagram-style verified seal: red scalloped badge with centered white checkmark. */
export function VerifiedBadge({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-label="Verified"
      className="inline-block shrink-0 align-middle"
    >
      <path
        fill="#FF3040"
        d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h6.234L14.638 40l5.36-3.094L25.358 40l3.106-5.6h6.234v-6.011L40 25.359 36.905 20 40 14.641l-5.302-3.137V5.432h-6.319L25.358 0l-5.36 3.094Z"
      />
      <path
        d="M11 20.5l5 5 13-13"
        fill="none"
        stroke="white"
        strokeWidth="3.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

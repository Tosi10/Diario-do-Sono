type BrandMarkProps = {
  className?: string;
  variant?: "mark" | "seal";
};

/** Símbolo provisório no espírito do ginkgo + ponto. Trocar pelo SVG oficial. */
export function BrandMark({ className = "h-16 w-11", variant = "mark" }: BrandMarkProps) {
  const inner = (
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 18c-9 8-16 14-18 26-1.6 9 3 16 11 19 2.2.8 4.6 1.2 7 1.2" strokeWidth="1.6" />
      <path d="M40 18c9 8 16 14 18 26 1.6 9-3 16-11 19-2.2.8-4.6 1.2-7 1.2" strokeWidth="1.6" />
      <path d="M32 48c-7 2-13 8-14 16-.8 6 2.4 11 8 13 2.4.8 5 1.2 7.6 1.2" strokeWidth="1.45" />
      <path d="M48 48c7 2 13 8 14 16 .8 6-2.4 11-8 13-2.4.8-5 1.2-7.6 1.2" strokeWidth="1.45" />
      <path d="M40 18v64" strokeWidth="1.5" />
      <circle cx="40" cy="90" r="2.4" fill="currentColor" stroke="none" />
    </g>
  );

  if (variant === "seal") {
    return (
      <svg viewBox="0 0 80 80" className={className} aria-hidden>
        <circle cx="40" cy="40" r="38" fill="none" stroke="currentColor" strokeWidth="1.15" />
        <g transform="translate(8 2) scale(0.8)">{inner}</g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 98" className={className} aria-hidden>
      {inner}
    </svg>
  );
}

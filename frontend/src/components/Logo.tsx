/** The "R²" wordmark — text from site settings so it can swap to an SVG later. */
export function Logo({
  text = "R",
  sup = "2",
  className = "",
}: {
  text?: string;
  sup?: string;
  className?: string;
}) {
  return (
    <span
      className={`font-mono font-bold tracking-tight text-ink ${className}`}
      style={{ fontSize: 22, letterSpacing: "-0.03em" }}
      aria-label={`${text}${sup}`}
    >
      {text}
      <span className="text-violet align-super" style={{ fontSize: 13 }}>
        {sup}
      </span>
    </span>
  );
}

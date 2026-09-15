// Approximation of the swirl mark from the design deck (orange coiled
// stroke + navy wordmark + red dot). If an exported logo asset (SVG/PNG)
// becomes available, swap it in here instead of this hand-drawn version.
export default function MaavarimLogo({
  className = "",
  light = false,
  markOnly = false,
}: {
  className?: string;
  light?: boolean;
  markOnly?: boolean;
}) {
  const textColor = light ? "#fff" : "#1D2445";

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 100 100" width="1em" height="1em" className="shrink-0" aria-hidden>
        <path
          d="M 68 30 A 32 32 0 1 0 68 78"
          fill="none"
          stroke="#F7901E"
          strokeWidth="13"
          strokeLinecap="round"
        />
        <path
          d="M 60 48 A 15 15 0 1 1 48 68"
          fill="none"
          stroke="#F7901E"
          strokeWidth="13"
          strokeLinecap="round"
        />
      </svg>
      {!markOnly && (
        <span className="font-heebo font-extrabold" style={{ color: textColor }}>
          מעברים
          <span style={{ color: "#FF3131" }}>.</span>
          <span
            className="inline-block"
            style={{
              fontFamily: "var(--font-handwriting)",
              fontWeight: 400,
              fontSize: "1.5em",
              color: textColor,
              marginRight: "0.05em",
            }}
          >
            נט
          </span>
        </span>
      )}
    </span>
  );
}

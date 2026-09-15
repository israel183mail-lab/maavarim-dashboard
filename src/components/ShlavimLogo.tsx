// "שלבים" partner-org logo — recreated from the supplied image (bold
// maroon wordmark + a star / sparkle / triangle mark, in that right-to-left
// order like the original). No source file was retrievable from the chat
// paste, so this is a close hand-built match; swap in the real asset if
// one becomes available as an uploaded file.
export default function ShlavimLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} dir="rtl">
      <span className="flex flex-col items-center gap-px" style={{ width: "0.5em" }}>
        <svg viewBox="0 0 24 23" style={{ width: "100%", height: "auto", display: "block" }}>
          <path d="M12 0 L15.5 8 L24 9 L18 15 L19.5 23 L12 19 L4.5 23 L6 15 L0 9 L8.5 8 Z" fill="#5C1B1B" />
        </svg>
        <svg viewBox="0 0 24 20" style={{ width: "100%", height: "auto", display: "block" }}>
          <path
            d="M12 0 C13 7 15 9 22 10 C15 11 13 13 12 20 C11 13 9 11 2 10 C9 9 11 7 12 0 Z"
            fill="#D9594B"
          />
        </svg>
        <svg viewBox="0 0 24 16" style={{ width: "100%", height: "auto", display: "block" }}>
          <path d="M12 0 L23 16 L1 16 Z" fill="#F2BD63" />
        </svg>
      </span>
      <span style={{ fontFamily: "'Suez One', serif", color: "#5C1B1B", lineHeight: 1 }}>שלבים</span>
    </span>
  );
}

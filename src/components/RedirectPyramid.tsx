// "מצב הכוון" — the redirect checklist as a pyramid, bottom step first,
// top level is the "back on track" goal. Read-only visualization; the
// checklist below it is what actually marks steps done.
type Step = { title: string; status: string };

const TEAL_SHADES = ["#0f766e", "#0d9488", "#14b8a6", "#5eead4", "#99f6e0"];

export default function RedirectPyramid({ steps, category }: { steps: Step[]; category: string }) {
  const levels = [...steps].reverse(); // bottom (first step) -> top
  levels.push({ title: "חזרה למסלול", status: "GOAL" });
  const n = levels.length;

  return (
    <div>
      <div className="text-sm font-semibold text-slate-600 mb-2">מצב הכוון — {category}</div>
      <div className="flex flex-col items-center">
        {levels.map((lvl, i) => {
          const widthPct = 100 - i * (60 / (n - 1 || 1));
          const isGoal = lvl.status === "GOAL";
          const done = lvl.status === "COMPLETED";
          const color = isGoal ? "#cbd5e1" : TEAL_SHADES[Math.min(i, TEAL_SHADES.length - 1)];
          return (
            <div
              key={i}
              className="flex items-center justify-center text-xs font-semibold text-white py-2.5 border-b border-white/40"
              style={{
                width: `${widthPct}%`,
                backgroundColor: color,
                opacity: done || isGoal ? 1 : 0.55,
              }}
            >
              {done && "✓ "}
              {lvl.title}
            </div>
          );
        })}
      </div>
    </div>
  );
}

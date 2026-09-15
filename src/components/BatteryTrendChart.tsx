// A trend line plotted inside a battery-shaped gauge — echoes the combined
// "success battery" visualization on the student card in the design deck.
// The colored bands are a fixed green→red reference scale; the black line
// traces the student's cumulative success score over their task sequence.
type Point = { label: string; score: number };

const BANDS = ["#21B524", "#6fd12f", "#F5C518", "#F7901E", "#F7901E", "#FF3131", "#FF3131"];

export default function BatteryTrendChart({ points, label }: { points: Point[]; label: string }) {
  const W = 260;
  const H = 300;
  const bodyTop = 30;
  const bodyBottom = H - 10;
  const bodyHeight = bodyBottom - bodyTop;
  const bandHeight = bodyHeight / BANDS.length;

  const scoreToY = (score: number) => bodyBottom - (Math.max(0, Math.min(100, score)) / 100) * bodyHeight;
  const n = Math.max(points.length - 1, 1);
  const xFor = (i: number) => 40 + (i / n) * (W - 80);

  const pathPoints = points.map((p, i) => `${xFor(i)},${scoreToY(p.score)}`).join(" ");

  return (
    <div>
      <div className="text-xs font-semibold text-slate-500 mb-1 text-center">{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={220}>
        {/* nub */}
        <rect x={W / 2 - 18} y={bodyTop - 14} width={36} height={14} rx={4} fill="#334155" />
        {/* bands */}
        {BANDS.map((color, i) => (
          <rect key={i} x={30} y={bodyTop + i * bandHeight} width={W - 60} height={bandHeight} fill={color} opacity={0.85} />
        ))}
        {/* outline */}
        <rect x={30} y={bodyTop} width={W - 60} height={bodyHeight} rx={14} fill="none" stroke="#1e293b" strokeWidth={4} />
        {/* trend line */}
        {points.length > 1 && (
          <polyline points={pathPoints} fill="none" stroke="#0f172a" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
        )}
        {points.map((p, i) => (
          <circle key={i} cx={xFor(i)} cy={scoreToY(p.score)} r={3.5} fill="#0f172a" />
        ))}
      </svg>
    </div>
  );
}

// Orange pill KPI badge — matches the "סך פעילים: 145" style on the home
// page in the design deck: a navy circle with the number, label to its side.
export default function KpiPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between bg-accent-500 rounded-full pl-2 pr-5 py-2 gap-3">
      <span className="text-sm font-bold text-white">{label}</span>
      <span className="flex items-center justify-center h-10 w-10 rounded-full bg-brand-700 text-white font-heebo font-extrabold text-sm shrink-0">
        {value}
      </span>
    </div>
  );
}

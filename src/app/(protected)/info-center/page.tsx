import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INSTITUTION_TYPE_LABELS } from "@/lib/format";
import InfoCenterMenu from "@/components/InfoCenterMenu";

export default async function InfoCenterPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const institutions = await prisma.institution.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl text-slate-800">מרכז המידע</h1>

      <InfoCenterMenu
        sections={[
          {
            key: "institutions",
            label: "ישיבות קטנות",
            hint: 'מידע על ישי"ק: סגנון, טלפונים של אנשי קשר, מידע נוסף',
            content: (
              <div className="grid sm:grid-cols-2 gap-3">
                {institutions.map((inst) => (
                  <div key={inst.id} className="card p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-slate-800">{inst.name}</div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-50 text-brand-700">
                        {INSTITUTION_TYPE_LABELS[inst.type]}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 space-y-0.5">
                      {inst.city && <div>עיר: {inst.city}</div>}
                      {inst.principalName && <div>ראש הישיבה/מנהל: {inst.principalName}</div>}
                      {inst.contactPhone && <div dir="ltr">טלפון: {inst.contactPhone}</div>}
                      {inst.info && <p className="mt-1 text-slate-400">{inst.info}</p>}
                    </div>
                    {inst.websiteUrl && (
                      <a href={inst.websiteUrl} target="_blank" className="text-xs text-brand-600 hover:underline mt-2 inline-block">
                        אתר המוסד ←
                      </a>
                    )}
                  </div>
                ))}
                {institutions.length === 0 && <div className="text-sm text-slate-400">אין עדיין מוסדות רשומים.</div>}
              </div>
            ),
          },
          {
            key: "workshops",
            label: "קישור לסדנאות",
            hint: "לוחות זמנים וחומרי הסדנאות לרכזים",
            content: (
              <div className="card p-4 text-sm text-slate-500">
                חומרי הסדנאות ולוחות הזמנים לשנת {'תשפ"ו'} יעודכנו כאן על ידי הנהלת התוכנית.
              </div>
            ),
          },
          {
            key: "materials",
            label: "חומר מקצועי",
            hint: "מאמרים והדרכות מקצועיות",
            content: (
              <div className="card p-4 text-sm text-slate-500">
                מאמרים והדרכות מקצועיות לרכזים יתעדכנו כאן בהמשך.
              </div>
            ),
          },
          {
            key: "tips",
            label: "טיפים",
            hint: "המלצות מעשיות מרכזים ותיקים",
            content: (
              <div className="card p-4 text-sm text-slate-500">
                טיפים והמלצות מעשיות מצוות מעברים יתעדכנו כאן בהמשך.
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

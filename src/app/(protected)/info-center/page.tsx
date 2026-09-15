import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { INSTITUTION_TYPE_LABELS } from "@/lib/format";

export default async function InfoCenterPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const institutions = await prisma.institution.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl text-slate-800">מרכז המידע</h1>

      <section>
        <h2 className="text-lg text-slate-800 mb-3">מוסדות — ישיבות קטנות ותלמודי תורה</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="card p-4">
          <h2 className="font-semibold text-slate-800 mb-2">סדנאות</h2>
          <p className="text-sm text-slate-500">
            חומרי הסדנאות ולוחות הזמנים לשנת {'תשפ"ו'} יעודכנו כאן על ידי הנהלת התוכנית.
          </p>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold text-slate-800 mb-2">חומר מקצועי וטיפים</h2>
          <p className="text-sm text-slate-500">
            מאמרים, הדרכות והמלצות מקצועיות לרכזים יתעדכנו כאן בהמשך.
          </p>
        </div>
      </section>
    </div>
  );
}

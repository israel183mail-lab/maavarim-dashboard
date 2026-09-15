import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BulkRegisterForm from "@/components/BulkRegisterForm";

export default async function RegisterPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const institutions = await prisma.institution.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl text-slate-800">רישום תלמידים</h1>
        <p className="text-sm text-slate-500 mt-1">
          בתחילת שנת הלימודים יש לרשום כאן את כלל התלמידים בכיתה. התלמידים ישויכו אליך כרכז אחראי.
        </p>
      </div>
      <BulkRegisterForm institutions={institutions.map((i) => ({ id: i.id, name: i.name }))} />
    </div>
  );
}

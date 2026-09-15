import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { isManager } from "@/lib/permissions";
import StudentDataGrid from "@/components/StudentDataGrid";

export default async function StudentsSearchPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const manager = isManager(session);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl text-slate-800">כרטיס תלמיד — חיפוש</h1>
      <StudentDataGrid coordinatorId={manager ? undefined : session.userId} showCoordinatorColumn={manager} />
    </div>
  );
}

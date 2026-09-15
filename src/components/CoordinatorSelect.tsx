"use client";

export default function CoordinatorSelect({
  coordinators,
  defaultValue,
}: {
  coordinators: { id: string; name: string }[];
  defaultValue: string;
}) {
  return (
    <form method="get" className="flex items-center gap-2">
      <select
        name="coordinatorId"
        defaultValue={defaultValue}
        className="input"
        onChange={(e) => e.currentTarget.form?.submit()}
      >
        {coordinators.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
    </form>
  );
}

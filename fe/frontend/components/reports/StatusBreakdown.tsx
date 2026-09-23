import type { TasksSummary } from "@/types/api";

const STATUSES: Array<{ key: keyof TasksSummary["byStatus"]; label: string }> = [
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "done", label: "Done" },
];

type StatusBreakdownProps = {
  byStatus: TasksSummary["byStatus"];
};

export function StatusBreakdown({ byStatus }: StatusBreakdownProps) {
  return (
    <section className="card panel" aria-label="Tasks by status">
      <h2 className="section-title">Tasks by status</h2>
      <ul className="list">
        {STATUSES.map((status) => (
          <li key={status.key} className="status-row">
            <span>{status.label}</span>
            <span className="badge">{byStatus[status.key]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

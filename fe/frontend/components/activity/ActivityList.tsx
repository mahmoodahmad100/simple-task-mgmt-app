import type { ActivityLog } from "@/types/api";
import { ActivityItem } from "@/components/activity/ActivityItem";

type ActivityListProps = {
  logs: ActivityLog[];
  query: string;
};

export function ActivityList({ logs, query }: ActivityListProps) {
  if (logs.length === 0) {
    const message = query.trim() ? "No activity matches this search." : "No activity yet.";

    return (
      <section className="card panel">
        <p className="muted">{message}</p>
      </section>
    );
  }

  return (
    <section aria-label="Activity list">
      <ul className="list">
        {logs.map((log) => (
          <ActivityItem key={log.id} log={log} />
        ))}
      </ul>
    </section>
  );
}

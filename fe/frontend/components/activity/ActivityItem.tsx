import { formatTimestamp } from "@/lib/format";
import type { ActivityLog } from "@/types/api";

type ActivityItemProps = {
  log: ActivityLog;
};

export function ActivityItem({ log }: ActivityItemProps) {
  return (
    <li className="card item">
      <p className="item-title">{log.action || "(no action)"}</p>
      <p className="item-body">{log.info || "(no info)"}</p>
      <small className="muted">{formatTimestamp(log.when)}</small>
    </li>
  );
}

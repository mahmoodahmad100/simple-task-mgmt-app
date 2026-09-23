import { formatTimestamp } from "@/lib/format";
import type { Task } from "@/types/api";

type TaskItemProps = {
  task: Task;
  busy: boolean;
  onToggle: (task: Task) => void;
};

export function TaskItem({ task, busy, onToggle }: TaskItemProps) {
  return (
    <li className="card item">
      <div className="item-row">
        <p className="item-title">{task.title}</p>
        <span className={task.completed ? "badge done" : "badge todo"}>
          {task.completed ? "Completed" : "Pending"}
        </span>
      </div>

      <small className="muted">Updated: {formatTimestamp(task.updatedAt)}</small>

      <div>
        <button
          type="button"
          className="button"
          onClick={() => onToggle(task)}
          disabled={busy}
          aria-label={`Mark ${task.title} as ${task.completed ? "pending" : "completed"}`}
        >
          {busy ? "Saving..." : task.completed ? "Mark as Pending" : "Mark as Completed"}
        </button>
      </div>
    </li>
  );
}

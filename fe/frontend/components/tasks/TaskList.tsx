import type { Task } from "@/types/api";
import { TaskItem } from "@/components/tasks/TaskItem";

type TaskListProps = {
  tasks: Task[];
  updatingTaskId: string;
  onToggle: (task: Task) => void;
};

export function TaskList({ tasks, updatingTaskId, onToggle }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <section className="card panel">
        <p className="muted">No tasks match this filter.</p>
      </section>
    );
  }

  return (
    <section aria-label="Task list">
      <ul className="list">
        {tasks.map((task) => (
          <TaskItem key={task.id} task={task} busy={updatingTaskId === task.id} onToggle={onToggle} />
        ))}
      </ul>
    </section>
  );
}

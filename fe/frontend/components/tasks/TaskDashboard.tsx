"use client";

import { StatusFilter } from "@/components/tasks/StatusFilter";
import { TaskList } from "@/components/tasks/TaskList";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types/api";

export function TaskDashboard() {
  const {
    tasks,
    filteredTasks,
    filter,
    loading,
    error,
    updatingTaskId,
    setFilter,
    fetchTasks,
    updateTaskStatus,
  } = useTasks();

  const handleToggle = (task: Task) => {
    updateTaskStatus(task.id, !task.completed);
  };

  const initialLoading = loading && tasks.length === 0;
  const initialError = !loading && Boolean(error) && tasks.length === 0;

  return (
    <section className="stack">
      <header className="card panel">
        <h1 className="page-title">Task Dashboard</h1>
      </header>

      <StatusFilter value={filter} onChange={setFilter} />

      {initialLoading ? (
        <section className="card panel">
          <p className="muted">Loading tasks...</p>
        </section>
      ) : null}

      {initialError ? (
        <section className="card panel error-panel">
          <p className="error-text">{error}</p>
          <button type="button" className="button" onClick={fetchTasks}>
            Retry
          </button>
        </section>
      ) : null}

      {!initialLoading && !initialError ? (
        <>
          {error ? (
            <section className="card panel error-panel">
              <p className="error-text">{error}</p>
              <button type="button" className="button" onClick={fetchTasks}>
                Retry
              </button>
            </section>
          ) : null}
          <TaskList tasks={filteredTasks} updatingTaskId={updatingTaskId} onToggle={handleToggle} />
        </>
      ) : null}
    </section>
  );
}

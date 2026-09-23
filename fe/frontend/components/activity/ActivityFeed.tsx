"use client";

import { ActivityList } from "@/components/activity/ActivityList";
import { ActivitySearch } from "@/components/activity/ActivitySearch";
import { useActivity } from "@/hooks/useActivity";

export function ActivityFeed() {
  const { logs, visibleLogs, query, setQuery, loading, error, fetchActivity } = useActivity();

  return (
    <section className="stack">
      <header className="card panel page-header">
        <h1 className="page-title">Activity Feed</h1>
        <p className="muted">Search the log by action or detail.</p>
        <ActivitySearch value={query} onChange={setQuery} />
      </header>

      <section className="card panel">
        <small className="muted">
          Total: {logs.length} | Visible: {visibleLogs.length}
        </small>
      </section>

      {loading ? (
        <section className="card panel">
          <p className="muted">Loading activity...</p>
        </section>
      ) : null}

      {error ? (
        <section className="card panel error-panel">
          <p className="error-text">{error}</p>
          <button type="button" className="button" onClick={fetchActivity}>
            Retry
          </button>
        </section>
      ) : null}

      {!loading && !error ? <ActivityList logs={visibleLogs} query={query} /> : null}
    </section>
  );
}

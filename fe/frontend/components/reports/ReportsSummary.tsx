"use client";

import { StatCard } from "@/components/reports/StatCard";
import { StatusBreakdown } from "@/components/reports/StatusBreakdown";
import { useReports } from "@/hooks/useReports";

export function ReportsSummary() {
  const { summary, loading, error, fetchSummary } = useReports();

  return (
    <section className="stack">
      <header className="card panel">
        <h1 className="page-title">Reports</h1>
        <p className="muted">Task totals, status counts, and recent activity.</p>
      </header>

      {loading ? (
        <section className="card panel">
          <p className="muted">Loading report...</p>
        </section>
      ) : null}

      {error ? (
        <section className="card panel error-panel">
          <p className="error-text">{error}</p>
          <button type="button" className="button" onClick={fetchSummary}>
            Retry
          </button>
        </section>
      ) : null}

      {!loading && !error && summary ? (
        <>
          <div className="stats">
            <StatCard label="Total tasks" value={summary.total} />
            <StatCard label="Recent activity" value={summary.recentActivityCount} />
          </div>
          <StatusBreakdown byStatus={summary.byStatus} />
        </>
      ) : null}
    </section>
  );
}

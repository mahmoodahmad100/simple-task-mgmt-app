"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ActivityLog, ErrorResponse } from "@/types/api";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

async function readErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed with status ${response.status}`;

  try {
    const body = (await response.json()) as ErrorResponse;
    return body.error?.message || fallback;
  } catch {
    return fallback;
  }
}

export function useActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/activity");

      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }

      const data = (await response.json()) as unknown;
      setLogs(Array.isArray(data) ? (data as ActivityLog[]) : []);
    } catch (err) {
      setLogs([]);
      setError(getErrorMessage(err, "Could not load activity right now."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  const visibleLogs = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!text) {
      return logs;
    }

    return logs.filter((item) => {
      const action = (item.action || "").toLowerCase();
      const info = (item.info || "").toLowerCase();
      return action.includes(text) || info.includes(text);
    });
  }, [logs, query]);

  return {
    logs,
    visibleLogs,
    query,
    setQuery,
    loading,
    error,
    fetchActivity,
  };
}

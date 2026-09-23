"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getErrorMessage, requestJson } from "@/lib/http";
import type { ActivityLog } from "@/types/api";

export function useActivity() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await requestJson<unknown>("/api/activity");

      if (!Array.isArray(data)) {
        throw new Error("Activity response was not a list.");
      }

      setLogs(data as ActivityLog[]);
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

import { BACKEND_BASE_URL } from "@/lib/constants";
import { readErrorMessage } from "@/lib/http";
import type { ActivityLog, Task, TaskResponse, TasksResponse } from "@/types/api";

function buildBackendUrl(path: string): string {
  return `${BACKEND_BASE_URL}${path}`;
}

async function fetchBackend(path: string, init?: RequestInit): Promise<Response> {
  const response = await fetch(buildBackendUrl(path), {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response));
  }

  return response;
}

export async function getTasksFromBackend(): Promise<Task[]> {
  const response = await fetchBackend("/tasks");
  const body = (await response.json()) as TasksResponse;
  return body.data;
}

export async function updateTaskInBackend(taskId: string, completed: boolean): Promise<Task> {
  const response = await fetchBackend(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });

  const body = (await response.json()) as TaskResponse;
  return body.data;
}

export async function getActivityFromBackend(): Promise<ActivityLog[]> {
  const response = await fetchBackend("/activity");
  const body = (await response.json()) as unknown;

  if (!Array.isArray(body)) {
    throw new Error("Activity response was not a list.");
  }

  return body as ActivityLog[];
}

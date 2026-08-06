import { useAuthStore } from "@/store/auth.store";

const BASE_URL = "https://kick-analyst-admin.jay886631.workers.dev";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
}

export interface ApiError {
  message: string;
  status: number;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  const token = useAuthStore.getState().token;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      // response had no JSON body — fall back to statusText
    }
    const error: ApiError = { message, status: res.status };
    throw error;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get:    <T>(path: string, h?: Record<string, string>) => request<T>(path, { method: "GET", headers: h }),
  post:   <T>(path: string, body: unknown, h?: Record<string, string>) => request<T>(path, { method: "POST", body, headers: h }),
  put:    <T>(path: string, body: unknown, h?: Record<string, string>) => request<T>(path, { method: "PUT", body, headers: h }),
  patch:  <T>(path: string, body: unknown, h?: Record<string, string>) => request<T>(path, { method: "PATCH", body, headers: h }),
  // DELETE may carry a body (e.g. an audit reason). Both args are optional so
  // existing `delete(path)` calls keep working.
  delete: <T>(path: string, body?: unknown, h?: Record<string, string>) =>
    request<T>(path, { method: "DELETE", body, headers: h }),
};

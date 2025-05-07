import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to parse error as JSON first
    let errorMessage = "";
    const contentType = res.headers.get("content-type");
    
    try {
      if (contentType && contentType.includes("application/json")) {
        const errorJson = await res.json();
        errorMessage = errorJson.error || errorJson.message || JSON.stringify(errorJson);
      } else {
        errorMessage = await res.text();
      }
    } catch (e) {
      // If parsing fails, fallback to status text
      errorMessage = res.statusText;
    }
    
    console.error(`API Error (${res.status}):`, errorMessage);
    throw new Error(errorMessage);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  body?: any,
  options: RequestInit = {}
): Promise<Response> {
  // Don't set Content-Type for FormData (browser will set it with proper boundary)
  const isFormData = body instanceof FormData;
  
  const res = await fetch(url, {
    method,
    headers: body && !isFormData ? { "Content-Type": "application/json" } : {},
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    ...options,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

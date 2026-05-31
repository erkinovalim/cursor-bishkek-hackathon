/**
 * API configuration.
 * Set NEXT_PUBLIC_API_URL to your FastAPI server (e.g. http://localhost:8000).
 * When unset, the mock client is used.
 */
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "",
  useMock: !process.env.NEXT_PUBLIC_API_URL,
} as const;

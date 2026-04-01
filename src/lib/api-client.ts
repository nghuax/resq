"use client";

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  error?: string;
};

export async function apiFetch<T>(
  input: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const result = (await response.json()) as ApiEnvelope<T>;

  if (!response.ok || !result.success) {
    throw new Error(result.error ?? "Có lỗi xảy ra.");
  }

  return result.data;
}

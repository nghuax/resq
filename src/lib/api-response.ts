import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status = 400, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init);
}

export function fail(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    },
    { status },
  );
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return fail("Dữ liệu không hợp lệ.", 422, error.flatten());
  }

  if (error instanceof ApiError) {
    return fail(error.message, error.status, error.details);
  }

  console.error(error);
  return fail("Có lỗi xảy ra, vui lòng thử lại.", 500);
}

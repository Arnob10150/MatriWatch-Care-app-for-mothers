import type { Response } from "express";

export function sendServerError(res: Response, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({
    error: "Internal server error",
    detail: message,
  });
}

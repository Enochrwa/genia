import { randomUUID } from "node:crypto";
import type { NextFunction, Response } from "express";
import type { AppRequest } from "./request";

const SAFE = /^[A-Za-z0-9._-]{8,64}$/;

/** Echoes a safe client-provided X-Request-Id or generates one; always sets the response header. */
export function requestIdMiddleware(req: AppRequest, res: Response, next: NextFunction): void {
  const incoming = req.header("x-request-id");
  req.requestId = incoming && SAFE.test(incoming) ? incoming : randomUUID();
  res.setHeader("X-Request-Id", req.requestId);
  next();
}

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import type { Response } from "express";
import type { ApiErrorBody, ErrorCode } from "@genia/types";
import { AppError } from "./errors";
import type { AppRequest } from "./request";

const HTTP_TO_CODE: Record<number, ErrorCode> = {
  400: "VALIDATION_ERROR",
  401: "AUTH_UNAUTHENTICATED",
  404: "NOT_FOUND",
};

interface HttpErrorLike {
  status?: number;
  statusCode?: number;
  type?: string;
}

function isHttpError(e: unknown): e is HttpErrorLike {
  if (typeof e !== "object" || e === null) return false;
  const s = (e as HttpErrorLike).status ?? (e as HttpErrorLike).statusCode;
  return typeof s === "number" && s >= 400 && s < 500;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger("Errors");

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const req = http.getRequest<AppRequest>();
    const res = http.getResponse<Response>();
    const requestId = req.requestId ?? "unknown";

    let status = 500;
    let code: ErrorCode = "INTERNAL_ERROR";
    let message = "Something went wrong";
    let details: Record<string, unknown> | undefined;

    if (exception instanceof AppError) {
      status = exception.status;
      code = exception.code;
      message = exception.message;
      details = exception.details;
      if (exception.retryAfterSeconds)
        res.setHeader("Retry-After", String(exception.retryAfterSeconds));
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = HTTP_TO_CODE[status] ?? (status >= 500 ? "INTERNAL_ERROR" : "VALIDATION_ERROR");
      message =
        status === 404
          ? "Resource not found"
          : status === 413
            ? "Request body too large"
            : exception.message;
    } else if (isHttpError(exception)) {
      // Errors raised by the body parser (http-errors): oversized or malformed bodies.
      status = exception.status ?? exception.statusCode ?? 400;
      code = "VALIDATION_ERROR";
      message = status === 413 ? "Request body too large" : "Malformed request";
    } else {
      // Never leak internals. Log with the request id so support can correlate.
      this.logger.error(`[${requestId}] ${(exception as Error)?.stack ?? String(exception)}`);
    }

    const body: ApiErrorBody = {
      error: { code, message, requestId, ...(details ? { details } : {}) },
    };
    res.status(status).json(body);
  }
}

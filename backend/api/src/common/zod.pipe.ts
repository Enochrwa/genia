import type { PipeTransform } from "@nestjs/common";
import type { ZodType, z } from "zod";
import { Errors } from "./errors";

export class ZodValidationPipe<T extends ZodType> implements PipeTransform<unknown, z.infer<T>> {
  constructor(private readonly schema: T) {}
  transform(value: unknown): z.infer<T> {
    const r = this.schema.safeParse(value ?? {});
    if (!r.success) {
      const fields: Record<string, string[]> = {};
      for (const i of r.error.issues) (fields[i.path.join(".") || "_"] ??= []).push(i.message);
      throw Errors.validation({ fields });
    }
    return r.data;
  }
}

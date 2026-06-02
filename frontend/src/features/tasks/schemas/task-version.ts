/**
 * TaskVersion schema - Re-exports from OpenAPI generated types
 */
import { schemas } from "@/lib/api/generated/api";

import type { z } from "zod";

export const taskVersionSchema = schemas.TaskVersion;

export type TaskVersion = z.infer<typeof schemas.TaskVersion>;

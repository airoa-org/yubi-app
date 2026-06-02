/**
 * Task schemas - Re-exports from OpenAPI generated types
 * DO NOT define manual schemas here - use OpenAPI as single source of truth
 */

import { schemas } from "@/lib/api/generated/api";

import type { z } from "zod";

// Re-export OpenAPI schemas
export const taskSchema = schemas.Task;
export const taskCreateSchema = schemas.TaskCreate;
export const taskUpdateSchema = schemas.TaskUpdate;
export const taskTagSchema = schemas.TaskTag;
export const taskTagCreateSchema = schemas.TaskTagCreate;
export const taskCategoryTypeSchema = schemas.TaskCategoryType;

// Re-export types from OpenAPI schemas
export type Task = z.infer<typeof schemas.Task>;
export type TaskCreate = z.infer<typeof schemas.TaskCreate>;
export type TaskUpdate = z.infer<typeof schemas.TaskUpdate>;
export type TaskTag = z.infer<typeof schemas.TaskTag>;
export type TaskTagCreate = z.infer<typeof schemas.TaskTagCreate>;
export type TaskCategoryType = z.infer<typeof schemas.TaskCategoryType>;

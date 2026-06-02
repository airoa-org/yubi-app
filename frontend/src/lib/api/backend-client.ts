import "server-only";
import { z } from "zod";

import { getUserId } from "@/lib/auth/session";
import { clearActiveUser } from "@/lib/auth/switch-user";

import { schemas } from "./generated/api";

const BACKEND_API_URL = process.env.BACKEND_API_URL || "http://backend:8000";

// =============================================================================
// Types (inferred from generated schemas)
// =============================================================================

export type Task = z.infer<typeof schemas.Task>;
export type TaskListResponse = z.infer<typeof schemas.TaskListResponse>;
export type TaskCreate = z.infer<typeof schemas.TaskCreate>;
export type TaskUpdate = z.infer<typeof schemas.TaskUpdate>;
export type TaskTag = z.infer<typeof schemas.TaskTag>;
export type TaskTagCreate = z.infer<typeof schemas.TaskTagCreate>;
export type TaskCategoryType = z.infer<typeof schemas.TaskCategoryType>;
export type Robot = z.infer<typeof schemas.Robot>;
export type RobotListResponse = z.infer<typeof schemas.RobotListResponse>;
export type RobotCreate = z.infer<typeof schemas.RobotCreate>;
export type RobotUpdate = z.infer<typeof schemas.RobotUpdate>;
export type Episode = z.infer<typeof schemas.Episode>;
export type EpisodeListResponse = z.infer<typeof schemas.EpisodeListResponse>;
export type EpisodeCreate = z.infer<typeof schemas.EpisodeCreate>;
export type EpisodeUpdate = z.infer<typeof schemas.EpisodeUpdate>;
export type EpisodeBulkCreateRequest = EpisodeCreate & { count: number };
export type EpisodeGrade = z.infer<typeof schemas.EpisodeGrade>;
export type EpisodeGradeUpdate = z.infer<typeof schemas.EpisodeGradeUpdate>;
export type EpisodeGradeListResponse = z.infer<
  typeof schemas.EpisodeGradeListResponse
>;
export type Site = z.infer<typeof schemas.Site>;
export type SiteListResponse = z.infer<typeof schemas.SiteListResponse>;
export type Location = z.infer<typeof schemas.Location>;
export type LocationListResponse = z.infer<typeof schemas.LocationListResponse>;
export type LocationCreate = z.infer<typeof schemas.LocationCreate>;
export type LocationUpdate = z.infer<typeof schemas.LocationUpdate>;
export type UserResponse = z.infer<typeof schemas.UserResponse>;
export type UserListResponse = z.infer<typeof schemas.UserListResponse>;
export type UserRoleUpdateRequest = z.infer<
  typeof schemas.UserRoleUpdateRequest
>;
export type UserUpdateRequest = z.infer<typeof schemas.UserUpdateRequest>;
export type MeUpdateRequest = z.infer<typeof schemas.MeUpdateRequest>;

export type OrganizationResponse = z.infer<typeof schemas.OrganizationResponse>;
export type OrganizationListResponse = z.infer<
  typeof schemas.OrganizationListResponse
>;
export type UserCreateRequest = z.infer<typeof schemas.UserCreateRequest>;
export type SubTask = z.infer<typeof schemas.SubTask>;
export type SubTaskCreate = z.infer<typeof schemas.SubTaskCreate>;
export type SubTaskUpdate = z.infer<typeof schemas.SubTaskUpdate>;
export type SubTaskReorder = z.infer<typeof schemas.SubTaskReorder>;
export type EpisodeRecordingsResponse = z.infer<
  typeof schemas.EpisodeRecordingsResponse
>;
export type EpisodeStatsResponse = z.infer<typeof schemas.EpisodeStatsResponse>;
export type FleetSiteSummary = z.infer<typeof schemas.FleetSiteSummary>;
export type FleetSiteStats = z.infer<typeof schemas.FleetSiteStats>;
export type CollectionTrend = z.infer<typeof schemas.CollectionTrend>;
export type ApiKeyResponse = z.infer<typeof schemas.ApiKeyResponse>;
export type ApiKeyListResponse = z.infer<typeof schemas.ApiKeyListResponse>;
export type ApiKeyCreateRequest = z.infer<typeof schemas.ApiKeyCreateRequest>;
export type ApiKeyCreateResponse = z.infer<typeof schemas.ApiKeyCreateResponse>;

// =============================================================================
// Core fetch function
// =============================================================================

/**
 * Custom error class for Backend API errors
 */
export class BackendApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "BackendApiError";
  }
}

/**
 * Make a request to the Backend API and return the raw Response.
 * Use this for non-JSON responses such as CSV downloads.
 */
export async function fetchBackendRaw(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const userId = await getUserId();
  const url = `${BACKEND_API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "X-User-ID": userId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    // If the user in the cookie was deleted, clear the cookie and redirect to force reload with DEFAULT_USER_ID
    if (response.status === 401) {
      await clearActiveUser();
      const { redirect } = await import("next/navigation");
      redirect("/web");
    }
    const error = await response.json().catch(() => ({}));
    throw new BackendApiError(
      response.status,
      error.message || response.statusText
    );
  }

  return response;
}

/**
 * Make a request to the Backend API
 */
async function fetchBackend<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const userId = await getUserId();
  const url = `${BACKEND_API_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-User-ID": userId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    // If the user in the cookie was deleted, clear the cookie and redirect to force reload with DEFAULT_USER_ID
    if (response.status === 401) {
      await clearActiveUser();
      const { redirect } = await import("next/navigation");
      redirect("/web");
    }
    const error = await response.json().catch(() => ({}));
    throw new BackendApiError(
      response.status,
      error.message || response.statusText
    );
  }

  // Handle empty responses (204 No Content, DELETE, etc.)
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text);
}

// =============================================================================
// Tasks API
// =============================================================================

export async function fetchTasks(params?: {
  has_approved_version?: boolean;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
  status?: number[];
  priority?: number[];
  difficulty?: number[];
  robot_type?: string;
  search?: string;
}): Promise<TaskListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.has_approved_version) {
    searchParams.append("has_approved_version", "true");
  }
  if (params?.page !== undefined) {
    searchParams.append("page", String(params.page));
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", String(params.limit));
  }
  if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
  if (params?.sort_order) searchParams.append("sort_order", params.sort_order);
  params?.status?.forEach((s) => searchParams.append("status", String(s)));
  params?.priority?.forEach((p) => searchParams.append("priority", String(p)));
  params?.difficulty?.forEach((d) =>
    searchParams.append("difficulty", String(d))
  );
  if (params?.robot_type) searchParams.append("robot_type", params.robot_type);
  if (params?.search) searchParams.append("search", params.search);
  const query = searchParams.toString();
  return fetchBackend<TaskListResponse>(
    `/api/tasks${query ? `?${query}` : ""}`
  );
}

export async function fetchTask(taskId: string): Promise<Task> {
  return fetchBackend<Task>(`/api/tasks/${taskId}`);
}

export type TaskSummaryResponse = z.infer<typeof schemas.TaskSummaryResponse>;
export type TaskCompletionTrend = z.infer<typeof schemas.TaskCompletionTrend>;

export async function fetchTaskSummary(params?: {
  robot_type?: string[];
  category_type_id?: string;
  tag_id?: string[];
  from?: string;
  to?: string;
}): Promise<TaskSummaryResponse> {
  const searchParams = new URLSearchParams();
  params?.robot_type?.forEach((m) => searchParams.append("robot_type", m));
  if (params?.category_type_id)
    searchParams.append("category_type_id", params.category_type_id);
  params?.tag_id?.forEach((id) => searchParams.append("tag_id", id));
  if (params?.from) searchParams.append("from", params.from);
  if (params?.to) searchParams.append("to", params.to);
  const query = searchParams.toString();
  return fetchBackend<TaskSummaryResponse>(
    `/api/tasks/summary${query ? `?${query}` : ""}`
  );
}

export async function fetchTaskCompletionTrend(params: {
  group_by: string;
  robot_type?: string[];
  category_type_id?: string;
  tag_id?: string[];
  from?: string;
  to?: string;
  interval?: string;
}): Promise<TaskCompletionTrend> {
  const searchParams = new URLSearchParams();
  searchParams.append("group_by", params.group_by);
  params.robot_type?.forEach((m) => searchParams.append("robot_type", m));
  if (params.category_type_id)
    searchParams.append("category_type_id", params.category_type_id);
  params.tag_id?.forEach((id) => searchParams.append("tag_id", id));
  if (params.from) searchParams.append("from", params.from);
  if (params.to) searchParams.append("to", params.to);
  if (params.interval) searchParams.append("interval", params.interval);
  const query = searchParams.toString();
  return fetchBackend<TaskCompletionTrend>(
    `/api/tasks/completion-trend?${query}`
  );
}

export async function fetchTaskAvailableTags(params?: {
  robot_type?: string[];
  category_type_id?: string;
}): Promise<TaskTag[]> {
  const searchParams = new URLSearchParams();
  params?.robot_type?.forEach((m) => searchParams.append("robot_type", m));
  if (params?.category_type_id)
    searchParams.append("category_type_id", params.category_type_id);
  const query = searchParams.toString();
  return fetchBackend<TaskTag[]>(
    `/api/tasks/available-tags${query ? `?${query}` : ""}`
  );
}

export async function createTask(data: TaskCreate): Promise<Task> {
  return fetchBackend<Task>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTask(
  taskId: string,
  data: TaskUpdate
): Promise<Task> {
  return fetchBackend<Task>(`/api/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// =============================================================================
// User Import API
// =============================================================================

export type UserImportValidationResponse = z.infer<
  typeof schemas.UserImportValidationResponse
>;
export type UserImportValidRow = z.infer<typeof schemas.UserImportValidRow>;
export type UserImportRowError = z.infer<typeof schemas.UserImportRowError>;
export type UserImportResponse = z.infer<typeof schemas.UserImportResponse>;

export async function validateUserImport(
  csvContent: string
): Promise<UserImportValidationResponse> {
  return fetchBackend<UserImportValidationResponse>(
    "/api/users/import/validate",
    {
      method: "POST",
      body: JSON.stringify({ csv_content: csvContent }),
    }
  );
}

export async function importUsers(
  csvContent: string
): Promise<UserImportResponse> {
  return fetchBackend<UserImportResponse>("/api/users/import", {
    method: "POST",
    body: JSON.stringify({ csv_content: csvContent }),
  });
}

// =============================================================================
// Task Import API
// =============================================================================

export interface TaskImportValidationResponse {
  valid_rows: TaskImportRow[];
  duplicate_rows: TaskImportRowError[];
  error_rows: TaskImportRowError[];
  summary: {
    valid_count: number;
    duplicate_count: number;
    error_count: number;
  };
}

export interface TaskImportRow {
  row_number: number;
  name: string;
  description?: string;
  manual_url: string;
  priority: string;
  difficulty: string;
  status?: string;
  deadline: string;
  robot_type?: string;
  tags?: string;
}

export interface TaskImportRowError {
  row_number: number;
  errors: string[];
  name?: string;
}

export interface TaskImportResponse {
  imported_count: number;
  skipped_count: number;
  error_count: number;
  errors: TaskImportRowError[];
}

export async function validateTaskImport(
  csvContent: string
): Promise<TaskImportValidationResponse> {
  return fetchBackend<TaskImportValidationResponse>(
    "/api/tasks/import/validate",
    {
      method: "POST",
      body: JSON.stringify({ csv_content: csvContent }),
    }
  );
}

export async function importTasks(
  csvContent: string
): Promise<TaskImportResponse> {
  return fetchBackend<TaskImportResponse>("/api/tasks/import", {
    method: "POST",
    body: JSON.stringify({ csv_content: csvContent }),
  });
}

// =============================================================================
// Task Versions API
// =============================================================================

export type TaskVersion = z.infer<typeof schemas.TaskVersion>;
export type TaskVersionCreate = z.infer<typeof schemas.TaskVersionCreate>;
export type TaskVersionUpdate = z.infer<typeof schemas.TaskVersionUpdate>;

export async function fetchTaskVersions(
  taskId: string
): Promise<TaskVersion[]> {
  return fetchBackend<TaskVersion[]>(`/api/tasks/${taskId}/versions`);
}

export async function createTaskVersion(
  taskId: string,
  data: TaskVersionCreate
): Promise<TaskVersion> {
  return fetchBackend<TaskVersion>(`/api/tasks/${taskId}/versions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTaskVersion(
  taskId: string,
  versionId: string,
  data: TaskVersionUpdate
): Promise<TaskVersion> {
  return fetchBackend<TaskVersion>(
    `/api/tasks/${taskId}/versions/${versionId}`,
    { method: "PATCH", body: JSON.stringify(data) }
  );
}

export async function approveTaskVersion(
  taskId: string,
  versionId: string
): Promise<TaskVersion> {
  return fetchBackend<TaskVersion>(
    `/api/tasks/${taskId}/versions/${versionId}/approve`,
    { method: "POST" }
  );
}

export type TaskVersionParametersUpdate = z.infer<
  typeof schemas.TaskVersionParametersUpdate
>;

export async function updateTaskVersionParameters(
  taskId: string,
  versionId: string,
  data: TaskVersionParametersUpdate
): Promise<TaskVersion> {
  return fetchBackend<TaskVersion>(
    `/api/tasks/${taskId}/versions/${versionId}/parameters`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    }
  );
}

// =============================================================================
// Robots API
// =============================================================================

export interface RobotFilterParams {
  site_id?: string;
  location_id?: string;
  status?: number;
  robot_type?: string;
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

export async function fetchRobots(
  params?: RobotFilterParams
): Promise<RobotListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.site_id) {
    searchParams.append("site_id", params.site_id);
  }
  if (params?.location_id) {
    searchParams.append("location_id", params.location_id);
  }
  if (params?.status !== undefined) {
    searchParams.append("status", String(params.status));
  }
  if (params?.robot_type) {
    searchParams.append("robot_type", params.robot_type);
  }
  if (params?.page !== undefined) {
    searchParams.append("page", String(params.page));
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", String(params.limit));
  }
  if (params?.search) {
    searchParams.append("search", params.search);
  }
  if (params?.sort_by) {
    searchParams.append("sort_by", params.sort_by);
  }
  if (params?.sort_order) {
    searchParams.append("sort_order", params.sort_order);
  }
  const query = searchParams.toString();
  return fetchBackend<RobotListResponse>(
    `/api/robots${query ? `?${query}` : ""}`
  );
}

export async function fetchRobot(robotId: string): Promise<Robot> {
  return fetchBackend<Robot>(`/api/robots/${robotId}`);
}

export async function createRobot(data: RobotCreate): Promise<Robot> {
  return fetchBackend<Robot>("/api/robots", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRobot(
  robotId: string,
  data: RobotUpdate
): Promise<Robot> {
  return fetchBackend<Robot>(`/api/robots/${robotId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteRobot(robotId: string): Promise<void> {
  await fetchBackend<void>(`/api/robots/${robotId}`, {
    method: "DELETE",
  });
}

export async function fetchRobotTypes(params?: {
  site_id?: string;
  location_id?: string;
  status?: number;
}): Promise<string[]> {
  const searchParams = new URLSearchParams();
  if (params?.site_id) searchParams.append("site_id", params.site_id);
  if (params?.location_id)
    searchParams.append("location_id", params.location_id);
  if (params?.status !== undefined)
    searchParams.append("status", String(params.status));
  const query = searchParams.toString();
  return fetchBackend<string[]>(`/api/robot-types${query ? `?${query}` : ""}`);
}

// =============================================================================
// Episodes API
// =============================================================================

export interface EpisodeFilterParams {
  task_id?: string;
  task_version_id?: string;
  robot_id?: string;
  user_id?: string;
  status?: number[];
  started_at_from?: string;
  started_at_to?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}

export async function fetchEpisodes(
  params: EpisodeFilterParams = {}
): Promise<EpisodeListResponse> {
  const searchParams = new URLSearchParams();
  if (params.task_id) searchParams.set("task_id", params.task_id);
  if (params.task_version_id)
    searchParams.set("task_version_id", params.task_version_id);
  if (params.robot_id) searchParams.set("robot_id", params.robot_id);
  if (params.user_id) searchParams.set("user_id", params.user_id);
  params.status?.forEach((s) => searchParams.append("status", String(s)));
  if (params.started_at_from)
    searchParams.set("started_at_from", params.started_at_from);
  if (params.started_at_to)
    searchParams.set("started_at_to", params.started_at_to);
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.limit !== undefined)
    searchParams.set("limit", String(params.limit));
  if (params.sort_by) searchParams.set("sort_by", params.sort_by);
  if (params.sort_order) searchParams.set("sort_order", params.sort_order);
  const query = searchParams.toString();
  return fetchBackend<EpisodeListResponse>(
    `/api/episodes${query ? `?${query}` : ""}`
  );
}

export async function fetchEpisode(episodeId: string): Promise<Episode> {
  return fetchBackend<Episode>(`/api/episodes/${episodeId}`);
}

export async function createEpisode(data: EpisodeCreate): Promise<Episode> {
  return fetchBackend<Episode>("/api/episodes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createEpisodesBulk(
  data: EpisodeBulkCreateRequest
): Promise<Episode[]> {
  return fetchBackend<Episode[]>("/api/episodes/bulk", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateEpisode(
  episodeId: string,
  data: EpisodeUpdate
): Promise<Episode> {
  return fetchBackend<Episode>(`/api/episodes/${episodeId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// fetchMyEpisodeGrade returns null on 404 ("not graded yet"); other errors throw.
export async function fetchMyEpisodeGrade(
  episodeId: string
): Promise<EpisodeGrade | null> {
  try {
    return await fetchBackend<EpisodeGrade>(
      `/api/episodes/${episodeId}/grades/me`
    );
  } catch (error) {
    if (error instanceof BackendApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function updateMyEpisodeGrade(
  episodeId: string,
  data: EpisodeGradeUpdate
): Promise<EpisodeGrade> {
  return fetchBackend<EpisodeGrade>(`/api/episodes/${episodeId}/grades/me`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function listEpisodeGrades(
  episodeId: string,
  params: { page?: number; limit?: number } = {}
): Promise<EpisodeGradeListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.limit !== undefined)
    searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return fetchBackend<EpisodeGradeListResponse>(
    `/api/episodes/${episodeId}/grades${query ? `?${query}` : ""}`
  );
}

// =============================================================================
// Locations API
// =============================================================================

export async function fetchLocations(params?: {
  page?: number;
  limit?: number;
  search?: string;
  site_id?: string;
  sort_by?: string;
  sort_order?: string;
}): Promise<LocationListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) {
    searchParams.append("page", String(params.page));
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", String(params.limit));
  }
  if (params?.search) {
    searchParams.append("search", params.search);
  }
  if (params?.site_id) {
    searchParams.append("site_id", params.site_id);
  }
  if (params?.sort_by) {
    searchParams.append("sort_by", params.sort_by);
  }
  if (params?.sort_order) {
    searchParams.append("sort_order", params.sort_order);
  }
  const query = searchParams.toString();
  return fetchBackend<LocationListResponse>(
    `/api/locations${query ? `?${query}` : ""}`
  );
}

export async function fetchLocation(locationId: string): Promise<Location> {
  return fetchBackend<Location>(`/api/locations/${locationId}`);
}

export async function fetchSites(params?: {
  page?: number;
  limit?: number;
  search?: string;
  organization_id?: string;
}): Promise<SiteListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) {
    searchParams.append("page", String(params.page));
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", String(params.limit));
  }
  if (params?.search) {
    searchParams.append("search", params.search);
  }
  if (params?.organization_id) {
    searchParams.append("organization_id", params.organization_id);
  }
  const query = searchParams.toString();
  return fetchBackend<SiteListResponse>(
    `/api/sites${query ? `?${query}` : ""}`
  );
}

export async function createLocation(data: LocationCreate): Promise<Location> {
  return fetchBackend<Location>("/api/locations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateLocation(
  locationId: string,
  data: LocationUpdate
): Promise<Location> {
  return fetchBackend<Location>(`/api/locations/${locationId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteLocation(locationId: string): Promise<void> {
  await fetchBackend<void>(`/api/locations/${locationId}`, {
    method: "DELETE",
  });
}

// =============================================================================
// Users API
// =============================================================================

export async function fetchUsers(
  params: {
    page?: number;
    limit?: number;
    organization_id?: string;
    location_id?: string;
    site_id?: string;
    search?: string;
    sort_by?: string;
    sort_order?: string;
  } = {}
): Promise<UserListResponse> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.limit !== undefined) query.set("limit", String(params.limit));
  if (params.organization_id)
    query.set("organization_id", params.organization_id);
  if (params.location_id) query.set("location_id", params.location_id);
  if (params.site_id) query.set("site_id", params.site_id);
  if (params.search) query.set("search", params.search);
  if (params.sort_by) query.set("sort_by", params.sort_by);
  if (params.sort_order) query.set("sort_order", params.sort_order);
  const qs = query.toString() ? `?${query.toString()}` : "";
  return fetchBackend<UserListResponse>(`/api/users${qs}`);
}

export async function updateUser(
  userId: string,
  data: UserUpdateRequest
): Promise<UserResponse> {
  return fetchBackend<UserResponse>(`/api/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function fetchUser(userId: string): Promise<UserResponse> {
  return fetchBackend<UserResponse>(`/api/users/${userId}`);
}

export async function fetchMe(): Promise<UserResponse> {
  return fetchBackend<UserResponse>("/api/me");
}

export async function updateMe(data: MeUpdateRequest): Promise<UserResponse> {
  return fetchBackend<UserResponse>("/api/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateUserRole(
  userId: string,
  data: UserRoleUpdateRequest
): Promise<UserResponse> {
  return fetchBackend<UserResponse>(`/api/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateUserLocations(
  userId: string,
  locationIds: string[]
): Promise<UserResponse> {
  return fetchBackend<UserResponse>(`/api/users/${userId}/locations`, {
    method: "PUT",
    body: JSON.stringify({ location_ids: locationIds }),
  });
}

// =============================================================================
// Organizations API
// =============================================================================

export async function fetchOrganization(
  organizationId: string
): Promise<OrganizationResponse> {
  return fetchBackend<OrganizationResponse>(
    `/api/organizations/${organizationId}`
  );
}

export async function createUser(
  data: UserCreateRequest
): Promise<UserResponse> {
  return fetchBackend<UserResponse>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// =============================================================================
// SubTasks API
// =============================================================================

export async function fetchSubTasks(
  taskId?: string,
  taskVersionId?: string
): Promise<SubTask[]> {
  const params = new URLSearchParams();
  if (taskId) params.set("task_id", taskId);
  if (taskVersionId) params.set("task_version_id", taskVersionId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchBackend<SubTask[]>(`/api/sub-tasks${query}`);
}

export async function fetchSubTask(subtaskId: string): Promise<SubTask> {
  return fetchBackend<SubTask>(`/api/sub-tasks/${subtaskId}`);
}

export async function createSubTask(data: SubTaskCreate): Promise<SubTask> {
  return fetchBackend<SubTask>("/api/sub-tasks", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateSubTask(
  subtaskId: string,
  data: SubTaskUpdate
): Promise<SubTask> {
  return fetchBackend<SubTask>(`/api/sub-tasks/${subtaskId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteSubTask(subtaskId: string): Promise<void> {
  await fetchBackend<void>(`/api/sub-tasks/${subtaskId}`, {
    method: "DELETE",
  });
}

export async function reorderSubTasks(
  data: SubTaskReorder
): Promise<SubTask[]> {
  return fetchBackend<SubTask[]>("/api/sub-tasks/reorder", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function completeSubTask(subtaskId: string): Promise<SubTask> {
  return fetchBackend<SubTask>(`/api/sub-tasks/${subtaskId}/complete`, {
    method: "POST",
  });
}

export async function fetchEpisodeRecordings(
  episodeId: string
): Promise<EpisodeRecordingsResponse> {
  return fetchBackend<EpisodeRecordingsResponse>(
    `/api/episodes/${episodeId}/recordings`
  );
}

export async function fetchEpisodeStats(
  episodeId: string
): Promise<EpisodeStatsResponse> {
  return fetchBackend<EpisodeStatsResponse>(`/api/episodes/${episodeId}/stats`);
}

// =============================================================================
// Task Tags API
// =============================================================================

export async function fetchTaskTags(
  categoryTypeId?: string
): Promise<TaskTag[]> {
  const params = new URLSearchParams();
  if (categoryTypeId) params.set("category_type_id", categoryTypeId);
  const query = params.toString() ? `?${params.toString()}` : "";
  return fetchBackend<TaskTag[]>(`/api/task-tags${query}`);
}

export async function createTaskTag(data: TaskTagCreate): Promise<TaskTag> {
  return fetchBackend<TaskTag>("/api/task-tags", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// =============================================================================
// Task Category Types API
// =============================================================================

export async function fetchTaskCategoryTypes(): Promise<TaskCategoryType[]> {
  return fetchBackend<TaskCategoryType[]>("/api/task-category-types");
}

// =============================================================================
// Fleet
// =============================================================================

export async function fetchFleetSummary(): Promise<FleetSiteSummary[]> {
  return fetchBackend<FleetSiteSummary[]>("/api/fleet/summary");
}

export async function fetchFleetStats(
  from: string,
  to: string
): Promise<FleetSiteStats[]> {
  const searchParams = new URLSearchParams();
  searchParams.append("from", from);
  searchParams.append("to", to);
  return fetchBackend<FleetSiteStats[]>(
    `/api/fleet/stats?${searchParams.toString()}`
  );
}

export async function fetchFleetCollectionTrend(
  granularity: string,
  from: string,
  to: string
): Promise<CollectionTrend> {
  const searchParams = new URLSearchParams();
  searchParams.append("granularity", granularity);
  searchParams.append("from", from);
  searchParams.append("to", to);
  return fetchBackend<CollectionTrend>(
    `/api/fleet/collection-trend?${searchParams.toString()}`
  );
}

// --- Robot Operator ---

export async function setRobotOperator(
  robotId: string,
  data: { user_id: string; display_name: string; organization_name: string }
): Promise<void> {
  await fetchBackend<void>(`/api/robots/${robotId}/operator`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function clearRobotOperator(robotId: string): Promise<void> {
  await fetchBackend<void>(`/api/robots/${robotId}/operator`, {
    method: "DELETE",
  });
}

// =============================================================================
// API Keys API
// =============================================================================

export async function fetchApiKeys(params?: {
  page?: number;
  limit?: number;
  robot_id?: string;
  user_id?: string;
  include_revoked?: boolean;
}): Promise<ApiKeyListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page !== undefined) {
    searchParams.append("page", String(params.page));
  }
  if (params?.limit !== undefined) {
    searchParams.append("limit", String(params.limit));
  }
  if (params?.robot_id) {
    searchParams.append("robot_id", params.robot_id);
  }
  if (params?.user_id) {
    searchParams.append("user_id", params.user_id);
  }
  if (params?.include_revoked !== undefined) {
    searchParams.append("include_revoked", String(params.include_revoked));
  }
  const query = searchParams.toString();
  return fetchBackend<ApiKeyListResponse>(
    `/api/api-keys${query ? `?${query}` : ""}`
  );
}

export async function createApiKey(
  data: ApiKeyCreateRequest
): Promise<ApiKeyCreateResponse> {
  return fetchBackend<ApiKeyCreateResponse>("/api/api-keys", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchApiKey(apiKeyId: string): Promise<ApiKeyResponse> {
  return fetchBackend<ApiKeyResponse>(`/api/api-keys/${apiKeyId}`);
}

// TODO: updateApiKey (PATCH /api/api-keys/{id}) — backend is implemented but frontend
// UI is not yet built. Use revoke + recreate as a workaround.

export async function revokeApiKey(apiKeyId: string): Promise<void> {
  await fetchBackend<void>(`/api/api-keys/${apiKeyId}`, {
    method: "DELETE",
  });
}

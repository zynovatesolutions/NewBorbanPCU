/**
 * App runs as a single-organization system (no multi-branch UX).
 * Data writes may still send an optional branchId if present on the user
 * for DB compatibility — but the UI never filters or manages branches.
 */
export const BASE_PATH = "/admin";

export function getUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

/** Always false — branch-scoped listing is disabled. */
export function isBranchUser() {
  return false;
}

/** Optional ID for create payloads only (never used for list filters). */
export function getWriteBranchId() {
  const user = getUser();
  if (!user) return null;
  if (user.branchId && typeof user.branchId === "object") {
    return user.branchId._id || user.branchId.id || null;
  }
  return user.branchId || localStorage.getItem("branchId") || null;
}

export function pathTo(suffix = "") {
  const clean = String(suffix || "").replace(/^\//, "");
  return clean ? `${BASE_PATH}/${clean}` : BASE_PATH;
}

export const WORKSPACE_HOME_MODULE_ID = "workspace_home";
export const DEFAULT_WORKSPACE_MODULE_ID = "cs_selector";

export const VALID_WORKSPACE_MODULE_IDS = Object.freeze([
  WORKSPACE_HOME_MODULE_ID,
  DEFAULT_WORKSPACE_MODULE_ID,
  "novon_website",
  "emergence",
  "egres",
  "scene_builder",
  "admin_dev",
  "board_data",
  "ies_builder",
  "compliance_matters",
  "coordinated_surfaces",
  "lab_proof",
  "knowledge_base",
  "knowledge_spine",
  "canonical_language",
  "controlled_records",
  "rreg",
  "liora_cockpit",
  "engine_flow",
]);

export function normaliseWorkspaceModuleId(rawModule) {
  const requestedModuleId = String(rawModule || "").trim();
  if (!requestedModuleId) {
    return {
      moduleId: DEFAULT_WORKSPACE_MODULE_ID,
      requestedModuleId: DEFAULT_WORKSPACE_MODULE_ID,
      routeFallbackApplied: false,
      fallbackModuleId: null,
    };
  }

  if (VALID_WORKSPACE_MODULE_IDS.includes(requestedModuleId)) {
    return {
      moduleId: requestedModuleId,
      requestedModuleId,
      routeFallbackApplied: false,
      fallbackModuleId: null,
    };
  }

  return {
    moduleId: WORKSPACE_HOME_MODULE_ID,
    requestedModuleId,
    routeFallbackApplied: true,
    fallbackModuleId: WORKSPACE_HOME_MODULE_ID,
  };
}

export function resolveWorkspaceRoute(locationLike = globalThis.window?.location || "http://127.0.0.1/workspace") {
  const href = locationLike?.href || String(locationLike || "/workspace");
  const origin = globalThis.window?.location?.origin || "http://127.0.0.1";
  const url = new URL(href, origin);
  const resolvedModule = normaliseWorkspaceModuleId(url.searchParams.get("module"));

  return {
    path: url.pathname,
    moduleId: resolvedModule.moduleId,
    requestedModuleId: resolvedModule.requestedModuleId,
    routeFallbackApplied: resolvedModule.routeFallbackApplied,
    fallbackModuleId: resolvedModule.fallbackModuleId,
    query: Object.fromEntries(url.searchParams.entries()),
    goldenRoute: `/workspace?module=${encodeURIComponent(resolvedModule.moduleId)}`,
  };
}

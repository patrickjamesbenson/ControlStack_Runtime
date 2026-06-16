export function resolveWorkspaceRoute(locationLike = window.location) {
  const url = new URL(locationLike.href || String(locationLike), window.location.origin);
  const rawModule = (url.searchParams.get("module") || "cs_selector").trim();
  const moduleId = rawModule || "cs_selector";

  return {
    path: url.pathname,
    moduleId,
    query: Object.fromEntries(url.searchParams.entries()),
    goldenRoute: `/workspace?module=${encodeURIComponent(moduleId)}`,
  };
}

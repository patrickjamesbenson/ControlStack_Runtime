import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";

const PORT = Number.parseInt(process.env.CONTROLSTACK_RUNTIME_PORT || "8787", 10);
const HOST = process.env.CONTROLSTACK_RUNTIME_HOST || "127.0.0.1";
const ROOT = resolve(process.cwd());

const MIME_TYPES = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
]);

function send(res, status, body, contentType = "text/plain; charset=utf-8") {
  res.writeHead(status, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  res.end(body);
}

function sendJson(res, status, payload) {
  send(res, status, JSON.stringify(payload, null, 2), "application/json; charset=utf-8");
}

function isInsideRoot(candidate) {
  const relative = normalize(candidate).slice(ROOT.length);
  return candidate === ROOT || (candidate.startsWith(ROOT + sep) && !relative.startsWith(`..${sep}`));
}

function resolveRuntimePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const cleanPath = decoded.replace(/^\/+/, "");
  const absolute = resolve(join(ROOT, cleanPath));
  if (!isInsideRoot(absolute)) {
    return null;
  }
  return absolute;
}

async function serveFile(res, absolutePath) {
  if (!absolutePath || !isInsideRoot(absolutePath)) {
    sendJson(res, 403, { ok: false, error: "path_escape_rejected" });
    return;
  }

  try {
    const info = await stat(absolutePath);
    if (!info.isFile()) {
      sendJson(res, 404, { ok: false, error: "not_found" });
      return;
    }
    await access(absolutePath);
  } catch {
    sendJson(res, 404, { ok: false, error: "not_found" });
    return;
  }

  const contentType = MIME_TYPES.get(extname(absolutePath).toLowerCase()) || "application/octet-stream";
  res.writeHead(200, {
    "content-type": contentType,
    "cache-control": "no-store",
  });
  createReadStream(absolutePath).pipe(res);
}

const server = createServer(async (req, res) => {
  const requestUrl = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);

  if (req.method !== "GET" && req.method !== "HEAD") {
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  if (requestUrl.pathname === "/" || requestUrl.pathname === "/health") {
    sendJson(res, 200, {
      ok: true,
      name: "controlstack-runtime-shell",
      phase: "1B",
      workspace: "/workspace?module=cs_selector",
      root: ROOT,
    });
    return;
  }

  if (requestUrl.pathname === "/workspace") {
    await serveFile(res, resolve(ROOT, "apps/workspace-shell/index.html"));
    return;
  }

  if (requestUrl.pathname.startsWith("/apps/") || requestUrl.pathname.startsWith("/packages/")) {
    await serveFile(res, resolveRuntimePath(requestUrl.pathname));
    return;
  }

  sendJson(res, 404, {
    ok: false,
    error: "not_found",
    safeFallback: true,
  });
});

server.listen(PORT, HOST, () => {
  console.log(`ControlStack Runtime Shell listening on http://${HOST}:${PORT}/workspace?module=cs_selector`);
});

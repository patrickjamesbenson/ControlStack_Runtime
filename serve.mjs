// ControlStack Lab & IES — bounded read-only local static server.
// Usage: node serve.mjs [port]
// The served root is fixed to this worktree's packages/lab-kernel/ies-toolkit directory.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("./packages/lab-kernel/ies-toolkit/", import.meta.url));
const requestedPort = process.argv[2] === undefined ? 8899 : Number(process.argv[2]);
if (!Number.isInteger(requestedPort) || requestedPort < 1 || requestedPort > 65535) {
  throw new Error("Port must be an integer from 1 to 65535.");
}
const PORT = requestedPort;
const HOST = "127.0.0.1";

const TYPES = Object.freeze({
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".ies": "text/plain; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
});

function send(res, status, body, method = "GET", contentType = "text/plain; charset=utf-8") {
  const headers = {
    "content-type": contentType,
    "content-length": Buffer.byteLength(body),
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
  };
  res.writeHead(status, headers);
  res.end(method === "HEAD" ? undefined : body);
}

function containedFileFor(rawUrl) {
  if (typeof rawUrl !== "string" || !rawUrl.startsWith("/") || rawUrl.startsWith("//") || rawUrl.includes("\0")) {
    throw new Error("invalid_request_target");
  }
  const rawPath = rawUrl.split("?", 1)[0];
  if (rawPath.includes("\\") || /%(?:2f|5c|2e)/i.test(rawPath)) throw new Error("encoded_path_segment_rejected");
  const pathname = decodeURIComponent(rawPath);
  if (!pathname.startsWith("/") || pathname.includes("\\") || pathname.includes("\0")) throw new Error("invalid_path");
  const segments = pathname.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "." || segment === "..")) throw new Error("path_traversal_rejected");
  const publicPath = pathname === "/" ? "/index.html" : pathname;
  const candidate = resolve(ROOT, `.${publicPath}`);
  const withinRoot = relative(ROOT, candidate);
  if (withinRoot === "" || withinRoot === ".." || withinRoot.startsWith(`..${sep}`) || isAbsolute(withinRoot)) {
    throw new Error("path_outside_root");
  }
  return candidate;
}

const server = createServer(async (req, res) => {
  const method = req.method || "GET";
  if (method !== "GET" && method !== "HEAD") {
    res.setHeader("allow", "GET, HEAD");
    send(res, 405, "Method not allowed.\n", method);
    return;
  }
  try {
    const file = containedFileFor(req.url || "/");
    const body = await readFile(file);
    const type = TYPES[extname(file).toLowerCase()] || "application/octet-stream";
    res.writeHead(200, {
      "content-type": type,
      "content-length": body.byteLength,
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    });
    res.end(method === "HEAD" ? undefined : body);
  } catch {
    send(res, 404, "Not found.\n", method);
  }
});

server.on("clientError", (_error, socket) => {
  socket.end("HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n");
});

server.listen(PORT, HOST, () => {
  console.log(`ControlStack Lab serving read-only at http://${HOST}:${PORT}/`);
});

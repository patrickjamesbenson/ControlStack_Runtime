import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { buildIesReportCardExportBundle } from "./reportCardExportBundle.js";

const ALLOWED_MEDIA_TYPES = new Set(["text/html", "image/svg+xml"]);

function safeDirectory(value) {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  return resolve(value);
}

function safeEntryPath(outputDirectory, relativePath) {
  if (relativePath.includes("..") || relativePath.includes(":") || relativePath.startsWith("/") || relativePath.startsWith("\\")) {
    return null;
  }
  const target = resolve(outputDirectory, relativePath);
  if (!target.startsWith(outputDirectory)) return null;
  return target;
}

export async function writeIesReportCardExportBundle(report, options = {}) {
  if (options.confirmWrite !== true) {
    return {
      ok: false,
      errors: ["confirmWrite true is required"],
      writtenFiles: [],
      filesystemWritePerformed: false
    };
  }

  const outputDirectory = safeDirectory(options.outputDirectory);
  if (!outputDirectory) {
    return {
      ok: false,
      errors: ["outputDirectory is required"],
      writtenFiles: [],
      filesystemWritePerformed: false
    };
  }

  const bundle = buildIesReportCardExportBundle(report, options);
  if (!bundle.ok) {
    return {
      ok: false,
      errors: bundle.errors,
      writtenFiles: [],
      filesystemWritePerformed: false
    };
  }

  await mkdir(outputDirectory, { recursive: true });
  const writtenFiles = [];

  for (const entry of bundle.entries) {
    if (!ALLOWED_MEDIA_TYPES.has(entry.mediaType)) {
      return {
        ok: false,
        errors: [`unsupported media type: ${entry.mediaType}`],
        writtenFiles,
        filesystemWritePerformed: writtenFiles.length > 0
      };
    }

    const target = safeEntryPath(outputDirectory, entry.relativePath);
    if (!target) {
      return {
        ok: false,
        errors: [`unsafe export path: ${entry.relativePath}`],
        writtenFiles,
        filesystemWritePerformed: writtenFiles.length > 0
      };
    }

    await writeFile(target, entry.content, "utf-8");
    writtenFiles.push(target);
  }

  return {
    ok: true,
    errors: [],
    writtenFiles,
    filesystemWritePerformed: true,
    iesWrite: false,
    runtimeDataWrite: false,
    externalFetch: false,
    postEndpoint: false
  };
}

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { buildReportCardContractFromIesText } from "./reportCardParserBinding.js";
import { writeIesReportCardExportBundle } from "./reportCardExportWriter.js";

function takeArg(args, name) {
  const index = args.indexOf(name);
  if (index < 0) return null;
  return args[index + 1] ?? null;
}

function hasFlag(args, name) {
  return args.includes(name);
}

export function parseReportCardCliArgs(argv) {
  const args = argv.slice(2);
  return {
    iesPath: takeArg(args, "--ies"),
    outputDirectory: takeArg(args, "--out"),
    basename: takeArg(args, "--basename"),
    theme: takeArg(args, "--theme"),
    metadataPath: takeArg(args, "--metadata"),
    confirmWrite: hasFlag(args, "--confirm-write"),
    help: hasFlag(args, "--help") || hasFlag(args, "-h")
  };
}

export function reportCardCliUsage() {
  return [
    "Usage:",
    "node tools/ies-report/renderReportCardCli.js --ies <file.ies> --out <directory> --confirm-write [--basename name] [--theme datasheet-light|screen-dark|asset-transparent] [--metadata file.json]",
    "",
    "Outputs: .report.html, .polar.svg, .linear.svg, .intensities.html, .ugr.html",
    "No IES files are created or modified."
  ].join("\n");
}

async function readMetadata(path) {
  if (!path) return {};
  return JSON.parse(await readFile(path, "utf-8"));
}

export async function runReportCardCli(argv = process.argv, io = {}) {
  const stdout = io.stdout ?? process.stdout;
  const stderr = io.stderr ?? process.stderr;
  const options = parseReportCardCliArgs(argv);

  if (options.help) {
    stdout.write(`${reportCardCliUsage()}\n`);
    return 0;
  }

  if (!options.iesPath || !options.outputDirectory) {
    stderr.write(`${reportCardCliUsage()}\n`);
    return 2;
  }

  const iesText = await readFile(options.iesPath, "utf-8");
  const metadata = await readMetadata(options.metadataPath);
  const contract = buildReportCardContractFromIesText(iesText, metadata);

  if (!contract.ok) {
    stderr.write(`IES report card contract failed:\n${contract.errors.join("\n")}\n`);
    return 3;
  }

  const result = await writeIesReportCardExportBundle(contract.report, {
    outputDirectory: options.outputDirectory,
    confirmWrite: options.confirmWrite,
    basename: options.basename,
    theme: options.theme
  });

  if (!result.ok) {
    stderr.write(`IES report card export failed:\n${result.errors.join("\n")}\n`);
    return 4;
  }

  stdout.write(`IES report card export complete: ${result.writtenFiles.length} files\n`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runReportCardCli().then((code) => {
    process.exitCode = code;
  }).catch((error) => {
    process.stderr.write(`${error?.message ?? error}\n`);
    process.exitCode = 1;
  });
}

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

export const LOGODEV_VARIABLE = "LOGODEV_PUBLISHABLE_KEY";
export const LOGODEV_VALIDATOR = "logodev-publishable-key";

function encodedPowerShell(script) {
  return Buffer.from(script, "utf16le").toString("base64");
}

function powershell(script, input) {
  const result = spawnSync("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-InputFormat",
    "Text",
    "-OutputFormat",
    "Text",
    "-EncodedCommand",
    encodedPowerShell(script),
  ], {
    input,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
  if (result.status !== 0) throw new Error("A protected-secret operation failed.");
  return result.stdout.trim();
}

export function validateSecretValue(value, validator = LOGODEV_VALIDATOR) {
  if (validator !== LOGODEV_VALIDATOR) throw new Error("Unsupported protected-secret validator.");
  if (typeof value !== "string" || !/^[A-Za-z0-9._~-]{8,512}$/.test(value)) {
    throw new Error("The Logo.dev publishable key is missing or malformed.");
  }
  return value;
}

export function parseAllowlistedBatAssignment(content, {
  variable = LOGODEV_VARIABLE,
  validator = LOGODEV_VALIDATOR,
} = {}) {
  if (variable !== LOGODEV_VARIABLE) throw new Error("Unsupported BAT assignment variable.");
  if (typeof content !== "string") throw new Error("The Logo.dev BAT source is unreadable.");

  const values = [];
  const lines = content.replace(/^\uFEFF/, "").split(/\r?\n/);
  const quoted = new RegExp(`^set\\s+"${variable}=([^"\\r\\n]+)"$`, "i");
  const plain = new RegExp(`^set\\s+${variable}=([^\\r\\n]+)$`, "i");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || /^@?echo\s+off$/i.test(line) || /^rem(?:\s|$)/i.test(line) || /^::/.test(line)) continue;

    const match = line.match(quoted) || line.match(plain);
    if (match) {
      const exactName = line.match(/LOGODEV_PUBLISHABLE_KEY/);
      if (!exactName) throw new Error("The Logo.dev assignment must use the exact allowlisted variable name.");
      const value = match[1].trim();
      if (/[&|<>^%!"'\s]/.test(value)) throw new Error("The Logo.dev publishable key is malformed.");
      values.push(validateSecretValue(value, validator));
      continue;
    }

    if (line.toUpperCase().includes(variable)) {
      throw new Error("The Logo.dev BAT assignment is malformed.");
    }
    // All other BAT content is ignored. It is never executed, sourced or imported.
  }

  if (values.length === 0) throw new Error("The Logo.dev publishable key assignment is missing.");
  if (values.length !== 1) throw new Error("Duplicate Logo.dev publishable key assignments are not allowed.");
  return values[0];
}

export function readLogoDevBat(file) {
  return parseAllowlistedBatAssignment(readFileSync(file, "utf8"));
}

export function protectForCurrentUser(value, validator = LOGODEV_VALIDATOR) {
  const checked = validateSecretValue(value, validator);
  const script = [
    "$ErrorActionPreference='Stop'",
    "$v=[Console]::In.ReadToEnd().Trim()",
    "$s=ConvertTo-SecureString -String $v -AsPlainText -Force",
    "[Console]::Write((ConvertFrom-SecureString -SecureString $s))",
  ].join(";");
  const protectedValue = powershell(script, checked);
  if (!protectedValue) throw new Error("The Logo.dev publishable key could not be protected.");
  return protectedValue;
}

export function unprotectForCurrentUser(protectedValue, validator = LOGODEV_VALIDATOR) {
  if (typeof protectedValue !== "string" || !protectedValue.trim()) throw new Error("The protected secret is missing.");
  const script = [
    "$ErrorActionPreference='Stop'",
    "$c=[Console]::In.ReadToEnd().Trim()",
    "$s=ConvertTo-SecureString $c",
    "$b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)",
    "try{$v=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)}",
    "[Console]::OutputEncoding=[Text.Encoding]::UTF8",
    "[Console]::Write($v)",
  ].join(";");
  return validateSecretValue(powershell(script, protectedValue.trim()), validator);
}

export function protectedSecretIsValid(protectedValue, validator = LOGODEV_VALIDATOR) {
  try {
    unprotectForCurrentUser(protectedValue, validator);
    return true;
  } catch {
    return false;
  }
}

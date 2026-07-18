// ControlStack Lab — RFC 8785 JSON Canonicalization Scheme foundation.
// Pure and browser-safe. Produces UTF-8 bytes without Unicode normalisation.

export class CanonicalJsonError extends TypeError {
  constructor(message, code = "invalid_canonical_json_value") {
    super(message);
    this.name = "CanonicalJsonError";
    this.code = code;
  }
}

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function fail(message, code) {
  throw new CanonicalJsonError(message, code);
}

function assertUnicodeScalarString(value, path) {
  for (let index = 0; index < value.length; index += 1) {
    const codeUnit = value.charCodeAt(index);
    if (codeUnit >= 0xd800 && codeUnit <= 0xdbff) {
      const next = value.charCodeAt(index + 1);
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        fail(`${path} contains a lone high Unicode surrogate.`, "lone_unicode_surrogate");
      }
      index += 1;
    } else if (codeUnit >= 0xdc00 && codeUnit <= 0xdfff) {
      fail(`${path} contains a lone low Unicode surrogate.`, "lone_unicode_surrogate");
    }
  }
}

function assertNoSymbolProperties(value, path) {
  if (Object.getOwnPropertySymbols(value).length > 0) {
    fail(`${path} contains a symbol-keyed property.`, "symbol_not_supported");
  }
}

function serializeNumber(value, path) {
  if (!Number.isFinite(value)) {
    fail(`${path} contains a non-finite number.`, "non_finite_number");
  }
  // JSON.stringify follows the ECMAScript number serialisation required by JCS,
  // including serialising negative zero as 0.
  return JSON.stringify(value);
}

function serializeArray(value, active, path) {
  if (Object.getPrototypeOf(value) !== Array.prototype) {
    fail(`${path} must not be an Array subclass or class instance.`, "class_instance_not_supported");
  }
  if (typeof value.toJSON === "function") {
    fail(`${path} must not define a custom toJSON method.`, "custom_to_json_not_supported");
  }
  assertNoSymbolProperties(value, path);

  const enumerableKeys = Object.keys(value);
  for (const key of enumerableKeys) {
    if (!/^(?:0|[1-9]\d*)$/.test(key) || Number(key) >= value.length) {
      fail(`${path} contains a non-index array property ${JSON.stringify(key)}.`, "ambiguous_array_property");
    }
  }
  for (let index = 0; index < value.length; index += 1) {
    if (!hasOwn(value, index)) {
      fail(`${path} is sparse at index ${index}.`, "sparse_array_not_supported");
    }
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (descriptor && (descriptor.get || descriptor.set)) {
      fail(`${path}[${index}] uses an accessor property.`, "accessor_property_not_supported");
    }
  }

  if (active.has(value)) fail(`${path} contains cyclic data.`, "cyclic_data_not_supported");
  active.add(value);
  try {
    const children = [];
    for (let index = 0; index < value.length; index += 1) {
      children.push(serializeValue(value[index], active, `${path}[${index}]`));
    }
    return `[${children.join(",")}]`;
  } finally {
    active.delete(value);
  }
}

function serializeObject(value, active, path) {
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(`${path} must be a plain object, not a class instance.`, "class_instance_not_supported");
  }
  if (typeof value.toJSON === "function") {
    fail(`${path} must not define a custom toJSON method.`, "custom_to_json_not_supported");
  }
  assertNoSymbolProperties(value, path);
  if (active.has(value)) fail(`${path} contains cyclic data.`, "cyclic_data_not_supported");

  const keys = Object.keys(value);
  for (const key of keys) {
    assertUnicodeScalarString(key, `${path} property name`);
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (descriptor && (descriptor.get || descriptor.set)) {
      fail(`${path}.${key} uses an accessor property.`, "accessor_property_not_supported");
    }
  }

  // RFC 8785 compares property names lexicographically by UTF-16 code units.
  keys.sort();
  active.add(value);
  try {
    const members = keys.map((key) => (
      `${JSON.stringify(key)}:${serializeValue(value[key], active, `${path}.${key}`)}`
    ));
    return `{${members.join(",")}}`;
  } finally {
    active.delete(value);
  }
}

function serializeValue(value, active, path) {
  if (value === null) return "null";

  switch (typeof value) {
    case "string":
      assertUnicodeScalarString(value, path);
      return JSON.stringify(value);
    case "number":
      return serializeNumber(value, path);
    case "boolean":
      return value ? "true" : "false";
    case "undefined":
      fail(`${path} contains undefined.`, "undefined_not_supported");
      break;
    case "function":
      fail(`${path} contains a function.`, "function_not_supported");
      break;
    case "symbol":
      fail(`${path} contains a symbol.`, "symbol_not_supported");
      break;
    case "bigint":
      fail(`${path} contains a BigInt.`, "bigint_not_supported");
      break;
    case "object":
      if (value instanceof Date) fail(`${path} contains a Date object.`, "date_not_supported");
      if (value instanceof Map) fail(`${path} contains a Map.`, "map_not_supported");
      if (value instanceof Set) fail(`${path} contains a Set.`, "set_not_supported");
      if (Array.isArray(value)) return serializeArray(value, active, path);
      return serializeObject(value, active, path);
    default:
      fail(`${path} contains an unsupported value.`, "unsupported_value");
  }
  return "";
}

function encodeUtf8(value) {
  const bytes = [];
  for (let index = 0; index < value.length; index += 1) {
    let codePoint = value.charCodeAt(index);
    if (codePoint >= 0xd800 && codePoint <= 0xdbff) {
      const low = value.charCodeAt(index + 1);
      codePoint = 0x10000 + ((codePoint - 0xd800) << 10) + (low - 0xdc00);
      index += 1;
    }

    if (codePoint <= 0x7f) {
      bytes.push(codePoint);
    } else if (codePoint <= 0x7ff) {
      bytes.push(
        0xc0 | (codePoint >> 6),
        0x80 | (codePoint & 0x3f),
      );
    } else if (codePoint <= 0xffff) {
      bytes.push(
        0xe0 | (codePoint >> 12),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    } else {
      bytes.push(
        0xf0 | (codePoint >> 18),
        0x80 | ((codePoint >> 12) & 0x3f),
        0x80 | ((codePoint >> 6) & 0x3f),
        0x80 | (codePoint & 0x3f),
      );
    }
  }
  return new Uint8Array(bytes);
}

export function canonicalizeJson(value) {
  return serializeValue(value, new WeakSet(), "$");
}

export function canonicalizeJsonBytes(value) {
  return encodeUtf8(canonicalizeJson(value));
}

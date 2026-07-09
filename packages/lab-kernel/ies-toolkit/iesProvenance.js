// Lab IES toolkit — provenance. Pure, browser-safe content fingerprint + mutation log. No node:crypto.
// Fingerprint detects any content change (records mutate -> fingerprint changes). Prefixed "safe-".
function cyrb53(str, seed = 0){
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++){ const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}
function canon(o){
  if (Array.isArray(o)) return "[" + o.map(canon).join(",") + "]";
  if (o && typeof o === "object") return "{" + Object.keys(o).sort().map((k) => JSON.stringify(k) + ":" + canon(o[k])).join(",") + "}";
  return JSON.stringify(o);
}
export function fingerprint(obj){ return "safe-" + cyrb53(canon(obj)); }

function contentOf(record){
  return { schemaId: record.schemaId, oneMmNormalised: record.oneMmNormalised, baseLengthM: record.baseLengthM,
    recordType: record.recordType, referenceEngineId: record.referenceEngineId,
    labForm: (record.labForm || []).map((r) => ({ f: r.bareField, v: r.value, s: r.source })), photometry: record.photometry };
}
export function contentFingerprint(record){ return fingerprint(contentOf(record)); }

// Seal the immutable as-received fingerprint. Once origin.fingerprint is set, it never changes.
export function sealOrigin(record, nowUtc = new Date().toISOString()){
  const fp = contentFingerprint(record);
  record.origin.fingerprint = record.origin.fingerprint || fp;
  record.sourceFingerprint = record.sourceFingerprint || fp;
  record.recordFingerprint = fp;
  record.provenance = record.provenance || { mutationLog: [] };
  record.provenance.fingerprintsSealed = true;
  record.provenance.sealedAtUtc = nowUtc;
  return record;
}

// Call AFTER a tool changes record content: logs the mutation, updates recordFingerprint,
// and resets approval to pending_review if the record had already been finalised.
export function appendMutation(record, { toolId, toolVersion = "1.0.0", operation, paramsSummary = {}, actorType = "human_approved_tool_run" }, nowUtc = new Date().toISOString()){
  const before = record.recordFingerprint;
  const after = contentFingerprint(record);
  record.recordFingerprint = after;
  record.provenance = record.provenance || { mutationLog: [] };
  const wasFinal = record.approvalState === "reference" || record.approvalState === "approved";
  if (wasFinal) record.approvalState = "pending_review";
  record.provenance.mutationLog.push({
    ordinal: record.provenance.mutationLog.length + 1, toolId, toolVersion, operation, paramsSummary,
    inputFingerprint: before, outputFingerprint: after, timestampUtc: nowUtc, actorType, approvalReset: wasFinal,
  });
  return record;
}

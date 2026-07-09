// Lab IES toolkit — approval / promotion gate. Reads kind + gatesReference from the record's labForm.
// A record can only be stamped "reference" when every gates_reference row is filled (ies/lab)
// or ratified off "pending" (check), the origin is sealed, and there is no pending review.
import { appendMutation } from "./iesProvenance.js";

export function ratifyCheck(record, field, decision, actorType = "human_approved_tool_run"){
  const bare = String(field).replace(/^\[|\]$/g, "").toUpperCase();
  const row = (record.labForm || []).find((r) => r.bareField === bare && r.kind === "check");
  if (!row) throw new Error("no check row for " + field);
  if (row.options.length && !row.options.map((o) => o.toLowerCase()).includes(String(decision).toLowerCase()))
    throw new Error("decision must be one of: " + row.options.join(", "));
  row.value = decision; row.source = "check-ratified";
  appendMutation(record, { toolId: "lab-ratify", operation: "ratify-check", paramsSummary: { field: bare, decision }, actorType });
  return record;
}

export function referenceReadiness(record){
  const blockers = [];
  for (const r of (record.labForm || [])){
    if (!r.gatesReference) continue;
    if (r.kind === "check"){ if (!r.value || String(r.value).toLowerCase() === "pending") blockers.push({ field: r.bareField, reason: "check not ratified (pending)" }); }
    else if (!String(r.value || "").trim()) blockers.push({ field: r.bareField, reason: "required value missing" });
  }
  if (!record.provenance?.fingerprintsSealed) blockers.push({ field: "origin", reason: "origin fingerprint not sealed" });
  if (record.approvalState === "pending_review") blockers.push({ field: "approval", reason: "pending review after an edit" });
  return { ready: blockers.length === 0, blockers };
}

export function promoteToReference(record, nowUtc = new Date().toISOString()){
  const r = referenceReadiness(record);
  if (!r.ready) return { ok: false, blockers: r.blockers };
  record.approvalState = "reference";
  record.approvedAtUtc = nowUtc;
  return { ok: true };
}

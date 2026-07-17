// iesLabFormKeywords.js
// The MISSING BRIDGE (the "keyword writer"): the edited lab form IS the outgoing-IES
// keyword truth. Converts buildLabForm() rows -> meta.keywords_order that the existing
// writeIes() emits, in IES_ORDER, kind:"ies" only. The 3 check gates
// ([_BCLT_APPLIED],[_FLAGS_CHECKED],[_POWER_APPROVED]) never reach the .ies.
//
// This does NOT duplicate writeIes (which emits the block) or buildLabForm (which builds
// the rows) — it is the one piece that was missing between them. Verified end-to-end
// against the real toolkit + a real DNX-80 IES: an edited LUMCAT flows into the write.
//
// Belongs in packages/lab-kernel/ies-toolkit/ next to iesLabForm.js (CP to relocate).

import { CANONICAL_KEYWORDS, normalizeKeywordName } from "./iesKeywordContract.js";

export function labFormToKeywordsOrder(labForm) {
  const values = new Map();
  for (const row of (labForm || [])) {
    if ((row?.kind || "ies") !== "ies") continue;
    const key = normalizeKeywordName(row?.field ?? row?.key ?? row?.FIELD);
    const value = String(row?.value ?? "").trim();
    if (!CANONICAL_KEYWORDS.includes(key) || !value) continue;
    values.set(key, value);
  }
  return CANONICAL_KEYWORDS
    .filter((key) => values.has(key))
    .map((key) => ({ key: `[${key}]`, value: values.get(key) }));
}

// Apply the edited lab form onto a model so writeIes() emits the edited keyword block.
export function applyLabFormToModel(model, labForm) {
  const m = model.meta || (model.meta = {});
  m.keywords_order = labFormToKeywordsOrder(labForm);
  m.keywords = {}; // keywords_order is the single truth; avoid double-emit
  return model;
}

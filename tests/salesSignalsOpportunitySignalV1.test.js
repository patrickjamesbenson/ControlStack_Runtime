import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../packages/modules/sales-signals/opportunitySignalV1.js";
import * as schemaSurface from "../packages/modules/sales-signals/opportunitySignalSchemaV1.js";
import * as classifierSurface from "../packages/modules/sales-signals/keywordClassificationHarnessV1.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function validSignal() {
  return {
    schemaVersion: contract.OPPORTUNITY_SIGNAL_SCHEMA_VERSION,
    sourceEvidence: {
      sourceEventType: "redacted alert",
      sourceDate: "2026-07-01",
      dateLastChecked: "2026-07-02",
      matchedWording: "Austube Lighting luminaire DALI emergency",
      informationType: "Confirmed",
      evidenceSource: "manually supplied redacted alert",
      sourceLocation: "redacted source reference",
      applicableUserCorrection: null,
    },
    projectOpportunityIdentity: {
      projectName: "Redacted project",
      projectDescription: null,
      suburb: null,
      state: "NSW",
      postcode: null,
      sector: "education",
      estimatedValue: null,
      projectStage: "tendering",
      tenderStatus: "open",
      tenderClosingDate: null,
      expectedConstructionTiming: null,
      awardedStatus: null,
      opportunityDescription: "luminaire specification pursuit",
      qualificationState: "Under review",
    },
    companyContactCandidates: {
      organisations: [{
        organisationName: "Redacted organisation",
        projectRole: "electrical consultant",
        evidenceSource: "redacted schedule",
        confidence: "Medium",
        dateChecked: "2026-07-02",
        affiliateRelationship: null,
        relationshipSignal: null,
      }],
      contacts: [{
        candidateName: null,
        currentRole: "lighting designer",
        organisationName: "Redacted organisation",
        likelyProjectRelevance: "specification influence",
        reasonSelected: "role appears in redacted project evidence",
        publicProfessionalSource: null,
        businessEmailAvailability: null,
        phoneAvailability: null,
        verificationDate: null,
        confidence: "Low",
        existingCrmMatch: null,
        enrichmentSource: null,
      }],
    },
    specificationProductEvidence: {
      matchedWording: "Austube Lighting luminaire DALI emergency",
      specifiedManufacturer: "Austube Lighting",
      specifiedProduct: null,
      productCode: null,
      luminaireType: "luminaire",
      mounting: null,
      finish: null,
      performanceData: null,
      controlsRequirement: "DALI",
      daliReference: "DALI",
      emergencyLightingRequirement: "emergency",
      approvedEquivalentWording: null,
      possibleAlternative: null,
      controlStackRelevance: "review required",
    },
    commercialRouteAssessment: {
      salesRoutes: ["Designer and specification", "Tender influence"],
      relationshipSignals: [],
      commercialReasoning: "Redacted specification evidence supports review.",
      priorityFactors: ["timing", "specification relevance"],
    },
    confidenceUrgency: {
      evidenceConfidence: "Medium",
      actionUrgency: "Near 8–21",
      sourceDate: "2026-07-01",
      dateLastChecked: "2026-07-02",
      nextKnownDeadline: null,
      recommendedActionDate: null,
    },
    recommendedNextAction: {
      action: "Review the redacted specification evidence.",
      reason: "A probable lighting opportunity requires human confirmation.",
      requiresHumanApproval: true,
      consequentialActionBlocked: true,
    },
    passiveCrmLinkCandidates: {
      companies: ["redacted possible company match"],
      contacts: [],
      leads: [],
      deals: [],
      existingOwnershipMustBePreserved: true,
    },
    proposedCrmInformation: {
      companies: ["redacted proposed company information"],
      contacts: [],
      leadOrDeal: null,
      researchInitiator: null,
      crmOwner: null,
      duplicatePreflightRequired: true,
      writeApproved: false,
      writeInstruction: null,
    },
  };
}

function classify(alertText) {
  return contract.classifyRedactedAlertTextV1({
    schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION,
    alertText,
  });
}

test("fixes schema versions, vocabulary and exact top-level field order", () => {
  assert.equal(contract.OPPORTUNITY_SIGNAL_SCHEMA_VERSION, "controlstack.sales-signals.opportunity-signal.v1");
  assert.equal(contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, "controlstack.sales-signals.keyword-classification.v1");
  assert.equal(contract.CORRECTION_CORPUS_SCHEMA_VERSION, "controlstack.sales-signals.correction-corpus.v1");
  assert.deepEqual(contract.OPPORTUNITY_SIGNAL_FIELD_ORDER, [
    "schemaVersion", "sourceEvidence", "projectOpportunityIdentity", "companyContactCandidates",
    "specificationProductEvidence", "commercialRouteAssessment", "confidenceUrgency",
    "recommendedNextAction", "passiveCrmLinkCandidates", "proposedCrmInformation",
  ]);
  assert.deepEqual(contract.CLASSIFICATION_VOCABULARY, [
    "Confirmed lighting match", "Probable lighting match", "Uncertain", "Wrong company",
    "Wrong product category", "False positive",
  ]);
  assert.equal(Object.isFrozen(contract.OPPORTUNITY_SIGNAL_FIELD_ORDER), true);
  assert.equal(Object.isFrozen(contract.CLASSIFICATION_VOCABULARY), true);
});

test("compatibility surfaces expose the single SS-1 implementation authority", () => {
  assert.equal(schemaSurface.OPPORTUNITY_SIGNAL_SCHEMA_VERSION, contract.OPPORTUNITY_SIGNAL_SCHEMA_VERSION);
  assert.equal(schemaSurface.validateOpportunitySignalV1, contract.validateOpportunitySignalV1);
  assert.equal(classifierSurface.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION);
  assert.equal(classifierSurface.classifyRedactedAlertTextV1, contract.classifyRedactedAlertTextV1);
  assert.equal(classifierSurface.CORRECTION_CORPUS_V1, contract.CORRECTION_CORPUS_V1);
});

test("validates the exact required and optional opportunity-signal contract", () => {
  const signal = validSignal();
  assert.deepEqual(contract.validateOpportunitySignalV1(signal), {
    valid: true,
    schemaVersion: contract.OPPORTUNITY_SIGNAL_SCHEMA_VERSION,
    reasonCode: "opportunity_signal_valid",
  });
  assert.equal(Object.isFrozen(contract.validateOpportunitySignalV1(signal)), true);

  const missingRequired = clone(signal);
  delete missingRequired.sourceEvidence.matchedWording;
  assert.equal(contract.validateOpportunitySignalV1(missingRequired).valid, false);

  const optionalNulls = clone(signal);
  optionalNulls.projectOpportunityIdentity.projectStage = null;
  optionalNulls.companyContactCandidates.organisations = [];
  optionalNulls.companyContactCandidates.contacts = [];
  assert.equal(contract.validateOpportunitySignalV1(optionalNulls).valid, true);
});

test("rejects unknown, widened, reordered, provider-shaped and unsafe schema values", () => {
  const fixtures = [];
  const extra = validSignal();
  extra.provider = "HubSpot";
  fixtures.push(extra);

  const nestedExtra = validSignal();
  nestedExtra.sourceEvidence.rawEnvelope = { subject: "unsafe" };
  fixtures.push(nestedExtra);

  const providerId = validSignal();
  providerId.passiveCrmLinkCandidates.companies = ["hubspotId: 12345"];
  fixtures.push(providerId);

  const url = validSignal();
  url.sourceEvidence.sourceLocation = "https://provider.invalid/item";
  fixtures.push(url);

  const path = validSignal();
  path.sourceEvidence.sourceLocation = "C:\\private\\alert.txt";
  fixtures.push(path);

  const credential = validSignal();
  credential.sourceEvidence.matchedWording = "password=secret";
  fixtures.push(credential);

  const mailbox = validSignal();
  mailbox.sourceEvidence.matchedWording = "From: person@example.invalid\nTo: other@example.invalid";
  fixtures.push(mailbox);

  const reordered = validSignal();
  const rebuilt = { sourceEvidence: reordered.sourceEvidence, schemaVersion: reordered.schemaVersion };
  for (const key of contract.OPPORTUNITY_SIGNAL_FIELD_ORDER.slice(2)) rebuilt[key] = reordered[key];
  fixtures.push(rebuilt);

  for (const value of fixtures) assert.equal(contract.validateOpportunitySignalV1(value).valid, false);
});

test("classifies true positives deterministically with stable reasons and evidence", () => {
  const first = classify("Austube Lighting luminaire schedule includes DALI emergency output.");
  const second = classify("Austube Lighting luminaire schedule includes DALI emergency output.");
  assert.deepEqual(first, second);
  assert.equal(first.classification, "Confirmed lighting match");
  assert.deepEqual(first.reasonCodes, ["keyword_present", "intended_company_context", "lighting_evidence_present"]);
  assert.deepEqual(first.matchedEvidence, [
    "intended:austube lighting", "lighting:luminaire", "lighting:lighting", "lighting:output", "lighting:dali", "lighting:emergency",
  ]);
  assert.equal(first.confidence, "High");
  assert.equal(first.priority, null);
  assert.equal(first.safety.crmActionTriggered, false);
  assert.equal(Object.isFrozen(first), true);
});

test("suppresses false positives and recovers case and punctuation variants", () => {
  const wrongCompany = classify("Austube Mills structural steel and hollow sections fabrication schedules.");
  assert.equal(wrongCompany.classification, "Wrong company");
  assert.deepEqual(wrongCompany.reasonCodes, ["keyword_present", "explicit_wrong_company_context", "lighting_evidence_absent"]);

  const wrongCategory = classify("Austube structural steel pipe and galvanised tube schedule.");
  assert.equal(wrongCategory.classification, "Wrong product category");

  const falsePositive = classify("Xero accounting software payroll and bookkeeping licences.");
  assert.equal(falsePositive.classification, "False positive");

  const recovered = classify("AUSTUBE-LIGHTING LED output wattage CCT optics mounting.");
  assert.equal(recovered.classification, "Confirmed lighting match");
});

test("keeps ambiguous and conflicting evidence visible", () => {
  const insufficient = classify("Austube noted in the project schedule.");
  assert.equal(insufficient.classification, "Uncertain");
  assert.equal(insufficient.confidence, "Low");

  const conflicting = classify("Xero output listed beside finance integration and DALI.");
  assert.equal(conflicting.classification, "Uncertain");
  assert.deepEqual(conflicting.reasonCodes, ["keyword_present", "evidence_ambiguous_or_insufficient"]);
});

test("fails closed on malformed, nested, unsafe, provider-like and oversized alert input", () => {
  const invalid = [
    null,
    {},
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: "" },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: { text: "Xero Lighting" } },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: "Xero Lighting https://provider.invalid/item" },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: "Austube C:\\private\\alert.txt" },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: "From: person@example.invalid\nXero Lighting" },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: "password=secret Austube" },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: "redacted alert without supported keyword" },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: `Austube ${"x".repeat(contract.MAX_ALERT_TEXT_CHARS)}` },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: "Austube Xero lighting" },
    { schemaVersion: contract.KEYWORD_CLASSIFICATION_SCHEMA_VERSION, alertText: "Xero Lighting", provider: "HubSpot" },
  ];
  for (const input of invalid) {
    const output = contract.classifyRedactedAlertTextV1(input);
    assert.equal(output.state, "rejected_fail_closed");
    assert.equal(output.classification, null);
    assert.equal(output.safety.crmActionTriggered, false);
  }
});

test("correction corpus covers every required case class without promoting rules", () => {
  const corpus = contract.CORRECTION_CORPUS_V1;
  assert.equal(corpus.schemaVersion, contract.CORRECTION_CORPUS_SCHEMA_VERSION);
  assert.equal(corpus.corpusStatus, "reviewed_examples_not_promoted_rules");
  const types = new Set(corpus.cases.map((entry) => entry.caseType));
  assert.deepEqual(types, new Set([
    "confirmed_true_positive", "false_positive_suppression", "false_negative_recovery",
    "ambiguous_or_insufficient", "malformed_input_rejection",
  ]));
  for (const entry of corpus.cases) {
    assert.match(entry.caseId, /^[a-z0-9-]+$/);
    assert.equal(typeof entry.reason, "string");
    assert.equal(entry.reason.length > 0, true);
    if (entry.expectedClassification !== null) {
      assert.equal(contract.CLASSIFICATION_VOCABULARY.includes(entry.expectedClassification), true);
      assert.equal(classify(entry.alertText).classification, entry.expectedClassification);
    } else {
      assert.equal(classify(entry.alertText).state, "rejected_fail_closed");
    }
  }
  assert.equal(corpus.promotionPolicy.correctionsAutoPromote, false);
  assert.equal(corpus.promotionPolicy.authorisedReviewerRequired, true);
  assert.equal(corpus.promotionPolicy.rollbackRequired, true);
  assert.equal(Object.isFrozen(corpus), true);
});

test("production and contract sources contain no mailbox, provider, network, route, persistence, shell or Selector seam", () => {
  const moduleSource = readFileSync(new URL("../packages/modules/sales-signals/opportunitySignalV1.js", import.meta.url), "utf8");
  const documentSource = readFileSync(new URL("../docs/sales-signals/OPPORTUNITY_SIGNAL_SCHEMA_V1.md", import.meta.url), "utf8");

  assert.doesNotMatch(moduleSource, /\bfetch\s*\(|https?:\/\/|node:fs|writeFile|readFile|localStorage|sessionStorage|indexedDB|express|router\.|app\.(?:get|post|put|patch|delete)\s*\(|workspace-shell|cs-selector/i);
  assert.doesNotMatch(moduleSource, /createDeal|updateDeal|createContact|createCompany|sendMessage|createTask|pipeline/i);
  assert.match(documentSource, /only Selector-facing seam in SS-1/);
  assert.match(documentSource, /does not grant provider authority/);
  assert.match(documentSource, /writeApproved` must be `false`/);
  assert.match(documentSource, /writeInstruction` must be `null`/);
});

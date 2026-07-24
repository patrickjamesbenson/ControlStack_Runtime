# ControlStack Sales Signals — Opportunity Signal Contract v1

**Contract identifier:** `controlstack.sales-signals.opportunity-signal.v1`  
**Requirements authority:** `SALES_SIGNALS_BRIEF_r0.4.md` plus the accepted owner response.  
**SS-1 boundary:** deterministic, read-only and redacted. This document is the only Selector-facing seam in SS-1. Selector is not modified.

## 1. Ownership and safety

ControlStack owns the opportunity-signal interpretation record. Source providers remain evidence sources only. HubSpot remains the formal CRM and system of record for approved companies, contacts, leads or deals, ownership, activities and commercial outcomes.

The contract does not grant provider authority, create a CRM write instruction, register Module 06 in the shell, persist or retrieve records, access a mailbox, invoke EstimateOne or Lusha, or expose live provider identifiers, credentials, mailbox metadata or personal contact details.

Values must be manually supplied and redacted for SS-1. Unknown fields, reordered fields, unexpected nesting, URLs, file paths, provider-shaped identifiers, credentials, secrets and raw mailbox-envelope material are rejected rather than retained.

## 2. Fixed top-level field order

1. `schemaVersion`
2. `sourceEvidence`
3. `projectOpportunityIdentity`
4. `companyContactCandidates`
5. `specificationProductEvidence`
6. `commercialRouteAssessment`
7. `confidenceUrgency`
8. `recommendedNextAction`
9. `passiveCrmLinkCandidates`
10. `proposedCrmInformation`

All ten fields are required. The validator requires this exact order.

## 3. Field contract

### 3.1 `schemaVersion`

| Type | Required | Validation | Owner |
|---|---:|---|---|
| string | yes | exact value `controlstack.sales-signals.opportunity-signal.v1` | ControlStack contract |

### 3.2 `sourceEvidence`

Separates the retained source event from project and opportunity identity, as required by r0.4 §5.1.

| Field | Type | Required | Validation / enum | Owner |
|---|---|---:|---|---|
| `sourceEventType` | string | yes | redacted plain text; no URL/path/provider/mailbox material | source evidence |
| `sourceDate` | string | yes | redacted date text | source evidence |
| `dateLastChecked` | string | yes | redacted date text | ControlStack review |
| `matchedWording` | string | yes | minimum redacted evidence; no unsafe material | source evidence |
| `informationType` | enum | yes | `Confirmed`, `Inferred`, `User-confirmed`, `User-corrected` | r0.4 §17.1 |
| `evidenceSource` | string or null | no | redacted source description only | source evidence |
| `sourceLocation` | string or null | no | redacted non-URL locator only in SS-1 | source evidence |
| `applicableUserCorrection` | string or null | no | concise redacted correction reference | user review |

### 3.3 `projectOpportunityIdentity`

Keeps project identity and commercial opportunity identity distinct, as required by r0.4 §§5.2–5.3.

| Field | Type | Required | Validation / enum | Owner |
|---|---|---:|---|---|
| `projectName` | string | yes | redacted plain text | project evidence |
| `projectDescription` | string or null | no | redacted plain text | project evidence |
| `suburb` | string or null | no | redacted plain text | project evidence |
| `state` | string or null | no | redacted plain text | project evidence |
| `postcode` | string or null | no | redacted plain text | project evidence |
| `sector` | string or null | no | redacted plain text | project evidence |
| `estimatedValue` | string, finite number or null | no | no provider-shaped value | project evidence |
| `projectStage` | enum or null | no | `concept/early design`, `developed design`, `documentation`, `tendering`, `tender extended`, `pending`, `builder awarded`, `construction`, `closed/cancelled` | r0.4 §12.1 |
| `tenderStatus` | string or null | no | redacted plain text | project evidence |
| `tenderClosingDate` | string or null | no | redacted date text | project evidence |
| `expectedConstructionTiming` | string or null | no | redacted plain text | project evidence |
| `awardedStatus` | string or null | no | redacted plain text | project evidence |
| `opportunityDescription` | string | yes | describes the genuinely distinct commercial pursuit | ControlStack opportunity interpretation |
| `qualificationState` | enum | yes | `New`, `Under review`, `Relevant`, `Researching`, `Ready for engagement`, `Accepted for CRM`, `Monitoring`, `Rejected`, `Transferred` | r0.4 §12.2 |

Duplicate source events must not create duplicate opportunities.

### 3.4 `companyContactCandidates`

Separates organisations, project stakeholder relationships and unapproved contact candidates, as required by r0.4 §§5.4–5.6.

`organisations` and `contacts` are required arrays and may be empty. Each is bounded to 25 entries in SS-1.

Organisation candidate fields, in order:

`organisationName`, `projectRole`, `evidenceSource`, `confidence`, `dateChecked`, `affiliateRelationship`, `relationshipSignal`.

`organisationName` is required. `confidence`, when supplied, is `High`, `Medium` or `Low`. A project role belongs to the project relationship and must not be treated as a permanent company role. Affiliate relationship is separate from project role.

Contact candidate fields, in order:

`candidateName`, `currentRole`, `organisationName`, `likelyProjectRelevance`, `reasonSelected`, `publicProfessionalSource`, `businessEmailAvailability`, `phoneAvailability`, `verificationDate`, `confidence`, `existingCrmMatch`, `enrichmentSource`.

All contact fields are optional in SS-1 and must be redacted. No personal contact detail, inferred email pattern or chargeable reveal is accepted. `confidence`, when supplied, is `High`, `Medium` or `Low`.

### 3.5 `specificationProductEvidence`

Required object with exact field order:

`matchedWording`, `specifiedManufacturer`, `specifiedProduct`, `productCode`, `luminaireType`, `mounting`, `finish`, `performanceData`, `controlsRequirement`, `daliReference`, `emergencyLightingRequirement`, `approvedEquivalentWording`, `possibleAlternative`, `controlStackRelevance`.

Every field is a redacted string or null. The object records evidence and possible relevance only; it does not claim product, manufacturer or provider authority.

### 3.6 `commercialRouteAssessment`

| Field | Type | Required | Validation / enum |
|---|---|---:|---|
| `salesRoutes` | array of enum | yes | zero or more of `Designer and specification`, `ControlStack and controls`, `Tender influence`, `Competitor takeover`, `Builder engagement`, `Electrical-contractor conversion`, `Owner or developer`, `Post-award conversion`, `Affiliate-supported route` |
| `relationshipSignals` | array of strings | yes | redacted, stable order |
| `commercialReasoning` | string or null | no | concise evidence-backed reasoning |
| `priorityFactors` | array of strings | yes | visible contributing factors; no opaque score |

Multiple sales routes may apply. A passed tender closing date is `Tender window passed`; commercial viability is assessed separately.

### 3.7 `confidenceUrgency`

Confidence, urgency and priority remain separate.

| Field | Type | Required | Validation / enum |
|---|---|---:|---|
| `evidenceConfidence` | enum | yes | `High`, `Medium`, `Low` |
| `actionUrgency` | enum | yes | `Immediate ≤7 days`, `Near 8–21`, `Open >21`, `Passed`, `Design influence window`, `Post-award window` |
| `sourceDate` | string or null | no | redacted date text |
| `dateLastChecked` | string or null | no | redacted date text |
| `nextKnownDeadline` | string or null | no | redacted date text |
| `recommendedActionDate` | string or null | no | redacted date text |

### 3.8 `recommendedNextAction`

| Field | Type | Required | Validation |
|---|---|---:|---|
| `action` | string | yes | concise recommendation only |
| `reason` | string | yes | evidence-backed reason |
| `requiresHumanApproval` | boolean | yes | must be `true` |
| `consequentialActionBlocked` | boolean | yes | must be `true` |

This object cannot trigger a message, task, CRM action, deal, pipeline update, contact enrichment or outbound contact.

### 3.9 `passiveCrmLinkCandidates`

Required exact fields: `companies`, `contacts`, `leads`, `deals`, `existingOwnershipMustBePreserved`.

The first four fields are arrays of redacted, passive candidate descriptions only. They are not confirmed provider links and may not contain live provider identifiers. `existingOwnershipMustBePreserved` must be `true`.

### 3.10 `proposedCrmInformation`

Required exact fields: `companies`, `contacts`, `leadOrDeal`, `researchInitiator`, `crmOwner`, `duplicatePreflightRequired`, `writeApproved`, `writeInstruction`.

This object records information proposed for later reviewed handover, not an instruction. `duplicatePreflightRequired` must be `true`, `writeApproved` must be `false`, and `writeInstruction` must be `null`. `researchInitiator` and `crmOwner` remain separate concepts.

## 4. Keyword-classification contract

Classifier input is exactly:

```json
{
  "schemaVersion": "controlstack.sales-signals.keyword-classification.v1",
  "alertText": "manually supplied redacted alert text"
}
```

The input is bounded to 4,000 characters as an SS-1 safety limit. It rejects missing minimum text, unexpected nesting, URLs, paths, provider-shaped content, credentials, secrets and raw mailbox-envelope material.

The fixed r0.4 §9 vocabulary is:

1. `Confirmed lighting match`
2. `Probable lighting match`
3. `Uncertain`
4. `Wrong company`
5. `Wrong product category`
6. `False positive`

Output includes stable reason codes and matched evidence terms in rule order. Confidence is emitted only from r0.4 §17.2. Priority is always `null` in SS-1 because the brief requires visible contributing factors rather than defining a keyword-only priority value.

The classifier is deterministic, offline and contains no hidden model, provider or network call. A classification result cannot create or change any CRM record or activity.

## 5. Correction corpus

The versioned correction corpus is `controlstack.sales-signals.correction-corpus.v1`. It contains bounded, redacted examples for confirmed true positives, false-positive suppression, false-negative recovery, ambiguous or insufficient evidence, and malformed-input rejection.

Each case records a stable case identifier, case type, redacted alert text, expected classification and concise reason. Corrections remain reviewed corpus evidence. They never silently become production exclusions.

Rule promotion requires all r0.4 §10.3 controls: sufficient examples, conflict review, historical-corpus testing, protection of valid lighting matches, authorised review, recorded version and effective date, and disable/rollback capability.

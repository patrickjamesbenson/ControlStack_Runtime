# ControlStack Sales Signals — Program Brief, Revision 0.4
Peer-Reviewed Consolidated Draft
Status: Approved for bounded discovery; implementation conditional on integration gates
Proposed module: Sales → Sales Signals — Module 06 · Initial delivery: Historical Replay
Primary CRM: HubSpot · Initial signal source: EstimateOne email alerts
Project enrichment: Authorised EstimateOne integration or manual pilot process
Contact enrichment: HubSpot, approved public sources and manually authorised Lusha actions
Initial users: Internal ControlStack users only

## 1. Executive decision
ControlStack Sales Signals should proceed as a bounded Historical Replay pilot. The pilot will determine whether project-alert emails can be transformed into useful, evidence-backed sales opportunities by: identifying and consolidating project signals; resolving ambiguous specification keywords; enriching project information; identifying stakeholders and appropriate contact roles; detecting trusted supplier affiliates; distinguishing design, controls, tender and post-award sales routes; checking for existing HubSpot records; selectively enriching contacts; preparing a reviewed CRM handover.
ControlStack will remain the signal-discovery, interpretation and research layer. HubSpot will remain the formal CRM and system of record for approved companies, contacts, leads or deals, ownership, activities and commercial outcomes. No live CRM write, contact-detail reveal or automated sales action will occur without an authorised user action during the pilot.

## 2. Product purpose
Sales Signals should answer: 1 What project has surfaced? 2 What caused it to surface? 3 Is the matched keyword genuinely relevant? 4 What product, company or system is specified? 5 What is the current project position? 6 Which organisations and people influence the opportunity? 7 Is a trusted affiliate involved? 8 Which sales routes remain viable? 9 How urgent is the next action? 10 What evidence supports the recommendation? 11 Does the opportunity or stakeholder already exist in HubSpot? 12 What should the salesperson do next? 13 Is the opportunity ready to transfer into the CRM?
The output is not merely a project list. It is a prioritised, reviewable sales-opportunity queue.

## 3. Product boundary
Sales Signals is a sales-signal and opportunity-intelligence module. It is not: a replacement CRM; an unrestricted project-data scraper; an automatic contact-harvesting tool; an automatic outbound-marketing system; an autonomous deal-creation agent; a substitute for salesperson judgement.
Email is the initial source, not the permanent boundary. Potential future sources include: project-alert systems; tender notifications; specification documents; builder invitations; consultant schedules; uploaded tender documents; project-status notifications; Selector-generated commercial signals; approved third-party project integrations. All sources should feed a shared ControlStack opportunity model.

## 4. Relationship to existing ControlStack signals
EstimateOne should not create a separate downstream sales process. Selector, EstimateOne and future sources should produce a shared opportunity signal that can use the same: company identity service; contact lookup; HubSpot company lookup; HubSpot contact lookup; HubSpot lead or deal lookup; duplicate detection; stakeholder enrichment; source-evidence handling; affiliate detection; ownership resolution; CRM preparation; approval and write controls.
Each source may provide different evidence, but the enrichment and CRM handover boundary should remain common. This shared capability should be reusable by: Selector-originated opportunities; EstimateOne projects; tender alerts; uploaded specifications; project-status changes; future sales-signal sources.

## 5. Canonical information model
The implementation should distinguish:
**5.1 Source event** — an individual alert, email, document match or project-status change (LB Group alert; Q-account alert; tender extension; builder award; new specification match). Retained as evidence; must not be confused with a new opportunity.
**5.2 Project** — the real construction project to which one or more source events relate. May receive multiple alerts, keywords and status changes over time.
**5.3 Opportunity** — the commercial pursuit being considered. One project may support more than one genuinely different opportunity (luminaire specification pursuit; controls opportunity; post-award replacement opportunity). Duplicate alerts must not create duplicate opportunities.
**5.4 Organisation** — a company involved in the project (owner; developer; architect; consultant; builder; electrical contractor; supplier; affiliate).
**5.5 Project stakeholder relationship** — the role an organisation performs on a particular project. The role belongs to the project relationship, not permanently to the company.
**5.6 Contact candidate** — a person who may be relevant but has not yet been approved as a CRM contact.
**5.7 Affiliate relationship** — ControlStack's existing commercial relationship with an organisation; separate from the organisation's project role.
**5.8 CRM link** — the confirmed association between a ControlStack record and an existing HubSpot company, contact, lead or deal.
**5.9 Correction record** — a user's review of a proposed classification, identity, stakeholder, route or other interpretation. Corrections form an evidence corpus. They do not automatically become production rules.

## 6. AI interaction model
Sales Signals must remain usable without AI. AI assists the user but does not own records, workflow stages or commercial decisions.
**6.1 Proposed and confirmed states** — information visibly distinguishes: source-confirmed value; deterministic rule result; AI proposal; user-confirmed value; user-corrected value. An AI proposal becomes an accepted field value only through an authorised user action or an explicitly approved deterministic rule.
**6.2 Appropriate presentation** — suggestion chips for short structured values (classification; project stage; sales route; company identity; confidence; urgency band). Review panel for larger AI outputs (stakeholder lists; project summaries; commercial reasoning; recommended approach; HubSpot deal summary).
**6.3 AI restrictions** — AI must not: hide or delete a signal; create a permanent exclusion; change a workflow stage; reveal Lusha data; create or modify HubSpot records; initiate outbound contact; overwrite a confirmed source fact; convert an inference into a confirmed fact.
**6.4 Graceful operation without AI** — when AI is unavailable or disabled: email extraction continues; project references remain available; deterministic matching continues; HubSpot lookups continue; users can populate all fields manually; the work queue remains operational; no existing reviewed information is lost.

## 7. Integration and access gates
**7.1 Mailbox access** — one manually linked mailbox belonging to one authorised internal user. Access: approved Google authorisation; least access necessary; read-only; revocable; restricted to the nominated mailbox; only the defined E1 messages and date range; no stored mailbox passwords. Retain message reference and extracted fields rather than permanently copying complete messages, where practical.
**7.2 EstimateOne integration gate** — target outcome is direct enrichment through the authorised user's Q EstimateOne account. Automated project retrieval must not be implemented unless: (1) an EstimateOne API or approved integration suitable for the intended use exists; or (2) written EstimateOne permission for the proposed access method. Until then Historical Replay may use: information in authorised alert emails; user-opened Q project records; manually supplied project exports; manually approved evidence capture. No automated browser scraping, credential sharing or hidden scripted access.
**7.3 HubSpot entitlement gate** — before selecting the final HubSpot destination, confirm availability of: HubSpot Leads; additional deal pipelines; workflows and round-robin assignment; required custom properties; association labels; relevant API permissions. Adapt to the available subscription.
**7.4 Lusha gate** — all chargeable Lusha actions remain manual during the pilot.

## 8. Initial Historical Replay
Process approximately two to four weeks of historical LB Group EstimateOne alerts.
**8.1 Initial keywords:** Xero · Austube · mLight (plus historical keywords evidenced in the period).
**8.2 Account relationship:** LB Group alerts provide the historical keyword signal; the EstimateOne project reference provides project correlation; the Q account provides the richer project view where authorised; Q is the intended future alert account.
**8.3 Replay workflow:** 1 identify eligible LB alert emails; 2 extract project reference, keyword, source date, details; 3 preserve the original source event; 4 consolidate repeated alerts per project; 5 preserve all keyword matches and status changes; 6 match to the corresponding Q project where permitted; 7 collect richer authorised evidence; 8 classify keyword context; 9 identify organisations and stakeholder roles; 10 check HubSpot for existing records; 11 detect supplier-affiliate relationships; 12 determine applicable sales routes; 13 determine action windows and urgency; 14 research suitable contact roles; 15 search public sources and Lusha only when authorised; 16 present for human review; 17 prepare a proposed CRM handover where approved; 18 record the review result and evidence.

## 9. Keyword interpretation
A keyword must never be accepted or rejected solely because the word appears.
**9.1 Austube** — intended match: Austube Lighting. False contexts: Austube Mills; structural steel; steel pipe; hollow sections; galvanised tube; fabrication schedules. Lighting evidence: luminaire; lighting; LED; output; wattage; CCT; CRI; optics; mounting; DALI; emergency; lighting product code.
**9.2 Xero** — intended match: Xero Lighting. False contexts: accounting software; payroll; bookkeeping; invoicing; finance integration; software licences. Lighting evidence: luminaire schedule; lighting product code; output; wattage; CCT; CRI; beam; optic; mounting; DALI; emergency.
**9.3 Classification:** Confirmed lighting match · Probable lighting match · Uncertain · Wrong company · Wrong product category · False positive. Evidence and confidence must remain available.

## 10. Corrections and learning
**10.1 Correction capture** — rejecting or editing a proposal opens a lightweight correction control. Required: corrected result; reason category. Optional: explanatory note; correct company; correct product; positive indicators; negative indicators; suggested future scope. Normally completable within 15 seconds.
**10.2 Abandoned corrections** — may record that the proposal was rejected but must be marked "Reason not supplied — not eligible for rule promotion". Must not silently influence production exclusions.
**10.3 Rule promotion** — corrections first enter a reviewed feedback corpus. A rule becomes deterministic only when: sufficient supporting examples exist; conflicting examples reviewed; tested against the historical corpus; does not hide valid lighting matches; an authorised reviewer approves; version and effective date recorded; can be disabled or rolled back. Loop: rule/AI proposal → user review → correction corpus → tested rule proposal → authorised promotion. The system learns cautiously.

## 11. Project and stakeholder information
**11.1 Project:** name; description; address; suburb; state; postcode; sector; estimated value; project stage; tender status; tender closing date; expected construction timing; awarded status; EstimateOne project reference; source link; date last checked.
**11.2 Specification:** matched wording; specified manufacturer; specified product; product code; luminaire type; mounting and finish; relevant performance data; controls requirement; DALI reference; emergency-lighting requirement; approved-equivalent wording; possible alternative; ControlStack relevance.
**11.3 Stakeholder organisations:** owner/client; developer; architect; electrical consultant; services consultant; lighting designer; tendering builders; awarded builder; electrical contractor; controls contractor; specified suppliers; other influencers. Every stakeholder includes: project role; evidence source; confidence; date checked.

## 12. Commercial interpretation model — dimensions remain separate
**12.1 Confirmed project stage:** concept/early design; developed design; documentation; tendering; tender extended; pending; builder awarded; construction; closed/cancelled.
**12.2 ControlStack qualification state:** New · Under review · Relevant · Researching · Ready for engagement · Accepted for CRM · Monitoring · Rejected · Transferred.
**12.3 Sales routes (multiple may apply):** Designer and specification · ControlStack and controls · Tender influence · Competitor takeover · Builder engagement · Electrical-contractor conversion · Owner or developer · Post-award conversion · Affiliate-supported route.
**12.4 Relationship signals:** known affiliate; warm introduction available; existing HubSpot company; existing HubSpot contact; active deal conflict; relationship-owner coordination required; do-not-engage restriction.
**12.5 Action urgency** answers "how soon should somebody act?" — not certainty.
**12.6 Evidence confidence** answers "how strongly does the evidence support the conclusion?" — never blended into urgency or priority.
**12.7 Priority** must be explainable through visible contributing factors (timing; specification relevance; territory; sector; value; viable route; identifiable stakeholder; affiliate leverage; existing relationship; product fit; controls opportunity). No single opaque score without its reasons.

## 13. Urgency and commercial windows
**13.1 Tender window:** Immediate ≤7 days · Near 8–21 · Open >21 · Passed.
**13.2 Design influence window** — actionable without a tender date.
**13.3 Post-award window** — builder engagement; contractor identification; value management; approved alternatives; procurement; controls coordination; emergency-lighting conversion.
**13.4 Required terminology:** a passed closing date is labelled "Tender window passed" — never automatically "Too late". Commercial viability assessed separately by sales route.
**13.5 Source freshness:** every urgency assessment includes source date; date last checked; next known deadline; recommended action date.

## 14. Supplier-affiliate model — from approved HubSpot company records
**14.1 Minimum properties:** Relationship status (Not assessed · Prospective · Active · Dormant · Strategic); Relationship type, multi-value (Manufacturer · Supplier · Distributor · Electrical contractor · Builder · Consultant · Lighting designer · Controls partner · Referral partner · Owner or client · Other); Relationship strength (Developing · Established · Strong · Strategic); Sales Signals monitoring (Enabled · Disabled); Contact policy (Direct contact permitted · Inform relationship owner · Coordinate before contact · Seek introduction · Joint approach · Do not engage); Relevant solutions (Harcroft · Xulux · Ektor · Zencontrol · Atom · ControlStack · Emergency lighting · Lighting controls · Linear lighting); plus territory; HubSpot relationship owner; preferred associated contact; relationship last verified; company aliases; relationship note; conflict warning. "Do not engage" belongs in contact policy, not general status.
**14.2 Affiliate signals:** Warm route into project · Affiliate leverage available · Introduction opportunity · Joint specification opportunity · Tender support available · Takeover support available · Coordination required · Potential channel conflict · Affiliate already engaged.
**14.3 Point-of-action controls:** Inform relationship owner displays the owner before proceeding; Coordinate before contact requires acknowledgement; Seek introduction recommends the relationship owner as the route; Do not engage blocks unless an authorised override is entered and logged; possible channel conflict shown during contact reveal and CRM handover.

## 15. HubSpot operating model
**15.1 Hierarchy:** ControlStack Sales Signals queue → HubSpot Lead where available → HubSpot Deal after sales acceptance. Where Leads unavailable: queue → approved HubSpot Deal. A dedicated research deal pipeline may be an interim fallback, not assumed the only model.
**15.2 Research-pipeline safeguards:** excluded from normal forecast reporting; research stages must not duplicate the active sales pipeline; accepted projects transfer cleanly; the research record closes as transferred; the same opportunity never active in two pipelines; handover traceable.
**15.3 Research stages (no technology-named stages; "AI assessed" is not a stage):** 1 New signal · 2 Under review · 3 Relevant · 4 Stakeholder research · 5 Ready for engagement · 6 Accepted for sales · 7 Monitor · 8 Rejected · 9 Transferred.
**15.4 Existing-record handling:** associate the opportunity; retain existing ownership; never overwrite the owner; show the owner; identify active deal conflicts; require coordination where appropriate.
**15.5 New-record handling:** the user approves the handover; ControlStack identifies the research initiator; HubSpot applies configured ownership/round-robin; the resulting owner returns to ControlStack; research initiator and CRM owner remain separate concepts.
**15.6 Duplicate preflight.** Companies: existing confirmed link; primary domain; known additional domains; normalised legal/trading name; aliases; name and location; manual review. Contacts: existing confirmed link; verified business email; additional verified email; name and company; professional profile; manual review. Opportunities: EstimateOne project reference; existing ControlStack project link; project name and location; associated stakeholder companies; active HubSpot leads or deals; manual review.
**15.7 Safe CRM write:** visible preflight; summary of records to create or update; before-and-after values for updates; explicit approval; stable source reference; safe retry; write result; partial-failure reporting. Repeating the same approved action must not create another company, contact or deal.

## 16. Contact enrichment and Lusha
**16.1 Order:** identify organisation → determine required role → check existing HubSpot → check approved public sources → search Lusha where justified → present candidates → approval before chargeable reveal → reveal only selected information → record source, cost, date → approve or reject before CRM transfer.
**16.2 Candidate requirements:** name; current role; organisation; likely project relevance; reason selected; public professional source; business email availability; phone availability; verification date; confidence; existing HubSpot match; enrichment source. No inferred email pattern presented as verified.
**16.3 Lusha controls:** no automatic chargeable searches; no automatic reveals; no Historical Replay bulk reveal; no phone reveal without a specific action; existing HubSpot contacts take priority; every chargeable action identifies project and purpose; every retrieved detail records verification date; credit use auditable.
**16.4 Credit visibility** before every chargeable action: action type; current cost; current balance; expected remaining balance; project; purpose. Applies to searches, company enrichment, contact enrichment and signal retrieval where chargeable — not only reveals.

## 17. Evidence and confidence
Every material conclusion includes: conclusion; information type; evidence source; source location/link; date checked; confidence; method used; applicable user correction.
**17.1 Information types:** Confirmed (directly supported by an authoritative source) · Inferred (reasoned interpretation supported by evidence) · User-confirmed · User-corrected.
**17.2 Confidence:** High (directly stated by reliable source or independently corroborated; unambiguous identity) · Medium (credible evidence; limited interpretation; plausible but incomplete) · Low (incomplete; ambiguous identity; conflicting sources; mainly assumption).
**17.3 Safeguards:** low-confidence information cannot appear as confirmed; conflicting evidence visible; exclusions retain evidence; commercial reasoning understandable; source evidence remains available after CRM transfer; human approval before consequential actions; corrections auditable.

## 18. User interface requirements
**18.1 Main queues:** Act now · Research next · Monitor · Review required · Rejected or false positive · Transferred. Review required includes: uncertain identity; conflicting project stage; possible duplicate; missing access; unresolved affiliate conflict; failed source retrieval.
**18.2 Batch triage:** rapid review of summarised signals — Confirm relevant · Mark uncertain · Reject · Open details. Keyboard operation optional; every action reversible.
**18.3 Evidence view:** every material conclusion opens its evidence record in one action.
**18.4 AI proposals:** chips for short values; review panel for summaries/lists; accept, edit, reject; clear AI provenance; no silent field replacement.
**18.5 Affiliate warnings** appear during the action they affect.
**18.6 Lusha controls:** credit cost before every chargeable action.
**18.7 CRM handover screen:** existing matches; proposed new records; ownership outcome; duplicate warnings; affiliate restrictions; property changes; source evidence; final approval control.
**18.8 Pilot Scoreboard:** current sample size; review coverage; extraction success; project-linking success; duplicate results; keyword results by keyword; stakeholder usefulness; sales-route usefulness; CRM preflight results; audit completeness; unresolved blockers.

## 19. Security, privacy and retention
**19.1 Mailbox minimisation:** process only nominated messages; avoid retaining unrelated email content; avoid permanent attachment storage unless required and approved; store extracted evidence rather than complete mailbox copies where practical.
**19.2 Credentials:** no stored mailbox or EstimateOne passwords; provider credentials server-side; revocable; never exposed to browser or AI prompt.
**19.3 User isolation:** one authorised internal user initially; no cross-user mailbox access; no sharing of research queues without explicit permission; multi-user expansion requires a separate security review.
**19.4 Contact information:** business-relevant only; retain source and verification date; respect do-not-engage/suppression; enrichment data not treated as permanently current; no unnecessary personal information copied into project records.
**19.5 Retention (pilot defines):** raw email retention; extracted evidence retention; rejected candidate retention; correction retention; effect of access revocation; pilot data deletion.
**19.6 Audit:** source access; classification changes; rule proposals; affiliate overrides; Lusha charges; CRM approvals; CRM results; access failures.

## 20. Pilot acceptance
Historical Replay proves technical feasibility AND tests commercial usefulness. 30 distinct signals suffice for discovery, not for unattended production.
**20.1 Collection:** ≥95% of eligible alert projects extracted; no silent failure; every failure enters Review required.
**20.2 Project linking:** ≥90% of projects with an available authorised richer record linked; links preserve original alert evidence; unavailable projects distinguished from technical failures.
**20.3 Duplicates:** ≥95% of repeated alerts consolidated correctly; keyword and status history preserved; no unnecessary duplicate opportunity knowingly transferred.
**20.4 Keyword classification (headline metric):** results reported separately for Xero, Austube, mLight; ≥85% overall agreement with human review; no reviewed genuine lighting match hidden by a high-confidence exclusion; uncertain results remain visible; false-positive and genuine-match performance reported separately.
**20.5 Learning safety:** no correction auto-becomes an exclusion rule; every promoted rule has reviewed evidence; every rule can be disabled; reprocessing shows improvement or degradation.
**20.6 Stakeholder usefulness:** ≥70% of relevant projects identify one useful stakeholder organisation; ≥50% a useful person or defined contact role; every proposed contact includes a reason; project role and company relationship not confused.
**20.7 Commercial interpretation:** every Act now / Research next record has evidence; every reviewed route recommendation marked useful/not; ≥80% of route recommendations reasonable; tender-date calculations correct; passed tenders not auto-closed; ≥3 actionable opportunities surfaced unless the source set contains fewer.
**20.8 HubSpot behaviour:** preflight on every proposed transfer; existing ownership preserved; no write without approval; repeated approved writes create no duplicates; partial failures reported; research initiator and CRM owner distinguishable.
**20.9 Lusha behaviour:** nothing chargeable automatic; cost shown beforehand; project and purpose recorded; no guessed contact information represented as verified.
**20.10 Auditability:** every material AI conclusion shows source and confidence; corrections retained; original EstimateOne references traceable; CRM handovers retain source evidence.
**20.11 Operational validation** before unattended daily processing: expanded corpus — additional genuine/false examples per ambiguous keyword; newly arriving Q alerts; later status updates; repeated-project tests; projects with and without HubSpot matches; affiliate and ownership conflicts; failed and repeated CRM handovers.

## 21. Go, revise and stop criteria
**Proceed to daily supervised pilot** when: EstimateOne access method authorised; collection and linking thresholds pass; classification commercially useful; no valid match silently hidden; stakeholder results justify action; CRM duplicate controls pass; access and audit controls pass.
**Revise** when: parsing works but classification weak; linking incomplete; stakeholder research not useful; evidence unclear in UI; duplicate/ownership handling needs refinement; rules do not generalise safely.
**Stop** when: authorised EstimateOne access cannot be established; project identities cannot be linked reliably; the system invents or misrepresents contact details; mailbox or CRM isolation unsafe; material data obtained outside permitted access; repeat writes cannot be made safe; the pilot creates more administrative work than sales value.

## 22. Principal risks
22.1 EstimateOne access — treatment: integration gate before automation. 22.2 CRM pollution — queue first; Lead where available; Deal only after acceptance. 22.3 False negatives — no automatic rule promotion; visible uncertain queue; regression review. 22.4 Stale data — source/recheck/verification dates. 22.5 Ownership conflict — preflight, visible owner, coordination warning. 22.6 Cost — visible cost + manual approval per chargeable action. 22.7 User fatigue — batch triage, short corrections, progressive disclosure. 22.8 Evidence overload — concise summaries, evidence one action away. 22.9 Data retention — minimise, define retention, support deletion.

## 23. Agreed decisions
1 Module location Sales → Sales Signals. 2 Shell registration Module 06. 3 Internal-only initially. 4 One manually linked mailbox. 5 Historical LB alerts provide replay signals. 6 Q account provides richer information where authorised. 7 EstimateOne and Selector share a downstream opportunity and enrichment boundary. 8 ControlStack performs HubSpot lookup and duplicate preflight. 9 Existing ownership respected. 10 New-record ownership via approved HubSpot assignment. 11 Affiliates sourced from approved HubSpot company information. 12 Affiliate warnings at the affected action. 13 Lusha manual. 14 All chargeable Lusha actions display cost. 15 AI optional and non-authoritative. 16 AI proposals visibly separate from confirmed facts. 17 Corrections enter a review corpus before becoming rules. 18 Urgency, confidence, route and workflow state remain separate. 19 Passed tender ≠ too late. 20 Historical Replay read-only to HubSpot. 21 Live CRM writes gated. 22 Pilot Scoreboard measures technical and commercial results. 23 Automated Q retrieval requires an approved EstimateOne access route.

## 24. Recommended program decision
Approve Historical Replay as a supervised discovery parcel: process historical LB alerts; consolidate by project; enrich from authorised Q evidence; distinguish genuine and false keyword contexts; identify stakeholders; detect affiliates; separate stage, route, urgency, priority and confidence; check existing HubSpot records; Lusha only through manual cost-visible actions; retain evidence and corrections; prepare CRM handovers without live writes.
Do not commission automated EstimateOne retrieval until the permitted integration method is confirmed. Do not commission unattended daily processing until Historical Replay and operational validation demonstrate the process is reliable, commercially useful and less burdensome than the manual workflow it replaces.

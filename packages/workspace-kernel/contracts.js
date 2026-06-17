export const WORKSPACE_CONTRACT_VERSION = "workspace-shell-contract.v0.4";

export const SHELL_OWNERSHIP = Object.freeze({
  identity: "shell",
  project: "shell",
  projectMetadata: "shell",
  saveRestore: "shell",
  handoff: "shell",
  companyContext: "shell",
  crmContext: "shell",
  hubspotContext: "shell",
  hubspotWritePolicy: "shell",
  crossModuleVisibility: "shell",
  roleBasedVisibility: "shell",
  shellFeatureFlags: "shell",
  responsiveNavigation: "shell",
});

export const MODULE_OWNERSHIP = Object.freeze({
  ui: "module",
  localTransientState: "module",
  localUiOnlyVisibility: "module",
  localResponsiveReflow: "module",
});

export const MODULE_LIFECYCLE_CONTRACT = Object.freeze({
  mount: "mount({ container, services, context })",
  update: "update({ route, identity, project, company, visibility, flags })",
  unmount: "unmount()",
  diagnostics: "diagnostics?()",
});

export const PHASE_4_DEFERRED_IMPLEMENTATIONS = Object.freeze({
  saveRestore: "deferred-real-implementation",
  handoff: "deferred-real-implementation",
  hubspotWrites: "deferred-real-implementation",
  hubspotAuth: "deferred-real-implementation",
  hubspotSync: "deferred-real-implementation",
  optionalPlugins: "deferred-real-implementation",
  engine: "out-of-scope",
  runTable: "out-of-scope",
  payload: "out-of-scope",
});

export function createContractDiagnostics() {
  return {
    contractVersion: WORKSPACE_CONTRACT_VERSION,
    shellOwnership: SHELL_OWNERSHIP,
    moduleOwnership: MODULE_OWNERSHIP,
    lifecycle: MODULE_LIFECYCLE_CONTRACT,
    deferred: PHASE_4_DEFERRED_IMPLEMENTATIONS,
  };
}

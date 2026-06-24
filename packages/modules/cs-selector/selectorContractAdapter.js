const MODULE_ID = "cs_selector";

function safeRead(reader, fallback) {
  if (typeof reader !== "function") return fallback;
  try {
    return reader();
  } catch {
    return fallback;
  }
}

function objectOrFallback(value, fallback) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

function createSelectorTimelineContext(timelinePolicy = {}) {
  const model = timelinePolicy.timelineModel || {};
  const projectRequirementDate = objectOrFallback(
    timelinePolicy.projectRequirementDate || model.projectRequirementDate,
    {
      value: null,
      label: "not set",
      source: "shell-project-context",
      requiredForFutureProducts: true,
    }
  );
  const timelineAccess = objectOrFallback(
    timelinePolicy.timelineAccess || model.timelineAccess,
    {
      status: "not-enabled-placeholder",
      label: "not enabled / placeholder",
      contactRepRequired: true,
      source: "shell-placeholder",
      writeEnabled: false,
    }
  );
  const specialPartsEntitlement = objectOrFallback(
    timelinePolicy.specialPartsEntitlement,
    {
      status: "not-live-placeholder",
      source: "shell-placeholder",
      entitlementLive: false,
      userEmailMatched: false,
      userComponentIds: [],
      entitledParts: [],
      readOnly: true,
    }
  );
  const specialPartsOptIn = objectOrFallback(
    timelinePolicy.specialPartsOptIn,
    {
      owner: "shell",
      status: "not-live-placeholder",
      source: "shell-project-context-placeholder",
      projectScoped: true,
      selectedPartIds: [],
      dismissedPartIds: [],
      writeEnabled: false,
    }
  );
  const moduleConsumption = objectOrFallback(
    timelinePolicy.moduleConsumption || model.moduleConsumption,
    {
      csSelector: {
        consumesTimelineContext: true,
        ownsSelectionCompatibility: true,
        filteringLive: false,
        warningsLive: false,
      },
      futureModules: {
        consumeTimelineContext: true,
        ownModuleSpecificCompatibility: true,
      },
    }
  );

  return {
    owner: "cs_selector",
    status: "passive-consumer",
    source: "selector-contract-adapter-stage-3c",
    consumedFrom: "shell-context.timelinePolicy",
    shellPolicyOwner: timelinePolicy.owner || "shell",
    shellPolicyStatus: timelinePolicy.status || "unavailable",
    readOnly: true,
    selectorAuthoritative: false,
    projectRequirementDate,
    timelineAccess,
    specialPartsEntitlement,
    specialPartsOptIn,
    moduleConsumption,
    lifecycleStatusPolicy: timelinePolicy.lifecycleStatusPolicy || {},
    modelQuestion: model.question || "Can this user/project use this product or special part by the project requirement date?",
    implementation: {
      filteringLive: false,
      warningsLive: false,
      entitlementLookupLive: false,
      optInLive: false,
      projectWritesLive: false,
      backendRoutesLive: false,
      slugMutationLive: false,
      buildMutationLive: false,
    },
    selectorOwnership: {
      selectedSystemCompatibility: true,
      selectedVariantCompatibility: true,
      selectedIpCompatibility: true,
      visualWarnings: true,
      clearOrKeepAnywayUi: true,
      appliedInBuildResult: true,
    },
  };
}

export function createSelectorContractAdapter({ services, context }) {
  return {
    moduleId: MODULE_ID,
    services,
    context,

    readSnapshots() {
      const auth = context.auth || safeRead(() => services.auth.getAuthSnapshot(), context.auth);
      const identity = context.identity || safeRead(() => services.identity.getIdentitySnapshot(), context.identity);
      const project = context.project || safeRead(() => services.project.getProjectSnapshot(), context.project);
      const crm = context.crm || safeRead(() => services.crm.getCrmSnapshot({ auth, identity, project }), context.crm);
      const authority = context.authority || safeRead(() => services.authority.getAuthoritySnapshot({ auth, identity, crm }), context.authority);
      const visibility = context.visibility || safeRead(() => services.visibility.getVisibilitySnapshot({ auth, identity, authority, project }), context.visibility);
      const timelinePolicy = context.timelinePolicy || safeRead(() => services.timelinePolicy.getTimelinePolicySnapshot({ auth, identity, authority, visibility, project }), context.timelinePolicy);
      const selectorTimelineContext = createSelectorTimelineContext(timelinePolicy);
      return {
        route: context.route,
        auth,
        identity,
        authority,
        project,
        company: context.company || safeRead(() => services.crm.getCompanyContext({ auth, identity, project }), context.company),
        crm,
        handoff: context.handoff || safeRead(() => services.handoff.getHandoffSnapshot(), context.handoff),
        visibility,
        timelinePolicy,
        selectorTimelineContext,
        flags: context.flags || safeRead(() => services.flags.getFlagSnapshot(), context.flags),
        lifecycle: context.lifecycle,
        diagnostics: context.diagnostics,
      };
    },

    createSelectorTimelineContext,

    canShowSelector() {
      return services.visibility.canShowModule?.(MODULE_ID, context) ?? true;
    },

    isFlagEnabled(flagId) {
      return services.flags.isEnabled?.(flagId) ?? false;
    },

    hasCapability(capabilityId) {
      return services.identity.hasCapability?.(capabilityId) ?? false;
    },
  };
}

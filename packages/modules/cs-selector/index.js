let mountedContainer = null;

function clearElement(element) {
  while (element.firstChild) element.removeChild(element.firstChild);
}

function appendTextElement(parent, tagName, text, className = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function appendDefinitionList(parent, rows) {
  const list = document.createElement("dl");
  list.className = "cs-selector-proof__meta";
  for (const [label, value] of rows) {
    appendTextElement(list, "dt", label);
    appendTextElement(list, "dd", String(value));
  }
  parent.appendChild(list);
}

function appendPillList(parent, items) {
  const list = document.createElement("ul");
  list.className = "cs-shell__pill-list";
  for (const item of items) {
    appendTextElement(list, "li", item);
  }
  parent.appendChild(list);
}

function render(container, payload) {
  const { services, context } = payload;
  const project = context.project;
  const visibility = context.visibility;
  const flags = context.flags;

  clearElement(container);

  const article = document.createElement("article");
  article.className = "cs-selector-proof";
  article.dataset.module = "cs_selector";

  const intro = document.createElement("div");
  appendTextElement(intro, "p", "Native module mount contract", "cs-shell__eyebrow");
  appendTextElement(intro, "h2", "cs_selector baseline mounted");
  appendTextElement(
    intro,
    "p",
    "This is the Phase 1B proof mount. It confirms the runtime shell route, host panel, shell-owned context shape, and module lifecycle without restoring selector feature logic.",
  );

  appendDefinitionList(article, [
    ["Module", "cs_selector"],
    ["Lifecycle", "mount / update / unmount"],
    ["Project owner", project.owner],
    ["Save/restore owner", project.save.owner],
    ["Handoff owner", context.handoff.owner],
    ["Visibility owner", visibility.owner],
    ["Feature flags owner", flags.owner],
  ]);

  const servicesSection = document.createElement("section");
  appendTextElement(servicesSection, "h3", "Safe placeholder services");
  appendPillList(servicesSection, [
    `identity:${services.identity.status}`,
    `project:${services.project.status}`,
    `crm:${services.crm.status}`,
    `handoff:${services.handoff.status}`,
    `visibility:${services.visibility.status}`,
    `flags:${services.flags.status}`,
  ]);

  article.prepend(intro);
  article.appendChild(servicesSection);
  container.appendChild(article);
}

export const csSelectorModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("cs_selector requires an HTMLElement container");
    }
    mountedContainer = container;
    render(container, { services, context });
  },

  update(nextContext) {
    if (!mountedContainer) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    if (nextContext) {
      mountedContainer.dataset.module = nextContext.route?.moduleId || "cs_selector";
    }
  },

  unmount() {
    if (mountedContainer) {
      clearElement(mountedContainer);
    }
    mountedContainer = null;
  },
};

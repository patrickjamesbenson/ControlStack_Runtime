export function createModuleRegistry() {
  const modules = new Map();

  return {
    register(moduleId, moduleApi) {
      if (!moduleId || typeof moduleId !== "string") {
        throw new Error("moduleId is required");
      }
      if (!moduleApi || typeof moduleApi.mount !== "function") {
        throw new Error(`module ${moduleId} must provide mount()`);
      }
      modules.set(moduleId, moduleApi);
    },

    get(moduleId) {
      return modules.get(moduleId) || null;
    },

    has(moduleId) {
      return modules.has(moduleId);
    },

    list() {
      return Array.from(modules.keys()).sort();
    },
  };
}

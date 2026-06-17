export function createPluginRegistry() {
  const plugins = new Map();
  const statuses = new Map();

  function readStatus(pluginId) {
    return statuses.get(pluginId) || {
      pluginId,
      status: "registered",
      optional: true,
      error: null,
      mountedAt: null,
    };
  }

  return {
    register(pluginId, pluginApi) {
      plugins.set(pluginId, pluginApi);
      statuses.set(pluginId, readStatus(pluginId));
      return pluginApi;
    },

    get(pluginId) {
      return plugins.get(pluginId) || null;
    },

    list() {
      return [...plugins.keys()];
    },

    markLoading(pluginId) {
      statuses.set(pluginId, {
        ...readStatus(pluginId),
        status: "loading",
        error: null,
      });
      return this.getStatusSnapshot();
    },

    markMounted(pluginId) {
      statuses.set(pluginId, {
        ...readStatus(pluginId),
        status: "mounted",
        error: null,
        mountedAt: new Date().toISOString(),
      });
      return this.getStatusSnapshot();
    },

    markFailed(pluginId, error) {
      statuses.set(pluginId, {
        ...readStatus(pluginId),
        status: "failed",
        error: error?.message || String(error || "unknown plugin failure"),
      });
      return this.getStatusSnapshot();
    },

    getStatusSnapshot() {
      return {
        owner: "shell",
        status: "placeholder",
        optionalPluginsBootCritical: false,
        plugins: [...statuses.values()].map((status) => ({ ...status })),
      };
    },
  };
}

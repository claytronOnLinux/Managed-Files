function updateRules() {
  chrome.storage.managed.get("blocktypes", (data) => {
    const blocktypes = data.blocktypes || [];
    const rules = blocktypes.map((ext, i) => ({
      id: i + 1,
      priority: 1,
      action: { type: "block" },
      condition: {
        urlFilter: `*.${ext}`,
        resourceTypes: ["main_frame"]
      }
    }));

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: rules.map((r) => r.id),
        addRules: rules
      },
      () => {
        console.log("Updated block rules:", rules);
      }
    );
  });
}

// Run once on startup
chrome.runtime.onInstalled.addListener(updateRules);
chrome.runtime.onStartup.addListener(updateRules);

// Re-apply if policy changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "managed" && changes.blocktypes) {
    updateRules();
  }
});
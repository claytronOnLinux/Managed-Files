function updateRules() {
  chrome.storage.managed.get(["blocktypes", "redirectUrl"], (data) => {
    const blocktypes = data.blocktypes || [];
    const redirectUrl =
      data.redirectUrl || chrome.runtime.getURL("blocked.html");

    let ruleId = 1;
    const rules = [];

    // Block rules for local file:// URLs only
    for (const ext of blocktypes) {
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          type: redirectUrl ? "redirect" : "block",
          redirect: redirectUrl ? { url: redirectUrl } : undefined
        },
        condition: {
          urlFilter: `|file:///*.${ext}`, // only local files
          resourceTypes: ["main_frame"]
        }
      });
    }

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: Array.from({ length: ruleId }, (_, i) => i + 1),
        addRules: rules
      },
      () => {
        console.log("Updated local file block rules:", rules);
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
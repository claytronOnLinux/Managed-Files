const LOG_RETENTION_DAYS = 7;

async function logAction(action, details = {}) {
  const now = Date.now();
  const logEntry = { timestamp: now, action, ...details };

  const data = await chrome.storage.local.get("extensionLogs");
  let logs = data.extensionLogs || [];

  // Add new log entry
  logs.push(logEntry);

  // Prune old logs (older than LOG_RETENTION_DAYS)
  const sevenDaysAgo = now - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  logs = logs.filter(entry => entry.timestamp >= sevenDaysAgo);

  await chrome.storage.local.set({ extensionLogs: logs });
}

function updateRules() {
  chrome.storage.managed.get(["blocktypes", "redirectUrl", "disableBlocking"], async (data) => {
    const blocktypes = data.blocktypes || [];
    const redirectUrl =
      data.redirectUrl || chrome.runtime.getURL("blocked.html");
    const disableBlocking = data.disableBlocking || false;

    let ruleId = 1;
    const rules = [];

    if (!disableBlocking) {
      for (const ext of blocktypes) {
        rules.push({
          id: ruleId++,
          priority: 1,
          action: {
            type: redirectUrl ? "redirect" : "block",
            redirect: redirectUrl ? { url: redirectUrl } : undefined
          },
          condition: {
            urlFilter: `file://*/*.${ext}`, // only local files
            resourceTypes: ["main_frame"]
          }
        });
      }
      await logAction("rules_updated", { status: "blocking_enabled", blocktypes: blocktypes });
    } else {
      await logAction("rules_updated", { status: "blocking_disabled" });
    }

    chrome.declarativeNetRequest.updateDynamicRules(
      {
        removeRuleIds: Array.from({ length: ruleId }, (_, i) => i + 1),
        addRules: rules
      },
      () => {
        // Removed console.log("Updated local file block rules:", rules);
      }
    );
  });
}

// Run once on startup
chrome.runtime.onInstalled.addListener(() => {
  updateRules();
  logAction("extension_installed_or_updated");
});
chrome.runtime.onStartup.addListener(() => {
  updateRules();
  logAction("extension_startup");
});

// Re-apply if policy changes
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "managed" && (changes.blocktypes || changes.disableBlocking)) {
    updateRules();
    logAction("policy_changed", { changes: changes });
  }
});
function updateRules() {
  chrome.storage.managed.get(["blocktypes", "redirectUrl"], (data) => {
    const blocktypes = Array.isArray(data.blocktypes) ? data.blocktypes : [];

    // If redirectUrl is present in policy (even empty), we will redirect.
    // Empty string falls back to bundled blocked.html.
    const redirectConfigured = Object.prototype.hasOwnProperty.call(
      data,
      "redirectUrl"
    );
    const fallbackBlocked =
      chrome.runtime.getURL("blocked.html") || "about:blank";
    const redirectUrl =
      redirectConfigured && data.redirectUrl
        ? data.redirectUrl
        : fallbackBlocked;

    let ruleId = 1;
    const rules = [];

    const special = /[.*+?^${}()|[\]\\]/g;
    const toCaseInsensitiveExt = (ext) => {
      let out = "";
      for (const ch of String(ext)) {
        if (/[a-z]/i.test(ch)) {
          out += `[${ch.toLowerCase()}${ch.toUpperCase()}]`;
        } else {
          out += ch.replace(special, "\\$&");
        }
      }
      return out;
    };

    for (const raw of blocktypes) {
      if (!raw) continue;
      const cleaned = String(raw).trim().replace(/^\./, "");
      if (!cleaned) continue;

      const ciExt = toCaseInsensitiveExt(cleaned);
      // Match file://...<anything>.<ext> followed by end, ? or #
      const regex = `^file://.*\\.${ciExt}(?:[?#]|$)`;

      rules.push({
        id: ruleId++,
        priority: 1,
        action: redirectConfigured
          ? { type: "redirect", redirect: { url: redirectUrl } }
          : { type: "block" },
        condition: {
          regexFilter: regex,
          resourceTypes: ["main_frame"],
        },
      });
    }

    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const removeRuleIds = existingRules.map((r) => r.id);

      chrome.declarativeNetRequest.updateDynamicRules(
        { removeRuleIds, addRules: rules },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error updating rules:",
              chrome.runtime.lastError.message
            );
          } else {
            console.log(
              "Updated local file block rules. New rules:",
              JSON.stringify(rules, null, 2)
            );
          }
        }
      );
    });
  });
}

// Initial setup when the extension is installed or updated
chrome.runtime.onInstalled.addListener(updateRules);

// Listen for changes in managed storage and update rules dynamically
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "managed" && (changes.blocktypes || changes.redirectUrl)) {
    console.log("Policy has changed, updating rules...");
    updateRules();
  }
});

// Run updateRules on first launch as well
updateRules();

// Optional: debug and log matches (requires declarativeNetRequestFeedback)
try {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    const url = info.request?.url || "";
    console.log("Matched rule:", info.rule.ruleId, "->", url);

    // Append to local logs for logs.html
    const ts = new Date().toISOString();
    let type = "";
    const m = url.match(/\.([^.\/?#]+)(?:[?#]|$)/);
    if (m) type = m[1];

    chrome.storage.local.get("blockedLogs", (data) => {
      const logs = Array.isArray(data.blockedLogs) ? data.blockedLogs : [];
      logs.unshift({ timestamp: ts, type, url });
      // keep last 1000 entries
      if (logs.length > 1000) logs.length = 1000;
      chrome.storage.local.set({ blockedLogs: logs });
    });
  });
} catch (e) {
  // declarativeNetRequestFeedback may be missing
}

// ── Helpers ──────────────────────────────────────────────────────────
const special = /[.*+?^${}()|[\]\\]/g;

function toCaseInsensitiveExt(ext) {
  let out = "";
  for (const ch of String(ext)) {
    if (/[a-z]/i.test(ch)) {
      out += `[${ch.toLowerCase()}${ch.toUpperCase()}]`;
    } else {
      out += ch.replace(special, "\\$&");
    }
  }
  return out;
}

// ── Rule management ─────────────────────────────────────────────────
function updateRules() {
  chrome.storage.managed.get(
    ["blocktypes", "redirectUrl", "disableBlocking"],
    (data) => {
      if (chrome.runtime.lastError) {
        // Managed storage unavailable (e.g. no policy set). Remove all rules.
        clearAllRules();
        return;
      }

      // Honor the disableBlocking flag
      if (data.disableBlocking === true) {
        clearAllRules();
        console.log("Blocking disabled by policy.");
        return;
      }

      const blocktypes = Array.isArray(data.blocktypes) ? data.blocktypes : [];
      const externalRedirect =
        typeof data.redirectUrl === "string" && data.redirectUrl.trim()
          ? data.redirectUrl.trim()
          : "";
      const blockedPageUrl = chrome.runtime.getURL("blocked.html");

      let ruleId = 1;
      const rules = [];

      for (const raw of blocktypes) {
        if (!raw) continue;
        const cleaned = String(raw).trim().replace(/^\./, "");
        if (!cleaned) continue;

        const ciExt = toCaseInsensitiveExt(cleaned);
        // Match file://...<anything>.<ext> optionally followed by ?/# and more.
        // The ^file:// anchor ensures remote URLs (https://) are NEVER matched.
        const regex = `^file://.*\\.${ciExt}([?#].*)?$`;

        if (externalRedirect) {
          // Admin specified a redirect URL — use it as-is.
          // NOTE: When using an external redirect, the blocked URL is NOT
          // passed along, so logging from blocked.html won't occur.
          rules.push({
            id: ruleId++,
            priority: 1,
            action: { type: "redirect", redirect: { url: externalRedirect } },
            condition: { regexFilter: regex, resourceTypes: ["main_frame"] },
          });
        } else {
          // Use built-in block page with the original URL passed as a param
          // so blocked.html can display it and log the event.
          // regexSubstitution \0 = the entire matched URL.
          // If the file path contains '#', it becomes a URL fragment in the
          // redirect, but blocked.html parses raw location.href to recover it.
          rules.push({
            id: ruleId++,
            priority: 1,
            action: {
              type: "redirect",
              redirect: {
                regexSubstitution: blockedPageUrl + "?url=\\0",
              },
            },
            condition: { regexFilter: regex, resourceTypes: ["main_frame"] },
          });
        }
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
                `Updated rules: ${rules.length} file type(s) blocked.`
              );
            }
          }
        );
      });
    }
  );
}

function clearAllRules() {
  chrome.declarativeNetRequest.getDynamicRules((existing) => {
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existing.map((r) => r.id),
      addRules: [],
    });
  });
}

// ── Logging ─────────────────────────────────────────────────────────
// Unified log format: { timestamp, action, details }
// All logging (blocked files, UI actions) flows through this listener.
const MAX_LOG_ENTRIES = 1000;
const MAX_ACTION_LEN = 64;
const MAX_DETAIL_LEN = 1024;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "logAction") return;

  // Only accept messages from our own extension pages.
  if (!sender.id || sender.id !== chrome.runtime.id) return;

  // Sanitise inputs — cap string lengths to prevent storage abuse.
  const action = String(message.action || "unknown").substring(0, MAX_ACTION_LEN);
  let details = message.details || {};
  // Flatten details to a JSON string, cap it, then parse back.
  try {
    let detailStr = JSON.stringify(details);
    if (detailStr.length > MAX_DETAIL_LEN) {
      detailStr = detailStr.substring(0, MAX_DETAIL_LEN);
      details = { _truncated: detailStr };
    }
  } catch (_) {
    details = {};
  }

  const entry = {
    timestamp: new Date().toISOString(),
    action,
    details,
  };

  chrome.storage.local.get("blockedLogs", (data) => {
    const logs = Array.isArray(data.blockedLogs) ? data.blockedLogs : [];
    logs.unshift(entry);
    if (logs.length > MAX_LOG_ENTRIES) logs.length = MAX_LOG_ENTRIES;
    chrome.storage.local.set({ blockedLogs: logs }, () => {
      sendResponse({ ok: true });
    });
  });

  // Return true to keep the message channel open for async sendResponse
  return true;
});

// ── Lifecycle ───────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(updateRules);

chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === "managed" &&
    (changes.blocktypes || changes.redirectUrl || changes.disableBlocking)
  ) {
    console.log("Policy changed, updating rules...");
    updateRules();
  }
});

// Also run on service worker startup (covers browser restart, extension
// update, and ChromeOS session restore).
updateRules();

// ── Debug-only rule match logging ───────────────────────────────────
// This API is only available for unpacked extensions in developer mode.
// In production (force-installed), it silently fails — logging is handled
// by blocked.html sending messages back to this service worker instead.
try {
  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((info) => {
    console.log(
      "DEBUG rule match:",
      info.rule.ruleId,
      "→",
      info.request?.url || "(unknown)"
    );
  });
} catch (_) {
  // Expected in production — not an error.
}

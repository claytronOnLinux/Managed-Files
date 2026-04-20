// ── Policy cache ─────────────────────────────────────────────────────
// The service worker can be killed and restarted at any time, so we
// read policy from chrome.storage.managed lazily and cache it in a
// module-scoped variable that gets refreshed on policy changes.
let cachedPolicy = {
  blocktypes: [],
  blocktypesLower: new Set(),
  redirectUrl: "",
  disableBlocking: false,
  ready: false,
};

function loadPolicy() {
  return new Promise((resolve) => {
    chrome.storage.managed.get(
      ["blocktypes", "redirectUrl", "disableBlocking"],
      (data) => {
        if (chrome.runtime.lastError) {
          // Managed storage unavailable (e.g. no policy set).
          cachedPolicy = {
            blocktypes: [],
            blocktypesLower: new Set(),
            redirectUrl: "",
            disableBlocking: false,
            ready: true,
          };
          resolve(cachedPolicy);
          return;
        }

        const raw = Array.isArray(data.blocktypes) ? data.blocktypes : [];
        const cleaned = raw
          .map((ext) =>
            String(ext || "")
              .trim()
              .replace(/^\./, "")
              .toLowerCase()
          )
          .filter(Boolean);

        cachedPolicy = {
          blocktypes: cleaned,
          blocktypesLower: new Set(cleaned),
          redirectUrl:
            typeof data.redirectUrl === "string" && data.redirectUrl.trim()
              ? data.redirectUrl.trim()
              : "",
          disableBlocking: data.disableBlocking === true,
          ready: true,
        };

        console.log(
          `Policy loaded: ${cleaned.length} blocked type(s), disableBlocking=${cachedPolicy.disableBlocking}, redirect=${cachedPolicy.redirectUrl || "(built-in)"}`
        );
        resolve(cachedPolicy);
      }
    );
  });
}

// ── Extension detection ─────────────────────────────────────────────
// Pull the extension from the path portion of the URL, ignoring the
// query string and fragment. This correctly handles paths containing
// '#' or '?' in the filename itself only if they appear after the
// final '.ext'; anything more exotic is treated as not-a-file-extension.
function getExtension(url) {
  if (typeof url !== "string") return null;
  if (!url.startsWith("file://")) return null;

  // Strip query and fragment to isolate the path.
  let path = url;
  const q = path.indexOf("?");
  if (q !== -1) path = path.substring(0, q);
  const h = path.indexOf("#");
  if (h !== -1) path = path.substring(0, h);

  const lastDot = path.lastIndexOf(".");
  const lastSlash = path.lastIndexOf("/");
  if (lastDot <= lastSlash) return null; // no extension in final segment

  const ext = path.substring(lastDot + 1).toLowerCase();
  if (!ext || ext.length > 32) return null;
  return ext;
}

// ── Block handling ───────────────────────────────────────────────────
function buildBlockUrl(originalUrl) {
  if (cachedPolicy.redirectUrl) {
    // Admin-specified external redirect — use as-is. No logging param.
    return cachedPolicy.redirectUrl;
  }
  // Built-in block page, with original URL as a query param so
  // blocked.html can display and log it.
  return (
    chrome.runtime.getURL("blocked.html") +
    "?url=" +
    encodeURIComponent(originalUrl)
  );
}

function shouldBlock(url) {
  if (!cachedPolicy.ready) return false;
  if (cachedPolicy.disableBlocking) return false;
  if (cachedPolicy.blocktypesLower.size === 0) return false;

  const ext = getExtension(url);
  if (!ext) return false;
  return cachedPolicy.blocktypesLower.has(ext);
}

// ── Navigation listener ─────────────────────────────────────────────
// onBeforeNavigate fires before the network request. We filter for
// file:// URLs and main frame (frameId === 0) navigations only, so
// resources loaded inside web pages are untouched.
chrome.webNavigation.onBeforeNavigate.addListener(
  (details) => {
    // Only handle top-level navigation in the main frame.
    if (details.frameId !== 0) return;

    // Ensure policy is loaded. If the SW just started, trigger a load
    // and bail on this event — the next navigation will catch it.
    if (!cachedPolicy.ready) {
      loadPolicy();
      return;
    }

    if (!shouldBlock(details.url)) return;

    const target = buildBlockUrl(details.url);
    chrome.tabs.update(details.tabId, { url: target }, () => {
      if (chrome.runtime.lastError) {
        console.warn(
          "Failed to redirect blocked file:",
          chrome.runtime.lastError.message
        );
      }
    });
  },
  { url: [{ schemes: ["file"] }] }
);

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
chrome.runtime.onInstalled.addListener(() => {
  loadPolicy();
});

chrome.runtime.onStartup.addListener(() => {
  loadPolicy();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === "managed" &&
    (changes.blocktypes || changes.redirectUrl || changes.disableBlocking)
  ) {
    console.log("Policy changed, reloading...");
    loadPolicy();
  }
});

// Also run on service worker startup (covers SW restarts between events).
loadPolicy();

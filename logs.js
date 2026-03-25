// ── Auth gate ────────────────────────────────────────────────────────
// popup.js writes a short-lived token to storage and appends it as a
// URL hash before opening this page. We verify the hash matches the
// stored token, then consume it so it can't be reused.
(function () {
  const hashToken = location.hash.slice(1); // strip the "#"
  if (!hashToken) return; // no token → stay on the denied screen

  chrome.storage.local.get("_logsAuthToken", (data) => {
    if (data._logsAuthToken && data._logsAuthToken === hashToken) {
      // Valid — consume the token and show logs
      chrome.storage.local.remove("_logsAuthToken");
      document.getElementById("authGate").style.display = "none";
      document.getElementById("logsContent").style.display = "block";
      loadLogs();
      bindButtons();
    }
  });
})();

// ── Rendering ────────────────────────────────────────────────────────
function renderLogs(logs) {
  const tbody = document.querySelector("#logsTable tbody");
  tbody.innerHTML = "";

  if (logs.length === 0) {
    const row = document.createElement("tr");
    const td = document.createElement("td");
    td.setAttribute("colspan", "3");
    td.textContent = "No log entries yet.";
    td.style.textAlign = "center";
    td.style.color = "#888";
    row.appendChild(td);
    tbody.appendChild(row);
    return;
  }

  logs.forEach((entry) => {
    const row = document.createElement("tr");
    const date = new Date(entry.timestamp).toLocaleString();
    const details =
      entry.details && Object.keys(entry.details).length > 0
        ? JSON.stringify(entry.details)
        : "";

    [date, entry.action || "", details].forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      row.appendChild(td);
    });

    tbody.appendChild(row);
  });
}

function loadLogs() {
  chrome.storage.local.get("blockedLogs", (data) => {
    renderLogs(data.blockedLogs || []);
  });
}

// ── Buttons ──────────────────────────────────────────────────────────
function bindButtons() {
  document.getElementById("downloadBtn").addEventListener("click", () => {
    chrome.runtime.sendMessage({
      type: "logAction",
      action: "logs_downloaded",
    });

    chrome.storage.local.get("blockedLogs", (data) => {
      const logs = data.blockedLogs || [];
      const blob = new Blob([JSON.stringify(logs, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "blocked-file-logs.json";
      a.click();
      URL.revokeObjectURL(url);
    });
  });

  document.getElementById("clearBtn").addEventListener("click", () => {
    if (!confirm("Clear all log entries? This cannot be undone.")) return;

    chrome.runtime.sendMessage({
      type: "logAction",
      action: "logs_cleared",
    });

    chrome.storage.local.set({ blockedLogs: [] }, () => {
      renderLogs([]);
    });
  });
}

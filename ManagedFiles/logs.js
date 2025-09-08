const LOG_RETENTION_DAYS = 7;

async function logAction(action, details = {}) {
  const now = Date.now();
  const logEntry = { timestamp: now, action, ...details };

  const data = await chrome.storage.local.get("extensionLogs");
  let logs = data.extensionLogs || [];

  logs.push(logEntry);

  const sevenDaysAgo = now - LOG_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  logs = logs.filter(entry => entry.timestamp >= sevenDaysAgo);

  await chrome.storage.local.set({ extensionLogs: logs });
}

function renderLogs(logs) {
  const tbody = document.querySelector("#logsTable tbody");
  tbody.innerHTML = "";
  logs.forEach((entry) => {
    const row = document.createElement("tr");
    const date = new Date(entry.timestamp).toLocaleString();
    row.innerHTML = `
      <td>${date}</td>
      <td>${entry.action}</td>
      <td>${JSON.stringify(entry.details || {})}</td>
    `;
    tbody.appendChild(row);
  });
}

chrome.storage.local.get("extensionLogs", (data) => {
  const logs = data.extensionLogs || [];
  renderLogs(logs);
});

document.getElementById("downloadBtn").addEventListener("click", async () => {
  await logAction("logs_downloaded");
  chrome.storage.local.get("extensionLogs", (data) => {
    const logs = data.extensionLogs || [];
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extension-logs.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});
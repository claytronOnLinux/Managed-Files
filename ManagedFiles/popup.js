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

document.getElementById("supportBtn").addEventListener("click", async () => {
  await logAction("support_button_clicked");
  chrome.storage.managed.get("supportUrl", (data) => {
    const url = data.supportUrl;
    if (url) {
      chrome.tabs.create({ url });
    } else {
      alert("IT Support URL is not configured by your administrator.");
    }
  });
});

document.getElementById("logsBtn").addEventListener("click", async () => {
  await logAction("view_logs_button_clicked");
  chrome.storage.managed.get("logsPassword", (data) => {
    const correctPassword = data.logsPassword;
    if (!correctPassword) {
      alert("Logs are not enabled by your administrator.");
      return;
    }

    const entered = prompt("Enter admin password to view logs:");
    if (entered === correctPassword) {
      chrome.tabs.create({ url: chrome.runtime.getURL("logs.html") });
      logAction("logs_viewed_successfully");
    } else {
      alert("Incorrect password.");
      logAction("logs_view_failed", { reason: "incorrect_password" });
    }
  });
});
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

document.getElementById("downloadBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "logAction", action: "logs_downloaded" });
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
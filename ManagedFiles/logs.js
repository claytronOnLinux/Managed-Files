function renderLogs(logs) {
  const tbody = document.querySelector("#logsTable tbody");
  tbody.innerHTML = "";
  logs.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.timestamp}</td>
      <td>${entry.type}</td>
      <td>${entry.url}</td>
    `;
    tbody.appendChild(row);
  });
}

chrome.storage.local.get("blockedLogs", (data) => {
  const logs = data.blockedLogs || [];
  renderLogs(logs);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  chrome.storage.local.get("blockedLogs", (data) => {
    const logs = data.blockedLogs || [];
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "blocked-logs.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});
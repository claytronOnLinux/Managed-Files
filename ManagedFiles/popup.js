let clickCount = 0;
let clickTimer = null;

document.getElementById("title").addEventListener("mousedown", (event) => {
  event.preventDefault(); // Prevents focus changes and text selection
  clickCount++;
  if (clickTimer) {
    clearTimeout(clickTimer);
  }
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 2000); // Reset after 2 seconds of inactivity

  if (clickCount === 5) {
    clickCount = 0;
    clearTimeout(clickTimer);
    showLogs();
  }
});

function showLogs() {
  chrome.runtime.sendMessage({ type: "logAction", action: "view_logs_button_clicked" });
  chrome.storage.managed.get("logsPassword", (data) => {
    const correctPassword = data.logsPassword;
    if (!correctPassword) {
      // Silently fail if logs are not enabled, as this is a hidden feature.
      return;
    }

    const entered = prompt("Enter admin password to view logs:");
    if (entered === correctPassword) {
      chrome.tabs.create({ url: chrome.runtime.getURL("logs.html") });
      chrome.runtime.sendMessage({ type: "logAction", action: "logs_viewed_successfully" });
    } else if (entered) { // Only log failed attempt if a password was entered
      chrome.runtime.sendMessage({ type: "logAction", action: "logs_view_failed", details: { reason: "incorrect_password" } });
    }
  });
}

document.getElementById("supportBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "logAction", action: "support_button_clicked" });
  chrome.storage.managed.get("supportUrl", (data) => {
    const url = data.supportUrl;
    if (url) {
      chrome.tabs.create({ url });
    } else {
      alert("IT Support URL is not configured by your administrator.");
    }
  });
});
document.getElementById("supportBtn").addEventListener("click", () => {
  chrome.storage.managed.get("supportUrl", (data) => {
    const url = data.supportUrl || "https://support.example.com";
    chrome.tabs.create({ url });
  });
});

document.getElementById("logsBtn").addEventListener("click", () => {
  chrome.storage.managed.get("logsPassword", (data) => {
    const correctPassword = data.logsPassword;
    if (!correctPassword) {
      alert("Logs are not enabled by your administrator.");
      return;
    }

    const entered = prompt("Enter admin password to view logs:");
    if (entered === correctPassword) {
      chrome.tabs.create({ url: chrome.runtime.getURL("logs.html") });
    } else {
      alert("Incorrect password.");
    }
  });
});
let clickCount = 0;
let clickTimer = null;

const authSection = document.getElementById("authSection");
const passwordInput = document.getElementById("passwordInput");
const authError = document.getElementById("authError");
const authSubmit = document.getElementById("authSubmit");
const supportNotice = document.getElementById("supportNotice");

// ── Secret 5-click to reveal password prompt ────────────────────────
document.getElementById("title").addEventListener("mousedown", (event) => {
  event.preventDefault();
  clickCount++;
  if (clickTimer) clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    clickCount = 0;
  }, 2000);

  if (clickCount === 5) {
    clickCount = 0;
    clearTimeout(clickTimer);
    showAuthPrompt();
  }
});

function showAuthPrompt() {
  chrome.runtime.sendMessage({
    type: "logAction",
    action: "view_logs_button_clicked",
  });

  chrome.storage.managed.get("logsPassword", (data) => {
    if (chrome.runtime.lastError || !data.logsPassword) return;
    authSection.style.display = "block";
    authError.style.display = "none";
    passwordInput.value = "";
    passwordInput.focus();
  });
}

// ── Password submission ─────────────────────────────────────────────
function attemptLogin() {
  const entered = passwordInput.value;
  if (!entered) return;

  chrome.storage.managed.get("logsPassword", (data) => {
    if (entered === data.logsPassword) {
      chrome.runtime.sendMessage({
        type: "logAction",
        action: "logs_viewed_successfully",
      });
      // Pass a short-lived token via hash so logs.html can verify the
      // navigation came from the popup rather than a direct URL visit.
      const token = Date.now().toString(36);
      chrome.storage.local.set({ _logsAuthToken: token }, () => {
        chrome.tabs.create({
          url: chrome.runtime.getURL("logs.html") + "#" + token,
        });
        window.close();
      });
    } else {
      chrome.runtime.sendMessage({
        type: "logAction",
        action: "logs_view_failed",
        details: { reason: "incorrect_password" },
      });
      authError.style.display = "block";
      passwordInput.value = "";
      passwordInput.focus();
    }
  });
}

authSubmit.addEventListener("click", attemptLogin);
passwordInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") attemptLogin();
});

// ── IT Support button ───────────────────────────────────────────────
document.getElementById("supportBtn").addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "logAction",
    action: "support_button_clicked",
  });
  chrome.storage.managed.get("supportUrl", (data) => {
    if (chrome.runtime.lastError || !data.supportUrl) {
      // Show inline notice instead of alert() which kills the popup
      supportNotice.style.display = "block";
      return;
    }
    chrome.tabs.create({ url: data.supportUrl });
  });
});

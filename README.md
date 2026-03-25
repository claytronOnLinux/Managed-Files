# Managed Files: Securely Block Local File Access

**A lightweight, policy-driven Chrome extension to prevent users from opening specific local file types (e.g., `.html`, `.js`, `.pdf`) in the browser.**

Managed Files is designed for enterprise and school environments where administrators need to control access to local files for security and compliance. Configuration is managed centrally via the Google Admin Console, allowing you to enforce policies across your entire organization seamlessly.

[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/managed-files/bfbdggpicmioahjkhbcjcbakjohjongi)

---

## ✨ Why Use Managed Files?

*   <img src="./assets/check.svg" alt="Check Icon" width="20" height="20"> **Enhance Security:** Prevent users from opening potentially malicious local files (like `.html` or `.js`) that could execute scripts or compromise security.
*   <img src="./assets/settings.svg" alt="Settings Icon" width="20" height="20"> **Centralized Management:** Configure and deploy blocking rules for your entire organization using Google Admin Console policies. No client-side setup is needed.
*   <img src="./assets/info-circle.svg" alt="Info Icon" width="20" height="20"> **Lightweight & Secure:** No external dependencies, no data collection, and no performance impact. The extension is built to be simple, fast, and secure.
*   🏫 **Enterprise-Ready:** Force-install the extension and lock down configurations for all users in your domain.
*   ✅ **Website Safe:** The extension only blocks `file://` navigations and does not interfere with websites or the resources they load.
*   🖥️ **Customizable Block Page:** A user-friendly block page shows the blocked file type and path. Administrators can optionally redirect to an internal helpdesk page instead.
*   📞 **IT Support Link:** The toolbar popup includes a configurable "Contact IT Support" link for users who need assistance.
*   📑 **Password-Protected Logs:** Administrators can review blocked file attempts (including file type, path, and timestamp) by entering a configured password. Logs can be exported as JSON for auditing.

---

## ⚙️ For System Administrators: Configuration

Configuration is handled via a JSON policy uploaded in the Google Admin Console.

1.  **Install the Extension:**
    *   Navigate to the Google Admin Console: **Devices → Chrome → Apps & Extensions → Users & Browsers**.
    *   Select the Organizational Unit (OU) or Group you want to configure.
    *   Click the **Add from Chrome Web Store** icon (a yellow circle with a plus sign).
    *   Search for the extension using its ID: `bfbdggpicmioahjkhbcjcbakjohjongi`.
    *   Select the extension and set the installation policy to **Force-install**.

2.  **Configure Policy:** Once installed, click the extension in the list. A panel will open on the right. Add your JSON configuration under **Policy for extensions**.

**Example Policy (Google Admin Console format):**

```json
{
  "blocktypes": {
    "Value": ["html", "js", "pdf", "vbs"]
  },
  "redirectUrl": {
    "Value": "https://intranet.company.com/file-blocked-info"
  },
  "supportUrl": {
    "Value": "https://helpdesk.company.com/new-ticket"
  },
  "logsPassword": {
    "Value": "YourSecurePasswordHere"
  },
  "disableBlocking": {
    "Value": false
  }
}
```

> **Important:** The Google Admin Console requires each policy value to be wrapped in a `{"Value": ...}` object. Using flat JSON (e.g., `"blocktypes": ["html"]`) will cause the policy to silently fail.

**Policy Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `blocktypes` | `string[]` | List of file extensions to block (e.g., `"html"`, `"js"`). |
| `redirectUrl` | `string` | Optional URL to redirect users to when a file is blocked. If omitted or empty, the built-in block page is shown (which also displays the blocked file path and type). |
| `supportUrl` | `string` | URL for the "Contact IT Support" link in the extension's popup. |
| `logsPassword` | `string` | Password required to view the blocked file logs. |
| `disableBlocking` | `boolean` | Set to `true` to temporarily disable all file blocking without removing the extension. Defaults to `false`. |

---

## 🕵️ Administrator Features

### Hidden Log Access

To keep the UI clean for end users, log access is hidden behind a secret gesture:

1.  Click the extension icon in the Chrome toolbar to open the popup.
2.  Click the **"Managed Files"** title at the top of the popup **5 times within 2 seconds**.
3.  Enter the `logsPassword` configured in your policy to view blocked file logs.

Logs include the timestamp, blocked file type, and full `file://` path for each blocked attempt. You can download the full log as JSON or clear it from the logs page.

> **Note:** Log recording requires the built-in block page (i.e., `redirectUrl` should be omitted or empty). When an external redirect URL is configured, the extension cannot capture blocked file details.

---

## 🔒 Privacy & Data

This extension is built with privacy and security as a top priority:

*   **No Data Collection:** It does not collect, store, or transmit any personal data.
*   **Local Storage:** All configuration and logs are stored locally on the user's machine using Chrome's storage APIs.
*   **No External Communication:** The extension does not contact any external servers unless a `redirectUrl` or `supportUrl` is configured by an administrator.

---

## 📜 License

This project is open-source and licensed under the MIT License. You are free to use, modify, and deploy it in your own environment.

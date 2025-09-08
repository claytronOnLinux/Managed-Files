# Managed Files: Securely Block Local File Access

**A lightweight, policy-driven Chrome extension to prevent users from opening specific local file types (e.g., `.html`, `.js`, `.pdf`) in the browser.**

Managed Files is designed for enterprise and school environments where administrators need to control access to local files for security and compliance. Configuration is managed centrally via the Google Admin Console, allowing you to enforce policies across your entire organization seamlessly.

[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/managed-files/bfbdggpicmioahjkhbcjcbakjohjongi)

---

## ✨ Why Use Managed Files?

*   <img src="./ManagedFiles/check.svg" alt="Check Icon" width="20" height="20"> **Enhance Security:** Prevent users from opening potentially malicious local files (like `.html` or `.js`) that could execute scripts or compromise security.
*   <img src="./ManagedFiles/settings.svg" alt="Settings Icon" width="20" height="20"> **Centralized Management:** Configure and deploy blocking rules for your entire organization using Google Admin Console policies. No client-side setup is needed.
*   <img src="./ManagedFiles/info-circle.svg" alt="Info Icon" width="20" height="20"> **Lightweight & Secure:** No external dependencies, no data collection, and no performance impact. The extension is built to be simple, fast, and secure.
*   🏫 **Enterprise-Ready:** Force-install the extension and lock down configurations for all users in your domain.
*   ✅ **Website Safe:** The extension only blocks `file://` navigations and does not interfere with websites or the resources they load.
*   🖥️ **Customizable Block Page:** Provide a user-friendly, modern block page that can be customized to redirect to an internal IT or helpdesk page.
*   📞 **IT Support Link:** The toolbar popup includes a configurable "Contact IT Support" link for users who need assistance.
*   📑 **Password-Protected Logs:** Administrators can review blocked file attempts (including file type, path, and timestamp) by entering a configured password. Logs can be exported for auditing.

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

**Example Policy:**

```json
{
  "blocktypes": ["html", "js", "pdf", "vbs"],
  "redirectUrl": "https://intranet.company.com/file-blocked-info",
  "supportUrl": "https://helpdesk.company.com/new-ticket",
  "logsPassword": "YourSecurePasswordHere",
  "disableBlocking": false
}
```

**Policy Fields:**

*   `blocktypes`: A list of file extensions to block (e.g., `"html"`, `"js"`).
*   `redirectUrl`: (Optional) A URL to redirect users to when a file is blocked. If empty, a local block page is shown.
*   `supportUrl`: The URL for the "Contact IT Support" link in the extension's popup.
*   `logsPassword`: A password to protect access to the logs of blocked files.
*   `disableBlocking`: Set to `true` to temporarily disable all file blocking.

---

## 🕵️ Administrator Features

### Hidden Log Access

To ensure a clean user interface and prevent confusion, the "View Logs" button is hidden by default. Administrators can access the logs on any machine by following these steps:

1.  Click the extension icon in the Chrome toolbar to open the popup.
2.  Click the **"Managed Files"** title at the top of the popup **5 times in a row**.
3.  A password prompt will appear. Enter the `logsPassword` configured in your policy to view the logs.

---

## 🔧 Development & Testing

If you wish to test the extension locally before deploying:

1.  **Load Unpacked:**
    *   Open Chrome and go to `chrome://extensions/`.
    *   Enable **Developer mode**.
    *   Click **Load unpacked** and select the `ManagedFiles/` folder.
    *   Enable **"Allow access to file URLs"** in the extension's settings.
2.  **Simulate Admin Policy:**
    *   Create a JSON file named after your extension's ID (e.g., `ibikmgedadoagbbjdgfapgogkkikggka.json`).
    *   Place this file in Chrome’s managed policy folder (location varies by OS).
    *   Restart Chrome and check `chrome://policy` to confirm the policy has been loaded.

---

## 🔒 Privacy & Data

This extension is built with privacy and security as a top priority:

*   **No Data Collection:** It does not collect, store, or transmit any personal data.
*   **Local Storage:** All configuration and logs are stored locally on the user's machine using Chrome's storage APIs.
*   **No External Communication:** The extension does not contact any external servers unless a `redirectUrl` or `supportUrl` is configured by an administrator.

---

## 📜 License

This project is open-source and licensed under the MIT License. You are free to use, modify, and deploy it in your own environment.
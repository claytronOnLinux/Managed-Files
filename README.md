Managed Files (Chrome Extension)

📌 Overview


Managed Files is a lightweight Chrome extension that prevents users from opening specific local file types (e.g., .html, .js, .pdf) directly in the browser via file:// URLs.

This extension is designed for enterprise and school environments where administrators need to restrict access to certain file types for security, compliance, or policy reasons.

Configuration is managed centrally via the Google Admin Console using JSON policies.

👉 Install the Chrome extension here!


---

✨ Features

- 🔒 Policy‑driven — Admins define blocked file types via Chrome Enterprise policies.

- ⚡ Lightweight — Minimal code, no external dependencies, no performance impact.

- 🛡️ Secure — No data collection, no remote code, no external communication.

- 🏫 Enterprise‑ready — Can be force‑installed and locked down via Google Admin Console.

- ✅ Safe for websites — Only blocks file:// navigations, does not block JavaScript or resources loaded by websites.

- 🖥️ Custom Block Page — Friendly, modern UI with optional redirect to an admin‑defined URL.

- 📞 Popup Menu — Toolbar button with a configurable “Contact IT Support” link.

- 📑 Password‑Protected Logs — Admins can review blocked attempts (file type, path, timestamp) after entering a configured password.

- 📥 Export Logs — IT can download logs as JSON for troubleshooting or compliance.


---

📂 File Structure

	managed-files/
	  ├── manifest.json    # Extension manifest (v3)
	  ├── background.js    # Service worker that applies blocking rules
	  ├── schema.json      # Policy schema for Admin Console
	  ├── popup.html       # Toolbar popup UI
	  ├── popup.js         # Popup logic (support + logs access)
	  ├── blocked.html     # Friendly block page
	  ├── logs.html        # Admin log viewer
	  ├── logs.js          # Logic for displaying/exporting logs
	  ├── icon128.png      # Extension icon
	  └── README.md        # This file


---

⚙️ Configuration (Admin Console)

1. Upload or publish the extension (private or internal).

2. In Google Admin Console → Devices → Chrome → Apps & Extensions, add the extension by ID.

3. Under Policy for extensions, provide JSON configuration.

Example Policy

	{
	  "blocktypes": ["html", "js", "pdf"],
	  "redirectUrl": "https://intranet.company.com/blocked",
	  "supportUrl": "https://helpdesk.company.com/ticket",
	  "logsPassword": "SuperSecret123",
	  "disableBlocking": false
	}


- blocktypes → List of file extensions to block (file:// only).

- redirectUrl → Optional URL to redirect blocked attempts (defaults to local blocked.html).

- supportUrl → URL opened when the user clicks “Contact IT Support” in the popup.

- logsPassword → Password required to view logs in the extension.

- disableBlocking → Set to `true` to disable all file blocking by the extension.


---

🔧 Development & Testing

Load Unpacked

1. Open Chrome and go to chrome://extensions/.

2. Enable Developer mode.

3. Click Load unpacked and select the managed-files/ folder.

4. Enable “Allow access to file URLs” in the extension settings.

5. Test by opening a local .html or .js file in Chrome — it should be blocked.

Simulating Admin Policy Locally

- Place a JSON file named after your extension ID in Chrome’s managed policy folder (varies by OS).

- Example (Windows):

	C:\Program Files\Google\Chrome\Policies\Managed\ibikmgedadoagbbjdgfapgogkkikggka.json



- Restart Chrome and check chrome://policy to confirm it loaded.


---

🔒 Privacy & Data Usage

- This extension does not collect, store, or transmit any personal data externally.

- All configuration is handled locally via Chrome’s managed storage.

- Logs are stored locally in chrome.storage.local and only viewable with the admin password.

- No external servers are contacted unless configured by the admin (e.g., custom redirect/support URL).

- No remote code is executed.


---

📜 License


MIT License — feel free to use, modify, and deploy in your own environment.

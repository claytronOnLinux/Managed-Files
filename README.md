# Managed Files (Chrome Extension)

## 📌 Overview


Block File Types is a lightweight Chrome extension that prevents users from opening specific local file types (e.g., .html, .js, .pdf) directly in the browser.

This extension is designed for enterprise and school environments where administrators need to restrict access to certain file types for security or policy reasons.

Configuration is managed centrally via the Google Admin Console using JSON policies.


---

## ✨ Features

- 🔒 Policy‑driven — Admins define blocked file types via Chrome Enterprise policies.

- ⚡ Lightweight — Minimal code, no external dependencies, no performance impact.

- 🛡️ Secure — No data collection, no remote code, no external communication.

- 🏫 Enterprise‑ready — Can be force‑installed and locked down via Google Admin Console.

- ✅ Safe for websites — Only blocks file:// navigations, does not block JavaScript or resources loaded by websites.


---

## 📂 File Structure

	block-file-types/
	  ├── manifest.json   # Extension manifest (v3)
	  ├── background.js   # Service worker that applies blocking rules
	  ├── schema.json     # Policy schema for Admin Console
	  ├── icon128.png     # Extension icon
	  └── README.md       # This file


---

## ⚙️ Configuration (Admin Console)

1. Upload or publish the extension (private or internal).

2. In Google Admin Console → Devices → Chrome → Apps & Extensions, add the extension by ID.

3. Under Policy for extensions, provide JSON configuration.

Example Policy

	{
	  "blocktypes": ["html", "js"]
	}

This will block attempts to open .html and .js files directly in Chrome (via file:// URLs).


---

## 🔧 Development & Testing

Load Unpacked

1. Open Chrome and go to chrome://extensions/.

2. Enable Developer mode.

3. Click Load unpacked and select the block-file-types/ folder.

4. Test by opening a local .html or .js file in Chrome — it should be blocked.

Packaging


To deploy outside of the Web Store, package the extension into a .crx and distribute via Admin Console.


---

## 🔒 Privacy & Data Usage

- This extension does not collect, store, or transmit any personal data.

- All configuration is handled locally via Chrome’s managed storage.

- No external servers are contacted.

- No remote code is executed.


---

## 📜 License


MIT License — feel free to use, modify, and deploy in your own environment.


---
✅ This README is clear for IT admins, compliant for Chrome Web Store, and friendly for GitHub.

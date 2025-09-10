function updateRules() {
  chrome.storage.managed.get(["blocktypes", "redirectUrl"], (data) => {
    // Default to an empty array if blocktypes isn't set
    const blocktypes = data.blocktypes || [];
    // Use the custom redirect URL or fall back to the bundled blocked.html
    const redirectUrl =
      data.redirectUrl || chrome.runtime.getURL("blocked.html");

    let ruleId = 1;
    const rules = [];

    // Create a rule for each file extension from the managed policy
    for (const ext of blocktypes) {
      rules.push({
        id: ruleId++,
        priority: 1,
        action: {
          // If a redirectUrl is provided (even an empty string from policy
          // could mean "use default"), we redirect. Otherwise, we block.
          // Note: an empty redirectUrl in policy will use the default.
          type: "redirect",
          redirect: { url: redirectUrl },
        },
        // --- THIS IS THE CORRECTED PART ---
        condition: {
          // Simpler filter that just matches the end of the URL path
          urlFilter: `*/*.${ext}`,
          // Explicitly apply this rule ONLY to local file URLs
          schemes: ["file"],
          resourceTypes: ["main_frame"],
        },
      });
    }

    // Get all existing rule IDs to remove them before adding new ones
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
      const removeRuleIds = existingRules.map((rule) => rule.id);

      chrome.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: removeRuleIds,
          addRules: rules,
        },
        () => {
          if (chrome.runtime.lastError) {
            console.error(
              "Error updating rules:",
              chrome.runtime.lastError.message,
            );
          } else {
            console.log("Updated local file block rules. New rules:", rules);
          }
        },
      );
    });
  });
}

// Initial setup when the extension is installed or updated
chrome.runtime.onInstalled.addListener(updateRules);

// Run when the browser starts (but not the extension, onInstalled is better)
// chrome.runtime.onStartup.addListener(updateRules); // This is often redundant

// Listen for changes in managed storage and update rules dynamically
chrome.storage.onChanged.addListener((changes, area) => {
  if (
    area === "managed" &&
    (changes.blocktypes || changes.redirectUrl)
  ) {
    console.log("Policy has changed, updating rules...");
    updateRules();
  }
});

// A small improvement: Run updateRules on first launch as well
updateRules();

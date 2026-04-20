(function () {
  // Extract the blocked URL from the raw href to handle filenames
  // containing '#' (which the browser treats as a fragment separator).
  // location.href preserves everything including the fragment.
  //
  // In v1.3+ the service worker passes the URL already encoded via
  // encodeURIComponent, so decode it here. Older builds (v1.2 and
  // earlier) appended the raw URL; we fall back to the raw substring
  // if decoding fails.
  var raw = location.href;
  var marker = "?url=";
  var idx = raw.indexOf(marker);
  if (idx === -1) return;

  var blockedUrl = raw.substring(idx + marker.length);
  if (!blockedUrl) return;

  try {
    var decoded = decodeURIComponent(blockedUrl);
    blockedUrl = decoded;
  } catch (_) {
    // Leave blockedUrl as the raw substring if decode fails.
  }

  // SECURITY: Only process file:// URLs. This prevents log poisoning
  // if a website somehow navigates to this page with a crafted URL.
  if (!blockedUrl.startsWith("file://")) return;

  // Cap length to prevent abuse from extremely long paths
  if (blockedUrl.length > 2048) {
    blockedUrl = blockedUrl.substring(0, 2048);
  }

  // Extract file extension for display
  var match = blockedUrl.match(/\.([a-zA-Z0-9]{1,12})(?:[?#].*)?$/);
  var fileType = match ? match[1].toLowerCase() : "unknown";

  // Show file info to the user
  var infoEl = document.getElementById("fileInfo");

  var typeNode = document.createElement("div");
  var typeLabel = document.createElement("strong");
  typeLabel.textContent = "Blocked type: ";
  typeNode.appendChild(typeLabel);
  typeNode.appendChild(document.createTextNode("." + fileType));
  infoEl.appendChild(typeNode);

  var pathNode = document.createElement("div");
  pathNode.style.marginTop = "0.4rem";
  var pathLabel = document.createElement("strong");
  pathLabel.textContent = "Path: ";
  pathNode.appendChild(pathLabel);
  pathNode.appendChild(document.createTextNode(blockedUrl));
  infoEl.appendChild(pathNode);

  infoEl.style.display = "block";

  // Log the blocked file event back to the service worker
  chrome.runtime.sendMessage({
    type: "logAction",
    action: "file_blocked",
    details: { url: blockedUrl, fileType: fileType },
  });
})();

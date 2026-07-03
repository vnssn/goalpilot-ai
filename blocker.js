//=====================================
// BLOCKING ENGINE
//=====================================

// Determines whether a page
// should be blocked or not.
function shouldBlock(decision) {
  return decision === "DISTRACTION";
}

// Blocks a distracting website
async function blockPage(tabId, website) {
  // Increment blocked count
  const stats = await chrome.storage.local.get(["blocked"]);

  await chrome.storage.local.set({
    blocked: (stats.blocked || 0) + 1,
  });
  console.log("BLOCKING WEBSITE:", website);

  // Redirect the current tab
  // to GoalPilot's custom
  // blocked page
  await chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL("blocked.html"),
  });
}

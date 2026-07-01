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
  console.log("BLOCKING WEBSITE:", website);

  // Redirect the current tab
  // to GoalPilot's custom
  // blocked page
  await chrome.tabs.update(tabId, {
    url: chrome.runtime.getURL("blocked.html"),
  });
}

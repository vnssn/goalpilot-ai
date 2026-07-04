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
  try {
    // Get current stats and goal
    const data = await chrome.storage.local.get(["blocked", "goal"]);

    // Save information for blocked.html
    await chrome.storage.local.set({
      blocked: (data.blocked || 0) + 1,

      blockedGoal: data.goal || "No active goal",

      blockedWebsite: new URL(website).hostname.replace("www.", ""),

      blockedDecision: "DISTRACTION",
    });

    console.log("BLOCKING WEBSITE:", website);
    console.log("GOAL:", data.goal);

    // Redirect to blocked page
    await chrome.tabs.update(tabId, {
      url: chrome.runtime.getURL("blocked/blocked.html"),
    });
  } catch (err) {
    console.error("BLOCK ERROR:", err);
  }
}

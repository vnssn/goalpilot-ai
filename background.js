//===============================
// TAB DETECTION
//===============================
console.log("BACKGROUND LOADED");

chrome.tabs.onUpdated.addListener(
  // Parameters:
  // tabId      -> unique ID of the tab
  // changeInfo -> tells us what changed
  // tab        -> contains information about the tab
  async (tabId, changeInfo, tab) => {
    // A webpage loads in multiple stages.
    // We only want to run our code after
    // the page has completely loaded.
    if (changeInfo.status !== "complete") return;

    // Fetch data stored in Chrome local storage.
    // We need:
    // goal   -> user's current study goal
    // active -> whether focus mode is ON
    const data = await chrome.storage.local.get(["goal", "active"]);

    // If focus mode is OFF,
    // there is nothing to monitor.
    if (!data.active) return;

    // Print the user's goal.
    // Example:
    // "Study Binary Search"
    console.log("Goal:", data.goal);

    // Print the current website URL.
    // Example:
    // https://youtube.com/watch?v=abc
    console.log("Website:", tab.url);

    // Print the title of the current page.
    // Example:
    // "Binary Search Tutorial - Striver"
    console.log("Title:", tab.title);
  },
);

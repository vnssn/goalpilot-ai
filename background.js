importScripts("gemini.js");

//===============================
// TAB DETECTION
//===============================
console.log("BACKGROUND LOADED");

//tab switch detection
chrome.tabs.onActivated.addListener((activeInfo) => {
  console.log("TAB SWITCHED EVENT");
  console.log(activeInfo);
});

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

    // Save current page information
    // so popup.html can display it

    await chrome.storage.local.set({
      // Current website URL
      currentWebsite: tab.url,

      // Current page title
      currentTitle: tab.title,
    });
  },
);

// Fires when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Get the active tab
  const tab = await chrome.tabs.get(activeInfo.tabId);

  // Get current session
  const data = await chrome.storage.local.get(["goal", "active"]);

  // Ignore if focus mode is off
  if (!data.active) return;

  console.log("TAB SWITCHED");

  console.log("Website:", tab.url);

  console.log("Title:", tab.title);

  // Get the user's saved Gemini API key
  const settings = await chrome.storage.local.get(["apiKey"]);

  // Ask Gemini if this page
  // is related to the user's goal
  const decision = await askGemini(
    data.goal,
    tab.url,
    tab.title,
    settings.apiKey,
  );

  // Print Gemini's answer
  console.log("GEMINI:", decision);

  // Save Gemini's decision so popup.js can display it
  await chrome.storage.local.set({
    aiDecision: decision,
  });

  // Update popup data
  await chrome.storage.local.set({
    currentWebsite: tab.url,
    currentTitle: tab.title,
  });
});

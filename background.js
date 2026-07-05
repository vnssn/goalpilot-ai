importScripts("gemini.js", "blocker.js", "rules.js");

console.log("BACKGROUND LOADED");

let lastTabId = -1;
let lastTime = 0;

// Gemini rate limiter
let requestCount = 0;
let windowStart = Date.now();

function shouldIgnore(url) {
  return (
    !url ||
    url.startsWith("chrome://") ||
    url.startsWith("chrome-extension://") ||
    url.startsWith("edge://") ||
    url.startsWith("about:") ||
    url.startsWith("devtools://")
  );
}

//===============================
// TAB DETECTION
//===============================
console.log("BACKGROUND LOADED");
async function analyzeTab(tabId, tab) {
  // Prevent duplicate analysis from
  // onUpdated + onActivated firing together
  if (lastTabId === tabId && Date.now() - lastTime < 1000) {
    console.log("SKIPPING DUPLICATE");
    return;
  }

  lastTabId = tabId;
  lastTime = Date.now();
  if (shouldIgnore(tab.url)) {
    console.log("IGNORED:", tab.url);
    return;
  }

  const data = await chrome.storage.local.get(["goal", "active"]);
  if (!data.active) return;

  console.log("TAB ANALYSIS");
  console.log("Website:", tab.url);
  console.log("TITLE FROM CHROME:");
  console.log(tab.title);
  console.log("URL:");
  console.log(tab.url);

  await chrome.storage.local.set({
    currentWebsite: tab.url,
    currentTitle: tab.title,
    aiDecision: "⏳ Analyzing...",
  });

  // Get API key
  const settings = await chrome.storage.local.get(["apiKey"]);

  // Always allow/block
  const rules = await chrome.storage.local.get(["alwaysAllow", "alwaysBlock"]);

  const allow = rules.alwaysAllow || [];
  const block = rules.alwaysBlock || [];

  if (block.some((site) => tab.url.includes(site))) {
    console.log("RULE: ALWAYS BLOCK");

    await chrome.storage.local.set({
      aiDecision: "DISTRACTION",
    });

    await blockPage(tabId, tab.url);
    return;
  }

  if (allow.some((site) => tab.url.includes(site))) {
    console.log("RULE: ALWAYS ALLOW");

    await chrome.storage.local.set({
      aiDecision: "RELEVANT",
      lastRelevantPage: tab.url,
    });

    return;
  }

  // User rules
  const siteRules = await chrome.storage.local.get([
    "blockedSites",
    "allowedSites",
  ]);

  if (siteRules.blockedSites?.some((site) => tab.url.includes(site))) {
    console.log("RULE: BLOCK");

    await chrome.storage.local.set({
      aiDecision: "DISTRACTION",
    });

    await blockPage(tabId, tab.url);
    return;
  }

  if (siteRules.allowedSites?.some((site) => tab.url.includes(site))) {
    console.log("RULE: ALLOW");

    await chrome.storage.local.set({
      aiDecision: "RELEVANT",
      lastRelevantPage: tab.url,
    });

    return;
  }

  const hostname = new URL(tab.url).hostname;

  // Dynamic sites use full URL cache
  let cacheKey = hostname;

  if (hostname.includes("youtube.com") || hostname.includes("google.com")) {
    cacheKey = tab.url;
  }

  // Allow search/home pages so users
  // can find relevant content.
  if (
    hostname.includes("youtube.com") &&
    (tab.url === "https://www.youtube.com/" || tab.url.includes("/results?"))
  ) {
    console.log("ALLOW: YOUTUBE SEARCH");

    await chrome.storage.local.set({
      aiDecision: "RELEVANT",
      lastRelevantPage: tab.url,
    });

    return;
  }

  // Allow only Google homepage.
  // Google searches should be analyzed by Gemini.
  if (
    hostname.includes("google.com") &&
    tab.url === "https://www.google.com/"
  ) {
    console.log("ALLOW: GOOGLE HOME");

    await chrome.storage.local.set({
      aiDecision: "RELEVANT",
      lastRelevantPage: tab.url,
    });

    return;
  }

  let decision;

  const cacheData = await chrome.storage.local.get(["decisionCache"]);

  const decisionCache = cacheData.decisionCache || {};

  // CACHE HIT
  if (cacheKey in decisionCache) {
    console.log("CACHE HIT:", cacheKey);

    decision = decisionCache[cacheKey];
  }

  // CACHE MISS
  else {
    console.log("CACHE MISS:", cacheKey);

    if (Date.now() - windowStart > 60000) {
      requestCount = 0;
      windowStart = Date.now();
    }

    if (requestCount >= 13) {
      console.log("GEMINI RATE LIMIT REACHED");

      await chrome.storage.local.set({
        aiDecision: "⚠️ Gemini limit reached. Wait a minute.",
      });

      return;
    }

    requestCount++;

    console.log("Gemini requests this minute:", requestCount);

    decision = await askGemini(data.goal, tab.url, tab.title, settings.apiKey);

    if (decision === "ERROR") {
      await chrome.storage.local.set({
        aiDecision: "⚠️ Gemini API Error",
      });

      console.log("GEMINI ERROR");

      return;
    }

    // cache only valid Gemini decisions
    // Cache only stable websites.
    // Skip dynamic platforms like
    // YouTube and Google.
    if (decision === "RELEVANT" || decision === "DISTRACTION") {
      decisionCache[cacheKey] = decision;

      await chrome.storage.local.set({
        decisionCache,
      });
    }
  }

  console.log("GEMINI:", decision);
  if (
    decision !== "RELEVANT" &&
    decision !== "DISTRACTION" &&
    decision !== "ERROR"
  ) {
    console.log("INVALID GEMINI RESPONSE:", decision);

    await chrome.storage.local.set({
      aiDecision: "⚠️ Invalid Gemini response",
    });

    return;
  }
  console.log("CACHE SIZE:", Object.keys(decisionCache).length);

  await chrome.storage.local.set({
    aiDecision: decision,
  });

  if (shouldBlock(decision)) {
    await blockPage(tabId, tab.url);
  } else {
    await chrome.storage.local.set({
      lastRelevantPage: tab.url,
    });

    console.log("ALLOW WEBSITE");
  }
}

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
    if (shouldIgnore(tab.url)) {
      console.log("IGNORED:", tab.url);
      return;
    }

    // A webpage loads in multiple stages.
    // We only want to run our code after
    // the page has completely loaded.
    if (changeInfo.status !== "complete") return;

    // Wait for YouTube to update its title
    await new Promise((resolve) => setTimeout(resolve, 2000));

    tab = await chrome.tabs.get(tabId);

    // Fetch data stored in Chrome local storage.
    // We need:
    // goal   -> user's current study goal
    // active -> whether focus mode is ON

    // Print the user's goal.
    // Example:
    // "Study Binary Search"
    await analyzeTab(tabId, tab);
  },
);

// Fires when user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);

  await analyzeTab(activeInfo.tabId, tab);
});

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install") {
    await chrome.storage.local.set({
      firstRun: true,
    });

    chrome.tabs.create({
      url: chrome.runtime.getURL("welcome/welcome.html"),
    });
  }
});

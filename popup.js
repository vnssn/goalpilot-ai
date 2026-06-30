// Getting references to all elements

const goalInput = document.getElementById("goal");
const durationInput = document.getElementById("duration");
const geminiInput = document.getElementById("geminiKey");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");

// Load previous saved data from chrome storage
window.addEventListener("load", async () => {
  //fetch prev saved data from chrome local storage
  const data = await chrome.storage.local.get([
    "goal",
    "duration",
    "apiKey",
    "active",
    "currentWebsite",
    "currentTitle",
    "aiDecision",
  ]);

  //if a goal was previously saved, show it inside the textarea

  if (data.goal) goalInput.value = data.goal; // prev goal
  if (data.duration) durationInput.value = data.duration; // prev duration
  if (data.apiKey) geminiInput.value = data.apiKey; //prev gemini key

  // Show current website in popup UI
  // Show only domain name
  if (data.currentWebsite) {
    document.getElementById("website").innerText = new URL(
      data.currentWebsite,
    ).hostname.replace("www.", "");
  }

  // Show current page title in popup UI
  if (data.currentTitle) {
    document.getElementById("content").innerText = data.currentTitle;
  }

  // Show Gemini's latest decision
  if (data.aiDecision) {
    document.getElementById("decision").innerText = data.aiDecision;
  }

  //print all retrieval in console for debugging
  console.log(data);
});

//==============================
// #Start Focus Session button
//=============================

startBtn.addEventListener("click", async () => {
  // Read values entered by the user
  const goal = goalInput.value;
  const duration = durationInput.value;
  const apiKey = geminiInput.value;

  // Save everything into Chrome's local storage
  await chrome.storage.local.set({
    // User's study/work goal
    goal: goal,

    // Session duration selected
    duration: duration,

    // User's Gemini API key
    apiKey: apiKey,

    // Whether focus mode is active
    active: true,

    // Store current timestamp
    // This will be used later to calculate
    // total focus time
    startTime: Date.now(),

    // Number of distractions blocked
    blocked: 0,

    // Total focus time in minutes
    focusTime: 0,
  });

  console.log("Session Started");

  // Show popup message
  //alert("Focus Session Started");
});

// =========================
// Stop Focus Session button
// =========================

stopBtn.addEventListener("click", async () => {
  // Retrieve the stored start time
  const data = await chrome.storage.local.get(["startTime"]);

  // Calculate elapsed milliseconds
  const elapsed = Date.now() - data.startTime;

  // Convert milliseconds to minutes
  const minutes = Math.floor(elapsed / 1000 / 60);

  // Update Chrome storage
  await chrome.storage.local.set({
    // Focus session ended
    active: false,

    // Save total focus time
    focusTime: minutes,
  });
  console.log("Session Stopped");

  // Display total focus time
  //alert(`Focus Time: ${minutes} minutes`);
  console.log(`Focus Time: ${minutes} minutes`);
});

// ==================================
// Real-time UI updates
// ==================================

chrome.storage.onChanged.addListener((changes, area) => {
  // Only listen to local storage changes
  if (area !== "local") return;

  // Website changed
  if (changes.currentWebsite) {
    document.getElementById("website").innerText = new URL(
      changes.currentWebsite.newValue,
    ).hostname.replace("www.", "");
  }

  // Page title changed
  if (changes.currentTitle) {
    document.getElementById("content").innerText =
      changes.currentTitle.newValue;
  }
});

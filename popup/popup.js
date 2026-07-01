// Getting references to all elements

const goalInput = document.getElementById("goal");
const durationInput = document.getElementById("duration");
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const resetBtn = document.getElementById("reset");

// Show only the correct button depending
// on whether a focus session is active
function updateSessionButtons(active) {
  if (active) {
    startBtn.style.display = "none";
    stopBtn.style.display = "block";
  } else {
    startBtn.style.display = "block";
    stopBtn.style.display = "none";
  }
}

function updateSessionInputs(active) {
  goalInput.disabled = active;
  durationInput.disabled = active;
}

// Update focus session status text
function updateStatus(active) {
  const status = document.getElementById("status");

  if (active) {
    // Session running
    status.innerText = "🟢 Focus Mode Active";

    status.style.color = "#22c55e";
  } else {
    // Session paused
    status.innerText = "🟡 Focus Mode Paused";

    status.style.color = "#f59e0b";
  }
}

function updateTimer() {
  setInterval(async () => {
    const data = await chrome.storage.local.get([
      "active",
      "startTime",
      "elapsedTime",
    ]);

    // Don't update if session inactive
    if (!data.active) return;

    // elapsed milliseconds
    const elapsed = (data.elapsedTime || 0) + (Date.now() - data.startTime);

    // convert to seconds
    const seconds = Math.floor(elapsed / 1000);

    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");

    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");

    const secs = String(seconds % 60).padStart(2, "0");

    document.getElementById("timer").innerText = `${hrs}:${mins}:${secs}`;
  }, 1000);
}

// Load previous saved data from chrome storage
window.addEventListener("load", async () => {
  //fetch prev saved data from chrome local storage
  const data = await chrome.storage.local.get([
    "goal",
    "duration",
    "active",
    "elapsedTime",
    "currentWebsite",
    "currentTitle",
    "aiDecision",
  ]);

  // Restore correct button state
  updateSessionButtons(data.active);
  updateSessionInputs(data.active);
  // Restore session status
  updateStatus(data.active);

  // Restore timer when popup opens
  if (data.elapsedTime) {
    const seconds = Math.floor(data.elapsedTime / 1000);

    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");

    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");

    const secs = String(seconds % 60).padStart(2, "0");

    document.getElementById("timer").innerText = `${hrs}:${mins}:${secs}`;
  }

  // Print all retrieved data
  console.log(data);

  //if a goal was previously saved, show it inside the textarea

  if (data.goal) goalInput.value = data.goal; // prev goal

  // Restore current goal
  document.getElementById("current-goal").innerText =
    data.goal || "No active session";
  if (data.duration) durationInput.value = data.duration; // prev duration

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

  updateTimer();
});

//==============================
// #Start Focus Session button
//=============================

startBtn.addEventListener("click", async () => {
  // Read values entered by the user
  const goal = goalInput.value;
  // Show current goal
  document.getElementById("current-goal").innerText = goal;
  const duration = durationInput.value;
  const prev = await chrome.storage.local.get(["elapsedTime"]);

  // Save everything into Chrome's local storage
  await chrome.storage.local.set({
    // User's study/work goal
    goal: goal,

    // Session duration selected
    duration: duration,

    // Whether focus mode is active
    active: true,

    // Store current timestamp
    // This will be used later to calculate
    // total focus time
    startTime: Date.now(),
    elapsedTime: prev.elapsedTime || 0,

    // Number of distractions blocked
    blocked: 0,

    // Total focus time in minutes
    focusTime: 0,
  });

  console.log("Session Started");

  updateSessionButtons(true);
  updateSessionInputs(true);
  // Show active status
  updateStatus(true);

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

  const previous = await chrome.storage.local.get(["elapsedTime"]);

  const totalElapsed = (previous.elapsedTime || 0) + elapsed;

  // Convert milliseconds to minutes
  const minutes = Math.floor(totalElapsed / 1000 / 60);

  // Update Chrome storage
  await chrome.storage.local.set({
    active: false,

    // Save paused timer
    elapsedTime: totalElapsed,

    focusTime: Math.floor(totalElapsed / 1000 / 60),
  });
  console.log("Session Stopped");

  // Display total focus time
  //alert(`Focus Time: ${minutes} minutes`);
  console.log(`Focus Time: ${minutes} minutes`);

  updateSessionButtons(false);
  updateSessionInputs(false);
  // Show paused status
  updateStatus(false);
});

// Reset timer
resetBtn.addEventListener("click", async () => {
  // Show paused status
  updateStatus(false);
  // Clear current goal
  document.getElementById("current-goal").innerText = "No active session";
  await chrome.storage.local.set({
    active: false,
    elapsedTime: 0,
    focusTime: 0,
  });

  document.getElementById("timer").innerText = "00:00:00";
});

// ==================================
// Real-time UI updates
// ==================================

chrome.storage.onChanged.addListener((changes, area) => {
  // Only listen to local storage changes
  if (area !== "local") return;

  // Focus session started/stopped
  if (changes.active) {
    const active = changes.active.newValue;

    updateSessionButtons(active);
    updateSessionInputs(active);

    // Update session status
    updateStatus(active);
  }
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
  // AI decision changed
  if (changes.aiDecision) {
    const decision = document.getElementById("decision");

    decision.innerText = changes.aiDecision.newValue;

    if (changes.aiDecision.newValue.includes("DISTRACTION")) {
      decision.style.color = "#ef4444";
    } else {
      decision.style.color = "#22c55e";
    }
  }
});
// Open GoalPilot settings page
document.getElementById("settings").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

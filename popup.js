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
  ]);

  //if a goal was previously saved, show it inside the textarea

  if (data.goal) goalInput.value = data.goal; // prev goal
  if (data.duration) durationInput.value = data.duration; // prev duration
  if (data.apiKey) geminiInput.value = data.apiKey; //prev gemini key

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

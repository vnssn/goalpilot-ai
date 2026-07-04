window.addEventListener("load", async () => {
  try {
    // Load blocked page data
    const data = await chrome.storage.local.get([
      "blockedGoal",
      "blockedWebsite",
      "blockedDecision",
      "blocked",
    ]);

    console.log("BLOCKED PAGE DATA:", data);

    document.getElementById("goal").innerText =
      data.blockedGoal || "No active goal";

    document.getElementById("website").innerText =
      data.blockedWebsite || "Unknown website";

    document.getElementById("decision").innerText =
      data.blockedDecision || "DISTRACTION";

    document.getElementById("blocked-count").innerText = data.blocked || 0;

    // Go Back
    document.getElementById("backBtn").addEventListener("click", async () => {
      console.log("GO BACK CLICKED");

      const data = await chrome.storage.local.get(["lastRelevantPage"]);

      console.log("LAST RELEVANT:", data.lastRelevantPage);

      if (data.lastRelevantPage) {
        window.location.href = data.lastRelevantPage;
      }
    });

    // Open GoalPilot
    document.getElementById("settingsBtn").addEventListener("click", () => {
      console.log("SETTINGS CLICKED");
      chrome.runtime.openOptionsPage();
    });
  } catch (err) {
    console.error(err);
  }
});

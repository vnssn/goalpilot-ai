// Load settings
window.onload = async () => {
  // Initialize default rules once
  const existing = await chrome.storage.local.get([
    "allowedSites",
    "blockedSites",
  ]);

  if (!existing.allowedSites || existing.allowedSites.length === 0) {
    await chrome.storage.local.set({
      allowedSites: [
        "chatgpt.com",
        "claude.ai",
        "gemini.google.com",
        "github.com",
        "leetcode.com",
        "geeksforgeeks.org",
        "stackoverflow.com",
        "nptel.ac.in",
        "coursera.org",
        "developer.mozilla.org",
      ],
    });
  }

  if (!existing.blockedSites || existing.blockedSites.length === 0) {
    await chrome.storage.local.set({
      blockedSites: [
        "instagram.com",
        "facebook.com",
        "x.com",
        "twitter.com",
        "netflix.com",
        "crunchyroll.com",
        "spotify.com",
        "primevideo.com",
        "hotstar.com",
        "tiktok.com",
      ],
    });
  }

  // Save API key
  document.getElementById("saveApi").addEventListener("click", async () => {
    const apiKey = document.getElementById("apiKey").value.trim();

    if (apiKey.includes("********")) {
      alert("API Key Already Saved");
      return;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Reply with OK",
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        alert("Invalid Gemini API Key");
        return;
      }

      await chrome.storage.local.set({
        apiKey: apiKey,
      });

      alert("API Key Saved Successfully");
    } catch (err) {
      console.error(err);
      alert("Could not verify API key");
    }
  });

  const data = await chrome.storage.local.get([
    "apiKey",
    "allowedSites",
    "blockedSites",
  ]);

  if (data.apiKey) {
    const key = data.apiKey;

    // show first 8 and last 4 chars only
    document.getElementById("apiKey").value =
      key.substring(0, 8) + "****************" + key.substring(key.length - 4);
  }

  if (data.allowedSites)
    document.getElementById("allowed").value = data.allowedSites.join("\n");

  if (data.blockedSites)
    document.getElementById("blocked").value = data.blockedSites.join("\n");

  // Save rules
  document.getElementById("saveRules").addEventListener("click", async () => {
    const allowed = document
      .getElementById("allowed")
      .value.split("\n")
      .filter(Boolean);

    const blocked = document
      .getElementById("blocked")
      .value.split("\n")
      .filter(Boolean);

    await chrome.storage.local.set({
      allowedSites: allowed,

      blockedSites: blocked,
    });

    alert("Rules Saved");
  });
};

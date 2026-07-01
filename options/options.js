// Load settings
window.onload = async () => {
  const data = await chrome.storage.local.get([
    "apiKey",
    "allowedSites",
    "blockedSites",
  ]);

  if (data.apiKey) document.getElementById("apiKey").value = data.apiKey;

  if (data.allowedSites)
    document.getElementById("allowed").value = data.allowedSites.join("\n");

  if (data.blockedSites)
    document.getElementById("blocked").value = data.blockedSites.join("\n");
};

// Save API key
document.getElementById("saveApi").addEventListener("click", async () => {
  await chrome.storage.local.set({
    apiKey: document.getElementById("apiKey").value,
  });

  alert("API Key Saved");
});

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

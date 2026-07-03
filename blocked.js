// Go Back button
document.getElementById("backBtn").addEventListener("click", async () => {
  // Get current tab
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  // Close blocked tab
  await chrome.tabs.remove(tab.id);
});

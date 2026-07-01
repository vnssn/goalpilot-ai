//=====================================
// USER RULE ENGINE
//=====================================

// Check if website is in
// user's allowed list
function isAllowed(website, allowedSites) {
  return allowedSites.some((site) => website.includes(site));
}

// Check if website is in
// user's blocked list
function isBlocked(website, blockedSites) {
  return blockedSites.some((site) => website.includes(site));
}

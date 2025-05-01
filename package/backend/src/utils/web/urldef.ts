// Function to get the URL for the web app
export function getTosUrl() {
  return `${process.env.NET_WEB_PUB}/terms`;
}

// Function to get the URL for the privacy policy
export function getPrivacyUrl() {
  return `${process.env.NET_WEB_PUB}/privacy`;
}

// Function to get the URL for the Birdie logo
export function getLogoUrl() {
  return `${process.env.NET_WEB_PUB}/birdie_logo_text.png`;
}

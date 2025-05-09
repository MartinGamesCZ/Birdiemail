// Declare variables defined by the Electron app
declare const appIsElectron: boolean;
declare const appVersion: string;

declare const ipcRenderer: any;

// Function to check if the app is running in Electron
export const checkAppIsDesktop = () =>
  typeof appIsElectron != "undefined" && !!appIsElectron;

// Function to get the app version
export const getAppVersion = () => appVersion;

// Function to open a link (default browser or Electron)
export const openLink = (url: string) => {
  if (
    checkAppIsDesktop() &&
    localStorage.getItem("openLinksInApp") !== "true"
  ) {
    ipcRenderer.send("open-link", url);
  } else {
    window.open(url, "_blank");
  }
};

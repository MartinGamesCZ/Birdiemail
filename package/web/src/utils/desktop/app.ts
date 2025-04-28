// Declare variables defined by the Electron app
declare const appIsElectron: boolean;
declare const appVersion: string;

// Function to check if the app is running in Electron
export const checkAppIsDesktop = () =>
  typeof appIsElectron != "undefined" && !!appIsElectron;

// Function to get the app version
export const getAppVersion = () => appVersion;

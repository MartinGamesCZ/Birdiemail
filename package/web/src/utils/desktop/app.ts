declare const appIsElectron: boolean;
declare const appVersion: string;

export const checkAppIsDesktop = () => !!appIsElectron;
export const getAppVersion = () => appVersion;

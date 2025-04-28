import { trpc } from "@/server/trpc";
import { checkAppIsDesktop, getAppVersion } from "../desktop/app";

// Function to obtain debug information
export async function getDebugInfo() {
  // Get user information from the server
  const user = await trpc.userRouter.userInfo.query();

  const debugInfo = {
    app: {
      type: checkAppIsDesktop() ? "desktop" : "web",
      version: getAppVersion() ?? "unknown",
      ua: navigator.userAgent,
    },
    service: {
      host: window.location.host,
      pathname: window.location.pathname,
      protocol: window.location.protocol,
    },
    time: {
      datetime: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      offset: new Date().getTimezoneOffset(),
    },
    session: {
      loggedin: (await trpc.userRouter.isLoggedIn.query()).loggedIn,
      mailaccounts: (await trpc.userRouter.getMailAccounts.query()).map(
        (b) => b.id
      ),
      uuid: user.status === "ok" ? user.data.id : null,
    },
  };

  // Return debug information
  return debugInfo;
}

// Function to stringify debug information
export function stringifyDebugInfo(
  data: {
    [key: string]: any;
  },
  indent: number = 0
): string {
  let out = "";

  // Iterate over each key-value pair in the data object
  for (const [key, value] of Object.entries(data)) {
    // Add indentation for nested objects
    out += " ".repeat(indent) + key + ": ";

    // If the value is an object, recursively stringify it
    if (typeof value === "object" && value != null)
      out += "\n" + stringifyDebugInfo(value, indent + 2);
    // If the value is a string / number, add it directly
    else out += value;

    // Add a newline after each key-value pair
    out += "\n";
  }

  // Remove last newline
  if (out.length > 0) out = out.slice(0, -1);

  return out;
}

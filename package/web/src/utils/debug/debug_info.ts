import { trpc } from "@/server/trpc";
import { checkAppIsDesktop, getAppVersion } from "../desktop/app";

export async function getDebugInfo() {
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

  return debugInfo;
}

export function stringifyDebugInfo(
  data: {
    [key: string]: any;
  },
  indent: number = 0
): string {
  let out = "";

  for (const [key, value] of Object.entries(data)) {
    out += " ".repeat(indent) + key + ": ";

    if (typeof value === "object" && value != null)
      out += "\n" + stringifyDebugInfo(value, indent + 2);
    else out += value;

    out += "\n";
  }

  // Remove last newline
  if (out.length > 0) out = out.slice(0, -1);

  return out;
}

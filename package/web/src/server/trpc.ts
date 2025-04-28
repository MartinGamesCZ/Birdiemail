import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "./schema/server";
import { TRPC_URL } from "@/config";
import { getCookie } from "@/utils/cookie";

// Create a TRPC client and connect it to the server
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      async headers() {
        return {
          // Add the session token and encryption key to the headers
          Authorization: (await getCookie("session_token")) ?? "",
          "X-Birdiemail-Encryption-Key":
            (await getCookie("encryption_key")) ?? "",
        };
      },
    }),
  ],
});

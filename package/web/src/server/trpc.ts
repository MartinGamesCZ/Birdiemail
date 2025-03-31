import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "./schema/server";
import { TRPC_URL } from "@/config";
import { getCookie } from "@/utils/cookie";

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: TRPC_URL,
      async headers() {
        return {
          Authorization: (await getCookie("session_token")) ?? "",
        };
      },
    }),
  ],
});

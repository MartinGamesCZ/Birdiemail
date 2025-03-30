export const IS_SSR = process.env.WEB_IS_SSR === "true";

export const TRPC_URL =
  process.env.WEB_TRPC_URL ?? process.env.NEXT_PUBLIC_TRPC_URL!;

export const IS_SSR = process.env.WEB_IS_SSR === "true";
export const IS_DEV = process.env.NODE_ENV === "development";

export const TRPC_URL =
  process.env.WEB_TRPC_URL ?? process.env.NEXT_PUBLIC_TRPC_URL!;

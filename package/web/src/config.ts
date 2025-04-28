// App configuration
export const IS_SSR = process.env.WEB_IS_SSR === "true"; // Check if the app is in SSR mode - next won't expose the env variables client side
export const IS_DEV = process.env.NODE_ENV === "development"; // Check if dev mode
export const TRPC_URL =
  process.env.WEB_TRPC_URL ?? process.env.NEXT_PUBLIC_TRPC_URL!; // Get the trpc url (depending on the CSR/SSR mode)

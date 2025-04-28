import Cookies from "js-cookie";

// Function to get a cookie both on client and server side
export async function getCookie(name: string) {
  // If in browser, use js-cookie to get the cookie
  if (typeof window !== "undefined") return Cookies.get(name);

  // If in server side, use next/headers to get the cookie
  const { cookies } = await import("next/headers");

  try {
    // Get the cookie from the request headers and return its value
    return (await cookies()).get(name)?.value;
  } catch (e) {
    return null;
  }
}

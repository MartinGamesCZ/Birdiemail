import Cookies from "js-cookie";

export async function getCookie(name: string) {
  if (typeof window !== "undefined" && document.cookie)
    return Cookies.get(name);

  const { cookies } = await import("next/headers");

  try {
    return (await cookies()).get(name)?.value;
  } catch (e) {
    return null;
  }
}

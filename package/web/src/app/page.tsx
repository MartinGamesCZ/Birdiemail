import { redirect } from "next/navigation";
import { trpc } from "../server/trpc";

export default async function Page() {
  const data = await trpc.userRouter.isLoggedIn.query();

  if (!data.loggedIn) return redirect("/auth/signin");

  return redirect("/mail");
}

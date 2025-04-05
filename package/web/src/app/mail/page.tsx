import { Mailbox } from "@/types/Mailbox";
import { redirect } from "next/navigation";

export default function Page() {
  redirect(`/mail/${Mailbox.Inbox}`);
}

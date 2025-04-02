import { redirect } from "next/navigation";

export default async function Page(props: {
  params: Promise<{
    mailbox: string;
  }>;
}) {
  const { mailbox } = await props.params;

  redirect(`/mail/${mailbox}/1`);
}

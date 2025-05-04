"use client";

import { Dock } from "@/components/dock";
import { trpc } from "@/server/trpc";
import { useQuery } from "@tanstack/react-query";

export function MailDock(props: { accountId: string; mailbox: string }) {
  const { data: mailboxes, isLoading: mailboxesLoading } = useQuery({
    queryKey: ["mailboxes", props.accountId],
    queryFn: async () =>
      await trpc.mailRouter.getMailboxes.query({
        accountId: props.accountId,
      }),
  });

  const mailbox = mailboxes?.find(
    (m) =>
      m.name === decodeURIComponent(props.mailbox) ||
      m.flags.includes(decodeURIComponent(props.mailbox).replace("@", "\\"))
  );

  return (
    <Dock
      active={
        "/mail/" +
        encodeURIComponent((mailbox?.flags?.[0] ?? "").replace("\\", "@"))
      }
    />
  );
}

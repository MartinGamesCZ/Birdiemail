"use client";

import { trpc } from "@/server/trpc";
import { useQuery } from "@tanstack/react-query";

export function AttachmentContent(props: {
  accountId: string;
  mailbox: string;
  messageId: string;
  attachmentId: string;
}) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["mailMessage", props.accountId, props.mailbox, props.messageId],
    queryFn: async () =>
      await trpc.mailRouter.getMailMessage.query({
        accountId: props.accountId,
        mailbox: props.mailbox,
        messageId: props.messageId,
      }),
    retryDelay: 4000,
  });

  const attachment = data?.files.find(
    (attachment) => attachment.id === props.attachmentId
  );

  if (attachment && attachment.type.startsWith("image/")) {
    return (
      <img
        src={`data:image/png;base64,${attachment.content}`}
        alt={attachment.name}
        width={"100%"}
        height={"100%"}
      />
    );
  }

  if (isLoading) return <p>Loading</p>;

  return <p>Wrong file type lol</p>;
}

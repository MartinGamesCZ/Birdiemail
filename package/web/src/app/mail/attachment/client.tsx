"use client";

import { trpc } from "@/server/trpc";
import { useQuery } from "@tanstack/react-query";

// TODO: Add warning for malware

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

  if (attachment && attachment.type.startsWith("application/pdf")) {
    const blob = new Blob([Buffer.from(attachment.content, "base64")], {
      type: attachment.type,
    });

    const url = URL.createObjectURL(blob);

    return <iframe src={url} width={"100%"} height={"100%"}></iframe>;
  }

  if (isLoading) return <p>Loading</p>;

  return <p>Unknown file type '{attachment?.type}'</p>;
}

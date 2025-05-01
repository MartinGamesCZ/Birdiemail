"use client";

import { Titlebar } from "@/components/desktop/titlebar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/server/trpc";
import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function AttachmentContent(props: {
  accountId: string;
  mailbox: string;
  messageId: string;
  attachmentId: string;
  isDesktop?: boolean;
}) {
  const [warningDismissed, setWarningDismissed] = useState(false);

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

  if (isLoading)
    return (
      <div
        suppressHydrationWarning
        className="flex flex-col items-center h-full"
      >
        {props.isDesktop && <Titlebar minimal title={attachment?.name} />}
        <div className="flex items-center justify-center h-full w-full">
          <Spinner className="h-10 w-10 mt-4" size="lg" />
        </div>
      </div>
    );

  if (!warningDismissed)
    return (
      <div
        suppressHydrationWarning
        className="flex flex-col items-center h-full"
      >
        {props.isDesktop && <Titlebar minimal title={attachment?.name} />}

        <div className="w-2/3 h-full flex flex-col items-center justify-center gap-2">
          <ExclamationTriangleIcon className="h-64 w-64 text-yellow-500" />
          <h1 className="text-3xl font-bold">
            Email attachments can contain malware
          </h1>
          <p className="text-gray-700 text-2xl">
            Please be careful when opening email attachments. If you don't trust
            the sender, do not open the attachment. If the sender is malicious,
            he could potentially infect your computer with malware.
          </p>
          <div className="flex flex-row gap-2 mt-4">
            <Button
              variant="ghost"
              size="xl"
              onClick={() => {
                window.close();
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="xl"
              className="bg-yellow-500 text-white hover:bg-yellow-600"
              onClick={() => {
                setWarningDismissed(true);
              }}
            >
              Open attachment
            </Button>
          </div>
        </div>
      </div>
    );

  if (attachment && attachment.type.startsWith("image/")) {
    return (
      <div
        suppressHydrationWarning
        className="flex flex-col items-center h-full"
      >
        {props.isDesktop && <Titlebar minimal title={attachment.name} />}
        <img
          src={`data:image/png;base64,${attachment.content}`}
          alt={attachment.name}
          width={"100%"}
          height={"100%"}
        />
      </div>
    );
  }

  if (attachment && attachment.type.startsWith("application/pdf")) {
    const blob = new Blob([Buffer.from(attachment.content, "base64")], {
      type: attachment.type,
    });

    const url = URL.createObjectURL(blob);

    return (
      <div
        suppressHydrationWarning
        className="flex flex-col items-center h-full"
      >
        {props.isDesktop && <Titlebar minimal title={attachment.name} />}
        <iframe src={url} width={"100%"} height={"100%"}></iframe>
      </div>
    );
  }

  return (
    <div suppressHydrationWarning className="flex flex-col items-center h-full">
      {props.isDesktop && <Titlebar minimal title={attachment?.name} />}
      <p>Attachment type not supported</p>
    </div>
  );
}

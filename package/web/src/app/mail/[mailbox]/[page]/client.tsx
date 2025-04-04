"use client";

import { Mailview } from "@/components/mailview";
import { Avatar } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/server/trpc";
import { formatMailDate } from "@/utils/dateparser";
import { dataTagSymbol, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function MailMessage(props: {
  messageId: string;
  accountId: string;
  mailbox: string;
}) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["mailMessage", props.accountId, props.mailbox, props.messageId],
    queryFn: async () =>
      await trpc.mailRouter.getMailMessage.query({
        accountId: props.accountId,
        mailbox: props.mailbox,
        messageId: props.messageId,
      }),
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!data) return;
    if (data.flags.includes("\\Seen")) return;

    trpc.mailRouter.addMailMessageFlag
      .mutate({
        accountId: props.accountId,
        mailbox: props.mailbox,
        messageId: props.messageId,
        flag: "\\Seen",
      })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["mailbox", props.accountId, props.mailbox],
        });
      });
  }, [data]);

  return isLoading || !data ? (
    <Spinner fullScreen color="primary" size="lg" />
  ) : (
    <div className="w-full h-full overflow-y-auto">
      <h2 className="text-2xl font-semibold">{data.subject}</h2>
      <div className="flex gap-4 items-center mt-4 mb-4 mr-8 ">
        <Avatar
          name={
            data.sender.name?.length > 0 ? data.sender.name : data.sender.email
          }
          size="lg"
        />
        <div className="flex-1 min-w-0 items-center">
          <h2 className="text-lg font-semibold truncate leading-xs">
            {data.sender.name}
          </h2>
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate mt-[-5px]">
              {data.sender.email}
            </p>
            <p
              className="text-xs text-gray-500 flex-shrink-0 ml-2"
              suppressHydrationWarning
            >
              {formatMailDate(data.date)}
            </p>
          </div>
        </div>
      </div>
      <Mailview body={data.body} />
    </div>
  );
}

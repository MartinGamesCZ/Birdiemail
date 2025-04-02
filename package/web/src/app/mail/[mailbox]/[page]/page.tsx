import { Dock } from "@/components/dock";
import Mailbox from "@/components/mailbox";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/server/trpc";
import { getCookie } from "@/utils/cookie";
import { Letter } from "react-letter";
import { Mailview } from "@/components/mailview";
import { Avatar } from "@/components/ui/avatar";
import { formatMailDate } from "@/utils/dateparser";

export default async function Page(props: {
  params: Promise<{
    mailbox: string;
    page: string;
  }>;
  searchParams: Promise<{
    messageId: string;
  }>;
}) {
  const { mailbox, page } = await props.params;
  const { messageId } = await props.searchParams;

  const data = await trpc.mailRouter.getMail.query({
    accountId: (await getCookie("current_account_id")) || "",
    mailbox,
    page: Number(page),
  });

  const mailAccounts = await trpc.userRouter.getMailAccounts.query();

  const message = messageId
    ? await trpc.mailRouter.getMailMessage.query({
        accountId: (await getCookie("current_account_id")) || "",
        mailbox,
        messageId,
      })
    : null;

  return (
    <div className="w-full h-full flex flex-row gap-5 p-5 bg-gray-50 dark:bg-gray-900">
      <Dock />
      <Mailbox
        boxId={mailbox}
        page={page}
        messages={data.data}
        accounts={mailAccounts}
        messageId={messageId}
      />
      <Card className="flex-1 p-0">
        <CardContent className="h-[calc(100%)]">
          {message ? (
            <div className="w-full h-full overflow-y-auto">
              <h2 className="text-2xl font-semibold">{message.subject}</h2>
              <div className="flex gap-4 items-center mt-4 mb-4 mr-8 ">
                <Avatar
                  name={
                    message.sender.name?.length > 0
                      ? message.sender.name
                      : message.sender.email
                  }
                  size="lg"
                />
                <div className="flex-1 min-w-0 items-center">
                  <h2 className="text-lg font-semibold truncate leading-none">
                    {message.sender.name}
                  </h2>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                      {message.sender.email}
                    </p>
                    <p
                      className="text-xs text-gray-500 flex-shrink-0 ml-2"
                      suppressHydrationWarning
                    >
                      {formatMailDate(message.date)}
                    </p>
                  </div>
                </div>
              </div>
              <Mailview body={message.body} />
            </div>
          ) : (
            <div className="text-gray-500 dark:text-gray-400 text-center mt-40">
              Select a message to view its contents
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

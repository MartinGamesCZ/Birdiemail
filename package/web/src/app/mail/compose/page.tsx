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
import Link from "next/link";
import MailCompose from "@/components/mailcompose";

export default async function Page(props: {
  searchParams: Promise<{
    messageId: string;
  }>;
}) {
  const { messageId } = await props.searchParams;

  const mailAccounts = await trpc.userRouter.getMailAccounts.query();

  if (mailAccounts.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-5">
        <Card className="max-w-md w-full">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-center">
              Welcome to Birdiemail
            </h2>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              No mail accounts have been added yet. Add your first account to
              get started.
            </p>
            <Button className="mt-2" variant="primary">
              <Link href="/user/accounts/setup">Add Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const accountId =
    ((await getCookie("current_account_id")) || mailAccounts[0]?.id) ?? "";

  return (
    <div className="w-full h-full flex flex-row gap-5 p-5 bg-gray-50 dark:bg-gray-900">
      <Dock active={"/mail/compose"} />
      <MailCompose accounts={mailAccounts} currentAccountId={accountId} />
    </div>
  );
}

import { trpc } from "@/server/trpc";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    accountId: string;
    mailbox: string;
    messageId: string;
  }>;
}) {
  const { accountId, mailbox, messageId } = await searchParams;

  const msg = await trpc.mailRouter.getRawMailMessage.query({
    accountId,
    mailbox,
    messageId,
  });

  if (!msg) {
    return (
      <div>
        <h1>Raw Email</h1>
        <p>Failed to load email</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-y-auto p-4">
      <h1 className="text-3xl mb-4">Raw Email</h1>
      <pre className="p-4 border border-gray-400 rounded-lg bg-gray-100 break-words">
        <code className="whitespace-pre-wrap">{msg}</code>
      </pre>
    </div>
  );
}

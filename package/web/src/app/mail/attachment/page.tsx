import { getCookie } from "@/utils/cookie";
import { AttachmentContent } from "./client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    boxId: string;
    messageId: string;
    attachmentId: string;
  }>;
}) {
  const { boxId, messageId, attachmentId } = await searchParams;

  return (
    <AttachmentContent
      accountId={(await getCookie("current_account_id")) ?? ""}
      mailbox={boxId}
      messageId={messageId}
      attachmentId={attachmentId}
    />
  );
}

import { getCookie } from "@/utils/cookie";
import { AttachmentContent } from "./client";
import { Titlebar } from "@/components/desktop/titlebar";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    boxId: string;
    messageId: string;
    attachmentId: string;
    isDesktop?: string;
  }>;
}) {
  const { boxId, messageId, attachmentId, isDesktop } = await searchParams;

  return (
    <AttachmentContent
      accountId={(await getCookie("current_account_id")) ?? ""}
      mailbox={boxId}
      messageId={messageId}
      attachmentId={attachmentId}
      isDesktop={isDesktop === "true"}
    />
  );
}

"use client";

import { useState, useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  XMarkIcon,
  PaperClipIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { RichTextEditor } from "./ui/rich-text-editor";
import { Avatar } from "./ui/avatar";
import { cn } from "@/lib/utils";
import { trpc } from "@/server/trpc";
import { Spinner } from "./ui/spinner";
import { useRouter } from "next/navigation";

// TODO: Add contact integration
// TODO: Fix multi-recipient input
interface MailComposeProps {
  onSend?: (data: {
    to: string[];
    cc: string[];
    bcc: string[];
    subject: string;
    body: string;
    attachments: File[];
  }) => void;
  onDiscard?: () => void;
  defaultTo?: string[];
  defaultSubject?: string;
  defaultBody?: string;
  accounts?: {
    id: string;
    email: string;
    name?: string;
  }[];
  currentAccountId?: string;
}

// TODO: Fix mail rendering for forwarding
// TODO: Injection security testing!!! (should sandbox if possible)
// TODO: Add proper headers when forwarding
export default function MailCompose({
  defaultTo = [],
  defaultSubject = "",
  defaultBody = "",
  accounts = [],
  currentAccountId = "",
}: MailComposeProps) {
  const [to, setTo] = useState<string[]>(defaultTo);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    if (typeof window == "undefined") return;

    const urlParams = new URL(location.href).searchParams;

    const pTo = urlParams.get("to");
    const pAction = urlParams.get("action");
    const pSourceMessageId = urlParams.get("src-msg-id");
    const pSourceMessageMailbox = urlParams.get("src-msg-mbox");

    (async () => {
      if (pTo) setTo(pTo.split(",").map((email) => email.trim()));

      if (pSourceMessageId && pSourceMessageMailbox) {
        const message = await trpc.mailRouter.getMailMessage.query({
          accountId: currentAccountId,
          mailbox: pSourceMessageMailbox,
          messageId: pSourceMessageId,
        });

        setSubject(`Fwd: ${message.subject}`);
        setBody(
          [
            `-------------- Forwarded message --------------`,
            `From: ${message.sender.name} (${message.sender.email})`,
            `To: ${to.join(", ")}`,
            `Subject: ${message.subject}`,
            `Date: ${new Date(message.date).toLocaleString()}`,
            ``,
            message.body,
          ].join("<br />")
        );
      }
    })();
  }, []);

  const currentAccount =
    accounts.find((account) => account.id === currentAccountId) || accounts[0];

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Added file");
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleRecipientChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    // Split by comma and clean up whitespace
    const recipients = value
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email);
    setter(recipients);
  };

  const handleSend = async () => {
    try {
      setIsSending(true);

      const files: {
        name: string;
        content: string;
      }[] = [];

      for (const file of attachments) {
        const reader = new FileReader();

        reader.readAsDataURL(file);

        await new Promise<void>((r) => {
          reader.onload = () => {
            files.push({
              name: file.name,
              content: reader.result as string,
            });

            r();
          };
        });
      }

      await trpc.mailRouter.sendMailMessage.mutate({
        accountId: currentAccountId,
        data: {
          to: to.join(", "),
          cc: cc.join(", "),
          bcc: bcc.join(", "),
          subject,
          body,
          attachments: files,
        },
      });

      router.back();
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className="px-7 py-5 gap-4 h-full flex flex-1 flex-col">
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-2 w-full">
          <h1 className="text-2xl font-semibold">Compose</h1>

          <div className="flex items-center gap-2 w-full mb-2">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-300">
              From:
            </div>
            <div className="flex items-center gap-2">
              <Avatar
                name={currentAccount?.name || currentAccount?.email}
                size="sm"
              />
              <span>{currentAccount?.name || currentAccount?.email}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-300">
              To:
            </div>
            <Input
              className="flex-1"
              value={to.join(", ")}
              onChange={(e) => handleRecipientChange(e.target.value, setTo)}
              placeholder="recipient@example.com"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCcBcc(!showCcBcc)}
              className="text-gray-500"
            >
              {showCcBcc ? (
                <ChevronUpIcon className="w-4 h-4 mr-1" />
              ) : (
                <ChevronDownIcon className="w-4 h-4 mr-1" />
              )}
              {showCcBcc ? "Hide" : "Cc/Bcc"}
            </Button>
          </div>

          {showCcBcc && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-20 text-sm text-gray-600 dark:text-gray-300">
                  Cc:
                </div>
                <Input
                  className="flex-1"
                  value={cc.join(", ")}
                  onChange={(e) => handleRecipientChange(e.target.value, setCc)}
                  placeholder="cc@example.com"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="w-20 text-sm text-gray-600 dark:text-gray-300">
                  Bcc:
                </div>
                <Input
                  className="flex-1"
                  value={bcc.join(", ")}
                  onChange={(e) =>
                    handleRecipientChange(e.target.value, setBcc)
                  }
                  placeholder="bcc@example.com"
                />
              </div>
            </>
          )}

          <div className="flex items-center gap-2 w-full">
            <div className="w-20 text-sm text-gray-600 dark:text-gray-300">
              Subject:
            </div>
            <Input
              className="flex-1"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject"
            />
          </div>

          <div className="flex-1 flex w-full">
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Write your message here..."
              className="w-full h-full flex-1"
              minHeight="200px"
            />
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Attachments:
              </div>
              <div className="flex flex-wrap gap-2">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-md py-1 px-3"
                  >
                    <span className="text-sm truncate max-w-[150px]">
                      {file.name}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => removeAttachment(index)}
                    >
                      <XMarkIcon className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-between mt-4">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                multiple
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleAttachmentClick}
                className="flex items-center gap-1"
                disabled={isSending}
              >
                <PaperClipIcon className="h-4 w-4" />
                Attach
              </Button>
            </div>
            <Button
              onClick={handleSend}
              className={cn(
                "bg-blue-600 hover:bg-blue-700 text-white",
                !to.length && "opacity-50 cursor-not-allowed"
              )}
              disabled={!to.length || isSending}
            >
              {isSending ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
              )}
              {isSending ? "Sending..." : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

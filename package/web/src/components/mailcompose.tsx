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

// Mail compose component properties interface
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

// Mail message compose component
export default function MailCompose({
  defaultTo = [],
  defaultSubject = "",
  defaultBody = "",
  accounts = [],
  currentAccountId = "",
}: MailComposeProps) {
  // State variables for the mail compose component
  const [to, setTo] = useState<string[]>(defaultTo);
  const [cc, setCc] = useState<string[]>([]);
  const [bcc, setBcc] = useState<string[]>([]);
  const [subject, setSubject] = useState(defaultSubject);
  const [body, setBody] = useState(defaultBody);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use next router for navigation
  const router = useRouter();

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window == "undefined") return;

    // Get url search parameters
    const urlParams = new URL(location.href).searchParams;

    // Extract parameters from the URL (used for forwarding/replying)
    const paramTo = urlParams.get("to");
    const paramAction = urlParams.get("action");
    const paramSourceMessageId = urlParams.get("src-msg-id");
    const paramSourceMessageMailbox = urlParams.get("src-msg-mbox");

    (async () => {
      // If there is a recipient set in the params, set it
      if (paramTo) setTo(paramTo.split(",").map((email) => email.trim()));

      // If there is a source message ID and mailbox, fetch the message
      if (paramSourceMessageId && paramSourceMessageMailbox) {
        // Fetch the message from the server
        const message = await trpc.mailRouter.getMailMessage.query({
          accountId: currentAccountId,
          mailbox: paramSourceMessageMailbox,
          messageId: paramSourceMessageId,
        });

        if (paramAction === "forward") {
          // If the action is forwarding, set the subject, body and headers
          setSubject(`Fwd: ${message.subject}`);
          setBody(
            [
              `---------- Forwarded message ---------`,
              `From: ${message.sender.name} (${message.sender.email})`,
              `To: ${to.join(", ")}`,
              `Subject: ${message.subject}`,
              `Date: ${new Date(message.date).toLocaleString()}`,
              ``,
              message.body,
            ].join("<br />")
          );
          setHeaders({
            // Add the original message to reference and reply headers
            References: (message.headers as any)["Message-ID"],
            "In-Reply-To": (message.headers as any)["Message-ID"],
          });
        }

        if (paramAction == "reply") {
          // If the action is replying, set the subject, body and headers
          setSubject(`Re: ${message.subject}`);
          setTo(
            (
              (message.headers as any)["Reply-To"] || message.sender.email
            ).split(",")
          );
          setHeaders({
            // Set the reference header as in the original message (with fallback to the original message)
            // and the reply header to the original message
            References:
              (message.headers as any)["References"] ??
              (message.headers as any)["Message-ID"],
            "In-Reply-To": (message.headers as any)["Message-ID"],
          });
        }
      }
    })();
  }, []);

  // Get the current account from the list of accounts
  const currentAccount =
    accounts.find((account) => account.id === currentAccountId) || accounts[0];

  // Function to handle file input click
  const handleAttachmentClick = () => {
    // Open the file input dialog
    fileInputRef.current?.click();
  };

  // Function to handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Add the selected files to the attachments state
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  // Function to remove an attachment from the attachments state
  const removeAttachment = (index: number) => {
    // Remove the attachment at the specified index
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Function to handle recipient input change
  // TODO: Fix multi-recipient input
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

  // Function to handle sending the email
  const handleSend = async () => {
    try {
      // Set loading state
      setIsSending(true);

      const files: {
        name: string;
        content: string;
      }[] = [];

      // Iterate over the attachments
      for (const file of attachments) {
        const reader = new FileReader();

        // Read the file as a data URL
        reader.readAsDataURL(file);

        await new Promise<void>((r) => {
          reader.onload = () => {
            // Push the file name and content (base64) to the files array
            files.push({
              name: file.name,
              content: reader.result as string,
            });

            r();
          };
        });
      }

      // Send the data to the server
      await trpc.mailRouter.sendMailMessage.mutate({
        accountId: currentAccountId,
        data: {
          to: to.join(", "),
          cc: cc.join(", "),
          bcc: bcc.join(", "),
          subject,
          body,
          attachments: files,
          headers: headers,
        },
      });

      // Go back to the previous page
      router.back();
    } catch (error) {
      console.error("Failed to send email:", error);
    } finally {
      // Reset the loading state
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

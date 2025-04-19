"use client";

import { Mailview } from "@/components/mailview";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/server/trpc";
import { Mailbox } from "@/types/Mailbox";
import { MailFlag } from "@/types/MailFlag";
import { formatMailDate } from "@/utils/dateparser";
import {
  ArrowDownLeftIcon,
  ArrowTurnLeftUpIcon,
  ArrowTurnUpLeftIcon,
  ArrowTurnUpRightIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  ForwardIcon,
  StarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, createElement } from "react";
import { createPortal } from "react-dom";

function MailToolbar(props: {
  accountId: string;
  mailbox: string;
  messageId: string;
  message: {
    date: string;
    id: string;
    subject: string;
    sender: {
      name: string;
      email: string;
    };
    body: string;
    flags: string[];
  };
}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const queryClient = useQueryClient();
  const router = useRouter();

  const handleAction = async (id: string, actionFn: () => Promise<any>) => {
    if (loadingActions[id]) return;

    setLoadingActions((prev) => ({ ...prev, [id]: true }));
    try {
      await actionFn();
    } catch (error) {
      console.error(`Failed to execute ${id} action:`, error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [id]: false }));
    }
  };

  // TODO: Add message actions into mailbox list
  const toolbarItems = [
    {
      id: "reply",
      icon: ArrowTurnUpLeftIcon,
      label: loadingActions.reply ? "Loading..." : "Reply",
      onClick: () =>
        handleAction("reply", async () => {
          // TODO
          alert("Work in progress");
        }),
      disabled: loadingActions.reply,
    },
    {
      id: "forward",
      icon: ArrowTurnUpRightIcon,
      label: loadingActions.forward ? "Loading..." : "Forward",
      onClick: () =>
        handleAction("forward", async () => {
          router.push(
            `/mail/compose?action=forward&src-msg-id=${props.messageId}&src-msg-mbox=${props.mailbox}`
          );
        }),
      disabled: loadingActions.forward,
    },
    { id: "divider1", type: "divider" },
    {
      id: "star",
      icon: props.message.flags.includes(MailFlag.Flagged)
        ? StarIconSolid
        : StarIcon,
      label: loadingActions.star ? "Loading..." : "Star",
      onClick: () =>
        handleAction("star", async () => {
          const willBeRemoved = props.message.flags.includes(MailFlag.Flagged);

          if (willBeRemoved)
            await await trpc.mailRouter.removeMailMessageFlag.mutate({
              flag: MailFlag.Flagged,
              messageId: props.messageId,
              mailbox: props.mailbox,
              accountId: props.accountId,
            });
          else
            await trpc.mailRouter.addMailMessageFlag.mutate({
              flag: MailFlag.Flagged,
              messageId: props.messageId,
              mailbox: props.mailbox,
              accountId: props.accountId,
            });

          queryClient.refetchQueries({
            queryKey: ["mailbox", props.accountId, props.mailbox],
          });

          if (
            willBeRemoved &&
            props.mailbox == encodeURIComponent(Mailbox.Flagged)
          ) {
            const newUrl = new URL(location.href);
            newUrl.searchParams.delete("messageId");

            router.push(newUrl.href);
          } else
            await queryClient.refetchQueries({
              queryKey: ["mailMessage", props.accountId, props.mailbox],
            });
        }),
      disabled: loadingActions.star,
    },
    {
      id: "mark-unread",
      icon: EnvelopeIcon,
      label: loadingActions["mark-unread"] ? "Loading..." : "Mark as unread",
      onClick: () =>
        handleAction("mark-unread", async () => {
          await trpc.mailRouter.removeMailMessageFlag.mutate({
            flag: MailFlag.Seen,
            messageId: props.messageId,
            mailbox: props.mailbox,
            accountId: props.accountId,
          });

          queryClient.refetchQueries({
            queryKey: ["mailbox", props.accountId, props.mailbox],
          });

          const newUrl = new URL(location.href);
          newUrl.searchParams.delete("messageId");

          router.push(newUrl.href);
        }),
      disabled: loadingActions["mark-unread"],
    },
    {
      id: "report",
      icon: ExclamationTriangleIcon,
      label: loadingActions.report ? "Loading..." : "Report",
      onClick: () =>
        handleAction("report", async () => {
          // TODO
          alert("Work in progress");
        }),
      disabled: loadingActions.report,
    },
    { id: "divider2", type: "divider" },
    {
      id: "delete",
      icon: TrashIcon,
      label: loadingActions.delete ? "Deleting..." : "Delete",
      className: "text-red-500",
      onClick: () =>
        handleAction("delete", async () => {
          await trpc.mailRouter.moveMailMessage.mutate({
            destination: "[Gmail]/Koš",
            messageId: props.messageId,
            mailbox: props.mailbox,
            accountId: props.accountId,
          });

          queryClient.refetchQueries({
            queryKey: ["mailbox", props.accountId, props.mailbox],
          });

          const newUrl = new URL(location.href);
          newUrl.searchParams.delete("messageId");

          router.push(newUrl.href);
        }),
      buttonClassName: `hover:bg-red-100 dark:hover:bg-red-900/20 ${
        loadingActions.delete ? "opacity-70 cursor-not-allowed" : ""
      }`,
      disabled: loadingActions.delete,
    },
  ];

  const handleMouseEnter = (id: string) => {
    const buttonElement = buttonRefs.current[id];
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      setTooltipPosition({
        left: rect.left + rect.width / 2,
        top: rect.bottom + 10,
      });
      setHoveredItem(id);
    }
  };

  return (
    <div className="mr-4 flex flex-row items-center px-1 py-2 mb-4 bg-gray-50 dark:bg-gray-800/40 rounded-md">
      {toolbarItems.map((item) =>
        item.type === "divider" ? (
          <div
            key={item.id}
            className="w-[1px] h-5 bg-gray-300 dark:bg-gray-700 mx-2"
          />
        ) : (
          <div key={item.id} className="relative">
            <Button
              variant="ghost"
              size="icon"
              ref={(el) => (buttonRefs.current[item.id] = el) as any}
              onMouseEnter={() => handleMouseEnter(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={item.buttonClassName}
              onClick={item.onClick}
              disabled={item.disabled}
            >
              {item.icon &&
                createElement(item.icon, {
                  className: `w-5 h-5 ${item.className || ""}`,
                })}
              {loadingActions[item.id] && (
                <Spinner size="sm" className="ml-1" color="primary" />
              )}
            </Button>
          </div>
        )
      )}

      {typeof document !== "undefined" &&
        hoveredItem &&
        createPortal(
          <div
            className="fixed bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap z-50 shadow-lg transform -translate-x-1/2"
            style={{
              top: `${tooltipPosition.top}px`,
              left: `${tooltipPosition.left}px`,
            }}
          >
            {toolbarItems.find((item) => item.id === hoveredItem)?.label}
          </div>,
          document.body
        )}
    </div>
  );
}

export function MailMessage(props: {
  messageId: string;
  accountId: string;
  mailbox: string;
  isInChain?: boolean;
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

  const reference = (data?.headers as Record<string, any>)?.[
    "In-Reply-To"
  ] as string;

  const { data: referenceData } = useQuery({
    queryKey: ["mailMessage", props.accountId, props.mailbox, reference],
    queryFn: async () =>
      await trpc.mailRouter.getMailMessage.query({
        accountId: props.accountId,
        mailbox: props.mailbox,
        messageId: reference!,
      }),
    enabled: !!reference,
    retryDelay: 4000,
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!data) return;
    if (data.flags.includes(MailFlag.Seen)) return;

    trpc.mailRouter.addMailMessageFlag
      .mutate({
        accountId: props.accountId,
        mailbox: props.mailbox,
        messageId: props.messageId,
        flag: MailFlag.Seen,
      })
      .then(() => {
        queryClient.invalidateQueries({
          queryKey: ["mailbox", props.accountId, props.mailbox],
        });
      });
  }, [data]);

  let body =
    data?.body.split("---------- Forwarded message ---------")?.[0] ?? "";

  if (data?.subject.includes("Re:"))
    body =
      data?.body.split(
        `<div class="gmail_quote gmail_quote_container">`
      )?.[0] ?? "";

  console.log(data?.headers);

  return isLoading || !data ? (
    <Spinner fullScreen color="primary" size="lg" />
  ) : (
    <div className="w-full h-full overflow-y-auto">
      <h2 className="text-2xl font-semibold">{data.subject}</h2>
      <div className="flex gap-4 items-center mt-4 mb-2 mr-4">
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

      {!props.isInChain && <MailToolbar {...props} message={data} />}
      {data?.preview.split("---------- Forwarded message ---------")[0].trim()
        .length > 0 && <Mailview body={body ?? ""} />}

      {reference && referenceData && (
        <div className="mt-4 w-full">
          <h2 className="w-full">
            <span className="border-b border-gray-300 w-full flex relative mb-3 mt-5">
              <p className="absolute text-sm bg-white translate-y-[-50%] translate-x-[-50%] left-1/2 text-gray-500 dark:text-gray-400 px-3">
                {data.subject.startsWith("Fwd:") ? "Forwarded" : "In reply to"}
              </p>
            </span>
          </h2>
          <MailMessage
            messageId={reference}
            accountId={props.accountId}
            mailbox={props.mailbox}
            isInChain={true}
          />
        </div>
      )}
    </div>
  );
}

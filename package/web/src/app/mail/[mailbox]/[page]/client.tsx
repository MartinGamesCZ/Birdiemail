"use client";

import { Mailview } from "@/components/mailview";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { trpc } from "@/server/trpc";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, createElement } from "react";
import { createPortal } from "react-dom";

function MailToolbar(props: {
  accountId: string;
  mailbox: string;
  messageId: string;
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
          // TODO
          alert("Work in progress");
        }),
      disabled: loadingActions.forward,
    },
    { id: "divider1", type: "divider" },
    {
      id: "star",
      icon: StarIcon,
      label: loadingActions.star ? "Loading..." : "Star",
      onClick: () =>
        handleAction("star", async () => {
          // TODO
          alert("Work in progress");
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

      <MailToolbar {...props} />
      <Mailview body={data.body} />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  ChevronDownIcon,
  PlusIcon,
  StarIcon,
  DocumentTextIcon,
  PaperClipIcon,
  ArrowTurnUpLeftIcon,
  ArrowTurnUpRightIcon,
  EnvelopeIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { formatMailDate } from "@/utils/dateparser";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { getCookie } from "@/utils/cookie";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { Pagination } from "./ui/pagination";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { trpc } from "@/server/trpc";
import { Spinner } from "./ui/spinner";
import { MailFlag } from "@/types/MailFlag";

// Account type definition
export type Account = {
  id: string;
  email: string;
  name?: string;
};

// Mailbox component
// This component displays a list of emails in a mailbox and allows the user to perform actions on them
export default function Mailbox(props: {
  accounts: Account[];
  boxId: string;
  page: string;
  messageId: string;
  currentAccount: string;
}) {
  // Query to fetch emails from the server
  const {
    data: messages,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["mailbox", props.currentAccount, props.boxId, props.page],
    queryFn: async () =>
      await trpc.mailRouter.getMail.query({
        accountId: props.currentAccount,
        mailbox: props.boxId,
        page: Number(props.page),
      }),
    retryDelay: 4000,
    refetchOnWindowFocus: true,
    refetchInterval: 60000,
  });

  // State to manage the currently selected account
  const [currentAccount, setCurrentAccount] = useState<Account>(
    props.accounts.find((account) => account.id === props.currentAccount) ||
      ({} as Account)
  );

  // Use next router for navigation
  const router = useRouter();

  // Query client for query manipulation
  const queryClient = useQueryClient();

  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>(
    {}
  );

  // Function to handle account change
  const handleAccountChange = (account: Account) => {
    // Update the current account state
    setCurrentAccount(account);

    // Save the current account in cookie
    Cookies.set("current_account_id", account.id, {
      expires: 30,
      path: "/",
    });

    // Remove messageId search param
    const url = new URL(window.location.href);
    url.searchParams.delete("messageId");

    // Redirect to the mailbox page of the selected account (close the message)
    router.push(url.toString());
  };

  // Function to handle actions like reply, forward, etc.
  const handleAction = async (
    messageId: string,
    actionId: string,
    actionFn: () => Promise<any>
  ) => {
    // Check if the action is already being executed
    if (loadingActions[`${messageId}-${actionId}`]) return;

    // Set loading state for the action
    setLoadingActions((prev) => ({
      ...prev,
      [`${messageId}-${actionId}`]: true,
    }));

    try {
      // Execute the action function
      await actionFn();
    } catch (error) {
      console.error(`Failed to execute ${actionId} action:`, error);
    } finally {
      // Reset loading state for the action
      setLoadingActions((prev) => ({
        ...prev,
        [`${messageId}-${actionId}`]: false,
      }));
    }
  };

  // Function to handle refresh action
  const handleRefresh = () => {
    // Invalidate the mailbox query to force refetch of the data
    queryClient.refetchQueries({
      queryKey: ["mailbox", props.currentAccount, props.boxId, props.page],
    });
  };

  useEffect(() => {
    // Only run this effect on the client side
    if (typeof window === "undefined") return;

    // Use default account if no account is selected
    if (!Cookies.get("current_account_id")) {
      handleAccountChange(props.accounts[0]);
    }
  }, [props.accounts]);

  return (
    <Card className="px-7 py-5 gap-4 w-1/3 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          <AccountSelector
            accounts={props.accounts}
            currentAccount={currentAccount}
            handleAccountChange={handleAccountChange}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <ArrowPathIcon
              className={cn(
                "w-5 h-5 text-gray-500",
                isFetching && "animate-spin"
              )}
              onClick={handleRefresh}
            />
          </Button>
          {/*<Button variant="ghost" size="icon">
            <ClockIcon className="w-5 h-5 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
          </Button>*/}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 w-full h-full pb-2 overflow-y-auto pr-2">
          {isLoading ? (
            <Spinner fullScreen color="primary" size="lg" />
          ) : (
            messages!.data.map((message, i) => {
              router.prefetch(
                `/mail/${props.boxId}/${props.page}?messageId=${message.id}`
              );

              return (
                <Mail
                  key={i}
                  message={message}
                  boxId={props.boxId}
                  page={props.page}
                  messageId={props.messageId}
                  currentAccount={currentAccount.id}
                  loadingActions={loadingActions}
                  setLoadingActions={setLoadingActions}
                  handleAction={handleAction}
                />
              );
            })
          )}
          <Pagination
            currentPage={Number(props.page)}
            totalPages={Number(messages?.meta.totalPages ?? 0)}
            baseUrl={`/mail/${props.boxId}`}
          />
        </div>
      </div>
    </Card>
  );
}

// TODO: Extract component for a mail action and move loading state to it
// TODO: Add list of actions shared with the mailbox toolbar
function Mail(props: {
  message: any;
  boxId: string;
  page: string;
  messageId: string;
  currentAccount: string;
  loadingActions: Record<string, boolean>;
  setLoadingActions: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >;
  handleAction: (
    messageId: string,
    actionId: string,
    actionFn: () => Promise<any>
  ) => void;
}) {
  // Use next router for navigation
  const router = useRouter();

  // Query client for query manipulation
  const queryClient = useQueryClient();

  return (
    <div className="cursor-pointer rounded-xl overflow-hidden flex-shrink-0">
      <Card
        className={cn(
          "transition-all duration-200 overflow-hidden relative",
          props.messageId == props.message.id
            ? "border border-blue-400 bg-blue-50 shadow-md dark:border-blue-900 dark:bg-blue-900/20"
            : props.message.flags.includes(MailFlag.Seen)
            ? "border border-gray-200 hover:border-gray-300 dark:border-gray-700/40 dark:hover:bg-gray-900/10"
            : "border border-gray-200 hover:border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 shadow-sm"
        )}
        noBorderStyling
        onClick={() =>
          router.push(
            `/mail/${props.boxId}/${props.page}?messageId=${props.message.id}`
          )
        }
      >
        {!props.message.flags.includes(MailFlag.Seen) && (
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500"></div>
        )}
        <CardContent className="gap-3 flex flex-col p-4 min-h-[120px]">
          <div className="flex gap-4 items-start">
            <Avatar
              name={
                props.message.sender.name?.length > 0
                  ? props.message.sender.internal?.name ??
                    props.message.sender.name
                  : props.message.sender.email
              }
              size="lg"
              active={props.messageId == props.message.id}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    props.message.flags.includes(MailFlag.Seen)
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-gray-800 dark:text-gray-200"
                  )}
                >
                  {props.message.sender.name?.length > 0
                    ? props.message.sender.internal?.name ??
                      props.message.sender.name
                    : props.message.sender.email}
                </p>
                <div className="flex items-center gap-1">
                  {!props.message.flags.includes(MailFlag.Seen) && (
                    <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                  )}
                  {props.message.flags.includes(MailFlag.Flagged) && (
                    <StarIconSolid className="h-4 w-4 text-blue-500" />
                  )}
                  <p
                    className="text-xs text-gray-500 flex-shrink-0 ml-2"
                    suppressHydrationWarning
                  >
                    {formatMailDate(props.message.date)}
                  </p>
                </div>
              </div>
              <h2
                className={cn(
                  "text-lg truncate",
                  props.message.flags.includes(MailFlag.Seen)
                    ? "font-semibold text-gray-800 dark:text-gray-200"
                    : "font-bold text-black dark:text-white"
                )}
              >
                {props.message.subject}
              </h2>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 ml-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisHorizontalIcon className="h-5 w-5 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                onClick={(e) => e.stopPropagation()}
              >
                <DropdownMenuItem
                  onClick={() =>
                    props.handleAction(props.message.id, "reply", async () => {
                      router.push(
                        `/mail/compose?action=reply&src-msg-id=${props.message.id}&src-msg-mbox=${props.boxId}`
                      );
                    })
                  }
                  disabled={props.loadingActions[`${props.message.id}-reply`]}
                  className="flex items-center"
                >
                  <ArrowTurnUpLeftIcon className="w-4 h-4 mr-2" />
                  {props.loadingActions[`${props.message.id}-reply`]
                    ? "Loading..."
                    : "Reply"}
                  {props.loadingActions[`${props.message.id}-reply`] && (
                    <Spinner size="sm" className="ml-2" color="primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    props.handleAction(
                      props.message.id,
                      "forward",
                      async () => {
                        router.push(
                          `/mail/compose?action=forward&src-msg-id=${props.message.id}&src-msg-mbox=${props.boxId}`
                        );
                      }
                    )
                  }
                  disabled={props.loadingActions[`${props.message.id}-forward`]}
                  className="flex items-center"
                >
                  <ArrowTurnUpRightIcon className="w-4 h-4 mr-2" />
                  {props.loadingActions[`${props.message.id}-forward`]
                    ? "Loading..."
                    : "Forward"}
                  {props.loadingActions[`${props.message.id}-forward`] && (
                    <Spinner size="sm" className="ml-2" color="primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    props.handleAction(props.message.id, "star", async () => {
                      const willBeRemoved = props.message.flags.includes(
                        MailFlag.Flagged
                      );

                      if (willBeRemoved)
                        await trpc.mailRouter.removeMailMessageFlag.mutate({
                          flag: MailFlag.Flagged,
                          messageId: props.message.id,
                          mailbox: props.boxId,
                          accountId: props.currentAccount,
                        });
                      else
                        await trpc.mailRouter.addMailMessageFlag.mutate({
                          flag: MailFlag.Flagged,
                          messageId: props.message.id,
                          mailbox: props.boxId,
                          accountId: props.currentAccount,
                        });

                      queryClient.refetchQueries({
                        queryKey: [
                          "mailbox",
                          props.currentAccount,
                          props.boxId,
                        ],
                      });
                    })
                  }
                  disabled={props.loadingActions[`${props.message.id}-star`]}
                  className="flex items-center"
                >
                  {props.message.flags.includes(MailFlag.Flagged) ? (
                    <StarIconSolid className="w-4 h-4 mr-2 text-blue-500" />
                  ) : (
                    <StarIcon className="w-4 h-4 mr-2" />
                  )}
                  {props.loadingActions[`${props.message.id}-star`]
                    ? "Loading..."
                    : props.message.flags.includes(MailFlag.Flagged)
                    ? "Unstar"
                    : "Star"}
                  {props.loadingActions[`${props.message.id}-star`] && (
                    <Spinner size="sm" className="ml-2" color="primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() =>
                    props.handleAction(
                      props.message.id,
                      "mark-unread",
                      async () => {
                        await trpc.mailRouter.removeMailMessageFlag.mutate({
                          flag: MailFlag.Seen,
                          messageId: props.message.id,
                          mailbox: props.boxId,
                          accountId: props.currentAccount,
                        });

                        queryClient.refetchQueries({
                          queryKey: [
                            "mailbox",
                            props.currentAccount,
                            props.boxId,
                          ],
                        });
                      }
                    )
                  }
                  disabled={
                    props.loadingActions[`${props.message.id}-mark-unread`]
                  }
                  className="flex items-center"
                >
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  {props.loadingActions[`${props.message.id}-mark-unread`]
                    ? "Loading..."
                    : "Mark as unread"}
                  {props.loadingActions[`${props.message.id}-mark-unread`] && (
                    <Spinner size="sm" className="ml-2" color="primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    props.handleAction(props.message.id, "delete", async () => {
                      await trpc.mailRouter.moveMailMessage.mutate({
                        destination: "[Gmail]/Koš",
                        messageId: props.message.id,
                        mailbox: props.boxId,
                        accountId: props.currentAccount,
                      });

                      queryClient.refetchQueries({
                        queryKey: [
                          "mailbox",
                          props.currentAccount,
                          props.boxId,
                        ],
                      });
                    })
                  }
                  disabled={props.loadingActions[`${props.message.id}-delete`]}
                  className="flex items-center text-red-500"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  {props.loadingActions[`${props.message.id}-delete`]
                    ? "Deleting..."
                    : "Delete"}
                  {props.loadingActions[`${props.message.id}-delete`] && (
                    <Spinner size="sm" className="ml-2" color="primary" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="w-full">
            <p
              className={cn(
                "line-clamp-2 overflow-hidden",
                props.message.flags.includes("\\Seen")
                  ? "text-gray-700 dark:text-gray-300"
                  : "text-gray-800 dark:text-gray-200"
              )}
            >
              {props.message.body.substring(0, 100)}...
            </p>

            {props.message.files && props.message.files.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {props.message.files.map((file: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center p-1.5 bg-gray-100 dark:bg-gray-800/60 rounded text-xs text-gray-700 dark:text-gray-300"
                  >
                    <PaperClipIcon className="h-3 w-3 text-gray-500 mr-1" />
                    <span className="truncate max-w-[100px]">
                      {file.name || `File ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AccountSelector(props: {
  accounts: Account[];
  currentAccount: Account;
  handleAccountChange: (account: Account) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-0 focus:outline-none focus-visible:outline-none">
        <p className="text-gray-600 dark:text-gray-300 hover:underline cursor-pointer flex items-center">
          {props.currentAccount.email}
          <ChevronDownIcon className="h-4 w-4 ml-1" />
        </p>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        {props.accounts.map((account) => (
          <DropdownMenuItem
            key={account.id}
            onClick={() => props.handleAccountChange(account)}
            className={
              props.currentAccount.id === account.id
                ? "bg-blue-50 dark:bg-blue-900/20"
                : ""
            }
          >
            <div className="flex items-center gap-2">
              <Avatar name={account.name || account.email} size="sm" />
              <div className="flex flex-col">
                {account.name && (
                  <span className="text-sm font-medium">{account.name}</span>
                )}
                <span className="text-xs text-gray-500">{account.email}</span>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <Link href="/user/accounts/setup" passHref>
          <DropdownMenuItem className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <PlusIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Add new account</span>
            </div>
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

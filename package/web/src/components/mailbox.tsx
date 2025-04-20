"use client";

import { useEffect, useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  ChevronDownIcon,
  PlusIcon,
  StarIcon,
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
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/server/trpc";
import { Spinner } from "./ui/spinner";
import { MailFlag } from "@/types/MailFlag";

export type Account = {
  id: string;
  email: string;
  name?: string;
};

export default function Mailbox(props: {
  accounts: Account[];
  boxId: string;
  page: string;
  messageId: string;
  currentAccount: string;
}) {
  const { data: messages, isLoading } = useQuery({
    queryKey: ["mailbox", props.currentAccount, props.boxId, props.page],
    queryFn: async () =>
      await trpc.mailRouter.getMail.query({
        accountId: props.currentAccount,
        mailbox: props.boxId,
        page: Number(props.page),
      }),
    retryDelay: 4000,
  });

  const [currentAccount, setCurrentAccount] = useState<Account>(
    props.accounts.find((account) => account.id === props.currentAccount) ||
      ({} as Account)
  );

  const router = useRouter();

  const handleAccountChange = (account: Account) => {
    setCurrentAccount(account);

    Cookies.set("current_account_id", account.id, {
      expires: 30,
    });

    // Remove messageId search param
    const url = new URL(window.location.href);
    url.searchParams.delete("messageId");

    router.push(url.toString());
  };

  return (
    <Card className="px-7 py-5 gap-4 w-1/3 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>

          <DropdownMenu>
            <DropdownMenuTrigger className="p-0 focus:outline-none focus-visible:outline-none">
              <p className="text-gray-600 dark:text-gray-300 hover:underline cursor-pointer flex items-center">
                {currentAccount.email}
                <ChevronDownIcon className="h-4 w-4 ml-1" />
              </p>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px]">
              {props.accounts.map((account) => (
                <DropdownMenuItem
                  key={account.id}
                  onClick={() => handleAccountChange(account)}
                  className={
                    currentAccount.id === account.id
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }
                >
                  <div className="flex items-center gap-2">
                    <Avatar name={account.name || account.email} size="sm" />
                    <div className="flex flex-col">
                      {account.name && (
                        <span className="text-sm font-medium">
                          {account.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {account.email}
                      </span>
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
        </div>
        <div className="flex gap-2">
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
                <div
                  key={i}
                  onClick={() =>
                    router.push(
                      `/mail/${props.boxId}/${props.page}?messageId=${message.id}`
                    )
                  }
                  className="cursor-pointer rounded-xl overflow-hidden flex-shrink-0"
                >
                  <Card
                    className={cn(
                      "transition-all duration-200 overflow-hidden relative",
                      props.messageId == message.id
                        ? "border border-blue-400 bg-blue-50 shadow-md dark:bg-blue-900/20"
                        : message.flags.includes("\\Seen")
                        ? "border border-gray-200 hover:border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/10"
                        : "border border-gray-200 hover:border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 shadow-sm"
                    )}
                    noBorderStyling
                  >
                    {!message.flags.includes("\\Seen") && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-500"></div>
                    )}
                    <CardContent className="gap-3 flex flex-col p-4 min-h-[120px]">
                      <div className="flex gap-4 items-start">
                        <Avatar
                          name={
                            message.sender.name?.length > 0
                              ? message.sender.name
                              : message.sender.email
                          }
                          size="lg"
                          active={props.messageId == message.id}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                message.flags.includes("\\Seen")
                                  ? "text-gray-600 dark:text-gray-400"
                                  : "text-gray-800 dark:text-gray-200"
                              )}
                            >
                              {message.sender.name?.length > 0
                                ? message.sender.name
                                : message.sender.email}
                            </p>
                            <div className="flex items-center gap-1">
                              {!message.flags.includes(MailFlag.Seen) && (
                                <div className="h-2 w-2 rounded-full bg-blue-600 dark:bg-blue-500"></div>
                              )}
                              {message.flags.includes(MailFlag.Flagged) && (
                                <StarIconSolid className="h-4 w-4 text-blue-500" />
                              )}
                              <p
                                className="text-xs text-gray-500 flex-shrink-0 ml-2"
                                suppressHydrationWarning
                              >
                                {formatMailDate(message.date)}
                              </p>
                            </div>
                          </div>
                          <h2
                            className={cn(
                              "text-lg truncate",
                              message.flags.includes(MailFlag.Seen)
                                ? "font-semibold text-gray-800 dark:text-gray-200"
                                : "font-bold text-black dark:text-white"
                            )}
                          >
                            {message.subject}
                          </h2>
                        </div>
                      </div>
                      <p
                        className={cn(
                          "line-clamp-2 overflow-hidden",
                          message.flags.includes("\\Seen")
                            ? "text-gray-700 dark:text-gray-300"
                            : "text-gray-800 dark:text-gray-200"
                        )}
                      >
                        {message.body.substring(0, 100)}...
                      </p>
                    </CardContent>
                  </Card>
                </div>
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

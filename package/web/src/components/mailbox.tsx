"use client";

import { useState } from "react";
import {
  CalendarDaysIcon,
  ClockIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
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

export type Account = {
  id: string;
  email: string;
  name?: string;
};

export default function Mailbox(props: {
  messages: {
    id: string;
    subject: string;
    sender: {
      name: string;
      email: string;
    };
    body: string;
    date: string;
  }[];
  accounts: Account[];
  currentAccountId?: string;
  onAccountChange?: (accountId: string) => void;
}) {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const [currentAccount, setCurrentAccount] = useState<Account>(
    props.currentAccountId
      ? props.accounts.find((a) => a.id === props.currentAccountId) ||
          props.accounts[0]
      : props.accounts[0]
  );

  const handleAccountChange = (account: Account) => {
    setCurrentAccount(account);
    if (props.onAccountChange) {
      props.onAccountChange(account.id);
    }
  };

  return (
    <Card className="px-7 py-5 gap-4 w-1/3 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Inbox</h1>
          {props.accounts.length > 1 ? (
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
          ) : (
            <div className="flex items-center">
              <p className="text-gray-600 dark:text-gray-300">
                {currentAccount.email}
              </p>
              <Link href="/user/accounts/setup" passHref>
                <Button variant="ghost" size="sm" className="ml-2 px-2 h-7">
                  <PlusIcon className="h-4 w-4 mr-1" />
                  <span className="text-xs">Add account</span>
                </Button>
              </Link>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <ClockIcon className="w-5 h-5 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon">
            <CalendarDaysIcon className="w-5 h-5 text-gray-500" />
          </Button>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div className="flex flex-col gap-4 w-full h-full pb-2 overflow-y-auto pr-2">
          {props.messages.map((message, i) => (
            <div
              key={i}
              onClick={() => setSelectedMessage(i)}
              className="cursor-pointer rounded-xl overflow-hidden flex-shrink-0"
            >
              <Card
                className={`border transition-all duration-200 ${
                  selectedMessage === i
                    ? "border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/10"
                }`}
              >
                <CardContent className="gap-3 flex flex-col p-4 min-h-[120px]">
                  <div className="flex gap-4 items-start">
                    <Avatar
                      name={
                        message.sender.name?.length > 0
                          ? message.sender.name
                          : message.sender.email
                      }
                      size="lg"
                      active={selectedMessage === i}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                          {message.sender.name?.length > 0
                            ? message.sender.name
                            : message.sender.email}
                        </p>
                        <p
                          className="text-xs text-gray-500 flex-shrink-0 ml-2"
                          suppressHydrationWarning
                        >
                          {formatMailDate(message.date)}
                        </p>
                      </div>
                      <h2 className="text-lg font-semibold truncate">
                        {message.subject}
                      </h2>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 line-clamp-2 overflow-hidden">
                    {message.body.substring(0, 100)}...
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

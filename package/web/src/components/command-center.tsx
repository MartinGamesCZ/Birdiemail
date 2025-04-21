"use client";

import { useState, useEffect, Fragment } from "react";
import {
  Dialog,
  Combobox,
  Transition,
  TransitionChild,
  ComboboxOptions,
  ComboboxOption,
} from "@headlessui/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { toggleTheme } from "@/providers/ThemeProvider";
import { IS_DEV } from "@/config";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/server/trpc";
import Cookies from "js-cookie";

interface CommandCenterProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

type CommandType = "navigation" | "action" | "mail" | "settings";

interface Command {
  id: string;
  name: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  type: CommandType;
  action: () => void;
}

export function CommandCenter({ isOpen, setIsOpen }: CommandCenterProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const { data: adminAccess } = useQuery({
    queryKey: ["user", "isAdmin"],
    queryFn: async () => await trpc.adminRouter.isAuthorized.query(),
  });

  const { data: mailboxes } = useQuery({
    queryKey: ["mail", "mailboxes", Cookies.get("current_account_id") ?? ""],
    queryFn: async () =>
      await trpc.mailRouter.getMailboxes.query({
        accountId: Cookies.get("current_account_id") ?? "",
      }),
  });

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [setIsOpen]);

  console.log(mailboxes);

  const commands: Command[] = [
    ...(IS_DEV
      ? ([
          {
            id: "goto-dev",
            name: "[DEV] Go to dev tools",
            description: "Open the developer tools -- DEV ONLY",
            type: "navigation",
            action: () => {
              router.push("/dev");
              setIsOpen(false);
            },
          },
          {
            id: "reload-page",
            name: "[DEV] Reload page",
            description: "Reload the current page -- DEV ONLY",
            type: "action",
            action: () => {
              location.reload();

              setIsOpen(false);
            },
          },
        ] as Command[])
      : []),
    ...(adminAccess?.authorized
      ? ([
          {
            id: "goto-admin",
            name: "[ADMIN] Go to admin panel",
            description: "Open the admin panel -- ADMIN ONLY",
            type: "navigation",
            action: () => {
              router.push("/admin");
              setIsOpen(false);
            },
          },
        ] as Command[])
      : []),
    ...(mailboxes
      ? mailboxes.map(
          (box) =>
            ({
              id: "goto-mailbox-" + box.name.toLowerCase().replaceAll(" ", "_"),
              name: "Go to " + box.name.toLowerCase(),
              description: "View your '" + box.name.toLowerCase() + "' mailbox",
              type: "mail",
              action: () => {
                router.push("/mail/" + box.name);
                setIsOpen(false);
              },
            } as Command)
        )
      : ([
          {
            id: "goto-inbox",
            name: "Go to Inbox",
            description: "View your inbox messages",
            type: "navigation",
            action: () => {
              router.push("/mail");
              setIsOpen(false);
            },
          },
        ] as Command[])),
    {
      id: "goto-compose",
      name: "Compose New Message",
      description: "Compose a new email message",
      type: "navigation",
      action: () => {
        router.push("/mail/compose");
        setIsOpen(false);
      },
    },
    {
      id: "goto-settings",
      name: "Go to Settings",
      description: "View and change app settings",
      type: "navigation",
      action: () => {
        router.push("/settings");
        setIsOpen(false);
      },
    },
    {
      id: "toggle-theme",
      name: "Toggle Theme",
      description: "Switch between light and dark mode",
      type: "settings",
      action: () => {
        toggleTheme();
        setIsOpen(false);
      },
    },
  ];

  const filteredCommands =
    query === ""
      ? commands
      : commands.filter(
          (command) =>
            command.name.toLowerCase().includes(query.toLowerCase()) ||
            (command.description &&
              command.description.toLowerCase().includes(query.toLowerCase()))
        );

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        onClose={() => setIsOpen(false)}
      >
        <div className="min-h-screen px-4 pt-16 flex justify-center items-start">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </TransitionChild>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4"
            enterTo="opacity-100 translate-y-0"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-4"
          >
            <div className="relative w-full max-w-2xl z-10">
              <Combobox
                as="div"
                onChange={(command: Command) => command?.action()}
              >
                <div className="flex items-center bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden ring-1 ring-gray-300 dark:ring-gray-700">
                  <div className="pl-4">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <Combobox.Input
                    className="w-full border-0 bg-transparent py-3 px-2 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-0 text-base"
                    placeholder="Search or type a command..."
                    onChange={(event) => setQuery(event.target.value)}
                    autoComplete="off"
                    autoFocus
                  />
                </div>
                {(filteredCommands.length > 0 ||
                  (filteredCommands.length === 0 && query !== "")) && (
                  <div className="absolute w-full mt-2">
                    {filteredCommands.length > 0 ? (
                      <ComboboxOptions
                        className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden max-h-80 overflow-y-auto"
                        static
                      >
                        {filteredCommands.map((command) => (
                          <ComboboxOption
                            key={command.id}
                            value={command}
                            className={({ active }) =>
                              `px-4 py-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-none ${
                                active
                                  ? "bg-blue-50 dark:bg-blue-900/20"
                                  : "bg-white dark:bg-gray-800"
                              }`
                            }
                          >
                            {({ active }) => (
                              <div className="flex justify-between items-center">
                                <div>
                                  <div
                                    className={`font-medium ${
                                      active
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-gray-900 dark:text-gray-100"
                                    }`}
                                  >
                                    {command.name}
                                  </div>
                                  {command.description && (
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                      {command.description}
                                    </div>
                                  )}
                                </div>
                                {command.shortcut && (
                                  <div className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">
                                    {command.shortcut}
                                  </div>
                                )}
                              </div>
                            )}
                          </ComboboxOption>
                        ))}
                      </ComboboxOptions>
                    ) : (
                      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg py-6 px-4 text-center text-gray-500 dark:text-gray-400">
                        No commands found for "{query}"
                      </div>
                    )}
                  </div>
                )}
              </Combobox>
            </div>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}

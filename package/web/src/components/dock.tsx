"use client";

import {
  BarsArrowUpIcon,
  BookOpenIcon,
  CalendarIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  InboxIcon,
  PencilIcon,
  ShieldExclamationIcon,
  StarIcon,
  TrashIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useState } from "react";
import { Card } from "./ui/card";
import { Mailbox } from "@/types/Mailbox";

const Links = [
  {
    type: "section",
    items: [
      {
        href: `/mail/${encodeURIComponent(Mailbox.Inbox)}`,
        icon: InboxIcon,
        label: "Inbox",
      },
      {
        href: `/mail/${encodeURIComponent(Mailbox.Flagged)}`,
        icon: StarIcon,
        label: "Starred",
      },
      /*{
        href: `/mail/${encodeURIComponent(Mailbox.Spam)}`,
        icon: ShieldExclamationIcon,
        label: "Spam",
      },*/
      {
        href: `/mail/${encodeURIComponent(Mailbox.Trash)}`,
        icon: TrashIcon,
        label: "Trash",
      },
      {
        href: `/mail/${encodeURIComponent(Mailbox.Sent)}`,
        icon: BarsArrowUpIcon,
        label: "Sent",
      },
    ],
  },
  /*{
    type: "section_with_div",
    items: [
      {
        href: "/mail/chat",
        icon: ChatBubbleLeftIcon,
        label: "Chat",
      },
      {
        href: "/mail/contacts",
        icon: BookOpenIcon,
        label: "Contacts",
      },
      {
        href: "/mail/calendar",
        icon: CalendarIcon,
        label: "Calendar",
      },
    ],
  },*/
  {
    type: "section_with_gap",
    items: [
      {
        href: "/mail/compose",
        icon: PencilIcon,
        label: "Compose",
      },
      {
        href: "/settings",
        icon: CogIcon,
        label: "Settings",
      },
      {
        href: "/user",
        icon: UserIcon,
        label: "Profile",
      },
    ],
  },
];

export function Dock(props: { active: string }) {
  const location = {
    pathname: props.active,
  };
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <Card className="p-5 gap-6 w-24 h-full flex flex-col">
      {Links.map((link) => (
        <div
          className={`flex flex-col gap-4 ${
            link.type === "section_with_gap" ? "mt-auto" : ""
          } ${
            link.type === "section_with_div"
              ? "border-t-2 border-gray-200 dark:border-gray-700 pt-4"
              : ""
          }`}
          key={link.type}
        >
          {link.items.map((item) => (
            <div className="relative group" key={item.href}>
              <Link
                href={item.href}
                className={`w-full aspect-square p-3 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-200 ease-in-out ${
                  location.pathname === item.href
                    ? "bg-blue-700 text-white shadow-md"
                    : "bg-blue-700/10 text-blue-900 hover:bg-blue-700/20 dark:text-blue-300 dark:hover:bg-blue-700/30"
                }`}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <item.icon className="w-6 h-6" />
              </Link>

              {hoveredItem === item.href && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap z-10 shadow-lg">
                  {item.label}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
    </Card>
  );
}

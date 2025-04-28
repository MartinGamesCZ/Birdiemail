"use client";

import {
  ChartPieIcon,
  UsersIcon,
  ChevronDownIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

// Admin links definition
const AdminLinks = [
  {
    type: "section",
    title: "Overview",
    items: [
      {
        href: "/admin",
        icon: ChartPieIcon,
        label: "Dashboard",
      },
      {
        href: "/admin/users",
        icon: UsersIcon,
        label: "Users",
      },
    ],
  },
];

// Admin navigation component
export function AdminNav() {
  const pathname = usePathname();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  return (
    <div className="p-5 w-64 hwt flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="mb-8">
        <div className="flex items-center">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 text-center w-full">
            Birdiemail Admin
          </h2>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-blue-200 dark:via-blue-800 to-transparent mt-4"></div>
      </div>

      {AdminLinks.map((section, index) => (
        <div key={index} className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3 px-3">
            {section.title}
          </h3>
          <div className="space-y-1">
            {section.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                  pathname === item.href
                    ? "bg-blue-700 text-white"
                    : "text-blue-900 hover:bg-blue-700/10 dark:text-blue-300 dark:hover:bg-blue-700/30"
                }`}
              >
                <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-auto pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <button
            onClick={() => setAccountMenuOpen(!accountMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-blue-900 hover:bg-blue-700/10 dark:text-blue-300 dark:hover:bg-blue-700/30 transition-all duration-200"
          >
            <div className="flex items-center">
              <UserCircleIcon className="w-5 h-5 mr-3 flex-shrink-0" />
              <span className="font-medium">Account</span>
            </div>
            <ChevronDownIcon
              className={`w-4 h-4 transition-transform duration-200 ${
                accountMenuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {accountMenuOpen && (
            <div className="absolute bottom-full mb-1 left-0 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <Link
                href="/user/profile"
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <UserCircleIcon className="w-4 h-4 mr-2" />
                <span>Profile</span>
              </Link>
              <button
                onClick={() => console.log("Logout clicked")}
                className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left text-red-600"
              >
                <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

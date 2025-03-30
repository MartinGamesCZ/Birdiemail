"use client";

import { useState } from "react";
import { CalendarDaysIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Avatar } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

const Box = {
  title: "Inbox",
  email: "martin.petr@birdiemail.social",
  messages: [
    {
      subject: "Hello",
      body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      sender: {
        name: "John Doe",
        email: "john.doe@example.com",
      },
    },
    {
      subject: "Meeting Reminder",
      body: "Don't forget about the meeting tomorrow at 10 AM. It will be held in the main conference room and your attendance is important.",
      sender: {
        name: "Jane Smith",
        email: "jane.smith@example.com",
      },
    },
    {
      subject: "Project Update",
      body: "The project is on track for completion by the end of the month. Please review the latest changes. Also, let me know if you have any questions or concerns.",
      sender: {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
      },
    },
  ],
};

export default function Mailbox() {
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);

  return (
    <Card className="px-7 py-5 gap-4 w-1/3 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">{Box.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">{Box.email}</p>
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

      <div className="relative flex-1 overflow-y-auto pr-2">
        <div className="flex flex-col gap-4 w-full h-full pb-2">
          {Box.messages.map((message, i) => (
            <div
              key={i}
              onClick={() => setSelectedMessage(i)}
              className="cursor-pointer rounded-xl overflow-hidden"
            >
              <Card
                className={`border transition-all duration-200 ${
                  selectedMessage === i
                    ? "border-blue-500 bg-blue-50 shadow-md dark:bg-blue-900/20"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/10"
                }`}
              >
                <CardContent className="gap-3 flex flex-col">
                  <div className="flex gap-4 items-center">
                    <Avatar
                      name={message.sender.name}
                      size="lg"
                      active={selectedMessage === i}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {message.sender.name}
                        </p>
                        <p className="text-xs text-gray-500">10:30 AM</p>
                      </div>
                      <h2 className="text-lg font-semibold">
                        {message.subject}
                      </h2>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
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

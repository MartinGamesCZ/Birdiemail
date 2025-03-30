"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Sidebar } from "@/components/ui/sidebar";
import { toggleTheme } from "@/providers/ThemeProvider";
import {
  ChevronDownIcon,
  PlusIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function Page() {
  const [selectedTab, setSelectedTab] = useState<string>("buttons");

  const sidebarItems = [
    { id: "buttons", label: "Buttons" },
    { id: "inputs", label: "Inputs" },
    { id: "cards", label: "Cards" },
    { id: "avatars", label: "Avatars" },
    { id: "layout", label: "Layout" },
  ];

  return (
    <div className="flex flex-col w-screen h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Component Test Page</h1>
        <Button variant="primary" onClick={() => toggleTheme()}>
          Toggle Theme
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          items={sidebarItems}
          selectedItem={selectedTab}
          onSelectItem={setSelectedTab}
        />

        {/* Main content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {selectedTab === "buttons" && (
            <div className="space-y-8">
              <Card>
                <CardHeader>Button Variants</CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="success">Success</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="link">Link</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="subtle">Subtle</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="default">Default</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>Button Sizes</CardHeader>
                <CardContent className="flex flex-wrap items-end gap-4">
                  <Button variant="primary" size="xs">
                    Extra Small
                  </Button>
                  <Button variant="primary" size="sm">
                    Small
                  </Button>
                  <Button variant="primary" size="default">
                    Default
                  </Button>
                  <Button variant="primary" size="lg">
                    Large
                  </Button>
                  <Button variant="primary" size="xl">
                    Extra Large
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>Icon Buttons</CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button variant="primary" size="icon">
                    <PlusIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ChevronDownIcon className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm">
                    <MagnifyingGlassIcon className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>Button States</CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                  <Button variant="primary" disabled>
                    Disabled
                  </Button>
                  <Button variant="primary" isLoading>
                    Loading
                  </Button>
                  <Button
                    variant="primary"
                    leftIcon={<PlusIcon className="h-4 w-4" />}
                  >
                    With Left Icon
                  </Button>
                  <Button
                    variant="primary"
                    rightIcon={<ChevronDownIcon className="h-4 w-4" />}
                  >
                    With Right Icon
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "inputs" && (
            <div className="space-y-8">
              <Card>
                <CardHeader>Input Variants</CardHeader>
                <CardContent className="space-y-4">
                  <Input variant="default" placeholder="Default input" />
                  <Input variant="filled" placeholder="Filled input" />
                  <Input variant="flushed" placeholder="Flushed input" />
                  <Input variant="success" placeholder="Success input" />
                  <Input
                    variant="error"
                    placeholder="Error input"
                    errorText="This field has an error"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>Input States and Features</CardHeader>
                <CardContent className="space-y-4">
                  <Input label="With Label" placeholder="Enter text" />
                  <Input
                    label="Required Field"
                    placeholder="Required input"
                    isRequired
                  />
                  <Input placeholder="Disabled input" disabled />
                  <Input
                    placeholder="With helper text"
                    helperText="This is some helpful information"
                  />
                  <Input
                    leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    placeholder="With left icon"
                  />
                  <Input
                    type="password"
                    placeholder="Password with toggle"
                    showPasswordToggle
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "cards" && (
            <div className="space-y-8">
              <Card>
                <CardHeader>Basic Card</CardHeader>
                <CardContent>
                  <p>This is a basic card with header and content sections.</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="border-blue-500">
                  <CardHeader>Card with Custom Border</CardHeader>
                  <CardContent>
                    Cards can have custom styling applied.
                  </CardContent>
                </Card>
                <Card className="bg-blue-50 dark:bg-blue-900/20">
                  <CardHeader>Card with Custom Background</CardHeader>
                  <CardContent>
                    Different background colors can be applied.
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-lg">
                <CardHeader>Interactive Card Example</CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex gap-4 items-center">
                    <Avatar name="John Doe" size="lg" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        John Doe
                      </p>
                      <h3 className="font-semibold">
                        Example Card with Avatar
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    This is an example of a card with multiple elements
                    combined.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {selectedTab === "avatars" && (
            <Card>
              <CardHeader>Avatar Sizes and States</CardHeader>
              <CardContent className="flex flex-wrap items-end gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar name="John Doe" size="sm" />
                  <span className="text-sm">Small</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar name="Jane Smith" size="md" />
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar name="Alice Johnson" size="lg" />
                  <span className="text-sm">Large</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Avatar name="Bob Brown" size="lg" active={true} />
                  <span className="text-sm">Active</span>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedTab === "layout" && (
            <div className="space-y-8">
              <Card>
                <CardHeader>Mail Layout Preview</CardHeader>
                <CardContent>
                  <div className="h-64 border border-gray-300 dark:border-gray-600 rounded-lg p-4 flex gap-4">
                    <div className="w-20 h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"></div>
                    <div className="w-1/3 h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"></div>
                    <div className="flex-1 h-full bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"></div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>Grid Layout</CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg text-center"
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>Flex Layout</CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div
                          key={i}
                          className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg text-center"
                        >
                          {i}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

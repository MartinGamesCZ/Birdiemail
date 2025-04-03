"use client";

import { useState, useEffect } from "react";
import { Dock } from "@/components/dock";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/server/trpc";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";

// Common email providers configuration
const emailProviders = [
  {
    name: "Gmail",
    domain: "gmail.com",
    imap: { host: "imap.gmail.com", port: 993, secure: true },
    smtp: { host: "smtp.gmail.com", port: 587, secure: true },
  },
  {
    name: "Seznam.cz",
    domain: "seznam.cz",
    imap: { host: "imap.seznam.cz", port: 993, secure: true },
    smtp: { host: "smtp.seznam.cz", port: 465, secure: true },
  },
  {
    name: "Outlook",
    domain: "outlook.com",
    imap: { host: "outlook.office365.com", port: 993, secure: true },
    smtp: { host: "smtp.office365.com", port: 587, secure: true },
  },
  /*{
    name: "Yahoo",
    domain: "yahoo.com",
    imap: { host: "imap.mail.yahoo.com", port: 993, secure: true },
    smtp: { host: "smtp.mail.yahoo.com", port: 465, secure: true },
  },
  {
    name: "ProtonMail",
    domain: "protonmail.com",
    imap: { host: "imap.protonmail.ch", port: 993, secure: true },
    smtp: { host: "smtp.protonmail.ch", port: 587, secure: true },
  },*/
  {
    name: "Custom",
    domain: "",
    imap: { host: "", port: 993, secure: true },
    smtp: { host: "", port: 587, secure: true },
  },
];

export default function SetupEmailAccountPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    imapHost: "",
    imapPort: 993,
    imapSecure: true,
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: true,
    selectedProvider: "Custom",
  });
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Auto-detect email domain
    if (name === "email" && value.includes("@")) {
      const domain = value.split("@")[1];
      autoDetectProvider(domain);
    }
  };

  const autoDetectProvider = (domain: string) => {
    const provider = emailProviders.find((p) => p.domain === domain);
    if (provider) {
      setFormData((prev) => ({
        ...prev,
        selectedProvider: provider.name,
        imapHost: provider.imap.host,
        imapPort: provider.imap.port,
        imapSecure: provider.imap.secure,
        smtpHost: provider.smtp.host,
        smtpPort: provider.smtp.port,
        smtpSecure: provider.smtp.secure,
      }));
    }
  };

  const handleProviderSelect = (value: string) => {
    const provider = emailProviders.find((p) => p.name === value);
    if (provider) {
      setFormData((prev) => ({
        ...prev,
        selectedProvider: value,
        imapHost: provider.imap.host,
        imapPort: provider.imap.port,
        imapSecure: provider.imap.secure,
        smtpHost: provider.smtp.host,
        smtpPort: provider.smtp.port,
        smtpSecure: provider.smtp.secure,
      }));
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) return;
    setIsLoading(true);

    const data = await trpc.userRouter.addMailAccount.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      imap_host: formData.imapHost,
      imap_port: Number(formData.imapPort),
      imap_secure: formData.imapSecure,
      smtp_host: formData.smtpHost,
      smtp_port: Number(formData.smtpPort),
      smtp_secure: formData.smtpSecure,
    });

    if (data.status == "error") {
      setIsLoading(false);
      toast.error(data.message);

      return;
    }

    router.push("/mail");
  };

  return (
    <div className="w-full h-full flex flex-row gap-5 p-5 bg-gray-50 dark:bg-gray-900">
      <Dock active="/user" />
      <Card className="flex-1">
        <CardHeader>
          <h1 className="text-2xl font-semibold">Add Email Account</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="selectedProvider">Email Provider</Label>
                <Select
                  value={formData.selectedProvider}
                  onValueChange={handleProviderSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailProviders.map((provider) => (
                      <SelectItem key={provider.name} value={provider.name}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your-email@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">IMAP Settings</h3>
                  <div>
                    <Label htmlFor="imapHost">IMAP Host</Label>
                    <Input
                      id="imapHost"
                      name="imapHost"
                      value={formData.imapHost}
                      onChange={handleChange}
                      placeholder="imap.example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="imapPort">IMAP Port</Label>
                    <Input
                      id="imapPort"
                      name="imapPort"
                      type="number"
                      value={formData.imapPort}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="imapSecure"
                      checked={formData.imapSecure}
                      onCheckedChange={(checked: any) =>
                        handleCheckboxChange("imapSecure", checked as boolean)
                      }
                    />
                    <Label htmlFor="imapSecure">
                      Use secure connection (SSL/TLS)
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">SMTP Settings</h3>
                  <div>
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      name="smtpHost"
                      value={formData.smtpHost}
                      onChange={handleChange}
                      placeholder="smtp.example.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      name="smtpPort"
                      type="number"
                      value={formData.smtpPort}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smtpSecure"
                      checked={formData.smtpSecure}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("smtpSecure", checked as boolean)
                      }
                    />
                    <Label htmlFor="smtpSecure">
                      Use secure connection (SSL/TLS)
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="primary" type="submit" isLoading={isLoading}>
                Add Account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

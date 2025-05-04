"use client";

import { Dock } from "@/components/dock";
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import {
  UserCircleIcon,
  LockClosedIcon,
  EnvelopeIcon,
  PlusIcon,
  PencilIcon,
  Cog6ToothIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/server/trpc";
import { useRouter } from "next/navigation";

export default function Page() {
  const {
    data: user,
    isLoading: userLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["user"],
    queryFn: async () => await trpc.userRouter.userInfo.query(),
  });

  const {
    data: mailAccounts,
    isLoading: mailAccountsLoading,
    refetch: refetchMailAccounts,
  } = useQuery({
    queryKey: ["mailAccounts"],
    queryFn: async () => await trpc.userRouter.getMailAccounts.query(),
  });

  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountEmail, setNewAccountEmail] = useState("");

  const [newMailUsername, setNewMailUsername] = useState("");

  const router = useRouter();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await trpc.userRouter.updateAccount.mutate({
      name: newAccountName,
    });

    if (res.status !== "ok") {
      toast.error(res.message);
      return;
    }

    toast.success("Profile updated successfully");

    refetchUser();
  };

  const handleUpdatePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await trpc.userRouter.changePassword.mutate({
      oldPassword: currentPassword,
      newPassword: newPassword,
    });

    if (res.status !== "ok") {
      toast.error(res.message);
      return;
    }

    toast.success("Password updated successfully");
    setIsPasswordDialogOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleMailAccountUpdate = async () => {
    const res = await trpc.userRouter.updateMailAccount.mutate({
      name: newMailUsername,
      accountId: editingAccount || "",
    });

    if (res.status != "ok") {
      toast.error(res.message);

      return;
    }

    toast.success("Mail account updated successfully");

    setIsEditDialogOpen(false);
    setEditingAccount(null);

    refetchMailAccounts();
  };

  useEffect(() => {
    if (user && user.status === "ok") {
      setNewAccountName(user.data.name);
      setNewAccountEmail(user.data.email);
    }
  }, [user]);

  if (userLoading || mailAccountsLoading) {
    return <p>Loading...</p>;
  }

  if (!user || user.status !== "ok" || !mailAccounts) {
    return <p>Error loading user data</p>;
  }

  const editingMailAccount = mailAccounts.find((a) => a.id == editingAccount);

  return (
    <div className="w-full h-full flex flex-row gap-5 p-5 bg-gray-50 dark:bg-gray-900">
      <Dock active="/user" />
      <div className="flex-1 flex flex-col gap-5 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
            <Card className="flex flex-col flex-1 overflow-hidden">
              <CardHeader className="px-6 py-5 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <UserCircleIcon className="w-6 h-6" />
                  <CardTitle>Account</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pt-2 pb-6 overflow-y-auto flex-1">
                <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
                  <Avatar name={user.data.name} className="h-16 w-16" />
                  <div>
                    <h3 className="font-medium">{user.data.name}</h3>
                    <p className="text-sm text-gray-500">{user.data.email}</p>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-5">
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        value={newAccountName}
                        onChange={(e) => setNewAccountName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      {/* Disabled for now */}
                      <Input
                        id="email"
                        type="email"
                        value={user.data.email}
                        onChange={(e) => setNewAccountEmail(e.target.value)}
                        disabled={true}
                      />
                    </div>
                  </div>
                  <div className="pt-2 flex justify-between items-center">
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsPasswordDialogOpen(true)}
                      className="flex items-center gap-1"
                    >
                      <LockClosedIcon className="w-4 h-4" />
                      Change Password
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col h-full overflow-hidden">
            <Card className="flex flex-col flex-1 overflow-hidden">
              <CardHeader className="px-6 py-5 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-6 h-6" />
                    <CardTitle>Mail Accounts</CardTitle>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1 ml-4"
                  onClick={() => router.push("/user/accounts/setup")}
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Account</span>
                </Button>
              </CardHeader>
              <CardContent className="px-6 pt-2 pb-6 overflow-y-auto flex-1">
                <div className="space-y-4">
                  {mailAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg shadow-xs transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar name={account.name} size="md" />
                          <div>
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                              {account.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {account.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setEditingAccount(account.id);
                            setIsEditDialogOpen(true);

                            setNewMailUsername(account.name);
                          }}
                        >
                          <Cog6ToothIcon className="w-4 h-4 mr-1" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Email Account Settings</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg">
              <Avatar name={editingMailAccount?.name || ""} size="md" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {editingMailAccount?.email}
              </p>
            </div>

            <div className="space-y-5">
              <div className="space-y-3">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={newMailUsername}
                  onChange={(e) => setNewMailUsername(e.target.value)}
                  placeholder="Your display name"
                />
                <p className="text-xs text-gray-500">
                  This is the name that will appear in the "From" field when you
                  send emails
                </p>
              </div>

              {/*<Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-md font-medium">
                    Advanced Settings
                  </Label>
                  <Button variant="ghost" size="sm" type="button" disabled>
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      SMTP Server:
                    </span>
                    <span className="font-mono text-gray-800 dark:text-gray-200">
                      smtp.gmail.com
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      IMAP Server:
                    </span>
                    <span className="font-mono text-gray-800 dark:text-gray-200">
                      imap.gmail.com
                    </span>
                  </div>
                </div>
              </div>*/}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditDialogOpen(false);
                setEditingAccount(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleMailAccountUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-lg">
              <ShieldExclamationIcon className="min-w-5 min-h-5 w-5 h-5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                After changing your password, we will need to re-encrypt all
                your mail account credentials.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div>
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdatePassword}>
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

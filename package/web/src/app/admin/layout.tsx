import { trpc } from "@/server/trpc";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authorized } = await trpc.adminRouter.isAuthorized.query();

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center hwt">
        <h1 className="text-2xl font-bold">Unauthorized</h1>
        <p className="text-gray-500">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  return children;
}

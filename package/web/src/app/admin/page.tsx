import { AdminNav } from "@/components/admin-nav";
import { trpc } from "@/server/trpc";

export default async function Page() {
  const { users } = await trpc.adminRouter.getStats.query();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="h-full">
        <AdminNav />
      </div>
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">User Statistics</h2>
            <p className="text-3xl font-bold">{users}</p>
            <p className="text-gray-500">Total registered users</p>
          </div>
          {/*<div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">---</h2>
            <p className="text-3xl font-bold">---</p>
            <p className="text-gray-500">-</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">---</h2>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <p>---</p>
            </div>
          </div>*/}
        </div>
      </div>
    </div>
  );
}

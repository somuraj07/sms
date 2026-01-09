"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "SUPERADMIN") {
      router.push("/login");
      return;
    }
  }, [session, status, router]);

  if (status === "loading" || !session || session.user.role !== "SUPERADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-gray-600">Welcome, {session.user.name || session.user.email}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              User Management
            </h2>
            <p className="text-gray-600">
              Manage all users across the system
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              System Settings
            </h2>
            <p className="text-gray-600">
              Configure system-wide settings
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Schools Management
            </h2>
            <p className="text-gray-600">
              Manage all schools in the system
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Reports & Analytics
            </h2>
            <p className="text-gray-600">
              View system-wide reports and analytics
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Permissions
            </h2>
            <p className="text-gray-600">
              Manage role-based permissions
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Audit Logs
            </h2>
            <p className="text-gray-600">
              View system audit logs
            </p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            User Information
          </h2>
          <div className="space-y-2 text-gray-600">
            <p><strong>Role:</strong> {session.user.role}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            {session.user.schoolName && (
              <p><strong>School:</strong> {session.user.schoolName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


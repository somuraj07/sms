"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import AdminLayout from "@/components/admin/AdminLayout";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "ADMIN") {
      router.push("/login");
      return;
    }

    fetchStats();
  }, [session, status, router]);

  const fetchStats = async () => {
    try {
      // Fetch stats from APIs
      const [studentsRes, teachersRes, classesRes, leavesRes] = await Promise.all([
        fetch("/api/student/list"),
        fetch("/api/teacher/list"),
        fetch("/api/class/list"),
        fetch("/api/leaves/pending"),
      ]);

      const students = await studentsRes.json();
      const teachers = await teachersRes.json();
      const classes = await classesRes.json();
      const leaves = await leavesRes.json();

      setStats({
        totalStudents: students.data?.length || 0,
        totalTeachers: teachers.data?.length || 0,
        totalClasses: classes.data?.length || 0,
        pendingLeaves: leaves.data?.length || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading || !session || session.user.role !== "ADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome, {session.user.name || session.user.email}!</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm mb-1">Total Students</p>
                <p className="text-4xl font-bold">{stats.totalStudents}</p>
              </div>
              <div className="text-5xl opacity-80">👨‍🎓</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">Total Teachers</p>
                <p className="text-4xl font-bold">{stats.totalTeachers}</p>
              </div>
              <div className="text-5xl opacity-80">👨‍🏫</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Total Classes</p>
                <p className="text-4xl font-bold">{stats.totalClasses}</p>
              </div>
              <div className="text-5xl opacity-80">📚</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Pending Leaves</p>
                <p className="text-4xl font-bold">{stats.pendingLeaves}</p>
              </div>
              <div className="text-5xl opacity-80">📋</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/admin/classes"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">Manage Classes</h3>
            <p className="text-gray-600">Create and manage classes</p>
          </Link>

          <Link
            href="/admin/students"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">👨‍🎓</div>
            <h3 className="text-xl font-bold mb-2">Manage Students</h3>
            <p className="text-gray-600">Add and manage students</p>
          </Link>

          <Link
            href="/admin/teachers"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">👨‍🏫</div>
            <h3 className="text-xl font-bold mb-2">Manage Teachers</h3>
            <p className="text-gray-600">Add and manage teachers</p>
          </Link>

          <Link
            href="/admin/attendance"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">Attendance</h3>
            <p className="text-gray-600">View attendance records</p>
          </Link>

          <Link
            href="/admin/marks"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Marks & Grades</h3>
            <p className="text-gray-600">Manage student marks</p>
          </Link>

          <Link
            href="/admin/leaves"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Leave Requests</h3>
            <p className="text-gray-600">Approve/reject leaves</p>
          </Link>

          <Link
            href="/admin/newsfeed"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-xl font-bold mb-2">News Feed</h3>
            <p className="text-gray-600">Create and manage announcements</p>
          </Link>

          <Link
            href="/admin/payments"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Payments</h3>
            <p className="text-gray-600">View payment transactions</p>
          </Link>

          <Link
            href="/hostel"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">Hostel Management</h3>
            <p className="text-gray-600">Manage hostel rooms and bookings</p>
          </Link>

          <Link
            href="/bus"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🚌</div>
            <h3 className="text-xl font-bold mb-2">Bus Management</h3>
            <p className="text-gray-600">Manage buses and schedules</p>
          </Link>

          <Link
            href="/exam"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Exam Allocation</h3>
            <p className="text-gray-600">Manage exam schedules and allocations</p>
          </Link>

          <Link
            href="/admin/newsfeed"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-xl font-bold mb-2">News Feed</h3>
            <p className="text-gray-600">Create and manage announcements</p>
          </Link>

          <Link
            href="/admin/buses"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🚌</div>
            <h3 className="text-xl font-bold mb-2">Bus Management</h3>
            <p className="text-gray-600">Manage buses, routes, and schedules</p>
          </Link>

          <Link
            href="/admin/hostel"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">Hostel Management</h3>
            <p className="text-gray-600">Manage hostel rooms and capacity</p>
          </Link>

          <Link
            href="/admin/analytics"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-gray-600">View comprehensive reports and statistics</p>
          </Link>

          <Link
            href="/admin/communication"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Contact Super Admin</h3>
            <p className="text-gray-600">Request help or communicate with super admin</p>
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
}


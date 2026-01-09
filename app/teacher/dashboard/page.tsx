"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TeacherDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    myClasses: 0,
    pendingLeaves: 0,
    todayAttendance: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "TEACHER") {
      router.push("/dashboard");
      return;
    }
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    // Fetch teacher stats
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher Portal</h1>
          <p className="text-gray-600">Welcome, {session?.user?.name}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">My Classes</p>
                <p className="text-3xl font-bold text-teal-600">{stats.myClasses}</p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Leaves</p>
                <p className="text-3xl font-bold text-orange-600">{stats.pendingLeaves}</p>
              </div>
              <div className="text-4xl">📋</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Today's Attendance</p>
                <p className="text-3xl font-bold text-green-600">{stats.todayAttendance}</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Appointments</p>
                <p className="text-3xl font-bold text-blue-600">{stats.pendingAppointments}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/teacher/attendance"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">Mark Attendance</h3>
            <p className="text-gray-600">Mark student attendance</p>
          </Link>

          <Link
            href="/teacher/marks"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Enter Marks</h3>
            <p className="text-gray-600">Add student marks and grades</p>
          </Link>

          <Link
            href="/teacher/homework"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Assignments</h3>
            <p className="text-gray-600">Create and manage homework</p>
          </Link>

          <Link
            href="/teacher/leaves"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">Leave Requests</h3>
            <p className="text-gray-600">Apply for leave</p>
          </Link>

          <Link
            href="/teacher/appointments"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Appointments</h3>
            <p className="text-gray-600">View student appointments</p>
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">My Classes</h3>
            <p className="text-gray-600">View assigned classes</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    attendance: 0,
    assignments: 0,
    marks: 0,
    appointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "STUDENT") {
      router.push("/dashboard");
      return;
    }
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    // Fetch student stats
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Portal</h1>
          <p className="text-gray-600">Welcome, {session?.user?.name}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Attendance</p>
                <p className="text-3xl font-bold text-blue-600">{stats.attendance}%</p>
              </div>
              <div className="text-4xl">✅</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Assignments</p>
                <p className="text-3xl font-bold text-purple-600">{stats.assignments}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Marks</p>
                <p className="text-3xl font-bold text-green-600">{stats.marks}</p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Appointments</p>
                <p className="text-3xl font-bold text-orange-600">{stats.appointments}</p>
              </div>
              <div className="text-4xl">📅</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/student/attendance"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">My Attendance</h3>
            <p className="text-gray-600">View attendance records</p>
          </Link>

          <Link
            href="/student/marks"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">My Marks</h3>
            <p className="text-gray-600">View marks and grades</p>
          </Link>

          <Link
            href="/student/homework"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-bold mb-2">Assignments</h3>
            <p className="text-gray-600">View and submit homework</p>
          </Link>

          <Link
            href="/student/appointments"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Appointments</h3>
            <p className="text-gray-600">Request appointments with teachers</p>
          </Link>

          <Link
            href="/student/payments"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Payments</h3>
            <p className="text-gray-600">View fee payments</p>
          </Link>

          <Link
            href="/hostel"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">Hostel Booking</h3>
            <p className="text-gray-600">Book hostel rooms</p>
          </Link>

          <Link
            href="/bus"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🚌</div>
            <h3 className="text-xl font-bold mb-2">Bus Booking</h3>
            <p className="text-gray-600">Book bus seats</p>
          </Link>

          <Link
            href="/student/newsfeed"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">📢</div>
            <h3 className="text-xl font-bold mb-2">Announcements</h3>
            <p className="text-gray-600">View school announcements</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

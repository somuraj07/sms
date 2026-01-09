"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function StudentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    hostelBookings: 0,
    busBookings: 0,
    examAllocations: 0,
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
    // Fetch student's bookings and allocations
    // This would require additional API endpoints
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Hostel Bookings</p>
                <p className="text-3xl font-bold text-indigo-600">{stats.hostelBookings}</p>
              </div>
              <div className="text-4xl">🏠</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Bus Bookings</p>
                <p className="text-3xl font-bold text-purple-600">{stats.busBookings}</p>
              </div>
              <div className="text-4xl">🚌</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Exam Allocations</p>
                <p className="text-3xl font-bold text-green-600">{stats.examAllocations}</p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            href="/hostel"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">Book Hostel</h3>
            <p className="text-gray-600">Book your hostel room and cot</p>
          </Link>

          <Link
            href="/bus"
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition cursor-pointer"
          >
            <div className="text-4xl mb-4">🚌</div>
            <h3 className="text-xl font-bold mb-2">Book Bus</h3>
            <p className="text-gray-600">Book your bus seat</p>
          </Link>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold mb-2">My Classes</h3>
            <p className="text-gray-600">View your classes and schedule</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Grades</h3>
            <p className="text-gray-600">View your marks and grades</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-bold mb-2">Fees</h3>
            <p className="text-gray-600">View and pay fees</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-bold mb-2">Attendance</h3>
            <p className="text-gray-600">View your attendance</p>
          </div>
        </div>
      </div>
    </div>
  );
}

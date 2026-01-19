"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/student/StudentLayout";

interface Attendance {
  id: string;
  date: string;
  period: number;
  status: string;
  class: {
    name: string;
    section: string | null;
  };
}

export default function StudentAttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "STUDENT") {
      router.push("/dashboard");
      return;
    }
    fetchAttendance();
  }, [session, status, router]);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("/api/attendance/my");
      const data = await res.json();
      if (data.success) {
        setAttendances(data.data || []);
        calculateStats(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (attendanceList: Attendance[]) => {
    const total = attendanceList.length;
    const present = attendanceList.filter((a) => a.status === "PRESENT").length;
    const absent = attendanceList.filter((a) => a.status === "ABSENT").length;
    const late = attendanceList.filter((a) => a.status === "LATE").length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    setStats({ total, present, absent, late, percentage });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PRESENT":
        return "bg-green-100 text-green-700";
      case "ABSENT":
        return "bg-red-100 text-red-700";
      case "LATE":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (status === "loading" || loading) {
    return (
      <StudentLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Attendance</h1>
          <p className="text-gray-600">View your attendance records</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-1">Total Days</p>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-1">Present</p>
            <p className="text-3xl font-bold text-green-600">{stats.present}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-1">Absent</p>
            <p className="text-3xl font-bold text-red-600">{stats.absent}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-1">Attendance %</p>
            <p className="text-3xl font-bold text-purple-600">{stats.percentage}%</p>
          </div>
        </div>

        {/* Attendance List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attendances.map((attendance) => (
                <tr key={attendance.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(attendance.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attendance.class.name} {attendance.class.section ? `- ${attendance.class.section}` : ""}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">Period {attendance.period}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(attendance.status)}`}>
                      {attendance.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StudentLayout>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface Analytics {
  totalStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalBuses: number;
  totalHostelRooms: number;
  pendingLeaves: number;
  totalNewsFeeds: number;
  studentsByClass: { className: string; count: number }[];
  studentsByGender: { gender: string; count: number }[];
}

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchAnalytics();
  }, [session, router]);

  const fetchAnalytics = async () => {
    try {
      const [studentsRes, teachersRes, classesRes, busesRes, roomsRes, leavesRes, newsRes] =
        await Promise.all([
          fetch("/api/student/list"),
          fetch("/api/teacher/list"),
          fetch("/api/class/list"),
          fetch("/api/bus/list"),
          fetch("/api/hostel/rooms/list"),
          fetch("/api/leaves/pending"),
          fetch("/api/newsfeed/list"),
        ]);

      const students = await studentsRes.json();
      const teachers = await teachersRes.json();
      const classes = await classesRes.json();
      const buses = await busesRes.json();
      const rooms = await roomsRes.json();
      const leaves = await leavesRes.json();
      const news = await newsRes.json();

      // Calculate students by class
      const studentsByClass: { [key: string]: number } = {};
      const studentsByGender: { [key: string]: number } = {};

      if (students.success && students.data) {
        students.data.forEach((student: any) => {
          const className = student.class?.name || "Not Assigned";
          studentsByClass[className] = (studentsByClass[className] || 0) + 1;

          const gender = student.gender || "OTHER";
          studentsByGender[gender] = (studentsByGender[gender] || 0) + 1;
        });
      }

      setAnalytics({
        totalStudents: students.data?.length || 0,
        totalTeachers: teachers.data?.length || 0,
        totalClasses: classes.data?.length || 0,
        totalBuses: buses.data?.length || 0,
        totalHostelRooms: rooms.rooms?.length || 0,
        pendingLeaves: leaves.data?.length || 0,
        totalNewsFeeds: news.data?.length || 0,
        studentsByClass: Object.entries(studentsByClass).map(([className, count]) => ({
          className,
          count: count as number,
        })),
        studentsByGender: Object.entries(studentsByGender).map(([gender, count]) => ({
          gender,
          count: count as number,
        })),
      });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-xl">Loading analytics...</p>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <p className="text-xl text-red-600">Failed to load analytics</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Analytics & Reports</h1>
          <p className="text-gray-600">Comprehensive overview of your institution</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-blue-100 text-sm mb-1">Total Students</p>
            <p className="text-4xl font-bold">{analytics.totalStudents}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-green-100 text-sm mb-1">Total Teachers</p>
            <p className="text-4xl font-bold">{analytics.totalTeachers}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-purple-100 text-sm mb-1">Total Classes</p>
            <p className="text-4xl font-bold">{analytics.totalClasses}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <p className="text-orange-100 text-sm mb-1">Pending Leaves</p>
            <p className="text-4xl font-bold">{analytics.pendingLeaves}</p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-1">Total Buses</p>
            <p className="text-3xl font-bold text-gray-800">{analytics.totalBuses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-1">Hostel Rooms</p>
            <p className="text-3xl font-bold text-gray-800">{analytics.totalHostelRooms}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="text-gray-600 text-sm mb-1">News Feeds</p>
            <p className="text-3xl font-bold text-gray-800">{analytics.totalNewsFeeds}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students by Class */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Students by Class</h3>
            {analytics.studentsByClass.length === 0 ? (
              <p className="text-gray-500">No data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.studentsByClass.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{item.className}</span>
                      <span className="text-sm text-gray-600">{item.count} students</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${
                            (item.count / analytics.totalStudents) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Students by Gender */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4">Students by Gender</h3>
            {analytics.studentsByGender.length === 0 ? (
              <p className="text-gray-500">No data available</p>
            ) : (
              <div className="space-y-3">
                {analytics.studentsByGender.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium capitalize">{item.gender.toLowerCase()}</span>
                      <span className="text-sm text-gray-600">{item.count} students</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          item.gender === "MALE"
                            ? "bg-blue-600"
                            : item.gender === "FEMALE"
                            ? "bg-pink-600"
                            : "bg-gray-600"
                        }`}
                        style={{
                          width: `${
                            (item.count / analytics.totalStudents) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

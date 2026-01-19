"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface ExamSchedule {
  id: string;
  examType: string;
  examName: string;
  subject: string;
  department: string | null;
  examDate: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  invigilatorName: string | null;
}

interface ExamAllocation {
  id: string;
  studentName: string;
  benchNumber: string;
  seatPosition: string | null;
  rollNumber: string | null;
  roomNumber: string;
}

export default function AdminExamPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [allocations, setAllocations] = useState<ExamAllocation[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchSchedules();
  }, [session, departmentFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError("");
      const url = departmentFilter
        ? `/api/exam/schedules/list?department=${encodeURIComponent(departmentFilter)}`
        : "/api/exam/schedules/list";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSchedules(data.data || []);
      } else {
        setError(data.message || "Failed to load exam schedules");
      }
    } catch (err: any) {
      setError("Failed to load exam schedules");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocations = async (scheduleId: string) => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`/api/exam/allocations/list?scheduleId=${scheduleId}`);
      const data = await res.json();
      if (data.success) {
        setAllocations(data.data || data.allocations || []);
      } else {
        setError(data.message || "Failed to load allocations");
      }
    } catch (err: any) {
      setError("Failed to load allocations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async (scheduleId: string) => {
    try {
      const res = await fetch(`/api/exam/pdf/${scheduleId}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `exam-allocation-${scheduleId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError("Failed to download PDF");
      }
    } catch (err) {
      setError("Failed to download PDF");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Exam Allocation</h1>
          <p className="text-gray-600">Manage exam room allocations</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-4">
            <input
              type="text"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              placeholder="Filter by department (e.g., CSE, ECE)"
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button
              onClick={fetchSchedules}
              className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
            >
              Search
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Exam Schedules */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">Exam Schedules</h2>
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No exam schedules found</div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {schedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    onClick={() => {
                      setSelectedSchedule(schedule.id);
                      fetchAllocations(schedule.id);
                    }}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                      selectedSchedule === schedule.id
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-green-300"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{schedule.examName}</h3>
                        <p className="text-sm text-gray-600">{schedule.subject}</p>
                        {schedule.department && (
                          <p className="text-xs text-gray-500">{schedule.department}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Room: {schedule.roomNumber}</p>
                        {schedule.invigilatorName && (
                          <p className="text-xs text-gray-500">Invigilator: {schedule.invigilatorName}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {new Date(schedule.examDate).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(schedule.startTime).toLocaleTimeString()} -{" "}
                          {new Date(schedule.endTime).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Allocations */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Allocations</h2>
              {selectedSchedule && (
                <button
                  onClick={() => downloadPDF(selectedSchedule)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                >
                  Download PDF
                </button>
              )}
            </div>
            {selectedSchedule ? (
              loading ? (
                <div className="text-center py-8">Loading allocations...</div>
              ) : allocations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No allocations found</div>
              ) : (
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr className="border-b">
                        <th className="text-left p-2">Roll No</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Bench</th>
                        <th className="text-left p-2">Seat</th>
                        <th className="text-left p-2">Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allocations.map((alloc) => (
                        <tr key={alloc.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{alloc.rollNumber || "-"}</td>
                          <td className="p-2">{alloc.studentName}</td>
                          <td className="p-2">{alloc.benchNumber}</td>
                          <td className="p-2">{alloc.seatPosition || "-"}</td>
                          <td className="p-2">{alloc.roomNumber}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                Select an exam schedule to view allocations
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

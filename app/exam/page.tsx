"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

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

export default function ExamAllocationPage() {
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
    if (!["ADMIN", "EXAMINER", "SUPERADMIN"].includes(session.user.role)) {
      router.push("/dashboard");
      return;
    }
    fetchSchedules();
  }, [session, departmentFilter]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      // This endpoint needs to be created: GET /api/exam/schedules
      // For now, using placeholder
      const res = await fetch("/api/exam/schedule/create", { method: "GET" });
      // Handle response
    } catch (err) {
      setError("Failed to load exam schedules");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocations = async (scheduleId: string) => {
    try {
      setLoading(true);
      // This endpoint needs to be created: GET /api/exam/allocations?scheduleId=...
      const res = await fetch(`/api/exam/allocate?scheduleId=${scheduleId}`);
      const data = await res.json();
      if (data.success) {
        setAllocations(data.allocations || []);
      }
    } catch (err) {
      setError("Failed to load allocations");
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
      }
    } catch (err) {
      setError("Failed to download PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
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
              <div className="space-y-3">
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
              allocations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No allocations found</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
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
    </div>
  );
}

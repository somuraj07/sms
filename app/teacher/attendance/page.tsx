"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeacherLayout from "@/components/teacher/TeacherLayout";

interface Class {
  id: string;
  name: string;
  section: string | null;
}

interface Student {
  id: string;
  user: { name: string };
  rollNo: string | null;
}

export default function MarkAttendancePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [period, setPeriod] = useState(1);
  const [attendances, setAttendances] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "TEACHER") {
      router.push("/dashboard");
      return;
    }
    fetchClasses();
  }, [session]);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const res = await fetch("/api/class/list");
      const data = await res.json();
      if (data.success) {
        setClasses(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch classes:", error);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/class/students?classId=${selectedClass}`);
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
        // Initialize all as PRESENT
        const initial: Record<string, "PRESENT"> = {};
        data.data.forEach((s: Student) => {
          initial[s.id] = "PRESENT";
        });
        setAttendances(initial);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/attendance/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date,
          period,
          attendances: Object.entries(attendances).map(([studentId, status]) => ({
            studentId,
            status,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Attendance marked successfully!");
        setTimeout(() => {
          setSuccess("");
          setAttendances({});
        }, 3000);
      } else {
        setError(data.message || "Failed to mark attendance");
      }
    } catch (error) {
      setError("Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mark Attendance</h1>
          <p className="text-gray-600">Mark attendance for your class</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Class *</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} {cls.section ? `- ${cls.section}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Period *</label>
              <select
                value={period}
                onChange={(e) => setPeriod(parseInt(e.target.value))}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={p}>
                    Period {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          {students.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4">Students</h3>
              <div className="space-y-2">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{student.user.name}</p>
                      {student.rollNo && (
                        <p className="text-sm text-gray-500">Roll: {student.rollNo}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setAttendances({ ...attendances, [student.id]: "PRESENT" })}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          attendances[student.id] === "PRESENT"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Present
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendances({ ...attendances, [student.id]: "ABSENT" })}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          attendances[student.id] === "ABSENT"
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Absent
                      </button>
                      <button
                        type="button"
                        onClick={() => setAttendances({ ...attendances, [student.id]: "LATE" })}
                        className={`px-4 py-2 rounded-lg font-medium transition ${
                          attendances[student.id] === "LATE"
                            ? "bg-yellow-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        Late
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {students.length > 0 && (
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {loading ? "Marking..." : "Mark Attendance"}
            </button>
          )}
        </form>
      </div>
    </TeacherLayout>
  );
}

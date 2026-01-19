"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeacherLayout from "@/components/teacher/TeacherLayout";

interface Student {
  id: string;
  AdmissionNo: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  class: {
    id: string;
    name: string;
    section: string | null;
  } | null;
  gender: string;
}

export default function TeacherStudentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "TEACHER") {
      router.push("/dashboard");
      return;
    }
    fetchStudents();
  }, [session, status, router]);

  const fetchStudents = async () => {
    try {
      const res = await fetch("/api/teacher/students");
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-full">
          <p>Loading...</p>
        </div>
      </TeacherLayout>
    );
  }

  // Group students by class
  const studentsByClass = students.reduce((acc, student) => {
    const className = student.class?.name || "Unassigned";
    if (!acc[className]) {
      acc[className] = [];
    }
    acc[className].push(student);
    return acc;
  }, {} as Record<string, Student[]>);

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Students</h1>
          <p className="text-gray-600">Students in your assigned classes</p>
        </div>

        <div className="space-y-6">
          {Object.entries(studentsByClass).map(([className, classStudents]) => (
            <div key={className} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">{className} ({classStudents.length} students)</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Admission No</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {classStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{student.AdmissionNo}</td>
                        <td className="px-4 py-3 font-medium">{student.user.name}</td>
                        <td className="px-4 py-3">{student.user.email || "-"}</td>
                        <td className="px-4 py-3 capitalize">{student.gender.toLowerCase()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TeacherLayout>
  );
}

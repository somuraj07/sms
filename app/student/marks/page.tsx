"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/student/StudentLayout";

interface Mark {
  id: string;
  subject: string;
  marks: number;
  totalMarks: number;
  suggestions: string | null;
  exam: {
    id: string;
    name: string;
  };
  createdAt: string;
}

export default function StudentMarksPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchMarks();
  }, [session, status, router]);

  const fetchMarks = async () => {
    try {
      const res = await fetch("/api/marks/my");
      const data = await res.json();
      if (data.success) {
        setMarks(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch marks:", error);
    } finally {
      setLoading(false);
    }
  };

  const getGrade = (percentage: number) => {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B+";
    if (percentage >= 60) return "B";
    if (percentage >= 50) return "C+";
    if (percentage >= 40) return "C";
    return "F";
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

  // Group marks by exam
  const marksByExam = marks.reduce((acc, mark) => {
    const examName = mark.exam.name;
    if (!acc[examName]) {
      acc[examName] = [];
    }
    acc[examName].push(mark);
    return acc;
  }, {} as Record<string, Mark[]>);

  return (
    <StudentLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Marks</h1>
          <p className="text-gray-600">View your marks and grades</p>
        </div>

        <div className="space-y-6">
          {Object.entries(marksByExam).map(([examName, examMarks]) => {
            const totalObtained = examMarks.reduce((sum, m) => sum + m.marks, 0);
            const totalMax = examMarks.reduce((sum, m) => sum + m.totalMarks, 0);
            const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

            return (
              <div key={examName} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{examName}</h2>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold">
                      {totalObtained.toFixed(2)} / {totalMax.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {percentage.toFixed(2)}% - Grade: {getGrade(percentage)}
                    </p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Suggestions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {examMarks.map((mark) => {
                        const markPercentage = (mark.marks / mark.totalMarks) * 100;
                        return (
                          <tr key={mark.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{mark.subject}</td>
                            <td className="px-4 py-3">
                              {mark.marks.toFixed(2)} / {mark.totalMarks.toFixed(2)}
                            </td>
                            <td className="px-4 py-3">{markPercentage.toFixed(2)}%</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium">
                                {getGrade(markPercentage)}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{mark.suggestions || "-"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StudentLayout>
  );
}

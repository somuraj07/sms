"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/student/StudentLayout";

interface Homework {
  id: string;
  title: string;
  description: string;
  subject: string;
  dueDate: string | null;
  class: {
    id: string;
    name: string;
    section: string | null;
  };
  teacher: {
    id: string;
    name: string;
  };
  hasSubmitted?: boolean;
  submission?: {
    id: string;
    content: string;
    submittedAt: string;
  } | null;
}

export default function StudentAssignmentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHomework, setSelectedHomework] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    fetchHomeworks();
  }, [session, status, router]);

  const fetchHomeworks = async () => {
    try {
      const res = await fetch("/api/homework/list");
      const data = await res.json();
      if (data.homeworks) {
        setHomeworks(data.homeworks || []);
      }
    } catch (error) {
      console.error("Failed to fetch homeworks:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (homeworkId: string) => {
    if (!submissionContent.trim()) {
      alert("Please enter your submission");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/homework/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homeworkId,
          content: submissionContent,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedHomework(null);
        setSubmissionContent("");
        fetchHomeworks();
        alert("Assignment submitted successfully!");
      } else {
        alert(data.message || "Failed to submit assignment");
      }
    } catch (error) {
      alert("Failed to submit assignment");
    } finally {
      setSubmitting(false);
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Assignments</h1>
          <p className="text-gray-600">View and submit your homework assignments</p>
        </div>

        <div className="space-y-4">
          {homeworks.map((homework) => (
            <div key={homework.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold mb-2">{homework.title}</h3>
                  <p className="text-gray-600 mb-2">{homework.description}</p>
                  <div className="flex gap-4 text-sm text-gray-500">
                    <span>Subject: {homework.subject}</span>
                    <span>Teacher: {homework.teacher.name}</span>
                    {homework.dueDate && (
                      <span>Due: {new Date(homework.dueDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div>
                  {homework.hasSubmitted ? (
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                      Submitted
                    </span>
                  ) : (
                    <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-medium">
                      Pending
                    </span>
                  )}
                </div>
              </div>
              {!homework.hasSubmitted && (
                <button
                  onClick={() => setSelectedHomework(homework.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Assignment
                </button>
              )}
              {homework.submission && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Your Submission:</p>
                  <p className="text-gray-800">{homework.submission.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {new Date(homework.submission.submittedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Submit Modal */}
        {selectedHomework && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <h2 className="text-2xl font-bold mb-4">Submit Assignment</h2>
              <textarea
                value={submissionContent}
                onChange={(e) => setSubmissionContent(e.target.value)}
                placeholder="Enter your submission..."
                className="w-full px-4 py-2 border rounded-lg mb-4"
                rows={10}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedHomework(null);
                    setSubmissionContent("");
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmit(selectedHomework)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

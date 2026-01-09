"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ParentDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "PARENT") {
      router.push("/dashboard");
      return;
    }
    fetchChildren();
  }, [session]);

  const fetchChildren = async () => {
    // Fetch parent's children
    // This would require additional API endpoints
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Parent Portal</h1>
          <p className="text-gray-600">Welcome, {session?.user?.name}</p>
        </div>

        {/* Children Selection */}
        {children.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Select Child</h2>
            <div className="flex gap-4">
              {children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChild(child.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition ${
                    selectedChild === child.id
                      ? "bg-pink-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedChild ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-2">Hostel Booking</h3>
              <p className="text-gray-600">View child's hostel booking</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">🚌</div>
              <h3 className="text-xl font-bold mb-2">Bus Booking</h3>
              <p className="text-gray-600">View child's bus bookings</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2">Exam Schedule</h3>
              <p className="text-gray-600">View child's exam schedule</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Grades</h3>
              <p className="text-gray-600">View child's grades and marks</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Fees</h3>
              <p className="text-gray-600">View and pay fees</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">Attendance</h3>
              <p className="text-gray-600">View child's attendance</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              {children.length === 0
                ? "No children linked to your account"
                : "Please select a child to view details"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

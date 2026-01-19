"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface Leave {
  id: string;
  leaveType: string;
  reason: string;
  days: string;
  fromDate: string;
  toDate: string;
  status: string;
  remarks: string | null;
  teacher: {
    id: string;
    name: string;
    email: string;
    mobile: string | null;
  };
  createdAt: string;
}

export default function LeavesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [remarks, setRemarks] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchLeaves();
  }, [session, filter]);

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leaves/pending");
      const data = await res.json();
      if (data.success) {
        const allLeaves = data.data || [];
        if (filter === "ALL") {
          setLeaves(allLeaves);
        } else {
          setLeaves(allLeaves.filter((l: Leave) => l.status === filter));
        }
      }
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: string) => {
    try {
      const res = await fetch(`/api/leaves/${leaveId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedLeave(null);
        setRemarks("");
        setActionType(null);
        fetchLeaves();
      } else {
        alert(data.message || "Failed to approve leave");
      }
    } catch (error) {
      alert("Failed to approve leave");
    }
  };

  const handleReject = async (leaveId: string) => {
    if (!remarks.trim()) {
      alert("Please provide remarks for rejection");
      return;
    }

    try {
      const res = await fetch(`/api/leaves/${leaveId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedLeave(null);
        setRemarks("");
        setActionType(null);
        fetchLeaves();
      } else {
        alert(data.message || "Failed to reject leave");
      }
    } catch (error) {
      alert("Failed to reject leave");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Leave Requests</h1>
          <p className="text-gray-600">Manage teacher leave requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter("PENDING")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "PENDING"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Pending ({leaves.filter((l) => l.status === "PENDING").length})
            </button>
            <button
              onClick={() => setFilter("APPROVED")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "APPROVED"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setFilter("REJECTED")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "REJECTED"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter("ALL")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {leaves.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No leave requests found</p>
              </div>
            ) : (
              leaves.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{leave.teacher.name}</h3>
                      <p className="text-gray-600">{leave.teacher.email}</p>
                      {leave.teacher.mobile && (
                        <p className="text-gray-600">{leave.teacher.mobile}</p>
                      )}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        leave.status
                      )}`}
                    >
                      {leave.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Leave Type</p>
                      <p className="font-medium capitalize">{leave.leaveType.toLowerCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Days</p>
                      <p className="font-medium">{leave.days}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">From Date</p>
                      <p className="font-medium">
                        {new Date(leave.fromDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">To Date</p>
                      <p className="font-medium">
                        {new Date(leave.toDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Reason</p>
                    <p className="text-gray-800">{leave.reason}</p>
                  </div>

                  {leave.remarks && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-500 mb-1">Remarks</p>
                      <p className="text-gray-800">{leave.remarks}</p>
                    </div>
                  )}

                  {leave.status === "PENDING" && (
                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setActionType("approve");
                          setRemarks("");
                        }}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedLeave(leave);
                          setActionType("reject");
                          setRemarks("");
                        }}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Action Modal */}
        {selectedLeave && actionType && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {actionType === "approve" ? "Approve" : "Reject"} Leave Request
              </h2>
              <div className="mb-4">
                <p className="text-gray-600 mb-2">
                  <strong>Teacher:</strong> {selectedLeave.teacher.name}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Period:</strong> {new Date(selectedLeave.fromDate).toLocaleDateString()}{" "}
                  - {new Date(selectedLeave.toDate).toLocaleDateString()}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Remarks {actionType === "reject" && "*"}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Enter remarks..."
                  required={actionType === "reject"}
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setSelectedLeave(null);
                    setActionType(null);
                    setRemarks("");
                  }}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionType === "approve") {
                      handleApprove(selectedLeave.id);
                    } else {
                      handleReject(selectedLeave.id);
                    }
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-white ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {actionType === "approve" ? "Approve" : "Reject"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

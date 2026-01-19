"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  totalColleges: number;
  activeColleges: number;
  totalStudents: number;
  totalTeachers: number;
  totalDepartments: number;
  totalStorageGB: number;
  colleges: Array<{
    id: string;
    name: string;
    subdomain: string;
    isActive: boolean;
    studentCount: number;
    teacherCount: number;
    createdAt: string;
  }>;
}

interface AnalysisData {
  collegesByState: Record<string, number>;
  collegesByCity: Record<string, number>;
  growthData: Array<{ month: string; colleges: number; students: number }>;
  topColleges: Array<{
    name: string;
    students: number;
    teachers: number;
    subdomain: string;
  }>;
}

export default function SuperAdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "analysis">("overview");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    location: "",
    pincode: "",
    district: "",
    state: "",
    city: "",
    subdomain: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    adminMobile: "",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/login");
      return;
    }

    if (session.user.role !== "SUPERADMIN") {
      router.push("/login");
      return;
    }

    fetchDashboardStats();
    if (activeTab === "analysis") {
      fetchAnalysis();
    }
  }, [session, status, router, activeTab]);

  const fetchDashboardStats = async () => {
    try {
      const res = await fetch("/api/superadmin/dashboard");
      const data = await res.json();
      if (data.success && data.data) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const res = await fetch("/api/superadmin/analysis");
      const data = await res.json();
      if (data.success && data.data) {
        setAnalysis(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analysis:", error);
    }
  };

  const handleCreateCollege = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/superadmin/colleges/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success || res.status === 201) {
        setSuccess("College created successfully!");
        setShowCreateModal(false);
        setFormData({
          name: "",
          address: "",
          location: "",
          pincode: "",
          district: "",
          state: "",
          city: "",
          subdomain: "",
          adminName: "",
          adminEmail: "",
          adminPassword: "",
          adminMobile: "",
        });
        fetchDashboardStats();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.message || "Failed to create college");
      }
    } catch (error) {
      setError("Failed to create college");
    } finally {
      setCreating(false);
    }
  };

  if (status === "loading" || loading || !session || session.user.role !== "SUPERADMIN") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Super Admin Dashboard
              </h1>
              <p className="text-gray-600">Welcome, {session.user.name || session.user.email}!</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              + Create College
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 border-b">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "overview"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`px-4 py-2 font-medium transition ${
                activeTab === "analysis"
                  ? "text-indigo-600 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Analysis
            </button>
          </div>
        </div>

        {/* Error/Success Messages */}
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

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Total Colleges</p>
                    <p className="text-4xl font-bold">{stats?.totalColleges || 0}</p>
                  </div>
                  <div className="text-5xl opacity-80">🏫</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Active Colleges</p>
                    <p className="text-4xl font-bold">{stats?.activeColleges || 0}</p>
                  </div>
                  <div className="text-5xl opacity-80">✅</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">Total Students</p>
                    <p className="text-4xl font-bold">{stats?.totalStudents || 0}</p>
                  </div>
                  <div className="text-5xl opacity-80">👨‍🎓</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm mb-1">Total Teachers</p>
                    <p className="text-4xl font-bold">{stats?.totalTeachers || 0}</p>
                  </div>
                  <div className="text-5xl opacity-80">👨‍🏫</div>
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Total Departments</p>
                    <p className="text-3xl font-bold text-indigo-600">{stats?.totalDepartments || 0}</p>
                  </div>
                  <div className="text-4xl">📚</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm mb-1">Storage Used</p>
                    <p className="text-3xl font-bold text-gray-800">{stats?.totalStorageGB || 0} GB</p>
                  </div>
                  <div className="text-4xl">💾</div>
                </div>
              </div>
            </div>

            {/* Recent Colleges */}
            {stats && stats.colleges.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Colleges</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Name</th>
                        <th className="text-left p-3">Subdomain</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Students</th>
                        <th className="text-left p-3">Teachers</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.colleges.slice(0, 10).map((college) => (
                        <tr key={college.id} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{college.name}</td>
                          <td className="p-3 text-gray-600">{college.subdomain}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-1 rounded text-sm ${
                                college.isActive
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {college.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="p-3">{college.studentCount}</td>
                          <td className="p-3">{college.teacherCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && analysis && (
          <div className="space-y-6">
            {/* Top Colleges */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Colleges by Enrollment</h2>
              <div className="space-y-4">
                {analysis.topColleges.map((college, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold">{college.name}</p>
                        <p className="text-sm text-gray-500">{college.subdomain}</p>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Students</p>
                        <p className="font-bold text-lg">{college.students}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Teachers</p>
                        <p className="font-bold text-lg">{college.teachers}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colleges by State */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Colleges by State</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analysis.collegesByState).map(([state, count]) => (
                  <div key={state} className="p-4 border rounded-lg">
                    <p className="font-bold text-lg">{state}</p>
                    <p className="text-2xl font-bold text-indigo-600">{count} colleges</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Colleges by City */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Colleges by City</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(analysis.collegesByCity).slice(0, 12).map(([city, count]) => (
                  <div key={city} className="p-4 border rounded-lg">
                    <p className="font-medium">{city}</p>
                    <p className="text-xl font-bold text-purple-600">{count}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Data */}
            {analysis.growthData && analysis.growthData.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Growth Trends</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">Month</th>
                        <th className="text-left p-3">New Colleges</th>
                        <th className="text-left p-3">New Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.growthData.map((data, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-3 font-medium">{data.month}</td>
                          <td className="p-3">{data.colleges}</td>
                          <td className="p-3">{data.students}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create College Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Create New College</h2>
              <form onSubmit={handleCreateCollege} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">College Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subdomain *</label>
                    <input
                      type="text"
                      value={formData.subdomain}
                      onChange={(e) => setFormData({ ...formData, subdomain: e.target.value.toLowerCase() })}
                      className="w-full px-4 py-2 border rounded-lg"
                      placeholder="college-name"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Will be: {formData.subdomain || "college-name"}.company.com</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Address *</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Location *</label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">District *</label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Pincode *</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-bold mb-4">Admin Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Name *</label>
                      <input
                        type="text"
                        value={formData.adminName}
                        onChange={(e) => setFormData({ ...formData, adminName: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Email *</label>
                      <input
                        type="email"
                        value={formData.adminEmail}
                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Password *</label>
                      <input
                        type="password"
                        value={formData.adminPassword}
                        onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Admin Mobile</label>
                      <input
                        type="tel"
                        value={formData.adminMobile}
                        onChange={(e) => setFormData({ ...formData, adminMobile: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {creating ? "Creating..." : "Create College"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


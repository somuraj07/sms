"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface Bus {
  id: string;
  busNumber: string;
  busName: string | null;
  totalSeats: number;
  routeName: string;
  schedules: BusSchedule[];
}

interface BusSchedule {
  id: string;
  className: string;
  departureTime: string;
  arrivalTime: string;
  pickupPoint: string | null;
  dropPoint: string | null;
  isActive: boolean;
}

export default function BusesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBusModal, setShowBusModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [busFormData, setBusFormData] = useState({
    busNumber: "",
    busName: "",
    totalSeats: "",
    routeName: "",
  });
  const [scheduleFormData, setScheduleFormData] = useState({
    className: "",
    departureTime: "",
    arrivalTime: "",
    pickupPoint: "",
    dropPoint: "",
  });

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchBuses();
  }, [session]);

  const fetchBuses = async () => {
    try {
      const res = await fetch("/api/bus/list");
      const data = await res.json();
      if (data.success) {
        // Fetch schedules for each bus
        const busesWithSchedules = await Promise.all(
          data.data.map(async (bus: Bus) => {
            const scheduleRes = await fetch(`/api/bus/schedules/list?busId=${bus.id}`);
            const scheduleData = await scheduleRes.json();
            return {
              ...bus,
              schedules: scheduleData.data || [],
            };
          })
        );
        setBuses(busesWithSchedules);
      }
    } catch (error) {
      console.error("Failed to fetch buses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/bus/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...busFormData,
          busName: busFormData.busName || null,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setShowBusModal(false);
        setBusFormData({
          busNumber: "",
          busName: "",
          totalSeats: "",
          routeName: "",
        });
        fetchBuses();
      } else {
        alert(data.message || "Failed to create bus");
      }
    } catch (error) {
      alert("Failed to create bus");
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBus) return;

    try {
      const res = await fetch("/api/bus/schedule/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: selectedBus,
          ...scheduleFormData,
          pickupPoint: scheduleFormData.pickupPoint || null,
          dropPoint: scheduleFormData.dropPoint || null,
        }),
      });

      const data = await res.json();
      if (data.success || data.message) {
        setShowScheduleModal(false);
        setSelectedBus(null);
        setScheduleFormData({
          className: "",
          departureTime: "",
          arrivalTime: "",
          pickupPoint: "",
          dropPoint: "",
        });
        fetchBuses();
      } else {
        alert(data.message || "Failed to create schedule");
      }
    } catch (error) {
      alert("Failed to create schedule");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Management</h1>
            <p className="text-gray-600">Manage buses, routes, and schedules</p>
          </div>
          <button
            onClick={() => setShowBusModal(true)}
            className="px-6 py-3 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition"
          >
            + Add Bus
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-6">
            {buses.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No buses found</p>
              </div>
            ) : (
              buses.map((bus) => (
                <div
                  key={bus.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">
                        {bus.busName || bus.busNumber}
                      </h3>
                      <p className="text-gray-600">Bus Number: {bus.busNumber}</p>
                      <p className="text-gray-600">Route: {bus.routeName}</p>
                      <p className="text-gray-600">Total Seats: {bus.totalSeats}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBus(bus.id);
                        setShowScheduleModal(true);
                      }}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
                    >
                      + Add Schedule
                    </button>
                  </div>

                  {bus.schedules.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-bold mb-2">Schedules:</h4>
                      <div className="space-y-2">
                        {bus.schedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            className="bg-gray-50 rounded-lg p-4 border"
                          >
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div>
                                <p className="text-sm text-gray-500">Class</p>
                                <p className="font-medium">{schedule.className}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Departure</p>
                                <p className="font-medium">
                                  {new Date(schedule.departureTime).toLocaleTimeString()}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Pickup Point</p>
                                <p className="font-medium">
                                  {schedule.pickupPoint || "Not set"}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-500">Drop Point</p>
                                <p className="font-medium">
                                  {schedule.dropPoint || "Not set"}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  schedule.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {schedule.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Bus Modal */}
        {showBusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add Bus</h2>
              <form onSubmit={handleCreateBus} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Bus Number *</label>
                  <input
                    type="text"
                    value={busFormData.busNumber}
                    onChange={(e) =>
                      setBusFormData({ ...busFormData, busNumber: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Bus Name</label>
                  <input
                    type="text"
                    value={busFormData.busName}
                    onChange={(e) =>
                      setBusFormData({ ...busFormData, busName: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Total Seats *</label>
                  <input
                    type="number"
                    value={busFormData.totalSeats}
                    onChange={(e) =>
                      setBusFormData({ ...busFormData, totalSeats: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Route Name *</label>
                  <input
                    type="text"
                    value={busFormData.routeName}
                    onChange={(e) =>
                      setBusFormData({ ...busFormData, routeName: e.target.value })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowBusModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Schedule Modal */}
        {showScheduleModal && selectedBus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Add Schedule</h2>
              <form onSubmit={handleCreateSchedule} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Class Name *</label>
                  <input
                    type="text"
                    value={scheduleFormData.className}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        className: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., 1st Year, CSE, ECE"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Departure Time *</label>
                  <input
                    type="datetime-local"
                    value={scheduleFormData.departureTime}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        departureTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Arrival Time *</label>
                  <input
                    type="datetime-local"
                    value={scheduleFormData.arrivalTime}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        arrivalTime: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Pickup Point</label>
                  <input
                    type="text"
                    value={scheduleFormData.pickupPoint}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        pickupPoint: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Main Gate, Station"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Drop Point</label>
                  <input
                    type="text"
                    value={scheduleFormData.dropPoint}
                    onChange={(e) =>
                      setScheduleFormData({
                        ...scheduleFormData,
                        dropPoint: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., College Campus"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleModal(false);
                      setSelectedBus(null);
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

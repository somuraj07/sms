"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Bus {
  id: string;
  busNumber: string;
  busName: string | null;
  totalSeats: number;
  routeName: string;
}

interface BusSeat {
  id: string;
  seatNumber: string;
  seatType: "WINDOW" | "AISLE" | "MIDDLE" | null;
  isAvailable: boolean;
}

interface BusSchedule {
  id: string;
  busId: string;
  className: string;
  departureTime: string;
  arrivalTime: string;
  pickupPoint: string | null;
  dropPoint: string | null;
}

interface BusAvailability {
  bus: Bus;
  seats: BusSeat[];
  availableSeats: BusSeat[];
  occupiedSeats: number;
}

export default function BusBookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [schedules, setSchedules] = useState<BusSchedule[]>([]);
  const [selectedBus, setSelectedBus] = useState<BusAvailability | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null);
  const [selectedSchedule, setSelectedSchedule] = useState<string | null>(null);
  const [travelDate, setTravelDate] = useState(new Date().toISOString().split("T")[0]);
  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "STUDENT") {
      router.push("/dashboard");
      return;
    }
    fetchBuses();
  }, [session]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bus/create"); // This should be a list endpoint
      // For now, we'll create a mock or use a different approach
      // You may need to create GET /api/bus/list endpoint
    } catch (err) {
      setError("Failed to load buses");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    if (!className) return;
    try {
      setLoading(true);
      // This endpoint needs to be created: GET /api/bus/schedules?className=...
      const res = await fetch(`/api/bus/schedule/create`); // Placeholder
      // Handle response
    } catch (err) {
      setError("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const fetchBusAvailability = async (busId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/bus/availability/${busId}?travelDate=${travelDate}`);
      const data = await res.json();
      if (data.availability) {
        setSelectedBus(data.availability);
      }
    } catch (err) {
      setError("Failed to load bus availability");
    } finally {
      setLoading(false);
    }
  };

  const handleBookSeat = async () => {
    if (!selectedBus || !selectedSeat) {
      setError("Please select a seat");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/bus/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: selectedBus.bus.id,
          seatId: selectedSeat,
          scheduleId: selectedSchedule,
          travelDate: travelDate,
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setSuccess("Seat booked successfully!");
        setTimeout(() => {
          setSelectedBus(null);
          setSelectedSeat(null);
        }, 2000);
      } else {
        setError(data.message || "Booking failed");
      }
    } catch (err) {
      setError("Failed to book seat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Bus Booking</h1>
          <p className="text-gray-600">Select a bus and book your seat</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g., CSE, 1st Year"
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Travel Date</label>
              <input
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchSchedules}
                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700"
              >
                Search Buses
              </button>
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bus List / Schedule */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Available Buses</h2>
              {schedules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Enter class and date to search
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      onClick={() => fetchBusAvailability(schedule.busId)}
                      className="p-4 rounded-lg border-2 border-gray-200 hover:border-purple-300 cursor-pointer"
                    >
                      <h3 className="font-bold">{schedule.className}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(schedule.departureTime).toLocaleTimeString()} -{" "}
                        {new Date(schedule.arrivalTime).toLocaleTimeString()}
                      </p>
                      {schedule.pickupPoint && (
                        <p className="text-xs text-gray-500 mt-1">
                          From: {schedule.pickupPoint}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Seat Selection */}
          <div className="lg:col-span-2">
            {selectedBus ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedBus.bus.busNumber}</h2>
                    <p className="text-gray-600">
                      {selectedBus.bus.routeName} • {selectedBus.availableSeats.length} seats available
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBus(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                {/* Seat Map */}
                <div className="mb-6">
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {selectedBus.seats.map((seat) => {
                      const isAvailable = seat.isAvailable;
                      const isSelected = selectedSeat === seat.id;
                      const seatType = seat.seatType || "MIDDLE";
                      return (
                        <button
                          key={seat.id}
                          onClick={() => isAvailable && setSelectedSeat(seat.id)}
                          disabled={!isAvailable}
                          className={`aspect-square rounded-lg font-medium transition-all relative ${
                            isSelected
                              ? "bg-purple-600 text-white scale-110 shadow-lg"
                              : isAvailable
                              ? seatType === "WINDOW"
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : seatType === "AISLE"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-red-100 text-red-700 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {seat.seatNumber}
                          {seatType === "WINDOW" && (
                            <span className="absolute top-1 right-1 text-xs">🪟</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-100 rounded"></div>
                      <span>Window</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 rounded"></div>
                      <span>Aisle</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 rounded"></div>
                      <span>Occupied</span>
                    </div>
                  </div>
                </div>

                {selectedSeat && (
                  <button
                    onClick={handleBookSeat}
                    disabled={loading}
                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-50"
                  >
                    {loading ? "Booking..." : "Book Selected Seat"}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">Select a bus schedule to view seats</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

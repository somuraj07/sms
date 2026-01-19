"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface HostelRoom {
  id: string;
  name: string;
  capacity: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  totalCots: number;
  availableCots: number;
  occupiedCots: number;
}

interface Cot {
  id: string;
  cotNumber: string;
  isAvailable: boolean;
  roomId: string;
}

interface RoomAvailability {
  room: HostelRoom;
  cots: Cot[];
  availableCots: Cot[];
  occupiedCots: Cot[];
}

export default function HostelBookingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState<HostelRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomAvailability | null>(null);
  const [selectedCot, setSelectedCot] = useState<string | null>(null);
  const [genderFilter, setGenderFilter] = useState<"MALE" | "FEMALE" | "ALL">("ALL");
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
    fetchRooms();
  }, [session, genderFilter]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const gender = genderFilter === "ALL" ? null : genderFilter;
      const url = gender ? `/api/hostel/rooms/list?gender=${gender}` : "/api/hostel/rooms/list";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
      }
    } catch (err) {
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomAvailability = async (roomId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hostel/availability/${roomId}`);
      const data = await res.json();
      if (data.availability) {
        setSelectedRoom(data.availability);
      }
    } catch (err) {
      setError("Failed to load room availability");
    } finally {
      setLoading(false);
    }
  };

  const handleBookCot = async () => {
    if (!selectedRoom || !selectedCot) {
      setError("Please select a cot");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/hostel/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom.room.id,
          cotId: selectedCot,
          checkInDate: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.message) {
        setSuccess("Cot booked successfully!");
        setTimeout(() => {
          setSelectedRoom(null);
          setSelectedCot(null);
          fetchRooms();
        }, 2000);
      } else {
        setError(data.message || "Booking failed");
      }
    } catch (err) {
      setError("Failed to book cot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Hostel Booking</h1>
          <p className="text-gray-600">Select a room and book your cot</p>
        </div>

        {/* Gender Filter */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setGenderFilter("ALL")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                genderFilter === "ALL"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              All Rooms
            </button>
            <button
              onClick={() => setGenderFilter("MALE")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                genderFilter === "MALE"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Male Rooms
            </button>
            <button
              onClick={() => setGenderFilter("FEMALE")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                genderFilter === "FEMALE"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Female Rooms
            </button>
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
          {/* Rooms List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Available Rooms</h2>
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : rooms.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No rooms available</div>
              ) : (
                <div className="space-y-3">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => fetchRoomAvailability(room.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                        selectedRoom?.room.id === room.id
                          ? "border-indigo-600 bg-indigo-50"
                          : "border-gray-200 hover:border-indigo-300"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg">{room.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{room.gender.toLowerCase()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-green-600">
                            {room.availableCots} Available
                          </p>
                          <p className="text-xs text-gray-500">
                            {room.occupiedCots}/{room.totalCots} Occupied
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cot Selection */}
          <div className="lg:col-span-2">
            {selectedRoom ? (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedRoom.room.name}</h2>
                    <p className="text-gray-600">
                      Select a cot • {selectedRoom.availableCots.length} available
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>

                {/* Seat-style Cot Grid */}
                <div className="mb-6">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {selectedRoom.cots.map((cot) => {
                      const isAvailable = cot.isAvailable;
                      const isSelected = selectedCot === cot.id;
                      return (
                        <button
                          key={cot.id}
                          onClick={() => isAvailable && setSelectedCot(cot.id)}
                          disabled={!isAvailable}
                          className={`aspect-square rounded-lg font-medium transition-all ${
                            isSelected
                              ? "bg-indigo-600 text-white scale-110 shadow-lg"
                              : isAvailable
                              ? "bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105"
                              : "bg-red-100 text-red-700 cursor-not-allowed opacity-50"
                          }`}
                        >
                          {cot.cotNumber}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-100 rounded"></div>
                      <span>Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-red-100 rounded"></div>
                      <span>Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-indigo-600 rounded"></div>
                      <span>Selected</span>
                    </div>
                  </div>
                </div>

                {selectedCot && (
                  <button
                    onClick={handleBookCot}
                    disabled={loading}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {loading ? "Booking..." : "Book Selected Cot"}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-500 text-lg">Select a room to view available cots</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

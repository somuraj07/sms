"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/student/StudentLayout";

interface Message {
  id: string;
  message: string;
  senderId: string;
  receiverId: string;
  sender: { name: string };
  receiver: { name: string };
  createdAt: string;
}

interface ChatUser {
  id: string;
  name: string;
  role: string;
}

export default function StudentChatPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    fetchUsers();
  }, [session, status, router]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/communication/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchMessages = async () => {
    if (!selectedUser) return;
    try {
      const res = await fetch(`/api/communication/messages?userId=${selectedUser}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    try {
      setLoading(true);
      const res = await fetch("/api/communication/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser,
          message: newMessage,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setNewMessage("");
        fetchMessages();
      } else {
        alert(data.message || "Failed to send message");
      }
    } catch (error) {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Chat with Teacher</h1>
          <p className="text-gray-600">Communicate with your teachers</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: "600px" }}>
          <div className="flex h-full">
            {/* Users List */}
            <div className="w-1/3 border-r overflow-y-auto">
              <div className="p-4 border-b bg-gray-50">
                <h2 className="font-bold">Teachers</h2>
              </div>
              <div className="divide-y">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user.id)}
                    className={`w-full text-left p-4 hover:bg-gray-50 transition ${
                      selectedUser === user.id ? "bg-blue-50 border-l-4 border-blue-600" : ""
                    }`}
                  >
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{user.role.toLowerCase()}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser ? (
                <>
                  <div className="p-4 border-b bg-gray-50">
                    <h2 className="font-bold">
                      {users.find((u) => u.id === selectedUser)?.name || "User"}
                    </h2>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg) => {
                      const isSender = msg.senderId === session?.user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isSender ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isSender
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p className={`text-xs mt-1 ${isSender ? "text-blue-100" : "text-gray-500"}`}>
                              {new Date(msg.createdAt).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border rounded-lg"
                    />
                    <button
                      type="submit"
                      disabled={loading || !newMessage.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Send
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Select a teacher to start chatting
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}

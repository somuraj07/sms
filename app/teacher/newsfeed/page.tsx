"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TeacherLayout from "@/components/teacher/TeacherLayout";

interface NewsFeed {
  id: string;
  title: string;
  description: string;
  tagline: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
}

export default function TeacherNewsFeedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [feeds, setFeeds] = useState<NewsFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tagline: "",
    mediaUrl: "",
    mediaType: "IMAGE",
  });

  useEffect(() => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (session.user.role !== "TEACHER") {
      router.push("/dashboard");
      return;
    }
    fetchFeeds();
  }, [session]);

  const fetchFeeds = async () => {
    try {
      const res = await fetch("/api/newsfeed/list");
      const data = await res.json();
      if (data.success) {
        setFeeds(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch news feeds:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/newsfeed/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({ title: "", description: "", tagline: "", mediaUrl: "", mediaType: "IMAGE" });
        fetchFeeds();
      } else {
        alert(data.message || "Failed to create news feed");
      }
    } catch (error) {
      alert("Failed to create news feed");
    }
  };

  return (
    <TeacherLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">News Feed</h1>
            <p className="text-gray-600">Create and manage announcements</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition"
          >
            + Create News Feed
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {feeds.map((feed) => (
              <div key={feed.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {feed.mediaUrl && (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {feed.mediaType === "IMAGE" ? (
                      <img src={feed.mediaUrl} alt={feed.title} className="w-full h-full object-cover" />
                    ) : (
                      <video src={feed.mediaUrl} className="w-full h-full object-cover" controls />
                    )}
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{feed.title}</h3>
                  {feed.tagline && <p className="text-gray-600 text-sm mb-2">{feed.tagline}</p>}
                  <p className="text-gray-700">{feed.description}</p>
                  <p className="text-gray-500 text-xs mt-4">
                    {new Date(feed.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Create News Feed</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tagline</label>
                  <input
                    type="text"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={4}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Media URL</label>
                  <input
                    type="url"
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Media Type</label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="IMAGE">Image</option>
                    <option value="VIDEO">Video</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
}

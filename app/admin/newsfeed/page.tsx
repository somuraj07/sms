"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";

interface NewsFeed {
  id: string;
  title: string;
  description: string;
  tagline: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function NewsFeedPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [newsFeeds, setNewsFeeds] = useState<NewsFeed[]>([]);
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
    if (session.user.role !== "ADMIN") {
      router.push("/dashboard");
      return;
    }
    fetchNewsFeeds();
  }, [session]);

  const fetchNewsFeeds = async () => {
    try {
      const res = await fetch("/api/newsfeed/list");
      const data = await res.json();
      if (data.success) {
        setNewsFeeds(data.data || []);
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
        body: JSON.stringify({
          ...formData,
          tagline: formData.tagline || null,
          mediaUrl: formData.mediaUrl || null,
          mediaType: formData.mediaType || null,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setShowModal(false);
        setFormData({
          title: "",
          description: "",
          tagline: "",
          mediaUrl: "",
          mediaType: "IMAGE",
        });
        fetchNewsFeeds();
      } else {
        alert(data.message || "Failed to create news feed");
      }
    } catch (error) {
      alert("Failed to create news feed");
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">News Feed</h1>
            <p className="text-gray-600">Manage announcements and updates</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            + Create Announcement
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="space-y-4">
            {newsFeeds.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <p className="text-gray-600 text-lg">No announcements yet</p>
              </div>
            ) : (
              newsFeeds.map((feed) => (
                <div
                  key={feed.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feed.title}</h3>
                      {feed.tagline && (
                        <p className="text-gray-600 italic mb-2">{feed.tagline}</p>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(feed.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-800 mb-4 whitespace-pre-wrap">{feed.description}</p>
                  {feed.mediaUrl && (
                    <div className="mb-4">
                      {feed.mediaType === "IMAGE" ? (
                        <img
                          src={feed.mediaUrl}
                          alt={feed.title}
                          className="max-w-full h-auto rounded-lg"
                        />
                      ) : (
                        <video
                          src={feed.mediaUrl}
                          controls
                          className="max-w-full h-auto rounded-lg"
                        />
                      )}
                    </div>
                  )}
                  <p className="text-sm text-gray-500">
                    Created by: {feed.createdBy.name}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Create Announcement</h2>
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
                    placeholder="Short catchy tagline"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={6}
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
                    placeholder="https://example.com/image.jpg"
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
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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

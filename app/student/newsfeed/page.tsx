"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import StudentLayout from "@/components/student/StudentLayout";

interface NewsFeed {
  id: string;
  title: string;
  description: string;
  tagline: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  createdAt: string;
}

export default function StudentNewsFeedPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [feeds, setFeeds] = useState<NewsFeed[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchFeeds();
  }, [session, status, router]);

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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">News Feed</h1>
          <p className="text-gray-600">View school announcements and updates</p>
        </div>

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
      </div>
    </StudentLayout>
  );
}

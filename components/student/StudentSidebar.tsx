"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/student/dashboard",
    icon: "📊",
  },
  {
    title: "Assignments",
    href: "/student/assignments",
    icon: "📝",
  },
  {
    title: "Attendance",
    href: "/student/attendance",
    icon: "✅",
  },
  {
    title: "Fees",
    href: "/student/fees",
    icon: "💰",
  },
  {
    title: "Chat with Teacher",
    href: "/student/chat",
    icon: "💬",
  },
  {
    title: "Marks",
    href: "/student/marks",
    icon: "📊",
  },
  {
    title: "News Feed",
    href: "/student/newsfeed",
    icon: "📢",
  },
];

export default function StudentSidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-blue-900 text-white rounded-lg shadow-lg"
      >
        <span className="text-2xl">☰</span>
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white flex flex-col shadow-2xl z-40 transform transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-blue-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Student Portal</h1>
            <p className="text-blue-300 text-sm mt-1">Management System</p>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-white hover:text-blue-300"
          >
            ✕
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-white text-blue-900 font-semibold shadow-lg"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors duration-200"
          >
            <span className="text-xl">🚪</span>
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}

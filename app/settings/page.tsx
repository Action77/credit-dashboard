"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  AlertCircle,
  BarChart3,
  Settings,
  Users,
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("notifications");

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="w-52 bg-[#071d5c] text-white flex flex-col">
        <div className="p-4">
          <h1 className="text-xl font-bold leading-tight">
            Credit With Route Block
          </h1>
        </div>

        <nav className="px-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>

          <Link
            href="/exceptions"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            <AlertCircle size={18} />
            Exceptions
          </Link>

          <Link
            href="/summary"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            <BarChart3 size={18} />
            Summary
          </Link>

          <Link
            href="/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600"
          >
            <Settings size={18} />
            Settings
          </Link>

          <Link
            href="/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700"
          >
            <Users size={18} />
            Users
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">Settings</h1>

        <div className="flex gap-6">
          {/* Left Menu */}
          <div className="w-64 border rounded-lg p-3 bg-white">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
                activeTab === "notifications"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              🔔 Notifications
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`w-full text-left px-4 py-3 rounded-lg ${
                activeTab === "security"
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100"
              }`}
            >
              🔒 Security
            </button>
          </div>

          {/* Right Content */}
          <div className="flex-1 border rounded-lg p-6 bg-white">
            {activeTab === "notifications" && (
              <>
                <h2 className="text-2xl font-semibold mb-2">
                  Notifications
                </h2>

                <p className="text-gray-500 mb-6">
                  Manage your notification preferences
                </p>

                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked />
                    Invoice Disappeared Alerts
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked />
                    Exception Alerts
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked />
                    Credit Import Alerts
                  </label>

                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked />
                    Collection Import Alerts
                  </label>
                </div>

                <button className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Save Changes
                </button>
              </>
            )}

            {activeTab === "security" && (
              <>
                <h2 className="text-2xl font-semibold mb-2">
                  Security
                </h2>

                <p className="text-gray-500 mb-6">
                  Manage your security settings
                </p>

                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full border rounded-lg p-3"
                  />

                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full border rounded-lg p-3"
                  />

                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full border rounded-lg p-3"
                  />
                </div>

                <div className="mt-6 text-sm text-gray-600 space-y-1">
                  <p>✓ At least 8 characters</p>
                  <p>✓ Include uppercase and lowercase letters</p>
                  <p>✓ Include numbers</p>
                  <p>✓ Include special characters</p>
                </div>

                <button className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Update Password
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
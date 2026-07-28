"use client";

import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard,
  Upload,
  FileText,
  AlertCircle,
  BarChart3,
  Settings,
  Users,
  LogOut,
} from "lucide-react";

export default function SettingsPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
const [currentUser, setCurrentUser] = useState("");
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
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
  >
    <LayoutDashboard size={18} />
    <span>Dashboard</span>
  </Link>

  <Link
    href="/import"
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
  >
    <Upload size={18} />
    <span>Import File</span>
  </Link>

  <Link
    href="/invoices"
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
  >
    <FileText size={18} />
    <span>Invoices</span>
  </Link>

  <Link
    href="/exceptions"
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
  >
    <AlertCircle size={18} />
    <span>Exceptions</span>
  </Link>

  <Link
    href="/summary"
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
  >
    <BarChart3 size={18} />
    <span>Summary</span>
  </Link>

  <Link
    href="/reports"
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
  >
    <BarChart3 size={18} />
    <span>Reports</span>
  </Link>

  <Link
    href="/settings"
    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600"
  >
    <Settings size={18} />
    <span>Settings</span>
  </Link>

  <Link
    href="/users"
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
  >
    <Users size={18} />
    <span>Users</span>
  </Link>

</nav>
<div className="p-6 border-t border-white/10">

  {isLoggedIn ? (

    <div
      className="flex items-center gap-3 bg-red-600 p-3 rounded-lg cursor-pointer"
      onClick={() => {
        localStorage.removeItem("currentUser");
        setIsLoggedIn(false);
      }}
    >
      <LogOut size={18} />
      Logout
    </div>

  ) : (

    <div
      className="flex items-center gap-3 bg-blue-600 p-3 rounded-lg cursor-pointer"
      onClick={() => setShowLoginModal(true)}
    >
      <Users size={18} />
      Login
    </div>

  )}

</div>
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
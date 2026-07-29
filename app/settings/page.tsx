"use client";

import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useEffect, useState } from "react";
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
    const [loginPassword, setLoginPassword] = useState("");
    const [exceptionExpiredAlert, setExceptionExpiredAlert] =
  useState(true);
    const [exceptionDeleteAlert, setExceptionDeleteAlert] = useState(true);
    const [isUpdatingPassword, setIsUpdatingPassword] =
  useState(false);
    const [invoiceAlert, setInvoiceAlert] = useState(true);

const [exceptionAlert, setExceptionAlert] = useState(true);

const [creditImportAlert, setCreditImportAlert] = useState(true);

const [collectionImportAlert, setCollectionImportAlert] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
const [currentUser, setCurrentUser] = useState("");
  const [activeTab, setActiveTab] = useState("notifications");
  useEffect(() => {
  const savedUser =
    localStorage.getItem("currentUser");

  if (savedUser) {
    setCurrentUser(savedUser);
    setIsLoggedIn(true);
  }
}, []);
useEffect(() => {
  const loadSettings = async () => {

    const currentUser =
      localStorage.getItem("currentUser");

    if (!currentUser) return;

    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .eq("username", currentUser)
      .single();

    if (!data) return;

    setInvoiceAlert(
      data.invoice_disappeared_alert
    );
setExceptionDeleteAlert(
  data.exception_delete_alert
);
setExceptionExpiredAlert(
  data.exception_expired_alert
);
    setExceptionAlert(
      data.exception_alert
    );

    setCreditImportAlert(
      data.credit_import_alert
    );

    setCollectionImportAlert(
      data.collection_import_alert
    );
  };

  loadSettings();
}, []);
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
                    <input
  type="checkbox"
  checked={invoiceAlert}
  onChange={(e) =>
    setInvoiceAlert(e.target.checked)
  }
/>
                    Invoice Disappeared Alerts
                  </label>
<label className="flex items-center gap-3">
  <input
    type="checkbox"
    checked={exceptionExpiredAlert}
    onChange={(e) =>
      setExceptionExpiredAlert(
        e.target.checked
      )
    }
  />
  Exception Expired Alerts
</label>
                  <label className="flex items-center gap-3">
                    <input
  type="checkbox"
  checked={exceptionAlert}
  onChange={(e) =>
    setExceptionAlert(e.target.checked)
  }
/>
                    Exception Add Alerts
                  </label>

<label className="flex items-center gap-3">
  <input
    type="checkbox"
    checked={exceptionDeleteAlert}
    onChange={(e) =>
      setExceptionDeleteAlert(e.target.checked)
    }
  />
  Exception Delete Alerts
</label>
                  <label className="flex items-center gap-3">
                    <input
  type="checkbox"
  checked={creditImportAlert}
  onChange={(e) =>
    setCreditImportAlert(e.target.checked)
  }
/>
                    Credit Import Alerts
                  </label>

                  <label className="flex items-center gap-3">
                    <input
  type="checkbox"
  checked={collectionImportAlert}
  onChange={(e) =>
    setCollectionImportAlert(e.target.checked)
  }
/>
                    Collection Import Alerts
                  </label>
                </div>

<button
  className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  onClick={async () => {

    const currentUser =
      localStorage.getItem("currentUser");

    if (!currentUser) {
      alert("Please Login First");
      return;
    }
const { data: currentSettings } =
  await supabase
    .from("user_settings")
    .select("*")
    .eq("username", currentUser)
    .single();
    const now =
  new Date().toISOString();

const { error } = await supabase
  .from("user_settings")
  .update({

    invoice_disappeared_alert:
      invoiceAlert,

    exception_alert:
      exceptionAlert,
exception_delete_alert:
  exceptionDeleteAlert,
exception_expired_alert:
  exceptionExpiredAlert,
    credit_import_alert:
      creditImportAlert,

    collection_import_alert:
      collectionImportAlert,

    disappeared_disabled_at:
  invoiceAlert
    ? currentSettings?.disappeared_disabled_at
    : (
        currentSettings?.disappeared_disabled_at ||
        now
      ),
exception_expired_disabled_at:
  exceptionExpiredAlert
    ? currentSettings?.exception_expired_disabled_at
    : (
        currentSettings?.exception_expired_disabled_at ||
        now
      ),
exception_disabled_at:
  exceptionAlert
    ? currentSettings?.exception_disabled_at
    : (
        currentSettings?.exception_disabled_at ||
        now
      ),

      exception_delete_disabled_at:
  exceptionDeleteAlert
    ? currentSettings?.exception_delete_disabled_at
    : (
        currentSettings?.exception_delete_disabled_at ||
        now
      ),

credit_disabled_at:
  creditImportAlert
    ? currentSettings?.credit_disabled_at
    : (
        currentSettings?.credit_disabled_at ||
        now
      ),

collection_disabled_at:
  collectionImportAlert
    ? currentSettings?.collection_disabled_at
    : (
        currentSettings?.collection_disabled_at ||
        now
      ),
  })
  .eq("username", currentUser);

    if (error) {
      alert("Failed To Save Settings");
      return;
    }

    alert("Settings Saved Successfully");
  }}
>
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
  value={currentPassword}
  onChange={(e) => setCurrentPassword(e.target.value)}
  className="w-full border rounded-lg p-3"
/>
  <input
  type="password"
  placeholder="New Password"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  className="w-full border rounded-lg p-3"
/>
  <input
  type="password"
  placeholder="Confirm New Password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  className="w-full border rounded-lg p-3"
/>
                </div>



<button
  disabled={isUpdatingPassword}
  className={`mt-6 px-5 py-2 text-white rounded-lg ${
    isUpdatingPassword
      ? "bg-gray-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
  onClick={async () => {

    if (isUpdatingPassword) return;

    setIsUpdatingPassword(true);

    try {

      const username =
        localStorage.getItem("currentUser");

      if (!username) {
        alert("Please Login First");
        return;
      }

      if (!currentPassword) {
        alert("Enter Current Password");
        return;
      }

      if (!newPassword) {
        alert("Enter New Password");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Passwords Do Not Match");
        return;
      }

      const { data: user } = await supabase
        .from("app_users")
        .select("*")
        .eq("username", username)
        .single();

      if (!user) {
        alert("User Not Found");
        return;
      }

      if (user.password !== currentPassword) {
        alert("Current Password Is Incorrect");
        return;
      }

      const { error } = await supabase
        .from("app_users")
        .update({
          password: newPassword,
        })
        .eq("username", username);

      if (error) {
        alert("Failed To Update Password");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      alert("Password Updated Successfully");

    } finally {

      setIsUpdatingPassword(false);

    }

  }}
>
  {isUpdatingPassword
    ? "Updating..."
    : "Update Password"}
</button>
              </>
            )}
          </div>
        </div>
      </main>
      {showLoginModal && (

  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">

    <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8">

      <h2 className="text-3xl font-bold text-slate-800 mb-6">
        Welcome Back
      </h2>

      <input
        type="text"
        placeholder="Username"
        value={currentUser}
        onChange={(e) =>
          setCurrentUser(e.target.value)
        }
        className="w-full border p-3 rounded-xl mb-4"
      />
<input
  type="password"
  placeholder="Password"
  value={loginPassword}
  onChange={(e) => setLoginPassword(e.target.value)}
  className="w-full border p-3 rounded-xl mb-4"
/>
      <button
  className="w-full bg-blue-600 text-white py-3 rounded-xl"
  onClick={async () => {

    if (!currentUser || !loginPassword) {
      alert("Enter Username And Password");
      return;
    }

    const { data: user, error } = await supabase
      .from("app_users")
      .select("*")
      .eq("username", currentUser)
      .single();

    if (error || !user) {
      alert("User Not Found");
      return;
    }

    if (user.password !== loginPassword) {
      alert("Invalid Password");
      return;
    }

    localStorage.setItem(
      "currentUser",
      currentUser
    );

    setIsLoggedIn(true);
    setShowLoginModal(false);

    setLoginPassword("");

  
  }}
>
  Login
</button>

      <button
        className="w-full mt-3 border py-3 rounded-xl"
        onClick={() =>
          setShowLoginModal(false)
        }
      >
        Cancel
      </button>

    </div>

  </div>

)}
    </div>
  );
}
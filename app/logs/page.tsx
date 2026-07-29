"use client";
import { storage as localStorage } from "@/utils/storage";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { addLog } from "@/lib/activityLog";
import {
  Activity,
  Upload,
  Shield,
  Trash2,
  LogIn,
  FileText,
  AlertCircle,
  BarChart3,
  Settings,
  Users,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

export default function LogsPage() {
const [isLoggedIn, setIsLoggedIn] = useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
const [currentUser, setCurrentUser] = useState("");
const [currentFullName, setCurrentFullName] = useState("");
  const [logs, setLogs] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedAction, setSelectedAction] = useState("");

  useEffect(() => {

    const loadLogs = async () => {

      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      setLogs(data || []);

    };

    loadLogs();

  }, []);

  const filteredLogs = useMemo(() => {

    return logs.filter(log => {

      const userMatch =
        !selectedUser ||
        log.full_name === selectedUser;

      const actionMatch =
        !selectedAction ||
        log.action === selectedAction;

      return userMatch && actionMatch;

    });

  }, [
    logs,
    selectedUser,
    selectedAction,
  ]);

  const todayActivities =
    logs.filter(log => {

      const today =
        new Date().toDateString();

      return (
        new Date(
          log.created_at
        ).toDateString() === today
      );

    }).length;

  const uniqueUsers =
    new Set(
      logs.map(log => log.username)
    ).size;

  const importCount =
    logs.filter(
      log =>
        log.action ===
          "IMPORT_CREDIT" ||
        log.action ===
          "IMPORT_COLLECTION"
    ).length;

  const getActionBadge = (
    action: string
  ) => {

    switch (action) {

      case "IMPORT_CREDIT":

        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
            IMPORT CREDIT
          </span>
        );

      case "IMPORT_COLLECTION":

        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
            IMPORT COLLECTION
          </span>
        );

      case "ADD_EXCEPTION":

        return (
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold">
            ADD EXCEPTION
          </span>
        );

      case "DELETE_EXCEPTION":

        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
            DELETE EXCEPTION
          </span>
        );

      case "LOGIN":

        return (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-semibold">
            LOGIN
          </span>
        );

      case "LOGOUT":

        return (
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
            LOGOUT
          </span>
        );

      default:

        return (
          <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">
            {action}
          </span>
        );

    }

  };

  const users = [
    ...new Set(
      logs.map(log => log.full_name)
    ),
  ];

  const actions = [
    ...new Set(
      logs.map(log => log.action)
    ),
  ];

return (

<>
  <div className="min-h-screen bg-[#f4f7fc] flex text-slate-900">

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
    href="/logs"
className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600"
  >
    <FileText size={18} />
    <span>logs</span>
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
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
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
      onClick={async () => {

  await addLog(
    currentUser,
    currentFullName,
    "LOGOUT",
    "User logged out"
  );

  localStorage.removeItem(
    "currentUser"
  );

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

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">

        <h1 className="text-3xl font-bold text-[#071d5c] flex items-center gap-2">
          <Activity size={28} />
          Activity Logs
        </h1>

        <p className="text-slate-500 mt-2">
          Complete audit history of user actions inside the system.
        </p>

      </div>

      <div className="grid grid-cols-4 gap-5 mb-6">

        <div className="bg-white border rounded-xl p-5">

          <div className="text-slate-500">
            Total Activities
          </div>

          <div className="text-4xl font-bold mt-3 text-[#071d5c]">
            {logs.length}
          </div>

        </div>

        <div className="bg-white border rounded-xl p-5">

          <div className="text-slate-500">
            Today
          </div>

          <div className="text-4xl font-bold mt-3 text-green-600">
            {todayActivities}
          </div>

        </div>

        <div className="bg-white border rounded-xl p-5">

          <div className="text-slate-500">
            Users
          </div>

          <div className="text-4xl font-bold mt-3 text-purple-600">
            {uniqueUsers}
          </div>

        </div>

        <div className="bg-white border rounded-xl p-5">

          <div className="text-slate-500">
            Imports
          </div>

          <div className="text-4xl font-bold mt-3 text-blue-600">
            {importCount}
          </div>

        </div>

      </div>

      <div className="bg-white rounded-xl border p-5 mb-6">

        <div className="flex gap-3">

          <select
            value={selectedUser}
            onChange={(e) =>
              setSelectedUser(
                e.target.value
              )
            }
            className="border rounded-lg px-4 py-2"
          >

            <option value="">
              All Users
            </option>

            {users.map(user => (

              <option
                key={user}
                value={user}
              >
                {user}
              </option>

            ))}

          </select>

          <select
            value={selectedAction}
            onChange={(e) =>
              setSelectedAction(
                e.target.value
              )
            }
            className="border rounded-lg px-4 py-2"
          >

            <option value="">
              All Actions
            </option>

            {actions.map(action => (

              <option
                key={action}
                value={action}
              >
                {action}
              </option>

            ))}

          </select>

        </div>

      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

        <table className="w-full text-sm">

          <thead>

            <tr className="bg-[#0b2668] text-white">

              <th className="p-4 text-left">
                Date & Time
              </th>

              <th className="p-4 text-left">
                User
              </th>

              <th className="p-4 text-left">
                Action
              </th>

              <th className="p-4 text-left">
                Details
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredLogs.map(log => (

              <tr
                key={log.id}
                className="border-b hover:bg-slate-50"
              >

                <td className="p-4">

                  {new Date(
                    log.created_at
                  ).toLocaleString()}

                </td>

                <td className="p-4 font-medium">
                  {log.full_name}
                </td>

                <td className="p-4">
                  {getActionBadge(
                    log.action
                  )}
                </td>

                <td className="p-4">
                  {log.details}
                </td>

              </tr>

            ))}

            {filteredLogs.length === 0 && (

              <tr>

                <td
                  colSpan={4}
                  className="p-8 text-center text-slate-500"
                >
                  No logs found
                </td>

              </tr>

            )}

          </tbody>

        </table>

            </div>

    </main>

  </div>
</>

  );

}
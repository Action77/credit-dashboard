"use client";
import Link from "next/link";

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
import { useEffect, useState } from "react";
import { storage as localStorage } from "@/utils/storage";


export default function ReportsPage() {
const [isLoggedIn, setIsLoggedIn] =
  useState(false);

const [showLoginModal, setShowLoginModal] =
  useState(false);

const [username, setUsername] =
  useState("");

const [password, setPassword] =
  useState("");

const [currentUser, setCurrentUser] =
  useState("");

  const [creditData, setCreditData] =
    useState<any[]>([]);

  const [collections, setCollections] =
    useState<any[]>([]);

  const [selectedTab, setSelectedTab] =
    useState("credit");

  const [collectionRows, setCollectionRows] =
    useState<any[]>([]);
useEffect(() => {

  const loadUser = async () => {

    const savedUser =
      await localStorage.getItem(
        "currentUser"
      );

    if (savedUser) {

      setCurrentUser(savedUser);

      setIsLoggedIn(true);

    }

  };

  loadUser();

}, []);
  useEffect(() => {

    const loadData = async () => {

      const response =
        await fetch("/api/reports");

      const data =
        await response.json();

      setCreditData(
        data.creditData || []
      );

      setCollections(
        data.collections || []
      );

    };

    loadData();

  }, []);

  const loadCollection =
    async (id: number) => {

      const response =
        await fetch(
          `/api/reports/${id}`
        );

      const data =
        await response.json();

      setCollectionRows(data);

    };

return (

<div className="min-h-screen bg-[#f4f7fc] flex text-slate-900">

      <aside className="w-52 bg-[#071d5c] text-white flex flex-col">

    <div className="p-4">
      <h1 className="text-xl font-bold leading-tight">
        Credit With Route Block
      </h1>
    </div>

    <nav className="px-4 space-y-2">

  <Link
  href="/"
  className="flex items-center gap-3 px-4 py-3"
>
  <LayoutDashboard size={18} />
  <span>Dashboard</span>
</Link>

  <div className="flex items-center gap-3 px-4 py-3">
    <Upload size={18} />
    Import File
  </div>

  <div className="flex items-center gap-3 px-4 py-3">
    <FileText size={18} />
    Invoices
  </div>

<Link
  href="/exceptions"
  className="flex items-center gap-3 px-4 py-3"
>
  <AlertCircle size={18} />
  <span>Exceptions</span>
</Link>


<Link
  href="/summary"
  className="flex items-center gap-3 px-4 py-3"
>
  <BarChart3 size={18} />
  <span>Summary</span>
</Link>

<Link
  href="/reports"
  className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg"
>
  <BarChart3 size={18} />
  
  <span>Reports</span>
</Link>

  <div className="flex items-center gap-3 px-4 py-3">
    <Settings size={18} />
    Settings
  </div>

<Link
  href="/users"
  className="flex items-center gap-3 px-4 py-3"
>
  <Users size={18} />
  Users
</Link>

</nav>
  <div
  className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${
    isLoggedIn
      ? "bg-red-600"
      : "bg-blue-600"
  }`}
  onClick={async () => {

    if (isLoggedIn) {

  await localStorage.removeItem("currentUser");

  setIsLoggedIn(false);

  setCurrentUser("");

    setUsername("");

  setPassword("");

} else {

  setShowLoginModal(true);

}

  }}
>
  {isLoggedIn ? (
  <>
    <LogOut size={18} />
    Logout
  </>
) : (
  <>
    <Users size={18} />
    Login
  </>
)}
</div>
 
  
</aside>

  <main className="flex-1 p-6">

      <h1 className="text-3xl font-bold mb-6">
        Reports
      </h1>

      <div className="flex gap-2 mb-6">

        <button
          className={`px-4 py-2 rounded ${
            selectedTab === "credit"
              ? "bg-blue-600 text-white"
              : "bg-slate-200"
          }`}
          onClick={() =>
            setSelectedTab("credit")
          }
        >
          Credit File
        </button>

        {collections.map(
          (item: any) => (

            <button
              key={item.id}
              className={`px-4 py-2 rounded ${
                selectedTab ===
                String(item.id)
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200"
              }`}
              onClick={() => {

                setSelectedTab(
                  String(item.id)
                  
                );

                loadCollection(
                  item.id
                );

              }}
            >
              Collection {item.id}
            </button>

          )
        )}

      </div>

      {selectedTab === "credit" ? (

        <div className="overflow-auto">

          <table className="w-full border">

            <thead>

              <tr className="bg-slate-800 text-white">

                {creditData.length > 0 &&
                  Object.keys(
                    creditData[0]
                  ).map(key => (

                    <th
                      key={key}
                      className="p-3"
                    >
                      {key}
                    </th>

                  ))}

              </tr>

            </thead>

            <tbody>

              {creditData.map(
                (row, index) => (

                  <tr
                    key={index}
                    className="border-b"
                  >
                    {Object.values(row)
                      .map(
                        (
                          value,
                          cellIndex
                        ) => (

                          <td
                            key={
                              cellIndex
                            }
                            className="p-2"
                          >
                            {String(
                              value
                            )}
                          </td>

                        )
                      )}
                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      ) : (

        <div className="overflow-auto">

          <table className="w-full border">

            <thead>

              <tr className="bg-slate-800 text-white">

                <th className="p-3">
                  Invoice
                </th>

                <th className="p-3">
                  Uploaded By
                </th>

              </tr>

            </thead>

            <tbody>

              {collectionRows.map(
                (row: any) => (

                  <tr
                    key={row.id}
                    className="border-b"
                  >

                    <td className="p-2">
                      {row.invoice}
                    </td>

                    <td className="p-2">
                      {row.uploaded_by}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

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
          value={username}
          onChange={(e) =>
            setUsername(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          className="w-full bg-blue-600 text-white py-3 rounded-xl"
          onClick={async () => {

            const users = [
              {
                username: "halyousif",
                password: "123456",
                id: "user1",
              },
              {
                username: "nelson",
                password: "123456",
                id: "user2",
              },
            ];

            const user = users.find(
              u =>
                u.username === username &&
                u.password === password
            );

            if (!user) {
              alert("Invalid Username or Password");
              return;
            }

            await localStorage.setItem(
              "currentUser",
              user.id
            );

            setCurrentUser(user.id);

            setIsLoggedIn(true);

            setShowLoginModal(false);

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
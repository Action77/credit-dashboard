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
  
  const [missingInvoices, setMissingInvoices] =
  useState<any[]>([]);
  const [filteredCreditData, setFilteredCreditData] =
  useState<any[]>([]);
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
const [searchText, setSearchText] =
  useState("");
  const [collectionRows, setCollectionRows] =
    useState<any[]>([]);
    useEffect(() => {

  const loadFilters = async () => {

    const saved =
      await localStorage.getItem(
        "summaryFilters"
      );

    if (!saved) {

      setFilteredCreditData(
        creditData
      );

      return;
    }

    const filters =
      JSON.parse(saved);

    const filtered =
      creditData.filter((row) => {

        const regionMatch =
          filters.regions?.length === 0 ||
          filters.regions?.includes(
            row.region
          );

        const cityMatch =
          filters.cities?.length === 0 ||
          filters.cities?.includes(
            row.city
          );

        const vanMatch =
          filters.vans?.length === 0 ||
          filters.vans?.includes(
            row.van_code
          );

        return (
          regionMatch &&
          cityMatch &&
          vanMatch
        );

      });

    setFilteredCreditData(
      filtered
    );

  };

  loadFilters();

}, [creditData]);

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

useEffect(() => {

  const loadMissingInvoices =
    async () => {

      const response =
        await fetch(
          "/api/reports/missing"
        );

      const data =
        await response.json();

      setMissingInvoices(data);

    };

  loadMissingInvoices();

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
    
const filteredCreditRows =
  filteredCreditData
    .filter((row) =>

      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(
          searchText.toLowerCase()
        )

    )
    .sort((a, b) =>
      String(a["Van Code."] || "")
        .localeCompare(
          String(b["Van Code."] || "")
        )
    );
      const filteredCollectionRows =
  collectionRows.filter((row) =>

    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(
        searchText.toLowerCase()
      )

  );
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
      <div className="bg-white border rounded-xl p-5 mb-6 overflow-hidden">

  <div className="flex justify-between items-center mb-4">

    <h2 className="text-xl font-bold text-amber-700">
      🚨 Disappeared Invoices
    </h2>

    <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
      {missingInvoices.length}
    </span>

  </div>

  <table className="text-xs border">
    <thead>

      <tr className="bg-amber-600 text-white">

        <th className="p-3">
          Invoice No
        </th>

        <th className="p-3">
          Customer Code
        </th>

        <th className="p-3">
          Customer Name
        </th>

        <th className="p-3">
          First Seen
        </th>

        <th className="p-3">
          Missing From
        </th>

      </tr>

    </thead>

    <tbody>

      {missingInvoices.map(
        (row: any, index) => (

          <tr
            key={index}
            className="bg-yellow-100 border-b"
          >

            <td className="p-2">
              {row.invoice}
            </td>

            <td className="p-2">
              {row.customer_code}
            </td>

            <td className="p-2">
              {row.customer_name}
            </td>

            <td className="p-2">
              Collection {row.first_seen}
            </td>

            <td className="p-2">
              Collection {row.missing_from}
            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>
<div className="mb-4">

  <input
    type="text"
    placeholder="Search..."
    value={searchText}
    onChange={(e) =>
      setSearchText(e.target.value)
    }
    className="w-full max-w-md border rounded-lg px-4 py-2"
  />

</div>
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

                {filteredCreditRows.length > 0 &&
                  Object.keys(
  filteredCreditRows[0]
)
.map(key => (

<th
  key={key}
  className="p-2 whitespace-nowrap"
>
                      {key}
                    </th>

                  ))}

              </tr>

            </thead>

            <tbody>

              {filteredCreditRows.map(
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
  key={cellIndex}
  className="p-2 whitespace-nowrap text-xs"
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

        <div className="overflow-x-auto">

  <table className="w-full table-fixed border">

    <thead>

      <tr className="bg-amber-600 text-white">

        <th className="w-[22%] p-3 text-left">
          Invoice No
        </th>

        <th className="w-[15%] p-3 text-left">
          Customer Code
        </th>

        <th className="w-[33%] p-3 text-left">
          Customer Name
        </th>

        <th className="w-[15%] p-3 text-left">
          First Seen
        </th>

        <th className="w-[15%] p-3 text-left">
          Missing From
        </th>

      </tr>

    </thead>

    <tbody>

      {missingInvoices.map(
        (row: any, index) => (

          <tr
            key={index}
            className="bg-yellow-100 border-b"
          >

            <td className="p-3">
              {row.invoice}
            </td>

            <td className="p-3">
              {row.customer_code}
            </td>

            <td className="p-3">
              {row.customer_name}
            </td>

            <td className="p-3">
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                #{row.first_seen}
              </span>
            </td>

            <td className="p-3">
              <span className="bg-red-100 text-red-700 px-2 py-1 rounded">
                #{row.missing_from}
              </span>
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
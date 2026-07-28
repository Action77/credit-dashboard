
"use client";
import { useEffect, useState } from "react";
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


export default function ExceptionsPage() {
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
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [invoiceText, setInvoiceText] = useState("");

const [tillDate, setTillDate] = useState("");
const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {

  const loadExceptions = async () => {

    const response =
      await fetch("/api/exceptions");

    const data =
      await response.json();

    setExceptions(data || []);

  };

  loadExceptions();

}, []);
useEffect(() => {

  const savedUser =
    localStorage.getItem(
      "currentUser"
    );

  if (savedUser) {

    setCurrentUser(savedUser);

    setIsLoggedIn(true);

  }

}, []);
  return (
  <div className="min-h-screen bg-[#f4f7fc] flex">

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

  <div className="flex items-center gap-3 px-4 py-3">
    <BarChart3 size={18} />
    Reports
  </div>

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
  onClick={() => {

    if (isLoggedIn) {

      localStorage.removeItem("currentUser");

      setIsLoggedIn(false);

      setCurrentUser("");

      window.location.href = "/";

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

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h1 className="text-3xl font-bold">
          Exceptions Management
        </h1>
      </div>

      <div className="bg-white rounded-xl border shadow-sm p-5 mb-6 max-w-4xl">
        <h3 className="font-bold text-lg mb-4">
          Add Multiple Exceptions
        </h3>

        <textarea
  rows={5}
  value={invoiceText}
  onChange={(e) =>
    setInvoiceText(e.target.value)
  }
  placeholder={`P1316600015510
P1316600015511
P1316600015512`}
  className="w-full border rounded-lg p-3 mb-4"
/>

<input
  type="date"
  value={tillDate}
  onChange={(e) =>
    setTillDate(e.target.value)
  }
  className="border rounded-lg p-3 mb-4 w-full"
/>

<button
  className="bg-blue-600 text-white px-6 py-3 rounded-lg"
  onClick={async () => {


    const currentUser =
      localStorage.getItem("currentUser");

    if (
      !currentUser ||
      !tillDate ||
      !invoiceText
    ) {
      return;
    }

    const creditResponse =
  await fetch("/api/credit-data");

const creditResult =
  await creditResponse.json();

const creditData =
  creditResult.data || [];
    const invoices =
      invoiceText
        .split("\n")
        .map(x => x.trim())
        .filter(Boolean);

    const newExceptions =
      invoices.map(invoice => {

        const match =
  creditData.find(
    (row: any) =>
      String(
        row["Invoice #"] || ""
      )
        .replace(/\s/g, "")
        .toUpperCase() ===
      invoice
        .replace(/\s/g, "")
        .toUpperCase()
  );

        return {
          invoice,
          tillDate,

          vanCode:
            match?.["Van Code."] || "",

          employeeName:
            match?.["Employee Name."] || "",

          atsCode:
            match?.["Employee ATS Code."] || "",

          customerCode:
            match?.["Customer Code"] || "",

          customerName:
            match?.["Customer Name"] || ""
        };
      });

    await fetch(
  "/api/exceptions",
  {
    method: "POST",
    headers: {
      "Content-Type":
        "application/json",
    },
    body: JSON.stringify(
      newExceptions.map(item => ({
        invoice: item.invoice,
        till_date: item.tillDate,
        van_code: item.vanCode,
        employee_name: item.employeeName,
        ats_code: item.atsCode,
        customer_code: item.customerCode,
        customer_name: item.customerName,
        created_by: currentUser,
      }))
    ),
  }
);

const response =
  await fetch("/api/exceptions");

setExceptions(
  await response.json()
);
    setInvoiceText("");

    setTillDate("");
    
  }}
>
  Add Exceptions
</button>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <div className="flex justify-between items-center mb-4">

  <h3 className="font-bold text-xl">
    Current Exceptions
    <input
  type="text"
  placeholder="Search..."
  value={searchTerm}
  onChange={(e) =>
    setSearchTerm(e.target.value)
  }
  className="border rounded-lg px-4 py-2 w-72"
/>
  </h3>

  <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold">
    Total: {exceptions.length}
  </div>

</div>
        <div className="overflow-x-auto">
  <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#071d5c] text-white">
              <th className="p-3 text-left">Van Code</th>
              <th className="p-3 text-left">Employee Name</th>
              <th className="p-3 text-left">ATS Code</th>
              <th className="p-3 text-left">Customer Code</th>
              <th className="p-3 text-left">Customer Name</th>
              <th className="p-3 text-left">Invoice #</th>
              <th className="p-3 text-left">Till Date</th>
              <th className="p-3 text-left">Days</th>
{isLoggedIn && (
  <th className="p-3 text-left">Delete</th>
)}

            </tr>
          </thead>

<tbody>

  {exceptions
  .filter(item => {

    const search =
      searchTerm.toLowerCase();

    return Object.values(item)
      .join(" ")
      .toLowerCase()
      .includes(search);

  })
  .map(
        (item, index) => {

      const tillDate =
  new Date(item.till_date);
      const daysLeft =
        Math.ceil(
          (
            tillDate.getTime() -
            new Date().getTime()
          ) /
          (1000 * 60 * 60 * 24)
        );

      return (

        <tr
  key={index}
  className="border-b hover:bg-slate-50"
>

          <td className="p-3">{item.van_code}</td>

          <td className="p-3">
            {item.employee_name}
          </td>

          <td className="p-3">{item.ats_code}
</td>

          <td className="p-3">
            {item.customer_code}
          </td>

          <td className="p-3">
            {item.customer_name}
          </td>

          <td className="p-3">
            {item.invoice}
          </td>

          <td className="p-3">
            {item.till_date}
          </td>

          <td className="p-3">
            {daysLeft}
          </td>

<td className="p-3">
  {isLoggedIn &&
    currentUser === item.created_by && (
      <button
        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs"
        onClick={async () => {
          await fetch(
            `/api/exceptions/${item.id}`,
            {
              method: "DELETE",
            }
          );

          setExceptions(prev =>
            prev.filter(
              exception =>
                exception.id !== item.id
            )
          );
        }}
      >
        Delete
      </button>
    )}
</td>
        </tr>

      );

    }
  )}

</tbody>
        </table>
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
              onClick={() => {

                const users = [
                  {
                    username: "halyousif",
                    password: "123456",
                    id: "user1"
                  },
                  {
                    username: "nelson",
                    password: "123456",
                    id: "user2"
                  }
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

                localStorage.setItem(
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
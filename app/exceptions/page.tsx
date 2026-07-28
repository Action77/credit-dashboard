
"use client";
import { storage as localStorage } from "@/utils/storage";
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
    const [deletingId, setDeletingId] =
  useState<number | null>(null);
  const [isAddingExceptions, setIsAddingExceptions] =
  useState(false);
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
const [isPermanent, setIsPermanent] =
  useState(false);
const [searchTerm, setSearchTerm] = useState("");

const addedCount =
  exceptions.filter(
    item => !item.permanent
  ).length;

const legalCount =
  exceptions.filter(
    item => item.permanent
  ).length;

const latestAdded =
  exceptions
    .filter(item => !item.permanent)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )[0];

const latestLegal =
  exceptions
    .filter(item => item.permanent)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    )[0];
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
  className="flex items-center gap-3 px-4 py-3 bg-blue-600 rounded-lg"
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
  className="flex items-center gap-3 px-4 py-3"
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

{isLoggedIn && (

  <div className="grid grid-cols-2 gap-6 mb-6">

    {/* Add Multiple Exceptions */}

    <div className="bg-white rounded-xl border shadow-sm p-5">

   
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

    <label className="flex items-center gap-2 mb-4">
      <input
        type="checkbox"
        checked={isPermanent}
        onChange={(e) =>
          setIsPermanent(e.target.checked)
        }
      />
      Legal
    </label>

    {!isPermanent && (
      <input
        type="date"
        value={tillDate}
        onChange={(e) =>
          setTillDate(e.target.value)
        }
        className="border rounded-lg p-3 mb-4 w-full"
      />
    )}

    {/* Add Exceptions Button هنا */}



<button
  disabled={isAddingExceptions}
  className={`text-white px-6 py-3 rounded-lg ${
    isAddingExceptions
      ? "bg-slate-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
  onClick={async () => {

    console.log(
      "ADD EXCEPTION CLICKED"
    );

    if (isAddingExceptions)
      return;

    setIsAddingExceptions(true);

    try {

      const currentUser =
        await localStorage.getItem(
          "currentUser"
        );

      if (!currentUser) {

        alert(
          "Please Login First"
        );

        return;

      }

      if (!invoiceText.trim()) {

        alert(
          "Please Enter Invoice Number"
        );

        return;

      }

      if (
        !isPermanent &&
        !tillDate
      ) {

        alert(
          "Please Select Till Date"
        );

        return;

      }

      const creditResponse =
        await fetch(
          "/api/credit-data"
        );

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

      const saveResponse =
        await fetch(
          "/api/exceptions",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              newExceptions.map(
                item => ({
                  invoice:
                    item.invoice,
                  till_date:
                    isPermanent
                      ? null
                      : item.tillDate,
                  permanent:
                    isPermanent,
                  van_code:
                    item.vanCode,
                  employee_name:
                    item.employeeName,
                  ats_code:
                    item.atsCode,
                  customer_code:
                    item.customerCode,
                  customer_name:
                    item.customerName,
                  created_by:
                    currentUser,
                })
              )
            ),
          }
        );

      if (!saveResponse.ok) {

        alert(
          "Failed To Save Exception"
        );

        return;

      }
      const response =
        await fetch(
          "/api/exceptions"
        );

      const data =
        await response.json();

      setExceptions(data);

      setInvoiceText("");
      setTillDate("");


    } catch (error) {

      console.error(error);

      alert(
        "Unexpected Error"
      );

    } finally {

      setIsAddingExceptions(
        false
      );

    }

  }}
>
  
  {isAddingExceptions
    ? "Processing..."
    : "Add Exceptions"}
</button>
      </div>
      <div className="bg-white rounded-xl border shadow-sm p-5">

  <div className="flex justify-between items-center mb-6">

    <h3 className="font-bold text-lg">
      Recent Activity
    </h3>

    <span className="text-xs text-slate-400">
      Last Actions
    </span>

  </div>

  <div className="space-y-4">

  <div className="border border-green-200 bg-green-50 rounded-xl p-4">

    <div className="text-green-700 font-semibold">
      Added Exceptions
    </div>

    <div className="text-3xl font-bold mt-2">
      {addedCount}
    </div>

    <div className="text-sm text-slate-500">
      Records Added
    </div>

    <div className="mt-3 text-sm font-medium">
      By {latestAdded?.created_by || "-"}
    </div>

    <div className="text-xs text-slate-400">
      Latest Added Record
    </div>

  </div>

  <div className="border border-amber-200 bg-amber-50 rounded-xl p-4">

    <div className="text-amber-700 font-semibold">
      Legal Exceptions
    </div>

    <div className="text-3xl font-bold mt-2">
      {legalCount}
    </div>

    <div className="text-sm text-slate-500">
      Records Added
    </div>

    <div className="mt-3 text-sm font-medium">
      By {latestLegal?.created_by || "-"}
    </div>

    <div className="text-xs text-slate-400">
      Latest Legal Record
    </div>

  </div>

</div>
</div>
</div>

)}
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
  className={`border-b ${
    item.permanent
      ? "bg-red-50"
      : "hover:bg-slate-50"
  }`}
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
  {item.created_by}
</td>
          <td className="p-3">
            {item.till_date}
          </td>

          <td className="p-3">
  {item.permanent ? (
    <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
      Legal
    </span>
  ) : (
    daysLeft
  )}
</td>
<td className="p-3">
  {isLoggedIn &&
    currentUser === item.created_by && (
      <button
  disabled={deletingId === item.id}
  className={`text-white px-3 py-1 rounded text-xs ${
    deletingId === item.id
      ? "bg-slate-400 cursor-not-allowed"
      : "bg-red-600 hover:bg-red-700"
  }`}
  onClick={async () => {

    if (deletingId === item.id)
      return;

    setDeletingId(item.id);

    try {
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

    } finally {

      setDeletingId(null);

    }

  }}
>
  {deletingId === item.id
    ? "Deleting..."
    : "Delete"}
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
  user.username
);

setCurrentUser(
  user.username
);
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
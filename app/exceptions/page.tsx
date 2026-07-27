
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
} from "lucide-react";
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

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [invoiceText, setInvoiceText] = useState("");

const [tillDate, setTillDate] = useState("");
  useEffect(() => {

  const currentUser =
    localStorage.getItem("currentUser");

  if (!currentUser) return;

  const saved =
    localStorage.getItem(
      `exceptions_${currentUser}`
    );

  if (!saved) return;

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  const validExceptions =
    JSON.parse(saved).filter(
      (item: any) => {

        const tillDate =
          new Date(item.tillDate);

        tillDate.setHours(
          0,
          0,
          0,
          0
        );

        return tillDate >= today;

      }
    );
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
  setExceptions(validExceptions);

  localStorage.setItem(
    `exceptions_${currentUser}`,
    JSON.stringify(validExceptions)
  );

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

</aside>

<main className="flex-1 p-6">

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h1 className="text-3xl font-bold">
          Exceptions Management
        </h1>
      </div>

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-bold text-lg mb-4">
          Add Multiple Exceptions
        </h3>

        <textarea
  rows={10}
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
  onClick={() => {

    const currentUser =
      localStorage.getItem("currentUser");

    if (
      !currentUser ||
      !tillDate ||
      !invoiceText
    ) {
      return;
    }

    const creditData =
      JSON.parse(
        localStorage.getItem(
          "creditData"
        ) || "[]"
      );

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
                row["Invoice #"]
              )
                .replace(/\s/g, "") ===
              invoice.replace(/\s/g, "")
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

    const updated =
      [...exceptions, ...newExceptions];

    setExceptions(updated);

    localStorage.setItem(
      `exceptions_${currentUser}`,
      JSON.stringify(updated)
    );

    setInvoiceText("");

    setTillDate("");
  }}
>
  Add Exceptions
</button>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-bold text-lg mb-4">
          Current Exceptions
        </h3>

        <table className="w-full">
          <thead>
            <tr>
              <th>Van Code</th>
              <th>Employee Name</th>
              <th>ATS Code</th>
              <th>Customer Code</th>
              <th>Customer Name</th>
              <th>Invoice #</th>
              <th>Till Date</th>
              <th>Days</th>
              <th>Delete</th>
            </tr>
          </thead>

<tbody>

  {exceptions.map(
    (item, index) => {

      const tillDate =
        new Date(item.tillDate);

      const daysLeft =
        Math.ceil(
          (
            tillDate.getTime() -
            new Date().getTime()
          ) /
          (1000 * 60 * 60 * 24)
        );

      return (

        <tr key={index}>

          <td>{item.vanCode}</td>

          <td>
            {item.employeeName}
          </td>

          <td>{item.atsCode}</td>

          <td>
            {item.customerCode}
          </td>

          <td>
            {item.customerName}
          </td>

          <td>
            {item.invoice}
          </td>

          <td>
            {item.tillDate}
          </td>

          <td>
            {daysLeft}
          </td>

          <td>
            Delete
          </td>

        </tr>

      );

    }
  )}

</tbody>
        </table>
      </div>
      </main>
    </div>
  );
}
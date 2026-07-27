"use client";
import { storage as localStorage } from "@/utils/storage";
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

export default function SummaryPage() {
  const [data, setData] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [collectedInvoices, setCollectedInvoices] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<any>({});
  const [filters, setFilters] = useState<any>({
  regions: [],
  cities: [],
  vans: [],
});
  const [lastUpdatedVans,
  setLastUpdatedVans] =
  useState<string[]>([]);
const [isLoggedIn, setIsLoggedIn] = useState(false);

const [showLoginModal, setShowLoginModal] = useState(false);

const [username, setUsername] = useState("");

const [password, setPassword] = useState("");

const usersLogin = [
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
  useEffect(() => {

  const loadData = async () => {

    const response = await fetch("/api/credit-data");
    const result = await response.json();

    setData(result.data || []);

    const currentUser =
      await localStorage.getItem("currentUser");

    const collected =
      await localStorage.getItem(
        "collectedInvoices"
      );

    const savedPermissions =
      await localStorage.getItem(
        "vanPermissions"
      );

    const savedUpdatedVans =
      await localStorage.getItem(
        "lastUpdatedVans"
      );

    const savedFilters =
      await localStorage.getItem(
        `savedFilters_${currentUser}`
      );

    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }

    if (collected) {
      setCollectedInvoices(
        JSON.parse(collected)
      );
    }

    if (savedPermissions) {
      setPermissions(
        JSON.parse(savedPermissions)
      );
    }

    if (savedUpdatedVans) {
      setLastUpdatedVans(
        JSON.parse(savedUpdatedVans)
      );
    }

    setIsLoggedIn(!!currentUser);

  };

  loadData();

}, []);
  const getStatusStyle = (
remaining: number,
ex: number,
updated: boolean
) => {

if (updated) {

return "bg-sky-100 text-sky-700";

}

if (remaining === 0 && ex === 0) {

return "bg-green-100 text-green-700";

}

if (remaining > 0 && ex === 0) {

return "bg-pink-100 text-pink-700";

}

if (remaining === 0 && ex > 0) {

return "bg-orange-100 text-orange-700";

}

return "bg-orange-200 text-orange-900";

};
const filteredData = data.filter((row) => {

  const regionMatch =
    filters.regions.length === 0 ||
    filters.regions.includes(
      row["Region"]
    );

  const cityMatch =
    filters.cities.length === 0 ||
    filters.cities.includes(
      row["City"]
    );

  const vanMatch =
    filters.vans.length === 0 ||
    filters.vans.includes(
      row["Van Code."]
    );

  return (
    regionMatch &&
    cityMatch &&
    vanMatch
  );

});
  const vans = Object.entries(
  filteredData.reduce((acc: any, row) => {
          const van = row["Van Code."];

      if (!acc[van]) {
        acc[van] = {
          ids: new Set(),
          remaining: 0,
          exceptions: 0,
        };
      }

      acc[van].ids.add(row["Employee ATS Code."]);

      const invoice = String(row["Invoice #"]).replace(/\s/g, "");

      const isException = exceptions.some(
        (e: any) =>
          String(e.invoice).replace(/\s/g, "") === invoice
      );

      const isCollected = collectedInvoices.includes(invoice);

      if (isException) {
        acc[van].exceptions++;
      } else if (!isCollected) {
        acc[van].remaining++;
      }

      return acc;
    }, {})
).sort(([a], [b]) =>
  String(a).localeCompare(
    String(b)
  )
);

  const getStatus = (remaining: number, ex: number) => {
    if (remaining > 0 && ex > 0) {
      return `${remaining} Remaining , Ex`;
    }

    if (remaining > 0) {
      return `${remaining} Remaining`;
    }

    if (ex > 0) {
      return "Ex & All Collected";
    }

    return "All Collected";
  };
const regionSummary = Object.entries(

  filteredData.reduce(
    (acc: any, row) => {

      const region =
        row["Region"] || "Unknown";

      if (!acc[region]) {

        acc[region] = {
          invoices: 0,
          amount: 0,
        };

      }

      const invoice =
        String(
          row["Invoice #"]
        ).replace(/\s/g, "");

      const isException =
        exceptions.some(
          (e: any) =>
            String(e.invoice)
              .replace(/\s/g, "") ===
            invoice
        );

      const isCollected =
        collectedInvoices.includes(
          invoice
        );

      if (
        !isException &&
        !isCollected
      ) {

        acc[region].invoices++;

        acc[region].amount +=
          Number(
            row["Credit Invoice Amount"]
          ) || 0;

      }

      return acc;

    },
    {}
  )

);
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
    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600"
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

      <main className="flex-1 p-6">

        <h1 className="text-3xl font-bold mb-6">
          Summary
        </h1>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-auto max-h-[480px]">
          <table className="w-full table-fixed text-sm">

  <thead className="sticky top-0 z-10 bg-[#071d5c] text-white">

<tr className="bg-[#071d5c] text-white border-b border-blue-900">

<th className="p-4 w-[24%] text-left font-semibold">
Status
</th>

<th className="p-4 w-[20%] text-center font-semibold">
ID
</th>

<th className="p-4 w-[32%] text-left font-semibold">
Van Code
</th>

<th className="p-4 w-[24%] text-center font-semibold">
Permission
</th>

</tr>

</thead>

  <tbody>

    {vans
            .map(([van, info]: any) => {

        const status =
          getStatus(
            info.remaining,
            info.exceptions
          );

        return (

        <tr
key={van}
className={`
border-b
border-slate-200
transition-colors
${
lastUpdatedVans.some(
  (v) => String(v).trim() === String(van).trim()
)
? "bg-yellow-200"
: "hover:bg-slate-50"
}
`}
>

            <td className="p-3 border-r text-center">

  <span
    className={`
      inline-flex
      items-center
      justify-center
      px-4
      py-1.5
      rounded-full
      text-xs
      font-semibold
      ${getStatusStyle(
  info.remaining,
  info.exceptions,
  lastUpdatedVans.some(
    (v) => String(v).trim() === String(van).trim()
  )
)}    `}
  >
    {status}
  </span>

</td>

            <td className="p-3 border-r text-center">
              {[...info.ids].join(" or ")}
            </td>

            <td className="p-3 border-r font-semibold text-slate-800">
  {van}
</td>
            <td className="p-3 text-center">
<input
  type="checkbox"
  className="w-5 h-5 accent-blue-600 cursor-pointer"
  disabled={!isLoggedIn}
                checked={
                  permissions[van] ?? false
                }
                onChange={(e) => {

                  const updated = {
  ...permissions,
  [van]: e.target.checked,
};

                  setPermissions(
                    updated
                  );

                  localStorage.setItem(
                    "vanPermissions",
                    JSON.stringify(
                      updated
                    )
                  );

                }}
              />
            </td>

          </tr>

        );

      })}

  </tbody>

</table>
        </div>
<div className="mt-8 bg-white rounded-xl border p-5">

  <h2 className="text-xl font-bold mb-4">
    Region Summary
  </h2>

  <table className="w-full text-sm">

<thead>

<tr className="bg-[#071d5c] text-white border-b border-blue-900">

<th className="p-4 text-left font-semibold">
Region
</th>

<th className="p-4 text-center font-semibold">
Invoices
</th>

<th className="p-4 text-right font-semibold">
Amount
</th>

</tr>

</thead>

    <tbody>

      {regionSummary.map(
        ([region, info]: any) => (

          <tr
            key={region}
            className="border-b"
          >

            <td className="p-3">
              {region}
            </td>

            <td className="p-3">
              {info.invoices}
            </td>

            <td className="p-3">
              {info.amount.toLocaleString()}
            </td>

          </tr>

        )
      )}

    </tbody>

  </table>

</div>
      </main>
{showLoginModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-xl p-6 w-80">

      <h2 className="text-xl font-bold mb-4">
        Login
      </h2>

      <input
        className="border w-full p-2 mb-3 rounded"
        placeholder="Username"
        value={username}
        onChange={(e) =>
          setUsername(e.target.value)
        }
      />

      <input
        type="password"
        className="border w-full p-2 mb-4 rounded"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <div className="flex justify-end gap-2">

        <button
          className="px-4 py-2 border rounded"
          onClick={() =>
            setShowLoginModal(false)
          }
        >
          Cancel
        </button>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => {

            const user =
              usersLogin.find(
                (u) =>
                  u.username === username &&
                  u.password === password
              );

            if (!user) {
              alert("Invalid Login");
              return;
            }

            localStorage.setItem(
  "currentUser",
  user.id
);

setIsLoggedIn(true);
setShowLoginModal(false);

setUsername("");
setPassword("");
          }}
        >
          Login
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
}
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
  Truck,
  CircleAlert,
  CheckCircle,
  Receipt,
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

const exceptionsResponse =
  await fetch("/api/exceptions");

const exceptionsData =
  await exceptionsResponse.json();

setExceptions(
  exceptionsData || []
);
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

    acc[van].ids.add(
      row["Employee ATS Code."]
    );

    const invoice =
      String(row["Invoice #"])
        .replace(/\s/g, "")
        .toUpperCase();

    const isException =
      exceptions.some(
        (e: any) =>
          String(e.invoice)
            .replace(/\s/g, "")
            .toUpperCase() ===
          invoice
      );

    const isCollected =
      collectedInvoices.some(
        i =>
          String(i)
            .replace(/\s/g, "")
            .toUpperCase() ===
          invoice
      );

    if (isException) {

      acc[van].exceptions++;

    } else if (!isCollected) {

      acc[van].remaining++;

    }

    return acc;

  }, {})
)

.sort((a: any, b: any) => {

  const aInfo = a[1];
  const bInfo = b[1];

  const aPriority =
    aInfo.remaining > 0 &&
    aInfo.exceptions > 0
      ? 1
      : aInfo.remaining > 0
      ? 2
      : aInfo.exceptions > 0
      ? 3
      : 4;

  const bPriority =
    bInfo.remaining > 0 &&
    bInfo.exceptions > 0
      ? 1
      : bInfo.remaining > 0
      ? 2
      : bInfo.exceptions > 0
      ? 3
      : 4;

  if (aPriority !== bPriority) {
    return aPriority - bPriority;
  }

  return (
    bInfo.remaining -
    aInfo.remaining
  );

});
  const getStatus = (
  remaining: number,
  ex: number
) => {

  if (
    remaining > 0 &&
    ex > 0
  ) {
    return `${remaining} Remaining , Ex`;
  }

  if (
    remaining > 0
  ) {
    return `${remaining} Remaining`;
  }

  if (
    remaining === 0 &&
    ex > 0
  ) {
    return "Ex & All Collected";
  }

  return "All Collected";

};
const regionSummary = Object.entries(

  data.reduce(
    
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
  String(row["Invoice #"])
    .replace(/\s/g, "")
    .toUpperCase();

const normalizedInvoice = String(
  row["Invoice #"] || ""
)
  .trim()
  .replace(/\s/g, "")
  .toUpperCase();

const isException =
  exceptions.some(
    (e: any) =>
      String(e.invoice || "")
        .trim()
        .replace(/\s/g, "")
        .toUpperCase() === normalizedInvoice
  );

const isCollected =
  collectedInvoices.some(
    (i: string) =>
      String(i || "")
        .trim()
        .replace(/\s/g, "")
        .toUpperCase() === normalizedInvoice
  );

if (
  !isException &&
  !isCollected
) {
  acc[region].invoices++;

  acc[region].amount +=
  Number(
    row["pending_cim"]
  ) || 0;
}      return acc;

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
<div className="grid grid-cols-4 gap-4 mb-6">


  <div className="bg-white border rounded-xl p-5 shadow-sm">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-slate-500">
          Total Vans
        </p>

        <h2 className="text-3xl font-bold mt-2">
          {vans.length}
        </h2>
      </div>

      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
        <Truck
          size={22}
          className="text-blue-600"
        />
      </div>

    </div>

  </div>

  <div className="bg-white border rounded-xl p-5 shadow-sm">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-pink-600">
          Remaining Invoices
        </p>

        <h2 className="text-3xl font-bold mt-2 text-pink-600">
          {vans.reduce(
            (
              sum: number,
              [_, info]: any
            ) =>
              sum +
              info.remaining,
            0
          )}
        </h2>
      </div>

      <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
        <Receipt
          size={22}
          className="text-pink-600"
        />
      </div>

    </div>

  </div>

  <div className="bg-white border rounded-xl p-5 shadow-sm">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-orange-600">
          Exception Invoices
        </p>

        <h2 className="text-3xl font-bold mt-2 text-orange-600">
          {vans.reduce(
            (
              sum: number,
              [_, info]: any
            ) =>
              sum +
              info.exceptions,
            0
          )}
        </h2>
      </div>

      <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
        <CircleAlert
          size={22}
          className="text-orange-600"
        />
      </div>

    </div>

  </div>

  <div className="bg-white border rounded-xl p-5 shadow-sm">

    <div className="flex items-center justify-between">

      <div>
        <p className="text-sm text-green-600">
          All Collected Vans
        </p>

        <h2 className="text-3xl font-bold mt-2 text-green-600">
          {
            vans.filter(
              ([_, info]: any) =>
                info.remaining === 0
            ).length
          }
        </h2>
      </div>

      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle
          size={22}
          className="text-green-600"
        />
      </div>

    </div>

  </div>

</div>

<div className="flex gap-6 items-stretch">

<div
  className="
    flex-1
    bg-white
    rounded-2xl
    shadow-sm
    border
    border-slate-100
    overflow-hidden
  "
>

  <div className="px-6 py-5 border-b border-slate-100">

    <div className="flex items-center justify-between">

      <div>

        <h2 className="text-xl font-bold text-slate-800">
          Van Performance
        </h2>

       <p className="text-xs text-slate-500 mt-1">
          Credit block status by van
        </p>

      </div>

      <div className="text-sm text-slate-500">
        {vans.length} Vans
      </div>

    </div>

  </div>

  <div className="overflow-auto max-h-[500px]">

    <table className="w-full text-sm border-collapse">
  <thead className="sticky top-0 z-10 bg-[#071d5c] text-white">

<tr className="bg-[#071d5c] text-white border-b border-blue-900">

<th className="px-4 py-3 text-center text-sm font-semibold border-r border-blue-900">
  Status
</th>

<th className="px-4 py-3 text-center text-sm font-semibold border-r border-blue-900">
  ID
</th>

<th className="px-4 py-3 text-center text-sm font-semibold border-r border-blue-900">
  Van Code
</th>

<th className="px-4 py-3 text-center text-sm font-semibold">
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
    transition-all
    duration-200
    ${
      lastUpdatedVans.some(
        (v) =>
          String(v).trim() ===
          String(van).trim()
      )
        ? "bg-yellow-50"
        : "hover:bg-slate-50"
    }
  `}
>

            <td className="px-4 py-3 text-center border-r border-b border-slate-300">

  <span
  className={`
      inline-flex
      items-center
      justify-center
      min-w-[130px]
      px-3
      py-1
      rounded-full
      text-xs
      font-semibold
            ${getStatusStyle(
        info.remaining,
        info.exceptions,
        lastUpdatedVans.some(
          (v) =>
            String(v).trim() ===
            String(van).trim()
        )
      )}
    `}
  >
    {status}
  </span>

</td>
            <td className="px-3 py-2 border-r border-b border-slate-300 text-center">
              {[...info.ids].join(" or ")}
            </td>

            <td className="px-3 py-2 text-center border-r border-b border-slate-300 font-semibold text-slate-800">
  {van}
</td>

<td className="px-4 py-3 text-center border-b border-slate-300">
    <input
    type="checkbox"
    className="w-4 h-4 accent-blue-600 cursor-pointer"
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

</div>

<div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col">    <div className="px-5 py-4 border-b border-slate-100">

    <h2 className="text-lg font-bold text-slate-800">
      Region Summary
    </h2>

    <p className="text-xs text-slate-500 mt-1">
      Outstanding invoices by region
    </p>

  </div>

  <div className="p-6 flex-1">

    <div className="space-y-5">

      {regionSummary
        .sort(
          (a: any, b: any) =>
            b[1].invoices -
            a[1].invoices
        )
        .map(
          ([region, info]: any) => {

            const maxInvoices =
              Math.max(
                ...regionSummary.map(
                  (r: any) =>
                    r[1].invoices
                ),
                1
              );

            return (

              <div key={region}>

                <div className="flex justify-between mb-2">

                  <span className="font-semibold">
                    {region}
                  </span>

                  <span className="text-slate-500">
                    {info.invoices}
                    {" "}
                    Invoices
                  </span>

                </div>

                <div className="h-3 bg-slate-200 rounded-full">

                  <div
                    className="h-3 bg-blue-600 rounded-full"
                    style={{
                      width: `${
                        (
                          info.invoices /
                          maxInvoices
                        ) * 100
                      }%`,
                    }}
                  />

                </div>

                <div className="text-right text-sm text-slate-500 mt-1">

                  SAR {info.amount.toLocaleString()}
                </div>

              </div>

            );

          }
        )}

    </div>

</div>

</div>

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
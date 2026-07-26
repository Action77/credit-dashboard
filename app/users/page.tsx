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
import * as XLSX from "xlsx";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const [regionFilter, setRegionFilter] =
    useState("");

  const [cityFilter, setCityFilter] =
    useState("");

  const [orgFilter, setOrgFilter] =
    useState("");

  const [vanFilter, setVanFilter] =
    useState("");

  const loadUsers = async () => {

  const response =
    await fetch("/api/users");

  const data =
    await response.json();

  console.log(
    "LOADED USERS",
    data
  );

  setUsers(data || []);

};
useEffect(() => {
  loadUsers();
}, []);
  const handleImport = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file =
      event.target.files?.[0];

    if (!file) return;

    const reader =
      new FileReader();

    reader.onload = async (e) => {

  const workbook = XLSX.read(
    e.target?.result,
    {
      type: "binary",
    }
  );

  const sheet =
    workbook.Sheets[
      workbook.SheetNames[0]
    ];

  const rows: any[] =
    XLSX.utils.sheet_to_json(sheet);

  console.log("ROWS", rows);

  const usersData =
    rows.map((row) => ({
      region:
        row["Region"] || "",

      city:
        row["City"] || "",

      organization_code:
        row["Organization Code"] || "",

      user_code:
        row["User Code"] || "",

      organization_name:
        row["Organization Name"] || "",

      van_sub_inventory:
        row["Van Sub Inventory"] || "",

      contact:
        row["Contact"] || "",
    }));

  console.log(
    "USERS DATA",
    usersData
  );
const response =
  await fetch(
    "/api/users",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(
        usersData
      ),
    }
  );

const result =
  await response.json();

console.log(
  "RESULT",
  result
);

loadUsers();
  setUsers(await (await fetch("/api/users")).json());
};

    reader.readAsBinaryString(file);
  };

  const handleDelete =
    async (id: number) => {

      await fetch(
        "/api/users",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      loadUsers();
    };

  const handleEdit =
    async (user: any) => {

      const contact =
        prompt(
          "Contact",
          user.contact
        );

      if (
        contact === null
      )
        return;

      await fetch(
        "/api/users",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            ...user,
            contact,
          }),
        }
      );

      loadUsers();
    };

  const filteredUsers =
    users.filter((user) => {

      const matchesSearch =
        JSON.stringify(user)
          .toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesRegion =
        !regionFilter ||
        user.region === regionFilter;

      const matchesCity =
        !cityFilter ||
        user.city === cityFilter;

      const matchesOrg =
        !orgFilter ||
        user.organization_code ===
          orgFilter;

      const matchesVan =
        !vanFilter ||
        user.van_sub_inventory ===
          vanFilter;

      return (
        matchesSearch &&
        matchesRegion &&
        matchesCity &&
        matchesOrg &&
        matchesVan
      );
    });

return (
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

  <div className="flex items-center gap-3 px-4 py-3">
    <AlertCircle size={18} />
    Exceptions
  </div>

  <div className="flex items-center gap-3 px-4 py-3">
    <BarChart3 size={18} />
    Summary
  </div>

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


      <div className="p-6 border-t border-white/10">
        <div
          className="flex items-center gap-3 cursor-pointer bg-red-600 p-3 rounded-lg"
          onClick={() => {
            localStorage.removeItem("currentUser");
            window.location.href = "/";
          }}
        >
          <LogOut size={18} />
          Logout
        </div>
      </div>

    </aside>

    <main className="flex-1 p-6">

      <div className="flex justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Users
        </h1>

        <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
          Import Users

          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={
              handleImport
            }
          />
        </label>

      </div>

      <div className="grid grid-cols-5 gap-3 mb-5">

        <input
          placeholder="Search"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="border rounded p-2"
        />

        <select
          value={regionFilter}
          onChange={(e) =>
            setRegionFilter(
              e.target.value
            )
          }
          className="border rounded p-2"
        >
          <option value="">
            Region
          </option>

          {[...new Set(
            users.map(
              (u) => u.region
            )
          )].map((item) => (
            <option
              key={String(item)}
              value={String(item)}
            >
              {String(item)}
            </option>
          ))}
        </select>

        <select
          value={cityFilter}
          onChange={(e) =>
            setCityFilter(
              e.target.value
            )
          }
          className="border rounded p-2"
        >
          <option value="">
            City
          </option>

          {[...new Set(
            users.map(
              (u) => u.city
            )
          )].map((item) => (
            <option
              key={String(item)}
              value={String(item)}
            >
              {String(item)}
            </option>
          ))}
        </select>

        <select
          value={orgFilter}
          onChange={(e) =>
            setOrgFilter(
              e.target.value
            )
          }
          className="border rounded p-2"
        >
          <option value="">
            Organization Code
          </option>

          {[...new Set(
            users.map(
              (u) =>
                u.organization_code
            )
          )].map((item) => (
            <option
              key={String(item)}
              value={String(item)}
            >
              {String(item)}
            </option>
          ))}
        </select>

        <select
          value={vanFilter}
          onChange={(e) =>
            setVanFilter(
              e.target.value
            )
          }
          className="border rounded p-2"
        >
          <option value="">
            Van Sub Inventory
          </option>

          {[...new Set(
            users.map(
              (u) =>
                u.van_sub_inventory
            )
          )].map((item) => (
            <option
              key={String(item)}
              value={String(item)}
            >
              {String(item)}
            </option>
          ))}
        </select>

      </div>

      <div className="overflow-auto">

        <table className="w-full border">

          <thead>

            <tr className="bg-slate-800 text-white">

              <th className="p-3">
                Region
              </th>

              <th className="p-3">
                City
              </th>

              <th className="p-3">
                Organization Code
              </th>

              <th className="p-3">
                User Code
              </th>

              <th className="p-3">
                Organization Name
              </th>

              <th className="p-3">
                Van Sub Inventory
              </th>

              <th className="p-3">
                Contact
              </th>

              <th className="p-3">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.map(
              (user) => (

              <tr
                key={user.id}
                className="border-b"
              >
                <td className="p-2">
                  {user.region}
                </td>

                <td className="p-2">
                  {user.city}
                </td>

                <td className="p-2">
                  {user.organization_code}
                </td>

                <td className="p-2">
                  {user.user_code}
                </td>

                <td className="p-2">
                  {user.organization_name}
                </td>

                <td className="p-2">
                  {user.van_sub_inventory}
                </td>

                <td className="p-2">
                  {user.contact}
                </td>

                <td className="p-2 flex gap-2">

                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() =>
                      handleEdit(user)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() =>
                      handleDelete(
                        user.id
                      )
                    }
                  >
                    Delete
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>

  </div>
);
}
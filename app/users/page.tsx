"use client";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { storage as localStorage } from "@/utils/storage";
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
  const [currentUser, setCurrentUser] =
  useState("");
  const [editingUserId, setEditingUserId] =
  useState<number | null>(null);
  const [saving, setSaving] = useState(false);

const [deletingUserId, setDeletingUserId] =
  useState<number | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [editingId, setEditingId] =
  useState<number | null>(null);

const [editData, setEditData] =
  useState<any>({});
  const [search, setSearch] = useState("");

  const [regionFilter, setRegionFilter] =
    useState("");

  const [cityFilter, setCityFilter] =
    useState("");

  const [orgFilter, setOrgFilter] =
    useState("");

  const [vanFilter, setVanFilter] =
    useState("");
const [isLoggedIn, setIsLoggedIn] = useState(false);

const [showLoginModal, setShowLoginModal] = useState(false);

const [username, setUsername] = useState("");

const [password, setPassword] = useState("");

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
  const load = async () => {
  await loadUsers();

  const currentUser =
    await localStorage.getItem("currentUser");

  setIsLoggedIn(!!currentUser);
};

  load();
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

    if (deletingUserId === id)
      return;

    setDeletingUserId(id);

    try {

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

      await loadUsers();

    } finally {

      setDeletingUserId(null);

    }
  };
  const handleEdit = (
  user: any
) => {

  if (editingUserId === user.id)
    return;

  setEditingUserId(user.id);

  setEditingId(user.id);

  setEditData(user);

};
const handleSave =
  async () => {

    if (saving) return;

    setSaving(true);

    try {

      await fetch(
        "/api/users",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            editData
          ),
        }
      );

      setEditingId(null);
      setEditingUserId(null);
      setEditData({});

      await loadUsers();

    } finally {

      setSaving(false);

    }
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
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-700 transition"
  >
    <Settings size={18} />
    <span>Settings</span>
  </Link>

  <Link
    href="/users"
    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600"
  >
    <Users size={18} />
    <span>Users</span>
  </Link>

</nav>


      <div className="p-6 border-t border-white/10">

  {isLoggedIn ? (
<div
  className={`flex items-center gap-3 cursor-pointer p-3 rounded-lg ${
    isLoggedIn ? "bg-red-600" : "bg-blue-600"
  }`}
  onClick={async () => {
  await localStorage.removeItem("currentUser");

  setIsLoggedIn(false);
  setUsername("");
  setPassword("");
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

      <div className="flex justify-between mb-6">

        <h1 className="text-3xl font-bold">
          Users
        </h1>

        {isLoggedIn && (
  <label className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">
    Import Users

    <input
      type="file"
      accept=".xlsx,.xls"
      className="hidden"
      onChange={handleImport}
    />
  </label>
)}

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
  {editingId === user.id ? (
    <input
      value={editData.region || ""}
      onChange={(e) =>
        setEditData({
          ...editData,
          region: e.target.value,
        })
      }
      className="border p-1 w-full"
    />
  ) : (
    user.region
  )}
</td>

<td className="p-2">
  {editingId === user.id ? (
    <input
      value={editData.city || ""}
      onChange={(e) =>
        setEditData({
          ...editData,
          city: e.target.value,
        })
      }
      className="border p-1 w-full"
    />
  ) : (
    user.city
  )}
</td>

<td className="p-2">
  {editingId === user.id ? (
    <input
      value={editData.organization_code || ""}
      onChange={(e) =>
        setEditData({
          ...editData,
          organization_code:
            e.target.value,
        })
      }
      className="border p-1 w-full"
    />
  ) : (
    user.organization_code
  )}
</td>

<td className="p-2">
  {editingId === user.id ? (
    <input
      value={editData.user_code || ""}
      onChange={(e) =>
        setEditData({
          ...editData,
          user_code:
            e.target.value,
        })
      }
      className="border p-1 w-full"
    />
  ) : (
    user.user_code
  )}
</td>

<td className="p-2">
  {editingId === user.id ? (
    <input
      value={
        editData.organization_name ||
        ""
      }
      onChange={(e) =>
        setEditData({
          ...editData,
          organization_name:
            e.target.value,
        })
      }
      className="border p-1 w-full"
    />
  ) : (
    user.organization_name
  )}
</td>

<td className="p-2">
  {editingId === user.id ? (
    <input
      value={
        editData.van_sub_inventory ||
        ""
      }
      onChange={(e) =>
        setEditData({
          ...editData,
          van_sub_inventory:
            e.target.value,
        })
      }
      className="border p-1 w-full"
    />
  ) : (
    user.van_sub_inventory
  )}
</td>

<td className="p-2">
  {editingId === user.id ? (
    <input
      value={editData.contact || ""}
      onChange={(e) =>
        setEditData({
          ...editData,
          contact:
            e.target.value,
        })
      }
      className="border p-1 w-full"
    />
  ) : (
    user.contact
  )}
</td>

                <td className="p-2 flex gap-2">

                  {isLoggedIn &&
  (editingId === user.id ? (
<button
  disabled={saving}
  className={`text-white px-3 py-1 rounded ${
    saving
      ? "bg-slate-400 cursor-not-allowed"
      : "bg-green-600"
  }`}
  onClick={handleSave}
>
  {saving ? "Saving..." : "Save"}
</button>
  ) : (
<button
  disabled={editingUserId === user.id}
  className={`text-white px-3 py-1 rounded ${
    editingUserId === user.id
      ? "bg-slate-400 cursor-not-allowed"
      : "bg-blue-600 hover:bg-blue-700"
  }`}
  onClick={() => handleEdit(user)}
>
  {editingUserId === user.id
    ? "Editing..."
    : "Edit"}
</button>
  ))}

{isLoggedIn && (
<button
  disabled={deletingUserId === user.id}
  className={`text-white px-3 py-1 rounded ${
    deletingUserId === user.id
      ? "bg-slate-400 cursor-not-allowed"
      : "bg-red-600"
  }`}
  onClick={() => handleDelete(user.id)}
>
  {deletingUserId === user.id
    ? "Deleting..."
    : "Delete"}
</button>
)}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </main>

  </div>

  {showLoginModal && (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">

      <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8">

        <h2 className="text-3xl font-bold text-center mb-6">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-3 rounded-xl mb-4"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-xl mb-4"
        />

        <button
          className="w-full bg-blue-600 text-white py-3 rounded-xl"
          onClick={async () => {

            const { data: user } = await supabase
  .from("app_users")
  .select("*")
  .eq("username", username)
  .single();

if (!user) {
  alert("Invalid Username");
  return;
}

if (user.password !== password) {
  alert("Invalid Password");
  return;
}

await localStorage.setItem(
  "currentUser",
  user.username
);

setIsLoggedIn(true);
setCurrentUser(user.username);

setShowLoginModal(false);

setUsername("");
setPassword("");
          }}
        >
          Login
        </button>

        <button
          className="w-full mt-3 border py-3 rounded-xl"
          onClick={() => setShowLoginModal(false)}
        >
          Cancel
        </button>

      </div>

    </div>
  )}

</>
);
}
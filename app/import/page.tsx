"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";

export default function ImportPage() {
    const [users, setUsers] =
  useState<any[]>([]);

const [creditFileInfo, setCreditFileInfo] =
  useState("");

const [collectionFileInfo, setCollectionFileInfo] =
  useState("");

const [usersFileInfo, setUsersFileInfo] =
  useState("");

    const [currentUser, setCurrentUser] =
  useState("");
    const [isUploadingCredit, setIsUploadingCredit] =
  useState(false);

const [isUploadingCollection, setIsUploadingCollection] =
  useState(false);

const [isImportingUsers, setIsImportingUsers] =
  useState(false);
const loadUsers = async () => {

  const response =
    await fetch("/api/users");

  const data =
    await response.json();

  setUsers(data || []);

};

const handleImport = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {

  if (isImportingUsers) return;

  setIsImportingUsers(true);

  try {

    const file =
      event.target.files?.[0];

    if (!file) {
      setIsImportingUsers(false);
      return;
    }

    const reader =
      new FileReader();

    reader.onload = async (e) => {

      try {

        const workbook =
          XLSX.read(
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
          XLSX.utils.sheet_to_json(
            sheet
          );

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

        await fetch(
          "/api/users",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              users: usersData,
              uploadedBy:
                currentUser,
            }),
          }
        );

        setUsersFileInfo(
          file.name
        );

        await loadUsers();

      } finally {

        setIsImportingUsers(
          false
        );

      }

    };

    reader.readAsBinaryString(
      file
    );

  } catch {

    setIsImportingUsers(
      false
    );

  }

};

  return (
    <main className="flex-1 p-6 bg-[#f4f7fc] min-h-screen">

      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          Import Center
        </h1>

        <p className="text-slate-500 mt-2">
          Upload and manage Credit, Collection and Users files.
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Credit */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
            📄
          </div>

          <h2 className="text-xl font-bold mb-2">
            Credit File
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            Upload the latest credit report.
          </p>

          {/* زر Credit الحالي هنا */}
        </div>

        {/* Collection */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-4">
            💰
          </div>

          <h2 className="text-xl font-bold mb-2">
            Collection File
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            Upload the latest collection report.
          </p>

          {/* زر Collection الحالي هنا */}
        </div>

        {/* Users */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">

          <div className="w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
            👥
          </div>

          <h2 className="text-xl font-bold mb-2">
            Users File
          </h2>

          <p className="text-slate-500 text-sm mb-6">
            Upload users master data.
          </p>

<label
  className={`w-full flex items-center justify-center text-white px-5 py-3 rounded-xl ${
    isImportingUsers
      ? "bg-slate-400 pointer-events-none"
      : "bg-purple-600 hover:bg-purple-700 cursor-pointer"
  }`}
>
  {isImportingUsers
    ? "Importing..."
    : "Import Users"}

  <input
    type="file"
    accept=".xlsx,.xls"
    className="hidden"
    onChange={handleImport}
  />
</label>
        </div>

      </div>

      {/* Last Imports */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mt-6">

        <h2 className="text-xl font-bold mb-5">
          Import Status
        </h2>

        <div className="space-y-4">

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="font-semibold text-blue-700">
              Credit File
            </div>

            <div className="text-sm text-slate-600">
              {creditFileInfo || "Not Imported"}
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="font-semibold text-green-700">
              Collection File
            </div>

            <div className="text-sm text-slate-600">
              {collectionFileInfo || "Not Imported"}
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="font-semibold text-purple-700">
              Users File
            </div>

            <div className="text-sm text-slate-600">
              {usersFileInfo || "Not Imported"}
            </div>
          </div>

        </div>

      </div>

    </main>
  );
}
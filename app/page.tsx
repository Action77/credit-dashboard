"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

import {
  LayoutDashboard,
  Upload,
  FileText,
  AlertCircle,
  BarChart3,
  Settings,
  Users,
  LogOut,
  Search,
  Filter,
} from "lucide-react";


export default function Home() {

  const [data, setData] =
    useState<any[]>([]);

  const [selectedRegion, setSelectedRegion] =
    useState("");

  const [selectedCity, setSelectedCity] =
    useState("");

  const [selectedVan, setSelectedVan] =
    useState("");

  const [exceptions, setExceptions] =
  useState<any[]>([]);

const [collectedInvoices,
  setCollectedInvoices] =
  useState<string[]>([]);

const [invoiceNo, setInvoiceNo] =
  useState("");

const [tillDate, setTillDate] =
  useState("");
const [loadedExceptions,
  setLoadedExceptions] =
  useState(false);
  useEffect(() => {
  const saved =
    localStorage.getItem(
      "exceptions"
    );

  if (!saved) {
    setLoadedExceptions(true);
    return;
  }

  const today = new Date();
  today.setHours(
    0,
    0,
    0,
    0
  );

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

  setExceptions(
    validExceptions
  );

  setLoadedExceptions(true);

}, []);
useEffect(() => {

  if (!loadedExceptions)
    return;

  localStorage.setItem(
    "exceptions",
    JSON.stringify(exceptions)
  );

}, [
  exceptions,
  loadedExceptions,
]);
useEffect(() => {
  const savedData =
    localStorage.getItem("creditData");

  const savedDate =
    localStorage.getItem("creditDate");

  const today =
    new Date().toDateString();

  if (
    savedData &&
    savedDate === today
  ) {
    setData(JSON.parse(savedData));
  } else {
    localStorage.removeItem(
      "creditData"
    );

    localStorage.removeItem(
      "creditDate"
    );
  }
}, []);

  const handleCreditImport = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const workbook = XLSX.read(
        e.target?.result,
        { type: "binary" }
      );

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const jsonData: any[] =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            range: 5,
          }
        );

      const blockedRows =
        jsonData.filter((row) =>
          String(
            row["Status User Block"] || ""
          )
            .trim()
            .toLowerCase() === "block"
        );
setData(blockedRows);

localStorage.setItem(
  "creditData",
  JSON.stringify(blockedRows)
);

localStorage.setItem(
  "creditDate",
  new Date().toDateString()
);

    };

    reader.readAsBinaryString(file);
  };
  const handleCollectionImport = (
  event: React.ChangeEvent<HTMLInputElement>
) => {

  const file =
    event.target.files?.[0];

  if (!file) return;

  const reader =
    new FileReader();

  reader.onload = (e) => {

    const workbook =
      XLSX.read(
        e.target?.result,
        { type: "binary" }
      );

    const sheetName =
      workbook.SheetNames[0];

    const worksheet =
      workbook.Sheets[sheetName];

    const rows: any[] =
      XLSX.utils.sheet_to_json(
        worksheet,
        {
          header: 1,
        }
      );

    const invoices =
      rows
        .slice(1)
        .filter((row) => {

          const status =
            String(
              row[26] || ""
            ).trim();

          return (
            status === "Hold" ||
            status === "Completed"
          );
        })
        .map((row) =>
          String(row[1] || "")
            .trim()
            .replace(/\s/g, "")
        );

    setCollectedInvoices(
      invoices
    );
    console.log("Collection Invoices:");
console.log(invoices);

setCollectedInvoices(
  invoices
);
  };

  reader.readAsBinaryString(
    file
  );
};
const filteredData = data.filter((row) => {
  return (
    
    (!selectedRegion ||
      row["Region"] === selectedRegion) &&
    (!selectedCity ||
      row["City"] === selectedCity) &&
    (!selectedVan ||
      row["Van Code."] === selectedVan)
  );
});
  return (
    <div className="min-h-screen bg-[#f4f7fc] flex text-slate-900">

      {/* Sidebar */}
      <aside className="w-52 bg-[#071d5c] text-white flex flex-col justify-between">

        <div>
          <div className="p-4">
            <h1 className="text-xl font-bold leading-tight">
              Credit With Route Block
            </h1>
          </div>

          <nav className="px-4 space-y-2">

            <div className="flex items-center gap-3 bg-blue-600 px-4 py-3 rounded-xl">
              <LayoutDashboard size={18} />
              Dashboard
            </div>

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

            <div className="flex items-center gap-3 px-4 py-3">
              <Users size={18} />
              Users
            </div>

          </nav>
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <LogOut size={18} />
            Logout
          </div>
        </div>

      </aside>

      {/* Content */}
      <main className="flex-1 p-6">

        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6 flex justify-between items-center">

          <h2 className="text-3xl font-bold">
            Dashboard
          </h2>

          <div className="flex gap-8">
            <span>
              Today: {new Date().toLocaleDateString()}
            </span>

            <span>
              Admin
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-6">

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <p className="text-gray-500">
              Blocked Invoices
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {filteredData.length}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <p className="text-gray-500">
              Active
            </p>

            <h2 className="text-5xl font-bold text-green-600 mt-3">
              0
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <p className="text-gray-500">
              Exceptions
            </p>

            <h2 className="text-5xl font-bold text-orange-500 mt-3">
  {exceptions.length}
</h2>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <p className="text-gray-500">
              Employees
            </p>

            <h2 className="text-5xl font-bold text-purple-600 mt-3">
              41
            </h2>
          </div>

        </div>

        {/* Actions */}
        <div className="flex justify-between mb-6">

          <div className="flex gap-3">

            <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg cursor-pointer">

              Import Credit

              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={handleCreditImport}
              />
            </label>

<label className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg cursor-pointer">

  Import Collection

  <input
    type="file"
    accept=".xlsx,.xls"
    className="hidden"
    onChange={handleCollectionImport}
  />

</label>

            <button className="bg-white border px-5 py-3 rounded-lg">
              Refresh Data
            </button>

          </div>

          <div className="flex gap-3">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3"
              />

              <input
                placeholder="Search..."
                className="bg-white border rounded-lg pl-10 py-3 pr-4"
              />

            </div>

            <button className="bg-white border rounded-lg px-4 flex items-center gap-2">
              <Filter size={16} />
              Filters
            </button>

          </div>

        </div>

        {/* Alert */}
        {data.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="font-bold text-green-700">
              File Imported Successfully
            </p>

            <p className="mt-2">
              Block Records:
              {" "}
              {filteredData.length}
            </p>
          </div>
        )}

        <div className="grid grid-cols-3 gap-6">

          {/* Table */}
          <div className="col-span-2 bg-white rounded-xl border shadow-sm p-5">

            <h3 className="font-bold text-xl mb-5">
              Invoices
            </h3>
<div className="flex gap-3 mb-4">

  <select
  value={selectedRegion}
onChange={(e) => {
  setSelectedRegion(e.target.value);
  setSelectedCity("");
  setSelectedVan("");
}}
  className="border rounded-lg px-3 py-2"
>
  <option value="">
    All Regions
  </option>

  {[...new Set(data.map((r) => r.Region))]
    .filter(Boolean)
    .map((region) => (
      <option
        key={region}
        value={region}
      >
        {region}
      </option>
    ))}
</select>

<select
  value={selectedCity}
onChange={(e) => {
  setSelectedCity(e.target.value);
  setSelectedVan("");
}}
  className="border rounded-lg px-3 py-2"
>
  <option value="">
    All Cities
  </option>

  {[
  ...new Set(
    data
      .filter(
        (r) =>
          !selectedRegion ||
          r.Region === selectedRegion
      )
      .map((r) => r.City)
  ),
]
    .filter(Boolean)
    .map((city) => (
      <option
        key={city}
        value={city}
      >
        {city}
      </option>
    ))}
</select>

<select
  value={selectedVan}
  onChange={(e) =>
    setSelectedVan(e.target.value)
  }
  className="border rounded-lg px-3 py-2"
>
  <option value="">
    All Vans
  </option>

  {[
  ...new Set(
    data
      .filter((r) => {
        return (
          (!selectedRegion ||
            r.Region === selectedRegion) &&
          (!selectedCity ||
            r.City === selectedCity)
        );
      })
      .map((r) => r["Van Code."])
  ),
]
    .filter(Boolean)
    .map((van) => (
      <option
        key={van}
        value={van}
      >
        {van}
      </option>
    ))}
</select>

</div>
            <div className="overflow-auto max-h-[600px]">

              <table className="min-w-[1700px] text-sm">

                <thead>

                  <tr className="bg-[#0b2668] text-white">

<th className="p-3">Van Code</th>
<th className="p-3">Employee Name</th>
<th className="p-3">ATS Code</th>
<th className="p-3">Customer Code</th>
<th className="p-3">Customer Name</th>
<th className="p-3">Central Invoice</th>
<th className="p-3">Payment Term</th>
<th className="p-3">Invoice #</th>
<th className="p-3">Trx Date</th>
<th className="p-3">Credit Amount</th>
<th className="p-3">Pending CIM</th>
<th className="p-3">Credit Days</th>
<th className="p-3">Rejected Count</th>
<th className="p-3">Status</th>

                  </tr>

                </thead>

                <tbody>

                  {data
  .filter((row) => {
    return (
      (!selectedRegion ||
        row["Region"] === selectedRegion) &&

      (!selectedCity ||
        row["City"] === selectedCity) &&

      (!selectedVan ||
        row["Van Code."] === selectedVan)
    );
  })
  .map((row, index) => (
<tr
  key={index}
  className="border-b"
  style={{
    backgroundColor:
      exceptions.some(
  (e) =>
    String(e.invoice)
      .replace(/\s/g, "") ===
    String(row["Invoice #"])
      .replace(/\s/g, "")
)
        ? "#FFCB96"
        : "",
  }}
>
                      <td className="p-3">
  {row["Van Code."]}
</td>

<td className="p-3">
  {row["Employee Name."]}
</td>

<td className="p-3">
  {row["Employee ATS Code."]}
</td>

<td className="p-3">
  {row["Customer Code"]}
</td>

<td className="p-3">
  {row["Customer Name"]}
</td>

<td className="p-3">
  {row["Central Invoice"]}
</td>

<td className="p-3">
  {row["Payment Term"]}
</td>

<td className="p-3">
  {row["Invoice #"]}
</td>

<td className="p-3">
  {row["Trx Date"]}
</td>

<td className="p-3">
  {row["Credit Invoice Amount"]}
</td>

<td className="p-3">
  {row["Pending CIM"]}
</td>

<td className="p-3">
  {row["Credit_Days"]}
</td>

<td className="p-3">
  {row["Total Rejected Count"]}
</td>
                      <td className="p-3">

                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Block
                        </span>

                      </td>
                    </tr>
                  ))}

                </tbody>

              </table>

            </div>

          </div>

          {/* Exception Panel */}
          <div className="bg-white rounded-xl border shadow-sm p-5">

            <h3 className="font-bold text-xl mb-5">
              Exception Invoices
            </h3>

<input
  value={invoiceNo}
  onChange={(e) =>
    setInvoiceNo(e.target.value)
  }
  placeholder="Invoice No."
  className="w-full border rounded-lg p-3 mb-3"
/>
<input
  type="date"
  value={tillDate}
  onChange={(e) =>
    setTillDate(e.target.value)
  }
  className="w-full border rounded-lg p-3 mb-3"
/>

            

        

            <button
  className="bg-blue-600 text-white w-full py-3 rounded-lg"
  onClick={() => {

    const invoice =
      invoiceNo
        .replace(/\s/g, "")
        .toUpperCase();

    if (
      !invoice ||
      !tillDate
    )
      return;

    setExceptions((prev) => {

      if (
        prev.some(
          (x) =>
            x.invoice === invoice
        )
      ) {
        return prev;
      }

      return [
        ...prev,
        {
          invoice,
          tillDate,
        },
      ];
    });

    setInvoiceNo("");
    setTillDate("");
  }}
>
  Add Exception
</button>
            <div className="mt-8">

              <h4 className="font-bold mb-4">
                Current Exceptions
              </h4>


<table className="w-full text-sm">

  <thead>

    <tr className="border-b">

      <th className="text-left p-2">
        Invoice
      </th>

      <th className="text-left p-2">
        Till Date
      </th>

<th className="text-left p-2">
  Days
</th>

<th className="text-left p-2">
  Delete
</th>

    </tr>

  </thead>

<tbody>

  {exceptions.map((item, index) => {



      const tillDate =
  new Date(item.tillDate);

const daysLeft =
  isNaN(tillDate.getTime())
    ? "-"
    : Math.ceil(
        (
          tillDate.getTime() -
          new Date().getTime()
        ) /
          (1000 * 60 * 60 * 24)
      );
      return (
        <tr key={index}>
          <td className="p-2">
            {item.invoice}
          </td>

<td className="p-2">
  {item.tillDate
    ? new Date(
        item.tillDate
      ).toLocaleDateString()
    : "-"}
</td>

          <td className="p-2">
            {daysLeft}
          </td>
          <td className="p-2">
  <button
    className="bg-red-600 text-white px-2 py-1 rounded"
    onClick={() =>
      setExceptions((prev) =>
        prev.filter(
          (_, i) => i !== index
        )
      )
    }
  >
    X
  </button>
</td>
        </tr>
      );
    })}

</tbody>
</table>

              </div>
              

            </div>

          </div>

       
        
{/* Summary Section */}

<div className="grid grid-cols-3 gap-6 mt-6">

  <div className="col-span-1 bg-white rounded-xl border shadow-sm p-5">

    <h3 className="font-bold mb-4">
      Summary by Employee
    </h3>

    <table className="w-full text-sm">

      <thead>
        <tr className="border-b">
          <th className="text-left p-2">
            Employee
          </th>

          <th className="text-left p-2">
            Total
          </th>

          <th className="text-left p-2">
            Block
          </th>
        </tr>
      </thead>

      <tbody>

        <tr>
          <td className="p-2">
            Nelson
          </td>

          <td className="p-2">
            213
          </td>

          <td className="p-2 text-red-600">
            213
          </td>
        </tr>

        <tr>
          <td className="p-2">
            Hossam
          </td>

          <td className="p-2">
            187
          </td>

          <td className="p-2 text-red-600">
            187
          </td>
        </tr>

      </tbody>

    </table>

  </div>
    <div className="bg-white rounded-xl border shadow-sm p-5">

    <h3 className="font-bold mb-4">
      Top Employees
    </h3>

    <div className="space-y-4">

      <div>

        <div className="flex justify-between">
          <span>Nelson</span>
          <span>213</span>
        </div>

        <div className="h-3 bg-slate-200 rounded">
          <div className="h-3 w-full bg-blue-600 rounded"></div>
        </div>

      </div>

      <div>

        <div className="flex justify-between">
          <span>Hossam</span>
          <span>187</span>
        </div>

        <div className="h-3 bg-slate-200 rounded">
          <div className="h-3 w-4/5 bg-blue-600 rounded"></div>
        </div>

      </div>

    </div>

  </div>
    <div className="bg-white rounded-xl border shadow-sm p-5">

    <h3 className="font-bold mb-4">
      Invoice Status
    </h3>

    <div className="flex flex-col items-center justify-center h-full">

      <div className="w-40 h-40 rounded-full border-[20px] border-red-500 flex items-center justify-center">

        <div className="text-center">

          <div className="text-3xl font-bold">
            {filteredData.length}
          </div>

          <div className="text-sm text-gray-500">
            Block
          </div>

        </div>

      </div>

    </div>

  </div>

</div>
      </main>

    </div>
  );
}
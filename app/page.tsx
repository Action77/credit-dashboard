"use client";
import WhatsAppReport from "@/components/WhatsAppReport";
import html2canvas from "html2canvas";
import {
  openWhatsApp
} from "@/utils/whatsapp";
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
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
  Search,
  Filter,
} from "lucide-react";


export default function Home() {
const [whatsAppVan, setWhatsAppVan] =
  useState("");
  const [data, setData] =
    useState<any[]>([]);
    const [selectedRegions,
  setSelectedRegions] =
  useState<string[]>([]);

const [selectedCities,
  setSelectedCities] =
  useState<string[]>([]);

const [selectedVans,
  setSelectedVans] =
  useState<string[]>([]);

const [searchText, setSearchText] =
  useState("");
  const [showFilters,
  setShowFilters] =
  useState(false);
  const [currentUser,
  setCurrentUser] =
  useState("");

const [isLoggedIn,
  setIsLoggedIn] =
  useState(false);
const [showLoginModal, setShowLoginModal] = useState(false);
const [username,
  setUsername] =
  useState("");

const [password,
  setPassword] =
  useState("");
  const [expandedRegions,
  setExpandedRegions] =
  useState<string[]>([]);

const [expandedCities,
  setExpandedCities] =
  useState<string[]>([]);
  const [exceptions, setExceptions] =
  useState<any[]>([]);

const [collectedInvoices,
  setCollectedInvoices] =
  useState<string[]>([]);

const [lastUpdatedVans,
  setLastUpdatedVans] =
  useState<string[]>([]);

const [invoiceNo, setInvoiceNo] =
  useState("");

const [tillDate, setTillDate] =
  useState("");
  const [creditFileInfo,
  setCreditFileInfo] =
  useState("");

const [collectionFileInfo,
  setCollectionFileInfo] =
  useState("");
const [loadedExceptions,
  setLoadedExceptions] =
  useState(false);
  useEffect(() => {

  if (!currentUser) return;

  const saved = localStorage.getItem(
    `exceptions_${currentUser}`
  );

  if (!saved) {
    setExceptions([]);
    setLoadedExceptions(true);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validExceptions = JSON.parse(saved).filter(
    (item: any) => {

      const tillDate = new Date(item.tillDate);

      tillDate.setHours(0, 0, 0, 0);

      return tillDate >= today;

    }
  );

  setExceptions(validExceptions);

  setLoadedExceptions(true);

}, [currentUser]);

useEffect(() => {

const saved =
  localStorage.getItem(
    `savedFilters_${currentUser}`
  );

  if (!saved) return;

  const filters =
    JSON.parse(saved);
setSelectedRegions(
  filters.regions || []
);

setSelectedCities(
  filters.cities || []
);

setSelectedVans(
  filters.vans || []
);
  
}, [currentUser]);
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

useEffect(() => {

  localStorage.setItem(
    "currentUser",
    currentUser
  );

}, [currentUser]);
useEffect(() => {

localStorage.setItem(
  `savedFilters_${currentUser}`,

    JSON.stringify({

      regions:
        selectedRegions,

      cities:
        selectedCities,

      vans:
        selectedVans,

    })

  );

}, [
  selectedRegions,
  selectedCities,
  selectedVans,
]);
useEffect(() => {

  localStorage.setItem(
    "summaryFilters",

    JSON.stringify({

      regions:
        selectedRegions,

      cities:
        selectedCities,

      vans:
        selectedVans,

    })

  );

}, [
  selectedRegions,
  selectedCities,
  selectedVans,
]);
useEffect(() => {

  if (
    !loadedExceptions ||
    !currentUser
  ) return;

  localStorage.setItem(
    `exceptions_${currentUser}`,
    JSON.stringify(exceptions)
  );

}, [
  exceptions,
  loadedExceptions,
  currentUser,
]);

useEffect(() => {

  const loadCollection =
    async () => {

      const response =
        await fetch(
          "/api/collection-data"
        );

      const data =
        await response.json();

      setCollectedInvoices(
        data.invoices || []
      );

    };

  loadCollection();

}, []);


useEffect(() => {

  const savedCreditInfo =
    localStorage.getItem(
      "creditFileInfo"
    );

  if (savedCreditInfo) {
    setCreditFileInfo(
      savedCreditInfo
    );
  }

  fetch("/api/collection-data")
  .then(res => res.json())
  .then(data => {
    setCollectionFileInfo(
      data.fileInfo || ""
    );
  });

}, []);
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
fetch("/api/collection-reset", {
  method: "POST",
});
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
const creditFileDate =
  worksheet["B3"]?.w ||
  "";
      const jsonData: any[] =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            range: 5,
          }
        );

      const blockedRows =
  jsonData.filter((row) => {

    const userBlock =
      String(
        row["Status User Block"] || ""
      )
        .trim()
        .toLowerCase();

    const invoiceStatus =
      String(
        row["Invoice status (Due/ Overdue)"] || ""
      )
        .trim()
        .toLowerCase();

    return (
      userBlock === "block" &&
      !invoiceStatus.includes("legal")
    );

  });
  setData(blockedRows);

setCreditFileInfo(
  `${file.name} | ${creditFileDate}`
);
localStorage.setItem(
  "creditFileInfo",
  `${file.name} | ${creditFileDate}`
);
setCollectedInvoices([]);

localStorage.removeItem(
  "collectedInvoices"
);
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

  console.log("BUTTON WORKING");

  const file =
    event.target.files?.[0];


  if (!file) return;
const formData = new FormData();

formData.append("file", file);
const currentUsername =
  users.find(
    u => u.id === currentUser
  )?.username || currentUser;

formData.append(
  "uploadedBy",
  currentUsername
);

fetch("/api/collection-upload", {
  method: "POST",
  body: formData,
});
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

    console.log("Collection Invoices:");
console.log(invoices);
const previousInvoices =
  JSON.parse(
    localStorage.getItem(
      "collectedInvoices"
    ) || "[]"
  );

const newCollected =
  invoices.filter(
    (invoice) =>
      !previousInvoices.includes(
        invoice
      )
  );

const affectedVans = [
  ...new Set(
    data
      .filter((row) =>
        newCollected.includes(
          String(
            row["Invoice #"]
          ).replace(/\s/g, "")
        )
      )
      .map(
        (row) =>
          row["Van Code."]
      )
  ),
];

setLastUpdatedVans(
  affectedVans
);

localStorage.setItem(
  "lastUpdatedVans",
  JSON.stringify(
    affectedVans
  )
);
setCollectedInvoices(
  invoices
);
const now = new Date();

setCollectionFileInfo(
  `${file.name} | ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
);
localStorage.setItem(
  "collectionFileInfo",
  `${file.name} | ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`
);
localStorage.setItem(
  "collectedInvoices",
  JSON.stringify(invoices)
);
  };

  reader.readAsBinaryString(
    file
  );
};
const filterBaseData =
  data.filter((row) => {

    const matchesFilters =
      (
        selectedRegions.length === 0 ||
        selectedRegions.includes(
          row["Region"]
        )
      )
      &&
      (
        selectedCities.length === 0 ||
        selectedCities.includes(
          row["City"]
        )
      )
      &&
      (
        selectedVans.length === 0 ||
        selectedVans.includes(
          row["Van Code."]
        )
      );

    const search =
      searchText
        .toLowerCase()
        .trim();

    const matchesSearch =
      !search ||
      [
        row["Van Code."],
        row["Employee Name."],
        row["Employee ATS Code."],
        row["Customer Code"],
        row["Customer Name"],
        row["Invoice #"],
      ]
        .join(" ")
        .toLowerCase()
        .includes(search);
    return (
      matchesFilters &&
      matchesSearch
    );
  });
  const whatsappVanCodes = [
  ...new Set(
    filterBaseData
      .filter((row) => {

        const invoice =
          String(
            row["Invoice #"]
          ).replace(/\s/g, "");

        const isException =
          exceptions.some(
            (e) =>
              String(e.invoice)
                .replace(/\s/g, "") === invoice
          );

        const isCollected =
          collectedInvoices.some(
            (i) => i === invoice
          );

        return (
          !isException &&
          !isCollected
        );
      })
      .map(
        (row) => row["Van Code."]
      )
  )
].sort();
const filteredData = filterBaseData.filter(
  (row) => {

    const invoice =
      String(
        row["Invoice #"]
      ).replace(/\s/g, "");

    const isException =
      exceptions.some(
        (e) =>
          String(e.invoice)
            .replace(/\s/g, "") ===
          invoice
      );

    const isCollected =
      collectedInvoices.some(
        (i) => i === invoice
      );

    const matchesWhatsappVan =
      !whatsAppVan ||
      row["Van Code."] === whatsAppVan;

    return (
      !isException &&
      !isCollected &&
      matchesWhatsappVan
    );

  }
);
const blockedCount =
  filteredData.filter((row) => {

    const invoice =
      String(
        row["Invoice #"]
      ).replace(/\s/g, "");

    const isException =
      exceptions.some(
        (e) =>
          String(e.invoice)
            .replace(/\s/g, "") ===
          invoice
      );

    const isCollected =
      collectedInvoices.some(
        (i) => i === invoice
      );

    return (
      !isException &&
      !isCollected
    );
  }).length;
const employeeCount =
  new Set(
    filteredData.map(
      (row) => row["Employee Name."]
    )
  ).size;
  const activeEmployees =
  Object.entries(

    filteredData.reduce(
      (acc: any, row) => {

        const employee =
          row["Employee Name."];

        if (!acc[employee]) {
          acc[employee] = [];
        }

        acc[employee].push(row);

        return acc;

      },
      {}
    )

  ).filter(([_, rows]: any) =>

    rows.every((row: any) => {

      const invoice =
        String(
          row["Invoice #"]
        ).replace(/\s/g, "");

      const isException =
        exceptions.some(
          (e) =>
            String(e.invoice)
              .replace(/\s/g, "") ===
            invoice
        );

      const isCollected =
        collectedInvoices.some(
          (i) => i === invoice
        );

      return (
        isException ||
        isCollected
      );

    })

  ).length;
  const toggleRegion = (
  region: string
) => {

  setExpandedRegions(prev =>

    prev.includes(region)

      ? prev.filter(
          r => r !== region
        )

      : [...prev, region]

  );

};
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

const toggleCity = (
  cityKey: string
) => {

  setExpandedCities(prev =>

    prev.includes(cityKey)

      ? prev.filter(
          c => c !== cityKey
        )

      : [...prev, cityKey]

  );

};
const generateReportImage =
  async () => {

    const report =
      document.getElementById(
        "whatsapp-report"
      );

    if (!report) {
      alert("Report Not Found");
      return;
    }

    const canvas =
  await html2canvas(
    report,
    {
      scale: 2,
      backgroundColor: "#ffffff",
    }
  );
    const blob =
  await new Promise<Blob | null>(
    (resolve) =>
      canvas.toBlob(
        (blob) =>
          resolve(blob),
        "image/png"
      )
  );

if (!blob) {
  alert(
    "Failed to create image"
  );
  return;
}

await navigator.clipboard.write([
  new ClipboardItem({
    "image/png": blob,
  }),
]);
const response =
  await fetch("/api/users");

const users =
  await response.json();

const selectedUser =
  users.find(
    (user: any) =>
      user.van_sub_inventory ===
      whatsAppVan
  );

if (!selectedUser) {
  alert(
    `Van ${whatsAppVan} not found in Users`
  );
  return;
}

const phoneNumber =
  String(selectedUser.contact)
    .replace(/\s/g, "");

const whatsappNumber =
  phoneNumber.startsWith("05")
    ? `966${phoneNumber.slice(1)}`
    : phoneNumber;
    window.open(
  `https://wa.me/${whatsappNumber}`,
  "_blank"
);



  };
const whatsappData =
  filteredData.filter(
    (row) =>
      row["Van Code."] ===
      whatsAppVan
  );
  

return (
<>
  <div
    style={{
      position: "absolute",
      left: "-99999px",
      top: 0,
    }}
  >
    <WhatsAppReport
      vanCode={whatsAppVan}
      data={whatsappData}
    />
  </div>

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

  setExceptions([]);

  setLoadedExceptions(false);

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


          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-5 mb-6">

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <p className="text-gray-500">
              Blocked Invoices
            </p>

            <h2 className="text-4xl font-bold mt-3">
              {blockedCount}
            </h2>
          </div>

          <div className="bg-white border rounded-xl p-6 shadow-sm">
            <p className="text-gray-500">
              Active
            </p>

            <h2 className="text-5xl font-bold text-green-600 mt-3">
  {activeEmployees}
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
  {employeeCount}
</h2>
          </div>

        </div>

        {/* Actions */}
        <div className="flex justify-between mb-6">

          <div className="flex gap-3">

            {isLoggedIn && (

  <label className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg cursor-pointer">

    Import Credit

    <input
      type="file"
      accept=".xlsx,.xls"
      className="hidden"
      onChange={handleCreditImport}
    />

  </label>

)}
{isLoggedIn && (

  <label className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg cursor-pointer">

    Import Collection

    <input
      type="file"
      accept=".xlsx,.xls"
      className="hidden"
      onChange={handleCollectionImport}
    />

  </label>

)}
            
          </div>

          <div className="flex gap-3 relative">

            <div className="relative">

              <Search
                size={18}
                className="absolute left-3 top-3"
              />

<input
  value={searchText}
  onChange={(e) =>
    setSearchText(e.target.value)
  }
  placeholder="Search Invoice, Van, Customer..."
  className="bg-white border rounded-lg pl-10 py-3 pr-4"
/>

            </div>



<button
  onClick={() =>
    setShowFilters(
      !showFilters
    )
  }
className="bg-white border px-5 py-3 rounded-lg flex items-center gap-2"
>
  <Filter size={16} />
  Filters
</button>

{showFilters && (
  <div className="absolute right-0 top-14 bg-white border shadow-xl rounded-xl w-[380px] z-50 p-4">

    <div className="max-h-[450px] overflow-auto">

      <div className="font-bold mb-3">
        Saudi
      </div>

      {[...new Set(data.map(row => row.Region))]
        .filter(Boolean)
        .sort()
        .map(region => (

          <div key={region}>

            <div className="flex items-center gap-2 py-1">
<input
  type="checkbox"
  checked={selectedRegions.includes(region)}
  onChange={(e) => {

    const regionCities = data
      .filter(row => row.Region === region)
      .map(row => row.City)
      .filter(Boolean);

    const regionVans = data
      .filter(row => row.Region === region)
      .map(row => row["Van Code."])
      .filter(Boolean);

    if (e.target.checked) {

      setSelectedRegions(prev => [
        ...new Set([...prev, region])
      ]);

      setSelectedCities(prev => [
        ...new Set([
          ...prev,
          ...regionCities
        ])
      ]);

      setSelectedVans(prev => [
        ...new Set([
          ...prev,
          ...regionVans
        ])
      ]);

    } else {

      setSelectedRegions(prev =>
        prev.filter(r => r !== region)
      );

      setSelectedCities(prev =>
        prev.filter(
          city => !regionCities.includes(city)
        )
      );

      setSelectedVans(prev =>
        prev.filter(
          van => !regionVans.includes(van)
        )
      );

    }
  }}
/>

  <span
    className="cursor-pointer"
    onClick={() => toggleRegion(region)}
  >
    {expandedRegions.includes(region) ? "▼" : "▶"}
  </span>

  <span>{region}</span>
</div>

            {expandedRegions.includes(region) && (

              <div className="ml-5">

                {[...new Set(
                  data
                    .filter(row => row.Region === region)
                    .map(row => row.City)
                )]
                  .filter(Boolean)
                  .sort()
                  .map(city => (

                    <div key={`${region}-${city}`}>

                      <div className="flex items-center gap-2 py-1">
<input
  type="checkbox"
  checked={selectedCities.includes(city)}
  onChange={(e) => {

    const cityVans = data
      .filter(
        row =>
          row.Region === region &&
          row.City === city
      )
      .map(row => row["Van Code."])
      .filter(Boolean);

    if (e.target.checked) {

      setSelectedCities(prev => [
        ...new Set([...prev, city])
      ]);

      setSelectedVans(prev => [
        ...new Set([
          ...prev,
          ...cityVans
        ])
      ]);

    } else {

      setSelectedCities(prev =>
        prev.filter(c => c !== city)
      );

      setSelectedVans(prev =>
        prev.filter(
          van => !cityVans.includes(van)
        )
      );

    }
  }}
/>

  <span
    className="cursor-pointer"
    onClick={() =>
      toggleCity(`${region}-${city}`)
    }
  >
    {expandedCities.includes(`${region}-${city}`)
      ? "▼"
      : "▶"}
  </span>

  <span>{city}</span>
</div>
                      {expandedCities.includes(
                        `${region}-${city}`
                      ) && (

                        <div className="ml-5">

                          {[...new Set(
                            data
                              .filter(
                                row =>
                                  row.Region === region &&
                                  row.City === city
                              )
                              .map(
                                row => row["Van Code."]
                              )
                          )]
                            .filter(Boolean)
                            .sort()
                            .map(van => (

                              <label
                                key={van}
                                className="flex gap-2 py-1"
                              >
                                <input
  type="checkbox"
  checked={selectedCities.includes(city)}
  onChange={(e) => {

    const cityVans = data
      .filter(
        row =>
          row.Region === region &&
          row.City === city
      )
      .map(row => row["Van Code."])
      .filter(Boolean);

    if (e.target.checked) {

      setSelectedCities(prev => [
        ...new Set([...prev, city])
      ]);

      setSelectedVans(prev => [
        ...new Set([
          ...prev,
          ...cityVans
        ])
      ]);

    } else {

      setSelectedCities(prev =>
        prev.filter(c => c !== city)
      );

      setSelectedVans(prev =>
        prev.filter(
          van => !cityVans.includes(van)
        )
      );

    }
  }}
/>

                                {van}

                              </label>

                            ))}

                        </div>

                      )}

                    </div>

                  ))}

              </div>

            )}

          </div>

        ))}

    </div>

    <div className="flex gap-2 mt-4">

      <button
        className="bg-red-600 text-white px-4 py-2 rounded-lg"
        onClick={() => {
          setSelectedRegions([]);
          setSelectedCities([]);
          setSelectedVans([]);
        }}
      >
        Clear
      </button>

      <button
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        onClick={() => setShowFilters(false)}
      >
        Apply
      </button>

    </div>

  </div>
)}
</div>
</div>

{/* Alert */}
        {data.length > 0 && (

  <div className="bg-white border rounded-xl p-5 mb-6">

    <h3 className="font-bold text-lg mb-4">
      Import Status
    </h3>

    <div className="space-y-3">

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">

        <div className="font-semibold text-blue-700">
          Credit File
        </div>

        <div className="text-sm text-slate-600">
          {creditFileInfo || "Not Imported"}
        </div>

      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">

        <div className="font-semibold text-green-700">
          Collection File
        </div>

        <div className="text-sm text-slate-600">
          {collectionFileInfo || "Not Imported"}
        </div>

      </div>

      <div className="text-sm text-slate-500">

        Active Block Records:
        <span className="font-bold ml-2">
          {blockedCount}
        </span>

      </div>

    </div>

  </div>

)}

        <div className="grid grid-cols-3 gap-6">

          {/* Table */}
          <div className="col-span-2 bg-white rounded-xl border shadow-sm p-5">

            <div className="flex justify-between items-center mb-5">

  <h3 className="font-bold text-xl">
    Invoices
  </h3>

  <div className="flex gap-2">

    <select
      value={whatsAppVan}
      onChange={(e) =>
        setWhatsAppVan(
          e.target.value
        )
      }
      className="border rounded-lg px-3 py-2"
    >
      <option value="">
        Select Van
      </option>

      {whatsappVanCodes.map(
        (van) => (
          <option
            key={van}
            value={van}
          >
            {van}
          </option>
        )
      )}
    </select>

<button
  onClick={generateReportImage}
  className="bg-green-600 text-white px-4 py-2 rounded-lg"
>
  WhatsApp
</button>

  </div>

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

                 {filteredData.map((row, index) => (
                  <tr
  key={index}
  className="border-b"
  style={{
  backgroundColor:

    collectedInvoices.some(
      (invoice) =>
        invoice ===
        String(
          row["Invoice #"]
        ).replace(/\s/g, "")
    )

      ? "#C6EFCE"

      : exceptions.some(
          (e) =>
            String(e.invoice)
              .replace(/\s/g, "") ===
            String(
              row["Invoice #"]
            ).replace(/\s/g, "")
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

{isLoggedIn && (
  <>
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
  </>
)}

            

        

{isLoggedIn && (

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

)}
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

{isLoggedIn && (
  <th className="text-left p-2">
    Delete
  </th>
)}

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
{isLoggedIn && (

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
  )}
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
    Employees Cleared Today
  </h3>

  <table className="w-full text-sm">

    <thead>
      <tr className="border-b">
        <th className="text-left p-2">
          Employee
        </th>

        <th className="text-left p-2">
          Cleared
        </th>
      </tr>
    </thead>

    <tbody>

      {Object.entries(

        data.reduce(
          (acc: any, row) => {

            const invoice =
              String(
                row["Invoice #"]
              ).replace(/\s/g, "");

            const employee =
              row["Employee Name."];

            const isException =
              exceptions.some(
                (e) =>
                  String(e.invoice)
                    .replace(/\s/g, "") ===
                  invoice
              );

            const isCollected =
              collectedInvoices.some(
                (i) => i === invoice
              );

            if (
              isException ||
              isCollected
            ) {

              acc[employee] =
                (acc[employee] || 0) + 1;

            }

            return acc;

          },
          {}
        )

      )

        .sort(
          (a: any, b: any) =>
            Number(b[1]) - Number(a[1])
        )

        .slice(0, 5)

        .map(
          ([employee, total]: any) => (

            <tr key={employee}>

              <td className="p-2">
                {employee}
              </td>

              <td className="p-2 text-green-600 font-semibold">
                {total}
              </td>

            </tr>

          )
        )}

    </tbody>

  </table>

</div>
<div className="bg-white rounded-xl border shadow-sm p-5">

  <h3 className="font-bold mb-4">
    Top Vans With Blocks
  </h3>

  <div className="space-y-4">

    {Object.entries(

      filteredData.reduce(
        (acc: any, row) => {

          const van =
            row["Van Code."];

          acc[van] =
            (acc[van] || 0) + 1;

          return acc;

        },
        {}
      )

    )

      .sort(
        (a: any, b: any) =>
          Number(b[1]) - Number(a[1])
      )

      .slice(0, 5)

      .map(
        ([van, total]: any) => (

          <div key={van}>

            <div className="flex justify-between mb-1">

              <span>{van}</span>

              <span className="font-semibold">
                {total}
              </span>

            </div>

            <div className="h-3 bg-slate-200 rounded-full">

              <div
                className="h-3 bg-blue-600 rounded-full"
                style={{
                  width: `${Math.min(
                    Number(total) * 5,
                    100
                  )}%`,
                }}
              />

            </div>

          </div>

        )
      )}

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
  {blockedCount}
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

    {showLoginModal && (

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">

        <div className="bg-white w-[420px] rounded-2xl shadow-2xl p-8">

          <div className="text-center mb-6">

            <h2 className="text-3xl font-bold text-slate-800">
              Welcome Back
            </h2>

            <p className="text-slate-500 mt-2">
              Sign in to access management features
            </p>

          </div>

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

              const user =
                users.find(
                  u =>
                    u.username === username &&
                    u.password === password
                );

              if (!user) {
                alert("Invalid Username or Password");
                return;
              }

              setCurrentUser(user.id);
              setIsLoggedIn(true);

              localStorage.setItem(
                "currentUser",
                user.id
              );

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

  </>
);
}
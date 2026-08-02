"use client";
import { AlertCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { storage as localStorage } from "@/utils/storage";

export default function VanReportPage() {
  const [isSubscribed,setIsSubscribed] =
  useState(false);
  const params = useParams();

  const vanCode = decodeURIComponent(
    String(params.van || "")
  );


  const [data, setData] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [collectedInvoices, setCollectedInvoices] = useState<string[]>([]);
  const [creditRules, setCreditRules] =
  useState<any[]>([]);

const [isRouteUnblocked, setIsRouteUnblocked] =
  useState(false);

const [isLoggedIn, setIsLoggedIn] =
  useState(false);  function urlBase64ToUint8Array(
  base64String: string
) {
  const padding =
    "=".repeat(
      (4 - (base64String.length % 4)) % 4
    );

  const base64 =
    (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const rawData =
    window.atob(base64);

  return Uint8Array.from(
    [...rawData].map(
      (char) => char.charCodeAt(0)
    )
  );
}
const subscribeToPush =
async () => {

  try {
if (!("serviceWorker" in navigator)) {
  alert("Service Worker not supported");
  return;
}
    const permission =
      await Notification.requestPermission();

    if (
      permission !== "granted"
    ) {
      return;
    }

    const registration =
  await navigator.serviceWorker.register(
    "/sw.js"
  );

await navigator.serviceWorker.ready;
const existingSubscription =
  await registration.pushManager.getSubscription();

if (existingSubscription) {
  await existingSubscription.unsubscribe();
}
const subscription =
  await registration.pushManager.subscribe({
        userVisibleOnly: true,
        
        applicationServerKey:
  urlBase64ToUint8Array(
    process.env
      .NEXT_PUBLIC_VAPID_PUBLIC_KEY!
  ),

      });

    await fetch(
      "/api/push-subscribe",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify({
          van_code: vanCode,
          subscription,
        }),
      }
    );

    setIsSubscribed(true);

    alert(
      "Notifications Enabled"
    );

  } catch (error) {

    console.error(error);

  }

};
  useEffect(() => {

    const load = async () => {

      const credit =
        await fetch("/api/credit-data");

      const creditData =
        await credit.json();


      const ex =
        await fetch("/api/exceptions");

      const exceptionsData =
        await ex.json();


      const col =
        await fetch("/api/collection-data");

      const colData =
        await col.json();

const { data: rules } =
  await supabase
    .from("credit_block_rules")
    .select("*");
      const {
  data: vanPermission
} = await supabase
  .from("van_permissions")
  .select("is_unblocked")
  .eq("van_code", vanCode)
  .single();
setIsRouteUnblocked(
  vanPermission?.is_unblocked || false
);


      const today =
        new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );


      const validExceptions =
        (exceptionsData || [])
        .filter((item:any)=>{

          const tillDate =
            new Date(
              item.till_date
            );

          tillDate.setHours(
            0,
            0,
            0,
            0
          );


          return (
            item.permanent ||
            tillDate >= today
          );

        });



      setData(
        creditData.data || []
      );

      setExceptions(
        validExceptions
      );

      setCollectedInvoices(
        colData.invoices || []
      );

      setCreditRules(
  rules || []
);

const currentUser =
  await localStorage.getItem("currentUser");

setIsLoggedIn(!!currentUser);

    };


    load();


  }, []);



  const reportData =
    useMemo(()=>{


      return data.filter((row)=>{


        if(
          String(row["Van Code."])
          !==
          vanCode
        ){
          return false;
        }


        const normalize =
        (v:string)=>
          String(v || "")
          .replace(/^ATS\s+/i,"")
          .replace(/\s+/g," ")
          .trim()
          .toUpperCase();



        const paymentTerm =
          String(
            row["Payment Term"] || ""
          )
          .trim();



        const rule =
          creditRules.find(
            r =>
            normalize(r.payment_term)
            ===
            normalize(paymentTerm)
          );



        if(!rule)
          return false;



        const creditDays =
          Number(
            row["Credit_Days"]
          ) || 0;



        const invoice =
          String(
            row["Invoice #"] || ""
          )
          .replace(/\s/g,"")
          .toUpperCase();



        const isException =
          exceptions.some(
            (e:any)=>
              String(
                e.invoice || ""
              )
              .replace(/\s/g,"")
              .toUpperCase()
              ===
              invoice
          );



        const isCollected =
          collectedInvoices.some(
            (i)=>
              String(i || "")
              .replace(/\s/g,"")
              .toUpperCase()
              ===
              invoice
          );



        return (

          String(
            row["Central Invoice"] || ""
          )
          .trim()
          .toUpperCase()
          ===
          "NOT CENTRAL"

          &&

          !String(
            row["Invoice status (Due/ Overdue)"] || ""
          )
          .toLowerCase()
          .includes("legal")

          &&

          creditDays >=
          rule.block_at_day

          &&

          !isException

          &&

          !isCollected

        );


      });


    },[
      data,
      vanCode,
      exceptions,
      collectedInvoices,
      creditRules
    ]);



  const totalAmount =
    reportData.reduce(
      (sum,row)=>
        sum +
        Number(
          row["Credit Invoice Amount"] || 0
        ),
      0
    );



  const oldestDays =
    Math.max(
      ...reportData.map(
        row =>
          Number(
            row["Credit_Days"]
          ) || 0
      ),
      0
    );



  return (

    <div className="min-h-screen bg-slate-100 p-3">


      <div className="mb-4 flex items-center">

  {isLoggedIn && (
    <Link
      href="/van"
      className="text-blue-600 text-sm"
    >
      ← Back
    </Link>
  )}

  <Link
    href={`/van/${encodeURIComponent(vanCode)}/exceptions`}
    className={`text-red-600 text-sm ${isLoggedIn ? "ml-auto" : "mx-auto"}`}
  >
    Exceptions →
  </Link>

</div>
      <div className="bg-[#071d5c] text-white rounded-xl p-4 mb-4">

        <h1 className="text-2xl font-bold">
          {vanCode}
        </h1>
<div className="mt-3">

  {isRouteUnblocked ? (

    <span
      className="
        inline-flex
        items-center
        px-4
        py-2
        rounded-full
        bg-green-600
        text-white
        text-sm
        font-semibold
      "
    >
      ✅ Route Unblocked
    </span>

  ) : (

    <span
      className="
        inline-flex
        items-center
        px-4
        py-2
        rounded-full
        bg-red-600
        text-white
        text-sm
        font-semibold
      "
    >
      ⛔ Route Blocked
    </span>

  )}

</div>
        <div className="mt-3 space-y-1 text-sm">

          <div>
            Invoices: {reportData.length}
          </div>


          <div>
            Credit Amount:{" "}
            {totalAmount.toLocaleString()}
          </div>


          <div>
            Oldest Credit Days:{" "}
            {oldestDays}
          </div>
{!isSubscribed && (

  <button
    onClick={subscribeToPush}
    className="
      mt-4
      bg-yellow-500
      text-black
      px-4
      py-2
      rounded-lg
      font-semibold
    "
  >
    🔔 Enable Notifications
  </button>

)}

        </div>

      </div>




      <div className="space-y-3">


        {reportData.map(
          (row,index)=>(

          <div
            key={index}
            className="bg-white rounded-xl shadow p-4"
          >

            <div className="font-bold text-blue-700 text-base">
              {row["Invoice #"]}
            </div>


            <div className="mt-2 font-medium">
              {row["Customer Name"]}
            </div>


            <div className="text-sm text-slate-500">
              {row["Customer Code"]}
            </div>



            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">


              <div>
                <span className="text-slate-500">
                  Days:
                </span>{" "}
                {row["Credit_Days"]}
              </div>



              <div>
                <span className="text-slate-500">
                  CIM:
                </span>{" "}
                {row["Pending CIM"]}
              </div>



              <div>
                <span className="text-slate-500">
                  Payment:
                </span>{" "}
                {row["Payment Term"]}
              </div>



              <div>
                <span className="text-slate-500">
                  Rejected:
                </span>{" "}
                {row["Total Rejected Count"]}
              </div>


            </div>


          </div>

        ))}


      </div>




      {reportData.length === 0 && (

        <div className="bg-white p-6 rounded-xl text-center text-slate-500">

          No block invoices found

        </div>

      )}



    </div>

  );


}
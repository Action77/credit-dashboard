// app/summary-mobile/page.tsx

"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { storage as localStorage } from "@/utils/storage";

export default function SummaryMobile() {
  const [data, setData] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [collectedInvoices, setCollectedInvoices] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<any>({});
  const [creditRules, setCreditRules] = useState<any[]>([]);

  const [filters] = useState<any>({
    regions: [],
    cities: [],
    vans: [],
  });

  useEffect(() => {
    const loadData = async () => {
      const response =
        await fetch("/api/credit-data");

      const result =
        await response.json();

      setData(result.data || []);

      const exceptionsResponse =
        await fetch("/api/exceptions");

      const exceptionsData =
        await exceptionsResponse.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const validExceptions =
        exceptionsData.filter((item: any) => {
          const tillDate =
            new Date(item.till_date);

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

      setExceptions(validExceptions);

      const collectionResponse =
        await fetch(
          "/api/collection-data"
        );

      const collectionData =
        await collectionResponse.json();

      setCollectedInvoices(
        collectionData.invoices || []
      );

      const savedPermissions =
        await localStorage.getItem(
          "vanPermissions"
        );

      if (savedPermissions) {
        setPermissions(
          JSON.parse(savedPermissions)
        );
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadRules = async () => {
      const currentUser =
        await localStorage.getItem(
          "currentUser"
        );

      if (!currentUser) return;

      const { data } =
        await supabase
          .from("credit_block_rules")
          .select("*")
          .eq(
            "username",
            currentUser
          );

      setCreditRules(data || []);
    };

    loadRules();
  }, []);

  const getStatusStyle = (
    remaining: number,
    ex: number
  ) => {
    if (
      remaining === 0 &&
      ex === 0
    ) {
      return "bg-green-100 text-green-700";
    }

    if (
      remaining > 0 &&
      ex === 0
    ) {
      return "bg-pink-100 text-pink-700";
    }

    if (
      remaining === 0 &&
      ex > 0
    ) {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-orange-200 text-orange-900";
  };

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

    if (remaining > 0) {
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

  const filteredData = data.filter(
    (row) => {
      const isNotCentral =
        String(
          row["Central Invoice"] || ""
        )
          .trim()
          .toUpperCase() ===
        "NOT CENTRAL";

      const invoiceStatus = String(
        row[
          "Invoice status (Due/ Overdue)"
        ] || ""
      ).toLowerCase();

      const paymentTerm = String(
        row["Payment Term"] || ""
      ).trim();

      const normalize = (
        value: string
      ) =>
        String(value || "")
          .replace(/^ATS\s+/i, "")
          .replace(/\s+/g, " ")
          .trim()
          .toUpperCase();

      const rule =
        creditRules.find(
          (r) =>
            normalize(
              r.payment_term
            ) ===
            normalize(
              paymentTerm
            )
        );

      const creditDays =
        Number(
          row["Credit_Days"]
        ) || 0;

      const showInvoice =
        rule
          ? creditDays >=
            rule.block_at_day
          : false;

      return (
        isNotCentral &&
        !invoiceStatus.includes(
          "legal"
        ) &&
        showInvoice
      );
    }
  );

  const vans = Object.entries(
    filteredData.reduce(
      (acc: any, row) => {
        const van =
          row["Van Code."];

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

        const invoice = String(
          row["Invoice #"]
        )
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
            (i) =>
              String(i)
                .replace(/\s/g, "")
                .toUpperCase() ===
              invoice
          );

        if (isException) {
          acc[van]
            .exceptions++;
        } else if (
          !isCollected
        ) {
          acc[van]
            .remaining++;
        }

        return acc;
      },
      {}
    )
  ).sort((a: any, b: any) =>
    String(a[0]).localeCompare(
      String(b[0]),
      undefined,
      { numeric: true }
    )
  );

  return (
    <div className="min-h-screen bg-slate-100 p-4">

      <h1 className="text-2xl font-bold mb-4">
        Van Performance
      </h1>

      <div className="space-y-3">

        {vans.map(
          ([van, info]: any) => (
            <div
              key={van}
              className="bg-white rounded-xl border shadow-sm p-4"
            >
              <div className="flex justify-between items-start gap-3">

                <div>
                  <div className="font-bold text-lg">
                    Van {van}
                  </div>

                  <div className="text-sm text-slate-500 mt-1">
                    {[...info.ids].join(
                      " or "
                    )}
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold text-center ${getStatusStyle(
                    info.remaining,
                    info.exceptions
                  )}`}
                >
                  {getStatus(
                    info.remaining,
                    info.exceptions
                  )}
                </span>
              </div>

              <div className="mt-4 flex justify-between">

                <span className="text-slate-500">
                  Permission
                </span>

                <span
                  className={
                    permissions[
                      van
                    ]
                      ? "text-green-600 font-semibold"
                      : "text-red-600 font-semibold"
                  }
                >
                  {permissions[
                    van
                  ]
                    ? "Enabled"
                    : "Disabled"}
                </span>
              </div>
            </div>
          )
        )}

      </div>

    </div>
  );
}
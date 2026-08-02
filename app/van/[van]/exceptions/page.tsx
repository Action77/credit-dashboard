"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

export default function VanExceptionsPage() {
  const params = useParams();

  const vanCode = decodeURIComponent(
    String(params.van || "")
  );

  const [exceptions, setExceptions] =
    useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const response =
        await fetch("/api/exceptions");

      const data =
        await response.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const validExceptions =
        (data || []).filter((item: any) => {
          if (item.permanent) {
            return true;
          }

          const tillDate =
            new Date(item.till_date);

          tillDate.setHours(
            0,
            0,
            0,
            0
          );

          return tillDate >= today;
        });

      setExceptions(
        validExceptions.filter(
          (item: any) =>
            String(item.van_code).trim() ===
            String(vanCode).trim()
        )
      );
    };

    load();
  }, [vanCode]);

  const calculateBusinessDays = (
    dateString: string
  ) => {
    if (!dateString) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate =
      new Date(dateString);

    let count = 0;

    const current =
      new Date(today);

    while (current <= endDate) {
      if (current.getDay() !== 5) {
        count++;
      }

      current.setDate(
        current.getDate() + 1
      );
    }

    return count;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-3">

      <div className="mb-4">
  <Link
    href={`/van/${encodeURIComponent(vanCode)}`}
    className="text-blue-600 text-sm"
  >
    ← Back To Van
  </Link>
</div>
      <div className="bg-red-600 text-white rounded-xl p-4 mb-4">
        <h1 className="text-2xl font-bold">
          {vanCode}
        </h1>

        <div className="text-sm mt-2">
          Exceptions: {exceptions.length}
        </div>
      </div>

      <div className="space-y-3">

        {exceptions.map((item, index) => {

          const daysLeft =
            calculateBusinessDays(
              item.till_date
            );

          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow p-4"
            >
              <div className="font-bold text-red-700">
                {item.invoice}
              </div>

              <div className="mt-2 font-medium">
                {item.customer_name}
              </div>

              <div className="text-sm text-slate-500">
                {item.customer_code}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">

                <div>
                  Employee:
                  {" "}
                  {item.employee_name}
                </div>

                <div>
                  ATS:
                  {" "}
                  {item.ats_code}
                </div>

                <div>
                  Till Date:
                  {" "}
                  {item.till_date}
                </div>

                <div>
                  {item.permanent
                    ? "Legal"
                    : `${daysLeft} Days`}
                </div>

              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import WhatsAppReport from "@/components/WhatsAppReport";

export default function VanReportPage() {
  const params = useParams();

  const vanCode = String(params.van || "");

  const [data, setData] = useState<any[]>([]);
  const [exceptions, setExceptions] = useState<any[]>([]);
  const [collectedInvoices, setCollectedInvoices] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const credit = await fetch("/api/credit-data");
      const creditData = await credit.json();

      const ex = await fetch("/api/exceptions");
      const exceptionsData = await ex.json();

      const col = await fetch("/api/collection-data");
      const collectionData = await col.json();

      setData(creditData.data || []);
      setExceptions(exceptionsData || []);
      setCollectedInvoices(collectionData.invoices || []);
    };

    load();
  }, []);

  const reportData = data.filter((row) => {
    if (row["Van Code."] !== vanCode) {
      return false;
    }

    const invoice = String(row["Invoice #"])
      .replace(/\s/g, "")
      .toUpperCase();

    const isException = exceptions.some(
      (e: any) =>
        String(e.invoice)
          .replace(/\s/g, "")
          .toUpperCase() === invoice
    );

    const isCollected = collectedInvoices.some(
      (i: string) =>
        String(i)
          .replace(/\s/g, "")
          .toUpperCase() === invoice
    );

    return !isException && !isCollected;
  });

  return (
    <div className="min-h-screen bg-slate-100 p-4">
      <WhatsAppReport
        vanCode={vanCode}
        data={reportData}
      />
    </div>
  );
}
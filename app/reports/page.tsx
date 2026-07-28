"use client";

import { useEffect, useState } from "react";

export default function ReportsPage() {

  const [creditData, setCreditData] =
    useState<any[]>([]);

  const [collections, setCollections] =
    useState<any[]>([]);

  const [selectedTab, setSelectedTab] =
    useState("credit");

  const [collectionRows, setCollectionRows] =
    useState<any[]>([]);

  useEffect(() => {

    const loadData = async () => {

      const response =
        await fetch("/api/reports");

      const data =
        await response.json();

      setCreditData(
        data.creditData || []
      );

      setCollections(
        data.collections || []
      );

    };

    loadData();

  }, []);

  const loadCollection =
    async (id: number) => {

      const response =
        await fetch(
          `/api/reports/${id}`
        );

      const data =
        await response.json();

      setCollectionRows(data);

    };

  return (

    <div className="p-6">

      <h1 className="text-3xl font-bold mb-6">
        Reports
      </h1>

      <div className="flex gap-2 mb-6">

        <button
          className={`px-4 py-2 rounded ${
            selectedTab === "credit"
              ? "bg-blue-600 text-white"
              : "bg-slate-200"
          }`}
          onClick={() =>
            setSelectedTab("credit")
          }
        >
          Credit File
        </button>

        {collections.map(
          (item: any) => (

            <button
              key={item.id}
              className={`px-4 py-2 rounded ${
                selectedTab ===
                String(item.id)
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200"
              }`}
              onClick={() => {

                setSelectedTab(
                  String(item.id)
                );

                loadCollection(
                  item.id
                );

              }}
            >
              Collection {item.id}
            </button>

          )
        )}

      </div>

      {selectedTab === "credit" ? (

        <div className="overflow-auto">

          <table className="w-full border">

            <thead>

              <tr className="bg-slate-800 text-white">

                {creditData.length > 0 &&
                  Object.keys(
                    creditData[0]
                  ).map(key => (

                    <th
                      key={key}
                      className="p-3"
                    >
                      {key}
                    </th>

                  ))}

              </tr>

            </thead>

            <tbody>

              {creditData.map(
                (row, index) => (

                  <tr
                    key={index}
                    className="border-b"
                  >
                    {Object.values(row)
                      .map(
                        (
                          value,
                          cellIndex
                        ) => (

                          <td
                            key={
                              cellIndex
                            }
                            className="p-2"
                          >
                            {String(
                              value
                            )}
                          </td>

                        )
                      )}
                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      ) : (

        <div className="overflow-auto">

          <table className="w-full border">

            <thead>

              <tr className="bg-slate-800 text-white">

                <th className="p-3">
                  Invoice
                </th>

                <th className="p-3">
                  Uploaded By
                </th>

              </tr>

            </thead>

            <tbody>

              {collectionRows.map(
                (row: any) => (

                  <tr
                    key={row.id}
                    className="border-b"
                  >

                    <td className="p-2">
                      {row.invoice}
                    </td>

                    <td className="p-2">
                      {row.uploaded_by}
                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        </div>

      )}

    </div>

  );

}
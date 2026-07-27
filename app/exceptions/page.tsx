"use client";

export default function ExceptionsPage() {
  return (
    <div className="min-h-screen bg-[#f4f7fc] p-6">
      <div className="bg-white rounded-xl border p-5 mb-6">
        <h1 className="text-3xl font-bold">
          Exceptions Management
        </h1>
      </div>

      <div className="bg-white rounded-xl border p-5 mb-6">
        <h3 className="font-bold text-lg mb-4">
          Add Multiple Exceptions
        </h3>

        <textarea
          rows={10}
          placeholder={`V1515900001630
V1672000015189
V1515900001700`}
          className="w-full border rounded-lg p-3 mb-4"
        />

        <input
          type="date"
          className="border rounded-lg p-3 mb-4 w-full"
        />

        <button
          className="bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Add Exceptions
        </button>
      </div>

      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-bold text-lg mb-4">
          Current Exceptions
        </h3>

        <table className="w-full">
          <thead>
            <tr>
              <th>Van Code</th>
              <th>Employee Name</th>
              <th>ATS Code</th>
              <th>Customer Code</th>
              <th>Customer Name</th>
              <th>Invoice #</th>
              <th>Till Date</th>
              <th>Days</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
          </tbody>
        </table>
      </div>
    </div>
  );
}
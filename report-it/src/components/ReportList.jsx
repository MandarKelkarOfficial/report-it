import React from "react";
import { useStyledExport } from "./exportStyledExcel";
import { useAuth } from "../context/AuthContext";

export default function ReportList({ data }) {
  const { user } = useAuth();
  const exportExcel = useStyledExport(data);

  return (
    <>
      <br />
      <br />
      <div className="bg-white rounded-xl shadow-lg p-8 mt-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div className="mb-4 sm:mb-0 text-center">
            <h2 className="text-2xl font-bold text-gray-800 ">
              <span className="text-blue-600">Field</span>
              <span className="text-red-600"> Reports</span>
            </h2>
            <p className="text-gray-600 mt-1 text-center">
              Submitted field reports
            </p>
          </div>

          {/* EXPORT BUTTON VISIBLE ONLY TO ADMINS */}
          {user?.role === "admin" && (
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 01-2-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Export Data
            </button>
          )}
        </div>

        {data.length === 0 ? (
          <div className="text-center py-12 bg-blue-50 rounded-xl">
            <div className="inline-block mb-4 text-blue-600">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">
              No reports yet
            </h3>
            <p className="text-gray-600">
              Start by submitting your first field report! 🚀
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-50">
                <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">
                    Created By
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">
                    Project No
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">
                    Work Done
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">
                    Status
                  </th>
             
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">
                    Images
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-blue-800">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors">
                           <td className="px-4 py-3 text-sm text-gray-600">
                      {r.createdBy}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 font-medium">
                      {r.priority}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.projectNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.customer}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <div className="line-clamp-2">
                        {Array.isArray(r.workDone)
                          ? r.workDone.join("; ")
                          : r.workDone}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.status}
                    </td>
             
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.imagesCount || 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

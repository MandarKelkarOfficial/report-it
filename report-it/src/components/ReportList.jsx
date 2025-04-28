import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useStyledExport } from "./exportStyledExcel";
import ReportComments from "./ReportComments";
import {
  ChevronDownIcon,
  UserCircleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function ReportList({ data }) {
  const { user } = useAuth();
  const [filterMode, setFilterMode] = useState("all");
  const [openId, setOpenId] = useState(null);
  const canToggle = user.role !== "xyz";

  const toggle = (id) => {
    if (!canToggle) return;
    setOpenId((prev) => (prev === id ? null : id));
  };

  const visibleReports =
    filterMode === "mine"
      ? data.filter((r) => String(r.agent?._id || r.agent) === String(user.id))
      : data;

  const exportExcel = useStyledExport(visibleReports);

  // Priority styling configuration
  const priorityStyles = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  // Status styling configuration
  const statusStyles = {
    open: "bg-blue-100 text-blue-800",
    "in-progress": "bg-purple-100 text-purple-800",
    done: "bg-green-100 text-green-800",
    closed: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="mt-16 bg-white rounded-xl shadow-lg p-8 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            <span className="text-blue-600">Field</span>
            <span className="text-red-600"> Reports</span>
          </h2>
          <p className="text-gray-500 mt-1">
            Manage and review submitted field reports
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          {data.length > 0 && (
            <div className="inline-flex rounded-lg bg-gray-100 p-1">
              <button
                onClick={() => setFilterMode("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === "all"
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                All Reports
              </button>
              <button
                onClick={() => setFilterMode("mine")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterMode === "mine"
                    ? "bg-white shadow-md text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                My Reports
              </button>
            </div>
          )}

          {(user.role === "admin" || user.role === "manager") && (
            <button
              onClick={exportExcel}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-br from-blue-600 to-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <DocumentTextIcon className="w-5 h-5" />
              Export to Excel
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      {visibleReports.length === 0 ? (
        <div className="text-center py-12 bg-blue-50/50 rounded-xl border-2 border-dashed border-blue-100">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-blue-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            {filterMode === "mine"
              ? "No reports created yet"
              : "No reports found"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterMode === "mine"
              ? "Get started by submitting a new field report."
              : "Try adjusting your filters or check back later."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Agent
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Project No.
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {visibleReports.map((r) => {
                const id = r._id || r.id;
                const isOpen = openId === id;

                return (
                  <React.Fragment key={id}>
                    <tr
                      onClick={() => canToggle && toggle(id)}
                      className={`transition-colors ${
                        isOpen ? "bg-blue-50" : ""
                      } ${canToggle ? "hover:bg-gray-50 cursor-pointer" : ""}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserCircleIcon className="h-8 w-8 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {r.agent?.name || r.createdBy}
                            </div>
                            <div className="text-sm text-gray-500">
                              {r.agent?.email || "No email"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            priorityStyles[r.priority?.toLowerCase()] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {r.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            statusStyles[r.status?.toLowerCase()] ||
                            "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {r.projectNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {r.projectName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <ChevronDownIcon
                          className={`w-5 h-5 transform transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </td>
                    </tr>

                    {canToggle && isOpen && (
                      <tr>
                        <td colSpan={7} className="bg-blue-50/30 p-4">
                          <ReportComments reportId={id} />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

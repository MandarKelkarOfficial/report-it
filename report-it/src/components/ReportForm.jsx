import React, { useState } from "react";
// import axios from "axios"; // Make sure this is imported
import { API } from "../context/AuthContext";

export default function ReportForm({ onAdd }) {
  const [entry, setEntry] = useState({
    projectName: "",
    projectNumber: "",
    customer: "",
    workDone: [""],
    priority: "medium",
  });

  const submit = async (e) => {
    e.preventDefault();

    const reportData = {
      ...entry,
      timestamp: Date.now(), // You can keep timestamp if you want
    };

    try {
      await API.post("/reports", reportData);
      alert("Report submitted successfully! 🎉");
      onAdd(reportData);
      setEntry({
        projectName: "",
        projectNumber: "",
        customer: "",
        workDone: [""],
        priority: "medium",
      });
    } catch (err) {
      console.error("Error saving report to backend:", err);
      alert("Failed to save report to server 😭");
    }
  };

  const handleWorkDoneChange = (index, value) => {
    const newWorkDone = [...entry.workDone];
    newWorkDone[index] = value;
    setEntry({ ...entry, workDone: newWorkDone });
  };

  const addWorkEntry = () => {
    setEntry({ ...entry, workDone: [...entry.workDone, ""] });
  };

  return (
    <>
    <br />
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl mx-auto mt-5">
      {/* Form Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center space-x-3 mb-4">
          <div className="bg-blue-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.4145.414A1 1 0 0119 5.414V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-blue-600">New</span>
            <span className="text-red-600"> Report</span>
          </h1>
        </div>
        <p className="text-gray-600">
          Submit field report with complete details
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter project name"
                value={entry.projectName}
                onChange={(e) =>
                  setEntry({ ...entry, projectName: e.target.value })
                }
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Project Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Number *
            </label>
            <div className="relative rounded-md shadow-sm">
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter project number"
                value={entry.projectNumber}
                onChange={(e) =>
                  setEntry({ ...entry, projectNumber: e.target.value })
                }
              />
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <div className="relative rounded-md shadow-sm">
            <input
              type="text"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Enter customer name"
              value={entry.customer}
              onChange={(e) => setEntry({ ...entry, customer: e.target.value })}
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Work Done Entries */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Work Done *
          </label>
          <div className="space-y-3">
            {entry.workDone.map((work, index) => (
              <div key={index} className="flex gap-3">
                <div className="relative flex-1 rounded-md shadow-sm">
                  <input
                    type="text"
                    required={index === 0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={`Work entry ${index + 1}`}
                    value={work}
                    onChange={(e) =>
                      handleWorkDoneChange(index, e.target.value)
                    }
                  />
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleWorkDoneChange(index, "")}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-red-500 hover:text-red-700"
                    >
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addWorkEntry}
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Another Work Entry
            </button>
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority *
          </label>
          <div className="relative rounded-md shadow-sm">
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
              value={entry.priority}
              onChange={(e) => setEntry({ ...entry, priority: e.target.value })}
            >
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Submit Report
        </button>
      </form>
    </div>
    </>
  );
}

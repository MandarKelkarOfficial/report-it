import React, { useEffect, useState } from "react";
import { API } from "../context/AuthContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

// Role Titles Map
const roleTitles = {
  admin: "System Administrator",
  manager: "Project Manager",
  "field-agent": "Field Agent",
};

// Tailwind Color Classes Map
const colorClasses = {
  blue: "bg-blue-50 text-blue-600",
  yellow: "bg-yellow-50 text-yellow-600",
  green: "bg-green-50 text-green-600",
  purple: "bg-purple-50 text-purple-600",
};

// StatCard Component
function StatCard({ title, value, color }) {
  return (
    <div className={`${colorClasses[color]} p-6 rounded-xl`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-700">{title}</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value ?? 0}</p>
        </div>
        <div className="bg-white p-3 rounded-lg shadow">
          <span className="text-2xl">📊</span>
        </div>
      </div>
    </div>
  );
}

// ActivityItem Component (only used by non-agents)
function ActivityItem({ description, timestamp, type }) {
  const typeStyles = {
    report: "bg-blue-100 text-blue-800",
    approval: "bg-green-100 text-green-800",
    default: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="p-4 hover:bg-gray-50 flex justify-between items-center">
      <div>
        <p className="text-gray-800">{description}</p>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(timestamp).toLocaleString()}
        </p>
      </div>
      <span
        className={`px-2 py-1 text-xs rounded-full ${
          typeStyles[type] || typeStyles.default
        }`}
      >
        {type}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    activity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endpoints = {
          admin: "/admin/dashboard-stats",
          manager: "/manager/dashboard-stats",
          "field-agent": "/agent/dashboard-stats",
        };

        const endpoint = endpoints[user.role] || endpoints["field-agent"];
        const { data } = await API.get(endpoint);

        if (user.role === "field-agent") {
          // backend returns { totalReports, minutesSinceLogin }
          setDashboardData({
            stats: {
              totalReports: data.totalReports,
              minutes: data.minutes,
            },
            activity: [], // no activity section for agents
          });
        } else {
          // admin & manager: { stats: {...}, activity: [...] }
          setDashboardData({
            stats: data.stats || {},
            activity: data.activity || [],
          });
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // now mapping per-role
  const roleBasedStats = {
    admin: [
      { title: "Total Users", value: dashboardData.stats.totalUsers, color: "blue" },
      {
        title: "Pending Approvals",
        value: dashboardData.stats.pendingApprovals,
        color: "yellow",
      },
      {
        title: "Active Reports",
        value: dashboardData.stats.activeReports,
        color: "purple",
      },
    ],
    manager: [
      { title: "Team Reports", value: dashboardData.stats.teamReports, color: "blue" },
      {
        title: "Completed Projects",
        value: dashboardData.stats.completedProjects,
        color: "green",
      },
      {
        title: "Ongoing Projects",
        value: dashboardData.stats.ongoingProjects,
        color: "purple",
      },
    ],
    "field-agent": [
      {
        title: "Total Reports",
        value: dashboardData.stats.totalReports,
        color: "blue",
      },
      {
        title: "Minutes Since Login",
        value: dashboardData.stats.minutes,
        color: "green",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
      <Navbar />

      <main className="pt-20 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Welcome back,{" "}
              <span className="text-blue-600">{user?.name}</span>!
              <span className="block text-sm font-normal text-gray-500 mt-1">
                {roleTitles[user.role] || "Unknown Role"}
              </span>
            </h1>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <>
                {/* Stats grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roleBasedStats[user.role]?.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                  ))}
                </div>

                {/* Recent Activity only for admin/manager */}
                {user.role !== "field-agent" && (
                  <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">
                      Recent Activity
                    </h2>
                    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                      {dashboardData.activity.length === 0 ? (
                        <div className="p-6 text-gray-500">
                          No recent activity
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200">
                          {dashboardData.activity.map((item, i) => (
                            <ActivityItem key={i} {...item} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

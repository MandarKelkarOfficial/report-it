// src/components/Navbar.jsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/icon-one.svg"; // Adjust the path as necessary

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      className="fixed top-0 inset-x-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50 mb-5"
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="flex items-center space-x-2"
              aria-label="Go to dashboard"
            >
              <div className="bg-white-600 w-8 h-8 rounded-lg flex items-center justify-center">
                <img
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  src={logo}
                />
              </div>
              <span className="text-xl font-bold">
                <span className="text-blue-600">REPORT</span>
                <span className="text-red-600">-IT</span>
              </span>
              <span className="sr-only">Field Reporting Management System</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden md:flex items-center space-x-8" role="menubar">
            <li role="none">
              <Link
                to="/dashboard"
                role="menuitem"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </li>
            {user?.role === "field-agent" && (
              <>
                {" "}
                <li role="none">
                  <Link
                    to="/reports"
                    role="menuitem"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    New Report
                  </Link>
                </li>
              </>
            )}

            <li role="none">
              <Link
                to="/view"
                role="menuitem"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                View Reports
              </Link>
            </li>
            {user?.role === "admin" && (
              <>
                <li role="none">
                  <Link
                    to="/admin/users"
                    role="menuitem"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Manage Users
                  </Link>
                </li>
                <li role="none">
                  <Link
                    to="/admin/logs"
                    role="menuitem"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    View Logs
                  </Link>
                </li>
              </>
            )}
          </ul>

          {/* User & Logout */}
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600" aria-live="polite">
              Welcome, {user?.name}
            </span>
            <button
              onClick={logout}
              className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium border border-red-100 hover:border-red-200 transition-colors"
              aria-label="Log out"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

import { useState, useEffect } from "react";
import { API, useAuth } from "../context/AuthContext";

export function useReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await API.get("/reports");
        const allReports = res.data.reports || [];

        const filteredReports =
          user?.role === "admin"
            ? allReports
            : allReports.filter((r) => r.userId === user.id || !r.userId);

        setReports(filteredReports);
      } catch (err) {
        console.error("Failed to load reports:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadReports();
    }
  }, [user]);

  const addReport = (report) => {
    setReports((prev) => [...prev, report]);
  };

  return { reports, loading, addReport };
}

import ReportForm from "../components/ReportForm";
// import ReportList from "../components/ReportList";
import { useReports } from "../hooks/useReports"; // 👈 Import hook

export default function Reports() {
  const {  loading, addReport } = useReports();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading reports…
      </div>
    );
  }

  return (
    <div className="p-0">
      <ReportForm onAdd={addReport} />
      {/* <ReportList data={reports} /> */}
    </div>
  );
}

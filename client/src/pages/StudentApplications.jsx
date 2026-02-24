import { useEffect, useState } from "react";
import API from "../api/axios";
import StudentLayout from "../components/StudentLayout";

export default function StudentApplications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications/my");
      setApplications(res.data.data || []);
    } catch {
      setApplications([]);
    }
  };

  const unapply = async (jobId) => {
    const ok = window.confirm("Withdraw your application for this job?");
    if (!ok) return;

    try {
      await API.delete(`/applications/${jobId}`);
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to withdraw application");
    }
  };

  return (
    <StudentLayout title="My Applications" subtitle="Track all applications and statuses.">
      <div className="panel panel-pad">
        {applications.length === 0 && <p className="subtle">No applications yet.</p>}
        {applications.map((app) => (
          <div key={app._id} className="border border-slate-200 rounded-xl p-3 mb-3">
            <p className="font-semibold">{app.job?.title}</p>
            <p className="text-sm text-slate-600">{app.job?.company}</p>
            <p className="text-emerald-700 font-bold">Score: {app.score}%</p>
            <p className="text-sm text-indigo-700">Status: {app.status || "Applied"}</p>
            <p className="text-xs text-slate-500">Updated: {app.statusUpdatedAt ? new Date(app.statusUpdatedAt).toLocaleString() : "-"}</p>
            {app.job?._id && (
              <button onClick={() => unapply(app.job._id)} className="btn-danger mt-2">
                Unapply
              </button>
            )}
          </div>
        ))}
      </div>
    </StudentLayout>
  );
}

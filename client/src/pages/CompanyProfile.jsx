import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";

export default function CompanyProfile() {
  const { companyName } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyName]);

  const load = async () => {
    try {
      const res = await API.get(`/jobs/company/${companyName}`);
      setData(res.data.data);
    } catch {
      setData(null);
    }
  };

  if (!data) {
    return (
      <div className="app-shell">
        <div className="page-wrap">
          <div className="panel panel-pad">Loading company profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-wrap max-w-6xl">
        <div className="page-header mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="section-title">{data.companyName}</h1>
            <p className="subtle">Company profile and active hiring team.</p>
          </div>
          <a href="/recruiter" className="btn-secondary">Back to Dashboard</a>
        </div>

        <section className="panel panel-pad mb-5">
          <h2 className="section-title text-lg mb-3">Recruiters</h2>
          {data.recruiters?.length ? (
            <div className="grid md:grid-cols-2 gap-4">
              {data.recruiters.map((r) => (
                <div key={r._id} className="rounded-2xl border border-amber-100 bg-white/80 p-4">
                  <p className="font-semibold text-slate-900">{r.name}</p>
                  <p className="text-sm text-slate-600">{r.email}</p>
                  <p className="text-sm text-amber-700 mt-1">{r.recruiterProfile?.jobTitle || "Recruiter"}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="subtle">No recruiters listed.</p>
          )}
        </section>

        <section className="panel panel-pad">
          <h2 className="section-title text-lg mb-3">Jobs</h2>
          {data.jobs?.length ? (
            <div className="grid md:grid-cols-2 gap-4">
              {data.jobs.map((j) => (
                <div key={j._id} className="rounded-2xl border border-amber-100 bg-white/80 p-4">
                  <p className="font-semibold text-slate-900">{j.title}</p>
                  <p className="text-sm text-slate-600 mt-1">Status: {j.status}</p>
                  <p className="text-sm text-slate-600">
                    Expiry: {j.expiryDate ? new Date(j.expiryDate).toLocaleDateString() : "No expiry"}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="subtle">No jobs found.</p>
          )}
        </section>
      </div>
    </div>
  );
}

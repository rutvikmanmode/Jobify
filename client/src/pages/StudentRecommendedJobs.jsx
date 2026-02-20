import { useEffect, useState } from "react";
import API from "../api/axios";
import StudentLayout from "../components/StudentLayout";

export default function StudentRecommendedJobs() {
  const [recommendedJobs, setRecommendedJobs] = useState([]);

  useEffect(() => {
    fetchRecommendedJobs();
  }, []);

  const fetchRecommendedJobs = async () => {
    try {
      const res = await API.get("/jobs/recommended");
      setRecommendedJobs(res.data.data || []);
    } catch {
      setRecommendedJobs([]);
    }
  };

  return (
    <StudentLayout title="Recommended Jobs" subtitle="Jobs suggested based on your resume and skills.">
      {recommendedJobs.length === 0 ? (
        <div className="panel panel-pad">
          <p className="subtle">No recommendations yet. Upload a resume to improve matching.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {recommendedJobs.map((job) => (
            <div key={job._id} className="panel panel-pad border-l-4 border-indigo-500">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-900">{job.title}</h3>
                  <p className="text-slate-600">{job.company}</p>
                </div>
                <img
                  src={job.postedBy?.recruiterProfile?.companyLogoUrl || "https://via.placeholder.com/56?text=Logo"}
                  alt={`${job.company || "Company"} logo`}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 bg-white shrink-0"
                />
              </div>
              <p className="text-indigo-700 font-semibold mt-2">Match: {job.matchPercentage || 0}%</p>
              <p className="text-sm text-emerald-700 font-semibold mt-1">Salary: {job.salary || "Not specified"}</p>
            </div>
          ))}
        </div>
      )}
    </StudentLayout>
  );
}

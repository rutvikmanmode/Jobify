import { useEffect, useRef, useState } from "react";
import API from "../api/axios";
import StudentLayout from "../components/StudentLayout";

function RevealOnScroll({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(24px)",
        transition: `opacity 520ms ease ${delay}ms, transform 520ms ease ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

export default function StudentDashboard() {
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.data || []);
    } catch {
      setJobs([]);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await API.get("/applications/my");
      setApplications(res.data.data || []);
    } catch {
      setApplications([]);
    }
  };

  const hasApplied = (jobId) => applications.some((app) => app.job && app.job._id === jobId);

  const previewBeforeApply = async (jobId) => {
    try {
      const res = await API.get(`/applications/preview/${jobId}`);
      const data = res.data;
      alert(
        `Score Preview: ${data.score}%\nMatched: ${(data.matchedSkills || []).join(", ") || "None"}\nMissing: ${(data.missingSkills || []).join(", ") || "None"}`
      );
    } catch {
      alert("Failed to preview score");
    }
  };

  const applyToJob = async (jobId) => {
    try {
      const preview = await API.get(`/applications/preview/${jobId}`);
      const ok = window.confirm(`Your predicted match score is ${preview.data.score}%. Continue applying?`);
      if (!ok) return;

      const res = await API.post(`/applications/${jobId}`);
      alert(`Applied successfully. Score: ${res.data.score}%`);
      fetchApplications();
    } catch (error) {
      alert(error.response?.data?.message || "Application failed");
    }
  };

  const openRecruiterProfile = (job) => {
    if (!job.postedBy) return;
    setSelectedRecruiter(job.postedBy);
  };

  const recruiterActiveJobs = selectedRecruiter
    ? jobs.filter((job) => job.postedBy?._id === selectedRecruiter._id)
    : [];

  return (
    <StudentLayout
      title="Student News Feed"
      subtitle="Opportunities That Move You Forward."
    >
      <RevealOnScroll>
        <div className="mb-6">
          <h2 className="section-title mb-3">Available Jobs Feed</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {jobs.map((job, index) => (
              <RevealOnScroll key={job._id} delay={Math.min(index * 45, 240)}>
                <div
                  className="panel panel-pad cursor-pointer"
                  onClick={() => setSelectedJob(job)}
                >
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
              <p className="text-sm text-indigo-700 mt-1">Match: {job.matchPercentage ?? 0}%</p>
              <p className="text-sm text-emerald-700 font-semibold mt-1">Salary: {job.salary || "Not specified"}</p>
              {job.description && (
                <p className="text-sm text-slate-600 mt-2 line-clamp-2">{job.description}</p>
              )}
              {job.postedBy?.name && (
                <p className="text-sm text-slate-500 mt-2">
                  Recruiter: {job.postedBy.name}
                  {job.postedBy.recruiterVerified && <span className="ml-2 text-emerald-700 font-semibold">Verified</span>}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  disabled={hasApplied(job._id)}
                  onClick={(e) => {
                    e.stopPropagation();
                    applyToJob(job._id);
                  }}
                  className={hasApplied(job._id) ? "btn-secondary opacity-60 cursor-not-allowed" : "btn-success"}
                >
                  {hasApplied(job._id) ? "Applied" : "Apply"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previewBeforeApply(job._id);
                  }}
                  className="btn-warning"
                >
                  Preview Score
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openRecruiterProfile(job);
                  }}
                  className="btn-primary"
                >
                  View Recruiter
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedJob(job);
                  }}
                  className="btn-secondary"
                >
                  View Details
                </button>
                {job.postedBy?._id && (
                  <a
                    href={`/messages?userId=${job.postedBy._id}&jobId=${job._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="btn-info"
                  >
                    Message Recruiter
                  </a>
                )}
              </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </RevealOnScroll>

      {selectedRecruiter && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="panel w-full max-w-3xl panel-pad max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="section-title text-xl">Recruiter Profile</h2>
              <button onClick={() => setSelectedRecruiter(null)} className="btn-secondary">Close</button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedRecruiter.recruiterProfile?.profilePictureUrl || "https://via.placeholder.com/100"} alt="Recruiter" className="w-20 h-20 rounded-full object-cover border border-slate-200" />
              <div>
                <p className="text-xl font-semibold">{selectedRecruiter.name}</p>
                <p className="text-slate-600">{selectedRecruiter.recruiterProfile?.jobTitle || "Recruiter"}</p>
                <p className="text-sm text-slate-500">{selectedRecruiter.recruiterVerified ? "Verified Recruiter" : "Not Verified"}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="font-semibold mb-1">Company Logo</p>
              <img
                src={selectedRecruiter.recruiterProfile?.companyLogoUrl || "https://via.placeholder.com/160x80?text=Company+Logo"}
                alt="Company logo"
                className="w-40 h-20 object-cover rounded-xl border border-slate-200 bg-white"
              />
            </div>
            <p className="font-semibold mb-1">Professional Bio</p>
            <p className="text-slate-700 mb-4">{selectedRecruiter.recruiterProfile?.professionalBio || "No bio provided"}</p>

            <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
              <p><span className="font-semibold">Company:</span> {selectedRecruiter.recruiterProfile?.companyName || "N/A"}</p>
              <p><span className="font-semibold">Industry:</span> {selectedRecruiter.recruiterProfile?.companyIndustry || "N/A"}</p>
              <p><span className="font-semibold">Company Size:</span> {selectedRecruiter.recruiterProfile?.companySize || "N/A"}</p>
              <p><span className="font-semibold">Office Location:</span> {selectedRecruiter.recruiterProfile?.officeLocation || "N/A"}</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedRecruiter._id && <a href={`/messages?userId=${selectedRecruiter._id}`} className="btn-info">Message Recruiter</a>}
              {selectedRecruiter.recruiterProfile?.linkedinProfileUrl && <a href={selectedRecruiter.recruiterProfile.linkedinProfileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">LinkedIn</a>}
              {selectedRecruiter.recruiterProfile?.companyWebsite && <a href={selectedRecruiter.recruiterProfile.companyWebsite} target="_blank" rel="noopener noreferrer" className="btn-secondary">Company Website</a>}
            </div>
            <p className="font-semibold mb-2">Active Job Postings</p>
            {recruiterActiveJobs.length > 0 ? recruiterActiveJobs.map((job) => (
              <div key={job._id} className="border border-slate-200 rounded-xl p-2 mb-2">
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-slate-600">{job.company}</p>
              </div>
            )) : <p className="subtle">No active postings found.</p>}
          </div>
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="panel w-full max-w-3xl panel-pad max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="section-title text-xl">{selectedJob.title}</h2>
                <p className="text-slate-600">{selectedJob.company}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="btn-secondary">Close</button>
            </div>
            <div className="mb-4">
              <img
                src={selectedJob.postedBy?.recruiterProfile?.companyLogoUrl || "https://via.placeholder.com/200x90?text=Company+Logo"}
                alt={`${selectedJob.company || "Company"} logo`}
                className="w-48 h-24 object-cover rounded-xl border border-slate-200 bg-white"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
              <p><span className="font-semibold">Status:</span> {selectedJob.status || "open"}</p>
              <p><span className="font-semibold">Match:</span> {selectedJob.matchPercentage ?? 0}%</p>
              <p><span className="font-semibold">Salary:</span> {selectedJob.salary || "Not specified"}</p>
              <p><span className="font-semibold">Posted:</span> {selectedJob.createdAt ? new Date(selectedJob.createdAt).toLocaleDateString() : "N/A"}</p>
              <p><span className="font-semibold">Expiry:</span> {selectedJob.expiryDate ? new Date(selectedJob.expiryDate).toLocaleDateString() : "No expiry"}</p>
            </div>

            <div className="mb-4">
              <p className="font-semibold mb-1">Job Description</p>
              <p className="text-slate-700 whitespace-pre-wrap">{selectedJob.description || "No description available."}</p>
            </div>

            <div className="mb-4">
              <p className="font-semibold mb-2">Required Skills</p>
              {selectedJob.requiredSkills?.length ? (
                selectedJob.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="chip">{skill}</span>
                ))
              ) : (
                <p className="subtle">No required skills listed.</p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                disabled={hasApplied(selectedJob._id)}
                onClick={() => applyToJob(selectedJob._id)}
                className={hasApplied(selectedJob._id) ? "btn-secondary opacity-60 cursor-not-allowed" : "btn-success"}
              >
                {hasApplied(selectedJob._id) ? "Applied" : "Apply"}
              </button>
              <button onClick={() => previewBeforeApply(selectedJob._id)} className="btn-warning">Preview Score</button>
              <button onClick={() => openRecruiterProfile(selectedJob)} className="btn-primary">View Recruiter</button>
              {selectedJob.postedBy?._id && (
                <a href={`/messages?userId=${selectedJob.postedBy._id}&jobId=${selectedJob._id}`} className="btn-info">
                  Message Recruiter
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </StudentLayout>
  );
}

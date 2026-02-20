import { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import RecruiterLayout from "../components/RecruiterLayout";
import { getResumeStreamUrl, toServerAssetUrl } from "../utils/apiBase";

export default function RecruiterJobManagement() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [editingJob, setEditingJob] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [recruiterIdInput, setRecruiterIdInput] = useState("");
  const [appFilters, setAppFilters] = useState({
    minScore: "",
    skill: "",
    education: "",
    experience: "",
    status: "",
    shortlisted: ""
  });

  const [form, setForm] = useState({
    title: "",
    company: "",
    salary: "",
    description: "",
    requiredSkills: "",
    status: "open",
    expiryDate: ""
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.data || []);
    } catch {
      setJobs([]);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await API.post("/jobs", {
        ...form,
        requiredSkills: form.requiredSkills.split(",").map((s) => s.trim()).filter(Boolean),
        expiryDate: form.expiryDate || null
      });
      alert("Job saved successfully");
      setForm({
        title: "",
        company: "",
        salary: "",
        description: "",
        requiredSkills: "",
        status: "open",
        expiryDate: ""
      });
      fetchJobs();
    } catch {
      alert("Failed to save job");
    }
  };

  const viewApplications = async (jobId, filters = appFilters) => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "") params.append(k, v);
      });
      const qs = params.toString();
      const url = `/applications/job/${jobId}${qs ? `?${qs}` : ""}`;
      const res = await API.get(url);
      setSelectedJob(jobId);
      setApplications(res.data.data || []);
    } catch {
      alert("Failed to fetch applications");
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      await API.delete(`/jobs/${jobId}`);
      alert("Job deleted successfully");
      fetchJobs();
    } catch {
      alert("Failed to delete job");
    }
  };

  const handleUpdateJob = async () => {
    try {
      await API.put(`/jobs/${editingJob._id}`, {
        ...editingJob,
        expiryDate: editingJob.expiryDate || null
      });
      alert("Job updated successfully");
      setEditingJob(null);
      fetchJobs();
    } catch {
      alert("Failed to update job");
    }
  };

  const handleJobStatus = async (jobId, status) => {
    try {
      await API.patch(`/jobs/${jobId}/status`, { status });
      fetchJobs();
    } catch {
      alert("Failed to update job status");
    }
  };

  const handleAddRecruiterToJob = async () => {
    if (!editingJob || !recruiterIdInput.trim()) return;
    try {
      await API.post(`/jobs/${editingJob._id}/recruiters`, {
        recruiterId: recruiterIdInput.trim()
      });
      alert("Recruiter added to job");
      setRecruiterIdInput("");
      fetchJobs();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add recruiter");
    }
  };

  const updateApplicationStatus = async (applicationId, status) => {
    try {
      await API.patch(`/applications/${applicationId}/status`, { status });
      if (selectedJob) viewApplications(selectedJob);
    } catch {
      alert("Failed to update application status");
    }
  };

  const updateApplicationReview = async (applicationId, payload) => {
    try {
      await API.patch(`/applications/${applicationId}/review`, payload);
      if (selectedJob) viewApplications(selectedJob);
    } catch {
      alert("Failed to update applicant review");
    }
  };

  const getResumeFilename = (resumePath) => {
    if (!resumePath) return null;
    const parts = resumePath.split("/");
    return parts[parts.length - 1];
  };

  const selectedJobData = useMemo(() => jobs.find((j) => j._id === selectedJob), [jobs, selectedJob]);

  return (
    <RecruiterLayout
      title="Recruiter Job Manager"
      subtitle="Create jobs, manage applicants, edit posting status, and shortlist candidates."
    >
      <div className="panel panel-pad mb-6">
        <h2 className="section-title text-lg mb-4">Create / Draft Job</h2>
        <form onSubmit={handlePostJob} className="grid md:grid-cols-2 gap-3">
          <input type="text" placeholder="Job Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
          <input type="text" placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="input" />
          <input type="text" placeholder="Salary (e.g. $70,000 - $90,000)" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="input md:col-span-2" />
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input md:col-span-2 min-h-[90px]" />
          <input type="text" placeholder="Required Skills (comma separated)" value={form.requiredSkills} onChange={(e) => setForm({ ...form, requiredSkills: e.target.value })} className="input" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
            <option value="open">Open</option>
            <option value="draft">Draft</option>
          </select>
          <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="input" />
          <button className="btn-primary md:col-span-2">Save Job</button>
        </form>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div key={job._id} className="panel panel-pad">
            <h2 className="text-lg font-bold">{job.title}</h2>
            <p className="text-slate-600">{job.company}</p>
            <p className="text-sm text-emerald-700 font-semibold">Salary: {job.salary || "Not specified"}</p>
            <p className="text-sm text-slate-500 mt-1">Status: <span className="font-medium">{job.status}</span></p>
            <p className="text-sm text-slate-500">Expiry: {job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : "No expiry"}</p>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => viewApplications(job._id)} className="btn-success">Applicants</button>
              <button onClick={() => setEditingJob(job)} className="btn-warning">Edit</button>
              <button onClick={() => handleJobStatus(job._id, "open")} className="btn-success">Open</button>
              <button onClick={() => handleJobStatus(job._id, "closed")} className="btn-warning">Close</button>
              <button onClick={() => handleJobStatus(job._id, "archived")} className="btn-secondary">Archive</button>
              <button onClick={() => handleJobStatus(job._id, "draft")} className="btn-info">Draft</button>
              <button onClick={() => handleDeleteJob(job._id)} className="btn-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {selectedJob && (
        <div className="panel panel-pad mt-6">
          <h2 className="section-title text-lg mb-4">Applicant Management</h2>
          <div className="grid md:grid-cols-3 gap-3 mb-4">
            <input placeholder="Min Score" value={appFilters.minScore} onChange={(e) => setAppFilters({ ...appFilters, minScore: e.target.value })} className="input" />
            <input placeholder="Skill" value={appFilters.skill} onChange={(e) => setAppFilters({ ...appFilters, skill: e.target.value })} className="input" />
            <input placeholder="Education" value={appFilters.education} onChange={(e) => setAppFilters({ ...appFilters, education: e.target.value })} className="input" />
            <input placeholder="Min Experience (internships count)" value={appFilters.experience} onChange={(e) => setAppFilters({ ...appFilters, experience: e.target.value })} className="input" />
            <select value={appFilters.status} onChange={(e) => setAppFilters({ ...appFilters, status: e.target.value })} className="input">
              <option value="">Any Status</option>
              <option value="Applied">Applied</option>
              <option value="Screening">Screening</option>
              <option value="Interview">Interview</option>
              <option value="Offered">Offered</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select value={appFilters.shortlisted} onChange={(e) => setAppFilters({ ...appFilters, shortlisted: e.target.value })} className="input">
              <option value="">Shortlist: Any</option>
              <option value="true">Shortlisted</option>
              <option value="false">Not Shortlisted</option>
            </select>
            <button onClick={() => viewApplications(selectedJob, appFilters)} className="btn-primary">Apply Filters</button>
          </div>

          {applications.map((app) => (
            <div key={app._id} className="border border-slate-200 rounded-xl p-3 mb-3">
              <p className="font-semibold">{app.student?.name || "Student"}</p>
              <p className="text-sm text-slate-600">{app.student?.email || "Email not available"}</p>
              <p className="text-emerald-700 font-bold">Score: {app.score}%</p>
              <p className="text-sm">Status: <span className="font-medium">{app.status}</span></p>
              <p className="text-sm">Shortlisted: {app.shortlisted ? "Yes" : "No"}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => app.student && setSelectedStudent(app.student)} disabled={!app.student} className="btn-primary">View Profile</button>
                {app.student?._id && <a href={`/messages?userId=${app.student._id}&jobId=${selectedJob}`} className="btn-info">Message</a>}
                <button onClick={() => updateApplicationReview(app._id, { shortlisted: !app.shortlisted })} className="btn-info">{app.shortlisted ? "Unshortlist" : "Shortlist"}</button>
                <button onClick={() => updateApplicationStatus(app._id, "Rejected")} className="btn-danger">Reject</button>
                <select onChange={(e) => updateApplicationStatus(app._id, e.target.value)} value={app.status} className="input max-w-[180px]">
                  <option value="Applied">Applied</option>
                  <option value="Screening">Screening</option>
                  <option value="Interview">Interview</option>
                  <option value="Offered">Offered</option>
                  <option value="Rejected">Rejected</option>
                </select>
                {app.student?.resume && <a href={toServerAssetUrl(app.student.resume)} download className="btn-success">Download Resume</a>}
              </div>
              <textarea
                defaultValue={app.internalNotes || ""}
                placeholder="Internal notes"
                className="input mt-2 min-h-[80px]"
                onBlur={(e) => updateApplicationReview(app._id, { internalNotes: e.target.value })}
              />
            </div>
          ))}
        </div>
      )}

      {editingJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="panel w-full max-w-xl panel-pad">
            <h2 className="section-title text-xl mb-4">Edit Job</h2>
            <input type="text" value={editingJob.title || ""} onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })} className="input mb-3" />
            <input type="text" value={editingJob.salary || ""} onChange={(e) => setEditingJob({ ...editingJob, salary: e.target.value })} className="input mb-3" placeholder="Salary" />
            <textarea value={editingJob.description || ""} onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })} className="input mb-3 min-h-[100px]" />
            <input type="text" value={(editingJob.requiredSkills || []).join(", ")} onChange={(e) => setEditingJob({ ...editingJob, requiredSkills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="input mb-3" />
            <select value={editingJob.status || "open"} onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })} className="input mb-3">
              <option value="draft">Draft</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="archived">Archived</option>
            </select>
            <input type="date" value={editingJob.expiryDate ? new Date(editingJob.expiryDate).toISOString().slice(0, 10) : ""} onChange={(e) => setEditingJob({ ...editingJob, expiryDate: e.target.value })} className="input mb-3" />
            <div className="border border-slate-200 rounded-xl p-3 mb-3">
              <p className="font-semibold mb-2">Multiple Recruiters</p>
              <input value={recruiterIdInput} onChange={(e) => setRecruiterIdInput(e.target.value)} placeholder="Recruiter User ID" className="input mb-2" />
              <button onClick={handleAddRecruiterToJob} className="btn-info">Add Recruiter</button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleUpdateJob} className="btn-primary">Save</button>
              <button onClick={() => setEditingJob(null)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="panel w-full max-w-2xl panel-pad max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="section-title text-xl">Student Profile</h2>
              <button onClick={() => setSelectedStudent(null)} className="btn-secondary">Close</button>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedStudent.profilePhoto ? toServerAssetUrl(selectedStudent.profilePhoto) : "https://via.placeholder.com/100"} alt="Student" className="w-24 h-24 rounded-full object-cover border border-slate-200" />
              <div>
                <p className="text-xl font-semibold">{selectedStudent.name}</p>
                <p className="text-slate-600">{selectedStudent.email}</p>
                <p className="text-sm text-slate-500">{selectedStudent.headline || "No headline added"}</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-3 mb-4 text-sm">
              <p><span className="font-semibold">Phone:</span> {selectedStudent.phone || "N/A"}</p>
              <p><span className="font-semibold">Location:</span> {selectedStudent.location || "N/A"}</p>
              <p><span className="font-semibold">University:</span> {selectedStudent.university || "N/A"}</p>
              <p><span className="font-semibold">Degree:</span> {selectedStudent.degree || "N/A"}</p>
              <p><span className="font-semibold">Specialization:</span> {selectedStudent.specialization || "N/A"}</p>
            </div>
            <p className="font-semibold mb-1">Bio</p>
            <p className="text-slate-700 mb-3">{selectedStudent.bio || "No bio added"}</p>
            {selectedStudent._id && <a href={`/messages?userId=${selectedStudent._id}&jobId=${selectedJob || ""}`} className="btn-info mb-3">Message Candidate</a>}
            <div className="mb-4">
              <p className="font-semibold mb-2">Skills</p>
              {selectedStudent.skills?.length ? selectedStudent.skills.map((skill, idx) => (
                <span key={idx} className="chip">{skill}</span>
              )) : <p className="subtle">No skills found</p>}
            </div>
            {selectedStudent.resume && (
              <div className="flex gap-2">
                <a href={getResumeStreamUrl(getResumeFilename(selectedStudent.resume))} target="_blank" rel="noopener noreferrer" className="btn-primary">View Resume</a>
                <a href={toServerAssetUrl(selectedStudent.resume)} download className="btn-success">Download Resume</a>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedJobData?.company && (
        <div className="mt-6">
          <a href={`/company/${encodeURIComponent(selectedJobData.company)}`} className="btn-secondary">
            Open Company Profile Page
          </a>
        </div>
      )}
    </RecruiterLayout>
  );
}

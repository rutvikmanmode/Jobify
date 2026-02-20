import { useEffect, useState } from "react";
import API from "../api/axios";
import { getResumeStreamUrl, toServerAssetUrl } from "../utils/apiBase";

const defaultBuilder = {
  fullName: "",
  title: "",
  summary: "",
  experience: "",
  education: "",
  projects: "",
  certifications: ""
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [resumeVersions, setResumeVersions] = useState([]);
  const [builder, setBuilder] = useState(defaultBuilder);
  const [improvementSuggestions, setImprovementSuggestions] = useState([]);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([
      fetchProfile(),
      fetchSkillSuggestions(),
      fetchResumeHistory(),
      fetchResumeBuilder()
    ]);
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile/me");
      setProfile(res.data.data);
    } catch {
      console.error("Failed to fetch profile");
    }
  };

  const fetchSkillSuggestions = async () => {
    try {
      const res = await API.get("/resume/skill-suggestions");
      setSkillSuggestions(res.data.suggestions || []);
    } catch {
      setSkillSuggestions([]);
    }
  };

  const fetchResumeHistory = async () => {
    try {
      const res = await API.get("/resume/history");
      setResumeVersions(res.data.versions || []);
    } catch {
      setResumeVersions([]);
    }
  };

  const fetchResumeBuilder = async () => {
    try {
      const res = await API.get("/resume/builder");
      const data = res.data.data || {};
      setBuilder({
        fullName: data.fullName || "",
        title: data.title || "",
        summary: data.summary || "",
        experience: (data.experience || []).join("\n"),
        education: (data.education || []).join("\n"),
        projects: (data.projects || []).join("\n"),
        certifications: (data.certifications || []).join("\n")
      });
    } catch {
      setBuilder(defaultBuilder);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      await API.put("/profile/me", profile);
      alert("Profile updated successfully");
    } catch {
      alert("Failed to update profile");
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) return alert("Select image first");
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      await API.post("/profile/photo", formData);
      alert("Photo uploaded");
      fetchProfile();
    } catch {
      alert("Photo upload failed");
    }
  };

  const handleResumeUpload = async () => {
    if (!resumeFile) return alert("Select resume first");
    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      const res = await API.post("/resume/upload", formData);
      if (res.data.suggestions?.length) {
        setImprovementSuggestions(res.data.suggestions);
      }
      alert("Resume uploaded successfully");
      await loadAll();
    } catch {
      alert("Resume upload failed");
    }
  };

  const handleAddSkill = async (skillValue) => {
    const skill = (skillValue || skillInput).trim();
    if (!skill) return;

    try {
      const res = await API.post("/resume/skills/add", { skill });
      setProfile({ ...profile, skills: res.data.skills || [] });
      setSkillInput("");
      fetchSkillSuggestions();
    } catch {
      alert("Failed to add skill");
    }
  };

  const handleRemoveSkill = async (skill) => {
    try {
      const res = await API.post("/resume/skills/remove", { skill });
      setProfile({ ...profile, skills: res.data.skills || [] });
      fetchSkillSuggestions();
    } catch {
      alert("Failed to remove skill");
    }
  };

  const handleSaveBuilder = async () => {
    try {
      await API.post("/resume/builder", {
        fullName: builder.fullName,
        title: builder.title,
        summary: builder.summary,
        experience: builder.experience.split("\n").map((v) => v.trim()).filter(Boolean),
        education: builder.education.split("\n").map((v) => v.trim()).filter(Boolean),
        projects: builder.projects.split("\n").map((v) => v.trim()).filter(Boolean),
        certifications: builder.certifications.split("\n").map((v) => v.trim()).filter(Boolean)
      });
      alert("Resume builder saved");
      await loadAll();
    } catch {
      alert("Failed to save builder data");
    }
  };

  const loadImprovementSuggestions = async () => {
    try {
      const res = await API.get("/resume/improvement-suggestions");
      setImprovementSuggestions(res.data.suggestions || []);
    } catch {
      setImprovementSuggestions([]);
    }
  };

  if (!profile) return <div className="app-shell"><div className="page-wrap">Loading...</div></div>;

  const resumeFilename = profile.resume ? profile.resume.split("/").pop() : null;
  const resumeViewUrl = getResumeStreamUrl(resumeFilename);

  const filledFields = [
    profile.headline,
    profile.bio,
    profile.phone,
    profile.location,
    profile.university,
    profile.degree,
    profile.resume,
    profile.profilePhoto
  ].filter(Boolean).length;

  const completion = Math.round((filledFields / 8) * 100);

  return (
    <div className="app-shell">
      <div className="page-wrap max-w-5xl">
        <div className="page-header flex items-center justify-between gap-3 mb-6">
          <h1 className="section-title">My Profile</h1>
          <a href="/student" className="btn-secondary">Back to Dashboard</a>
        </div>

        <div className="panel panel-pad mb-6">
          <p className="mb-2 font-semibold">Profile Completion: {completion}%</p>
          <div className="w-full bg-slate-200 rounded-full h-3">
            <div className="bg-emerald-600 h-3 rounded-full" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <div className="panel panel-pad mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <img
              src={
                profile.profilePhoto
                  ? toServerAssetUrl(profile.profilePhoto)
                  : "https://via.placeholder.com/120"
              }
              alt="Profile"
              className="w-28 h-28 rounded-full object-cover border border-slate-200"
            />
            <div>
              <label className="label">Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files[0])}
                className="input mb-2"
              />
              <button onClick={handlePhotoUpload} className="btn-primary">Upload Photo</button>
            </div>
          </div>
        </div>

        <div className="panel panel-pad mb-6">
          <h2 className="text-lg font-bold mb-4">Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" value={profile.email || ""} onChange={handleChange} placeholder="Enter your email" className="input" />
            </div>
            <div>
              <label className="label">Professional Headline</label>
              <input name="headline" value={profile.headline || ""} onChange={handleChange} placeholder="e.g. Full Stack Developer" className="input" />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input name="phone" value={profile.phone || ""} onChange={handleChange} placeholder="Enter phone number" className="input" />
            </div>
            <div>
              <label className="label">Location</label>
              <input name="location" value={profile.location || ""} onChange={handleChange} placeholder="City, State" className="input" />
            </div>
            <div>
              <label className="label">University</label>
              <input name="university" value={profile.university || ""} onChange={handleChange} placeholder="Enter university" className="input" />
            </div>
            <div>
              <label className="label">Degree</label>
              <input name="degree" value={profile.degree || ""} onChange={handleChange} placeholder="e.g. B.Tech CSE" className="input" />
            </div>
            <div>
              <label className="label">Specialization</label>
              <input name="specialization" value={profile.specialization || ""} onChange={handleChange} placeholder="e.g. Web Development" className="input" />
            </div>
            <div>
              <label className="label">LinkedIn URL</label>
              <input name="linkedin" type="url" value={profile.linkedin || ""} onChange={handleChange} placeholder="https://linkedin.com/in/..." className="input" />
            </div>
            <div>
              <label className="label">GitHub URL</label>
              <input name="github" type="url" value={profile.github || ""} onChange={handleChange} placeholder="https://github.com/..." className="input" />
            </div>
            <div>
              <label className="label">Portfolio URL</label>
              <input name="portfolio" type="url" value={profile.portfolio || ""} onChange={handleChange} placeholder="https://your-portfolio.com" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Bio</label>
              <textarea
                name="bio"
                value={profile.bio || ""}
                onChange={handleChange}
                placeholder="Write a short professional summary"
                className="input"
                rows="4"
              />
            </div>
          </div>
        </div>

        <div className="panel panel-pad mb-6">
          <h3 className="font-semibold mb-2">Dynamic Skill Tags</h3>
          <label className="label">Add Skill</label>
          <div className="flex gap-2 mb-3">
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              placeholder="e.g. React"
              className="input flex-1"
            />
            <button onClick={() => handleAddSkill()} className="btn-primary">Add</button>
          </div>

          {(profile.skills || []).length > 0 ? (
            <div>
              {profile.skills.map((skill, index) => (
                <span key={index} className="chip">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="ml-2 text-rose-600 font-bold">x</button>
                </span>
              ))}
            </div>
          ) : (
            <p className="subtle">No skills yet.</p>
          )}

          {skillSuggestions.length > 0 && (
            <div className="mt-3">
              <p className="font-medium mb-2">Suggested from resume</p>
              {skillSuggestions.map((skill, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddSkill(skill)}
                  className="btn-info mr-2 mb-2"
                >
                  + {skill}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="panel panel-pad mb-6">
          <h3 className="font-semibold mb-3">Resume</h3>
          <label className="label">Upload Resume (PDF)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="input mb-3"
          />

          <div className="flex flex-wrap gap-2">
            <button onClick={handleResumeUpload} className="btn-primary">Upload Resume</button>
            <button onClick={loadImprovementSuggestions} className="btn-warning">Get Improvement Suggestions</button>
          </div>

          {profile.resume && (
            <div className="flex gap-4 mt-4">
              <a
                href={resumeViewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-info"
              >
                View Resume
              </a>
            </div>
          )}

          {improvementSuggestions.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold mb-2">Resume Improvement Suggestions</p>
              {improvementSuggestions.map((item, idx) => (
                <p key={idx} className="text-sm text-slate-700 mb-1">- {item}</p>
              ))}
            </div>
          )}
        </div>

        <div className="panel panel-pad mb-6">
          <h3 className="font-semibold mb-3">Resume Version History</h3>
          {resumeVersions.length === 0 ? (
            <p className="subtle">No versions yet.</p>
          ) : (
            resumeVersions.map((version, idx) => {
              const filename = version.resumePath ? version.resumePath.split("/").pop() : null;
              const viewUrl = getResumeStreamUrl(filename);
              return (
                <div key={idx} className="border border-slate-200 rounded p-3 mb-2 bg-white">
                  <p className="text-sm text-slate-700">
                    {new Date(version.createdAt).toLocaleString()} | source: {version.source}
                  </p>
                  {version.extractedSkills?.length > 0 && (
                    <p className="text-sm text-slate-600">Skills: {version.extractedSkills.join(", ")}</p>
                  )}
                  {viewUrl && (
                    <a
                      href={viewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-sm"
                    >
                      View this version
                    </a>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="panel panel-pad mb-6">
          <h3 className="font-semibold mb-3">In-App Resume Builder</h3>
          <div className="grid gap-3">
            <div>
              <label className="label">Full Name</label>
              <input
                value={builder.fullName}
                onChange={(e) => setBuilder({ ...builder, fullName: e.target.value })}
                placeholder="Enter full name"
                className="input"
              />
            </div>
            <div>
              <label className="label">Professional Title</label>
              <input
                value={builder.title}
                onChange={(e) => setBuilder({ ...builder, title: e.target.value })}
                placeholder="e.g. Frontend Developer"
                className="input"
              />
            </div>
            <div>
              <label className="label">Summary</label>
              <textarea
                value={builder.summary}
                onChange={(e) => setBuilder({ ...builder, summary: e.target.value })}
                placeholder="Write a short profile summary"
                className="input"
                rows="3"
              />
            </div>
            <div>
              <label className="label">Experience</label>
              <textarea
                value={builder.experience}
                onChange={(e) => setBuilder({ ...builder, experience: e.target.value })}
                placeholder="One line per item"
                className="input"
                rows="4"
              />
            </div>
            <div>
              <label className="label">Education</label>
              <textarea
                value={builder.education}
                onChange={(e) => setBuilder({ ...builder, education: e.target.value })}
                placeholder="One line per item"
                className="input"
                rows="3"
              />
            </div>
            <div>
              <label className="label">Projects</label>
              <textarea
                value={builder.projects}
                onChange={(e) => setBuilder({ ...builder, projects: e.target.value })}
                placeholder="One line per item"
                className="input"
                rows="3"
              />
            </div>
            <div>
              <label className="label">Certifications</label>
              <textarea
                value={builder.certifications}
                onChange={(e) => setBuilder({ ...builder, certifications: e.target.value })}
                placeholder="One line per item"
                className="input"
                rows="2"
              />
            </div>

            <button onClick={handleSaveBuilder} className="btn-secondary">
              Save Builder Data
            </button>
          </div>
        </div>

        <button onClick={handleSave} className="btn-success">
          Save Changes
        </button>
      </div>
    </div>
  );
}

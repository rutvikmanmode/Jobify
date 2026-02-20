import { useEffect, useState } from "react";
import API from "../api/axios";
import StudentLayout from "../components/StudentLayout";

export default function StudentResumeCenter() {
  const [skills, setSkills] = useState([]);
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [improvementSuggestions, setImprovementSuggestions] = useState([]);
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsError, setTipsError] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMyProfileSkills();
    fetchSkillSuggestions();
  }, []);

  const fetchMyProfileSkills = async () => {
    try {
      const res = await API.get("/profile/me");
      setSkills(res.data?.data?.skills || []);
    } catch {
      setSkills([]);
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

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return alert("Select a PDF file");

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      setUploading(true);
      const res = await API.post("/resume/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setSkills(res.data.skills || []);
      alert("Resume uploaded successfully");
      fetchMyProfileSkills();
      fetchSkillSuggestions();
    } catch (error) {
      alert(error.response?.data?.msg || "Resume upload failed");
    } finally {
      setUploading(false);
    }
  };

  const addSuggestedSkill = async (skill) => {
    try {
      await API.post("/resume/skills/add", { skill });
      fetchMyProfileSkills();
      fetchSkillSuggestions();
    } catch {
      alert("Failed to add suggested skill");
    }
  };

  const loadResumeImprovements = async () => {
    setTipsLoading(true);
    setTipsError("");
    try {
      const res = await API.get("/resume/improvement-suggestions");
      setImprovementSuggestions(res.data.suggestions || []);
    } catch (error) {
      setImprovementSuggestions([]);
      setTipsError(error.response?.data?.message || "Failed to load improvement tips");
    } finally {
      setTipsLoading(false);
    }
  };

  return (
    <StudentLayout title="Resume Center" subtitle="Upload resume and improve your profile skills.">
      <div className="panel panel-pad">
        <form onSubmit={handleResumeUpload} className="flex flex-wrap items-center gap-3">
          <input type="file" accept=".pdf" onChange={(e) => setResumeFile(e.target.files[0])} className="input max-w-md" />
          <button type="submit" disabled={uploading} className="btn-primary">
            {uploading ? "Uploading..." : "Upload Resume"}
          </button>
          <button type="button" onClick={loadResumeImprovements} className="btn-warning">
            {tipsLoading ? "Generating Tips..." : "Improvement Tips"}
          </button>
        </form>

        {skills.length > 0 && (
          <div className="mt-4">
            <p className="label">Extracted Skills</p>
            {skills.map((skill, index) => (
              <span key={index} className="chip">{skill}</span>
            ))}
          </div>
        )}

        {skillSuggestions.length > 0 && (
          <div className="mt-4">
            <p className="label">Suggested Skills</p>
            {skillSuggestions.map((skill, idx) => (
              <button key={idx} onClick={() => addSuggestedSkill(skill)} className="btn-info mr-2 mb-2">
                + {skill}
              </button>
            ))}
          </div>
        )}

        {tipsError && (
          <div className="mt-4">
            <p className="text-sm text-rose-700">{tipsError}</p>
          </div>
        )}

        {!tipsLoading && improvementSuggestions.length === 0 && (
          <div className="mt-4">
            <p className="text-sm text-slate-600">Click Improvement Tips to get AI-based suggestions.</p>
          </div>
        )}

        {improvementSuggestions.length > 0 && (
          <div className="mt-4">
            <p className="label">AI Improvement Suggestions</p>
            {improvementSuggestions.map((item, idx) => (
              <p key={idx} className="text-sm text-slate-700 mb-1">- {item}</p>
            ))}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}

import { useEffect, useState } from "react";
import API from "../api/axios";
import StudentLayout from "../components/StudentLayout";
import { getResumeStreamUrl } from "../utils/apiBase";

export default function StudentResumeHistory() {
  const [resumeHistory, setResumeHistory] = useState([]);

  useEffect(() => {
    fetchResumeHistory();
  }, []);

  const fetchResumeHistory = async () => {
    try {
      const res = await API.get("/resume/history");
      setResumeHistory(res.data.versions || []);
    } catch {
      setResumeHistory([]);
    }
  };

  return (
    <StudentLayout title="Resume History" subtitle="View your uploaded resume versions.">
      <div className="panel panel-pad">
        {resumeHistory.length === 0 ? (
          <p className="subtle">No resume versions yet.</p>
        ) : (
          resumeHistory.map((version, idx) => {
            const filename = version.resumePath ? version.resumePath.split("/").pop() : null;
            const viewUrl = getResumeStreamUrl(filename);
            return (
              <div key={idx} className="border border-slate-200 rounded-xl p-3 mb-2">
                <p className="text-sm text-slate-700">
                  {new Date(version.createdAt).toLocaleString()} | {version.source}
                </p>
                {version.extractedSkills?.length > 0 && (
                  <p className="text-sm text-slate-600">Skills: {version.extractedSkills.join(", ")}</p>
                )}
                {viewUrl && (
                  <a href={viewUrl} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline text-sm">
                    View Version
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </StudentLayout>
  );
}

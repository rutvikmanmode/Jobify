import { useEffect, useState } from "react";
import { loadPreferences, updatePreferences } from "../utils/appPreferences";

export default function ApplicationSettings() {
  const [prefs, setPrefs] = useState(loadPreferences());

  useEffect(() => {
    setPrefs(loadPreferences());
  }, []);

  const setAndApply = (nextPatch) => {
    const updated = updatePreferences(nextPatch);
    setPrefs(updated);
  };

  return (
    <div className="app-shell">
      <div className="page-wrap">
        <div className="page-header flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="section-title">Application Settings</h1>
            <p className="subtle">Control app behavior and accessibility preferences.</p>
          </div>
          <a href={localStorage.getItem("role") === "recruiter" ? "/recruiter" : "/student"} className="btn-secondary">Back to Dashboard</a>
        </div>

        <div className="panel panel-pad">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-2xl p-4">
              <div>
                <p className="font-semibold">Dark Mode</p>
                <p className="text-sm text-slate-600">Switch app colors to dark appearance.</p>
              </div>
              <button
                onClick={() => setAndApply({ darkMode: !prefs.darkMode })}
                className={prefs.darkMode ? "btn-primary" : "btn-secondary"}
              >
                {prefs.darkMode ? "On" : "Off"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-2xl p-4">
              <div>
                <p className="font-semibold">Compact View</p>
                <p className="text-sm text-slate-600">Reduce spacing density across pages.</p>
              </div>
              <button
                onClick={() => setAndApply({ compactView: !prefs.compactView })}
                className={prefs.compactView ? "btn-primary" : "btn-secondary"}
              >
                {prefs.compactView ? "On" : "Off"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-2xl p-4">
              <div>
                <p className="font-semibold">Reduce Motion</p>
                <p className="text-sm text-slate-600">Disable animations/transitions for accessibility.</p>
              </div>
              <button
                onClick={() => setAndApply({ reduceMotion: !prefs.reduceMotion })}
                className={prefs.reduceMotion ? "btn-primary" : "btn-secondary"}
              >
                {prefs.reduceMotion ? "On" : "Off"}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-200 rounded-2xl p-4">
              <div>
                <p className="font-semibold">Font Size Preference</p>
                <p className="text-sm text-slate-600">Choose the reading size for app content.</p>
              </div>
              <select
                value={prefs.fontSize}
                onChange={(e) => setAndApply({ fontSize: e.target.value })}
                className="input max-w-[180px]"
              >
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

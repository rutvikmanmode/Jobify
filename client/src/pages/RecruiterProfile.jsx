import { useEffect, useState } from "react";
import API from "../api/axios";
import { toServerAssetUrl } from "../utils/apiBase";

const defaultRecruiterProfile = {
  jobTitle: "",
  professionalBio: "",
  linkedinProfileUrl: "",
  profilePictureUrl: "",
  companyName: "",
  companyLogoUrl: "",
  companyIndustry: "",
  companyWebsite: "",
  companySize: "",
  officeLocation: "",
  workEmail: "",
  workPhoneNumber: "",
  preferredCommunicationMethod: "In-app messaging",
  availabilityResponseTime: "",
  hiringDomains: [],
  seniorityLevels: [],
  atsId: "",
  subscriptionTier: "Free",
  jobPostingCredits: 0,
  notificationPreferences: {
    newApplications: true,
    messages: true,
    interviewReminders: true
  },
  teamAccess: []
};

const sectionCard = "panel panel-pad mb-5";

export default function RecruiterProfile() {
  const [profile, setProfile] = useState(defaultRecruiterProfile);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);

  const [hiringDomainsInput, setHiringDomainsInput] = useState("");
  const [seniorityLevelsInput, setSeniorityLevelsInput] = useState("");
  const [teamAccessInput, setTeamAccessInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/profile/me");
      const rp = res.data?.data?.recruiterProfile || {};
      setFullName(res.data?.data?.name || "");
      setEmail(res.data?.data?.email || "");
      setProfilePhoto(res.data?.data?.profilePhoto || "");
      const merged = {
        ...defaultRecruiterProfile,
        ...rp,
        notificationPreferences: {
          ...defaultRecruiterProfile.notificationPreferences,
          ...(rp.notificationPreferences || {})
        }
      };

      setProfile(merged);
      setHiringDomainsInput((merged.hiringDomains || []).join(", "));
      setSeniorityLevelsInput((merged.seniorityLevels || []).join(", "));
      setTeamAccessInput((merged.teamAccess || []).join(", "));
    } catch {
      alert("Failed to load recruiter profile");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (e) => {
    const { name, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      notificationPreferences: {
        ...prev.notificationPreferences,
        [name]: checked
      }
    }));
  };

  const handleSave = async () => {
    const payload = {
      name: fullName,
      email,
      recruiterProfile: {
        ...profile,
        hiringDomains: hiringDomainsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        seniorityLevels: seniorityLevelsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        teamAccess: teamAccessInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        jobPostingCredits: Number(profile.jobPostingCredits) || 0
      }
    };

    try {
      await API.put("/profile/me", payload);
      alert("Recruiter profile updated");
    } catch {
      alert("Failed to update recruiter profile");
    }
  };

  const handlePhotoUpload = async () => {
    if (!photoFile) {
      alert("Select an image first");
      return;
    }

    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      setUploadingPhoto(true);
      const res = await API.post("/profile/photo", formData);
      setProfilePhoto(res.data?.photo || "");
      setPhotoFile(null);
      alert("Profile photo uploaded");
      await fetchProfile();
    } catch {
      alert("Photo upload failed");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page-wrap">
          <div className="panel panel-pad">Loading recruiter profile...</div>
        </div>
      </div>
    );
  }

  const profilePhotoSrc = profilePhoto
    ? toServerAssetUrl(profilePhoto)
    : profile.profilePictureUrl || "https://via.placeholder.com/120";

  return (
    <div className="app-shell">
      <div className="page-wrap max-w-6xl">
        <div className="page-header flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <h1 className="section-title">Recruiter Profile</h1>
            <p className="subtle">Keep your recruiter identity complete to build candidate trust.</p>
          </div>
          <div className="flex gap-2">
            <a href="/recruiter" className="btn-secondary">Back</a>
            <button onClick={handleLogout} className="btn-danger">Logout</button>
          </div>
        </div>

        <section className={sectionCard}>
          <h2 className="section-title text-lg mb-3">Profile Photo</h2>
          <div className="flex items-center gap-6 flex-wrap">
            <img
              src={profilePhotoSrc}
              alt="Recruiter profile"
              className="w-24 h-24 rounded-full object-cover border border-slate-200 bg-white"
            />
            <div className="min-w-[260px]">
              <label className="label">Upload Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="input mb-2"
              />
              <button
                onClick={handlePhotoUpload}
                disabled={uploadingPhoto}
                className={uploadingPhoto ? "btn-secondary opacity-70 cursor-not-allowed" : "btn-primary"}
              >
                {uploadingPhoto ? "Uploading..." : "Upload Photo"}
              </button>
            </div>
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className="section-title text-lg mb-3">Personal and Professional Identity</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="input" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="input" />
            </div>
            <div>
              <label className="label">Official Job Title</label>
              <input name="jobTitle" value={profile.jobTitle} onChange={handleFieldChange} placeholder="Official Job Title" className="input" />
            </div>
            <div>
              <label className="label">Profile Picture URL</label>
              <input name="profilePictureUrl" value={profile.profilePictureUrl} onChange={handleFieldChange} placeholder="Profile Picture URL" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">LinkedIn Profile URL</label>
              <input name="linkedinProfileUrl" value={profile.linkedinProfileUrl} onChange={handleFieldChange} placeholder="LinkedIn Profile URL" className="input" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Professional Bio</label>
              <textarea name="professionalBio" value={profile.professionalBio} onChange={handleFieldChange} placeholder="Professional Bio" className="input" rows="3" />
            </div>
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className="section-title text-lg mb-3">Company and Organization Details</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label">Company Name</label>
              <input name="companyName" value={profile.companyName} onChange={handleFieldChange} placeholder="Company Name" className="input" />
            </div>
            <div>
              <label className="label">Company Logo URL</label>
              <input name="companyLogoUrl" value={profile.companyLogoUrl} onChange={handleFieldChange} placeholder="Company Logo URL" className="input" />
            </div>
            <div>
              <label className="label">Company Industry</label>
              <input name="companyIndustry" value={profile.companyIndustry} onChange={handleFieldChange} placeholder="Company Industry" className="input" />
            </div>
            <div>
              <label className="label">Company Website</label>
              <input name="companyWebsite" value={profile.companyWebsite} onChange={handleFieldChange} placeholder="Company Website" className="input" />
            </div>
            <div>
              <label className="label">Company Size</label>
              <input name="companySize" value={profile.companySize} onChange={handleFieldChange} placeholder="Company Size" className="input" />
            </div>
            <div>
              <label className="label">Office Location</label>
              <input name="officeLocation" value={profile.officeLocation} onChange={handleFieldChange} placeholder="Office Location" className="input" />
            </div>
          </div>
          <div className="mt-4">
            <p className="label">Company Logo Preview</p>
            <img
              src={profile.companyLogoUrl || "https://via.placeholder.com/220x100?text=Company+Logo"}
              alt="Company logo preview"
              className="w-56 h-24 object-cover rounded-xl border border-slate-200 bg-white"
            />
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className="section-title text-lg mb-3">Company Branding</h2>
          <p className="subtle mb-3">Update your company logo here. Students will see this logo on job cards.</p>
          <div className="grid md:grid-cols-[minmax(0,1fr)_240px] gap-4 items-start">
            <div>
              <label className="label">Company Logo URL</label>
              <input
                name="companyLogoUrl"
                value={profile.companyLogoUrl}
                onChange={handleFieldChange}
                placeholder="https://your-company.com/logo.png"
                className="input"
              />
              <p className="text-xs text-slate-500 mt-2">
                Tip: Use a direct image URL (png, jpg, webp, svg).
              </p>
            </div>
            <div>
              <p className="label">Live Preview</p>
              <img
                src={profile.companyLogoUrl || "https://via.placeholder.com/220x100?text=Company+Logo"}
                alt="Company logo"
                className="w-full h-24 object-cover rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className="section-title text-lg mb-3">Communication and Hiring Focus</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input name="workEmail" value={profile.workEmail} onChange={handleFieldChange} placeholder="Work Email" className="input" />
            <input name="workPhoneNumber" value={profile.workPhoneNumber} onChange={handleFieldChange} placeholder="Work Phone Number" className="input" />
            <select name="preferredCommunicationMethod" value={profile.preferredCommunicationMethod} onChange={handleFieldChange} className="input">
              <option>In-app messaging</option>
              <option>Email</option>
              <option>LinkedIn</option>
            </select>
            <input name="availabilityResponseTime" value={profile.availabilityResponseTime} onChange={handleFieldChange} placeholder="Availability / Response Time" className="input" />
          </div>
          <div className="grid gap-3">
            <input
              value={hiringDomainsInput}
              onChange={(e) => setHiringDomainsInput(e.target.value)}
              placeholder="Hiring Domains (comma separated)"
              className="input"
            />
            <input
              value={seniorityLevelsInput}
              onChange={(e) => setSeniorityLevelsInput(e.target.value)}
              placeholder="Seniority Levels (comma separated)"
              className="input"
            />
          </div>
        </section>

        <section className={sectionCard}>
          <h2 className="section-title text-lg mb-3">Internal Tools</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <input name="atsId" value={profile.atsId} onChange={handleFieldChange} placeholder="ATS ID" className="input" />
            <select name="subscriptionTier" value={profile.subscriptionTier} onChange={handleFieldChange} className="input">
              <option>Free</option>
              <option>Premium</option>
              <option>Enterprise</option>
            </select>
            <input type="number" name="jobPostingCredits" value={profile.jobPostingCredits} onChange={handleFieldChange} placeholder="Job Posting Credits" className="input" />
            <input value={teamAccessInput} onChange={(e) => setTeamAccessInput(e.target.value)} placeholder="Team Access Emails (comma separated)" className="input" />
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white/70 p-4">
            <p className="font-semibold mb-3">Notification Preferences</p>
            <div className="flex flex-wrap gap-5 text-sm">
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="newApplications" checked={Boolean(profile.notificationPreferences.newApplications)} onChange={handleNotificationChange} />
                New Applications
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="messages" checked={Boolean(profile.notificationPreferences.messages)} onChange={handleNotificationChange} />
                Messages
              </label>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" name="interviewReminders" checked={Boolean(profile.notificationPreferences.interviewReminders)} onChange={handleNotificationChange} />
                Interview Reminders
              </label>
            </div>
          </div>
        </section>

        <button onClick={handleSave} className="btn-primary">Save Recruiter Profile</button>
      </div>
    </div>
  );
}

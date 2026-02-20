import { useEffect, useState } from "react";
import API from "../api/axios";

export default function AccountSettings() {
  const [account, setAccount] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    code: ""
  });
  const [pendingEmailRequest, setPendingEmailRequest] = useState(false);

  const [deleteForm, setDeleteForm] = useState({
    password: "",
    confirmation: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, activityRes] = await Promise.all([
        API.get("/auth/account/settings"),
        API.get("/auth/account/login-activity")
      ]);
      setAccount(settingsRes.data?.data || null);
      setActivity(activityRes.data?.data || []);
    } catch {
      alert("Failed to load account settings");
    } finally {
      setLoading(false);
    }
  };

  const clearSessionAndGoLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  const submitPasswordChange = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/account/change-password", passwordForm);
      alert(res.data?.message || "Password changed");
      clearSessionAndGoLogin();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change password");
    }
  };

  const requestEmailUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/account/request-email-update", {
        newEmail: emailForm.newEmail
      });
      setPendingEmailRequest(true);
      const devCode = res.data?.devVerificationCode;
      alert(devCode ? `Verification code (dev): ${devCode}` : (res.data?.message || "Verification code sent"));
    } catch (error) {
      alert(error.response?.data?.message || "Failed to request email update");
    }
  };

  const verifyEmailUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/account/verify-email-update", { code: emailForm.code });
      alert(res.data?.message || "Email updated");
      setPendingEmailRequest(false);
      setEmailForm({ newEmail: "", code: "" });
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to verify code");
    }
  };

  const logoutAllDevices = async () => {
    const ok = window.confirm("This will log you out from all devices. Continue?");
    if (!ok) return;

    try {
      const res = await API.post("/auth/account/logout-all-devices");
      alert(res.data?.message || "Logged out from all devices");
      clearSessionAndGoLogin();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to logout all devices");
    }
  };

  const deleteAccount = async (e) => {
    e.preventDefault();
    const ok = window.confirm("This action permanently deletes your account and data. Continue?");
    if (!ok) return;

    try {
      const res = await API.delete("/auth/account/delete", { data: deleteForm });
      alert(res.data?.message || "Account deleted");
      clearSessionAndGoLogin();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete account");
    }
  };

  return (
    <div className="app-shell">
      <div className="page-wrap">
        <div className="page-header flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="section-title">Account Settings</h1>
            <p className="subtle">Manage password, email verification, login activity, and account security.</p>
          </div>
          <a href={localStorage.getItem("role") === "recruiter" ? "/recruiter" : "/student"} className="btn-secondary">Back to Dashboard</a>
        </div>

        {loading ? (
          <div className="panel panel-pad">
            <p className="subtle">Loading account settings...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            <div className="panel panel-pad">
              <h2 className="section-title text-lg mb-3">1. Change Password</h2>
              <form onSubmit={submitPasswordChange} className="grid md:grid-cols-3 gap-3">
                <input
                  type="password"
                  placeholder="Current Password"
                  className="input"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="New Password"
                  className="input"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="input"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
                <button className="btn-primary md:col-span-3">Update Password</button>
              </form>
            </div>

            <div className="panel panel-pad">
              <h2 className="section-title text-lg mb-3">2. Update Email (with verification)</h2>
              <p className="text-sm text-slate-600 mb-3">Current email: {account?.email || "Not set"} {account?.emailVerified ? "(Verified)" : "(Not verified)"}</p>
              <form onSubmit={requestEmailUpdate} className="flex flex-wrap gap-3 mb-3">
                <input
                  type="email"
                  placeholder="New email address"
                  className="input max-w-md"
                  value={emailForm.newEmail}
                  onChange={(e) => setEmailForm({ ...emailForm, newEmail: e.target.value })}
                  required
                />
                <button className="btn-primary">Send Verification Code</button>
              </form>

              {(pendingEmailRequest || account?.pendingEmail?.email) && (
                <form onSubmit={verifyEmailUpdate} className="flex flex-wrap gap-3">
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="input max-w-xs"
                    value={emailForm.code}
                    onChange={(e) => setEmailForm({ ...emailForm, code: e.target.value })}
                    required
                  />
                  <button className="btn-success">Verify and Update Email</button>
                </form>
              )}
            </div>

            <div className="panel panel-pad">
              <h2 className="section-title text-lg mb-3">3. Two-Factor Authentication (Future)</h2>
              <p className="text-sm text-slate-600">Status: {account?.twoFactorEnabled ? "Enabled" : "Disabled"}</p>
              <p className="text-sm text-slate-500 mt-1">This is reserved for a future release with authenticator/SMS integration.</p>
            </div>

            <div className="panel panel-pad">
              <h2 className="section-title text-lg mb-3">4. Login Activity History</h2>
              {activity.length === 0 ? (
                <p className="subtle">No login activity found yet.</p>
              ) : (
                activity.map((item, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-3 mb-2">
                    <p className="text-sm text-slate-700"><span className="font-semibold">Time:</span> {item.loggedInAt ? new Date(item.loggedInAt).toLocaleString() : "-"}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold">IP:</span> {item.ip || "unknown"}</p>
                    <p className="text-sm text-slate-600 break-words"><span className="font-semibold">Device:</span> {item.userAgent || "unknown"}</p>
                  </div>
                ))
              )}
            </div>

            <div className="panel panel-pad">
              <h2 className="section-title text-lg mb-3">5. Logout from All Devices</h2>
              <button onClick={logoutAllDevices} className="btn-warning">Logout All Devices</button>
            </div>

            <div className="panel panel-pad border-rose-200">
              <h2 className="section-title text-lg mb-3 text-rose-700">6. Delete Account</h2>
              <p className="text-sm text-slate-600 mb-3">Type <span className="font-semibold">DELETE</span> and your password to permanently remove account and related data.</p>
              <form onSubmit={deleteAccount} className="grid md:grid-cols-3 gap-3">
                <input
                  type="password"
                  className="input"
                  placeholder="Account password"
                  value={deleteForm.password}
                  onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                  required
                />
                <input
                  type="text"
                  className="input"
                  placeholder='Type "DELETE"'
                  value={deleteForm.confirmation}
                  onChange={(e) => setDeleteForm({ ...deleteForm, confirmation: e.target.value })}
                  required
                />
                <button className="btn-danger">Delete Account Permanently</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

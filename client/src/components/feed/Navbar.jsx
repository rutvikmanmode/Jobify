import { Link } from "react-router-dom";

export default function Navbar({ role }) {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  return (
    <header className="panel panel-pad sticky top-3 z-20 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Jobify Feed</h1>
          <p className="text-sm text-slate-500">News and updates from your hiring network</p>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          <Link to="/feed" className="btn-secondary">Feed</Link>
          {role === "student" && <Link to="/student/jobs/available" className="btn-secondary">Available Jobs</Link>}
          {role === "recruiter" && <Link to="/recruiter/analytics" className="btn-secondary">Recruiter Analytics</Link>}
          {role === "recruiter" && <Link to="/recruiter/jobs" className="btn-secondary">Manage Jobs</Link>}
          <Link to="/messages" className="btn-secondary">Messages</Link>
          <button type="button" onClick={handleLogout} className="btn-danger">Logout</button>
        </nav>
      </div>
    </header>
  );
}

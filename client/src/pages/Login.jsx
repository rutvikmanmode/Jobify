import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const cleanIdentifier = identifier.trim();
      const res = await API.post("/auth/login", {
        identifier: cleanIdentifier,
        email: cleanIdentifier.includes("@") ? cleanIdentifier : "",
        phone: cleanIdentifier.includes("@") ? "" : cleanIdentifier,
        password
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userId", res.data.user.id || res.data.user._id || "");

      navigate("/feed");
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="app-shell">
      <div className="page-wrap min-h-screen flex items-center justify-center">
        <div className="grid lg:grid-cols-2 gap-0 panel overflow-hidden w-full max-w-5xl">
          <div className="hidden lg:flex flex-col justify-between bg-slate-900 text-white p-10">
            <div>
              <p className="text-sm uppercase tracking-wider text-slate-300">Jobify</p>
              <h1 className="text-4xl font-extrabold mt-3 leading-tight">
                Your Career,
                <br />
                One Smart Dashboard
              </h1>
              <p className="mt-4 text-slate-300">
                Discover jobs, track applications, connect with recruiters, and schedule interviews in one place.
              </p>
            </div>
            <div className="text-sm text-slate-400">Built for students and hiring teams.</div>
          </div>

          <div className="panel-pad md:p-10">
            <h2 className="section-title">Welcome back</h2>
            <p className="subtle mt-1">Sign in to continue to your dashboard.</p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div>
                <label className="label">Email or Phone</label>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="you@example.com or +1..."
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="flex gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="input"
                    required
                  />
                  <button
                    type="button"
                    className="px-3 border border-slate-300 rounded-xl text-sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <button className="btn-primary w-full">Login</button>
            </form>

            <p className="text-sm mt-5 text-center text-slate-600">
              Don&apos;t have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-700 font-semibold"
                type="button"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

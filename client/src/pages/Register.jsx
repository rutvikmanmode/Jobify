import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "student"
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.email.trim() && !form.phone.trim()) {
      alert("Enter at least an email or phone number");
      return;
    }
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await API.post("/auth/register", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("userId", res.data.user.id || res.data.user._id || "");

      if (res.data.user.role === "student") {
        navigate("/student");
      } else {
        navigate("/recruiter");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="app-shell">
      <div className="page-wrap min-h-screen flex items-center justify-center">
        <div className="panel panel-pad w-full max-w-xl md:p-10">
          <h2 className="section-title">Create your account</h2>
          <p className="subtle mt-1">Join as a student or recruiter.</p>

          <form onSubmit={handleRegister} className="mt-6 space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="label">Phone Number</label>
              <input
                type="tel"
                className="input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 555 123 4567"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="flex gap-2">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a secure password"
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

            <div>
              <label className="label">Confirm Password</label>
              <div className="flex gap-2">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className="input"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  className="px-3 border border-slate-300 rounded-xl text-sm"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Role</label>
              <select
                className="input"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <button className="btn-primary w-full">Create Account</button>
          </form>

          <p className="text-sm mt-5 text-center text-slate-600">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-700 font-semibold"
              type="button"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


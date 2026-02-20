import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { animated, useSpring } from "@react-spring/web";

import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import StudentResumeCenter from "./pages/StudentResumeCenter";
import StudentResumeHistory from "./pages/StudentResumeHistory";
import StudentRecommendedJobs from "./pages/StudentRecommendedJobs";
import StudentApplications from "./pages/StudentApplications";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import RecruiterJobManagement from "./pages/RecruiterJobManagement";
import ProtectedRoute from "./components/ProtectedRoute";
import Profile from "./pages/Profile";
import RecruiterProfile from "./pages/RecruiterProfile";
import CompanyProfile from "./pages/CompanyProfile";
import Messages from "./pages/Messages";
import AccountSettings from "./pages/AccountSettings";
import ApplicationSettings from "./pages/ApplicationSettings";
import LandingPage from "./pages/LandingPage";
import CornerLogo from "./components/CornerLogo";
import InfoPage from "./pages/InfoPage";

function AnimatedAppRoutes() {
  const location = useLocation();
  const [pageMotion] = useSpring(() => ({
    from: { opacity: 0 },
    to: { opacity: 1 },
    reset: true,
    config: { tension: 220, friction: 26 }
  }), [location.pathname]);

  return (
    <animated.div style={pageMotion}>
      <Routes location={location}>

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/info" element={<InfoPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Route */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/resume-center"
          element={
            <ProtectedRoute role="student">
              <StudentResumeCenter />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/resume-history"
          element={
            <ProtectedRoute role="student">
              <StudentResumeHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/recommended"
          element={
            <ProtectedRoute role="student">
              <StudentRecommendedJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/student/applications"
          element={
            <ProtectedRoute role="student">
              <StudentApplications />
            </ProtectedRoute>
          }
        />

        {/* Recruiter Route */}
        <Route
          path="/recruiter"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/jobs"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterJobManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recruiter/profile"
          element={
            <ProtectedRoute role="recruiter">
              <RecruiterProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute role="student">
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:companyName"
          element={
            <ProtectedRoute>
              <CompanyProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <Messages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account-settings"
          element={
            <ProtectedRoute>
              <AccountSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/app-settings"
          element={
            <ProtectedRoute>
              <ApplicationSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
    </animated.div>
  );
}

export default function App() {
  return (
    <Router>
      <CornerLogo />
      <AnimatedAppRoutes />
    </Router>
  );
}

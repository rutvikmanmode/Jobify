import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { animated, useTransition } from "@react-spring/web";
import API from "../api/axios";
import { toServerAssetUrl } from "../utils/apiBase";

const menuItems = [
  { key: "feed", label: "Available Jobs Feed", to: "/student" },
  { key: "resumeCenter", label: "Resume Center", to: "/student/resume-center" },
  { key: "resumeHistory", label: "Resume History", to: "/student/resume-history" },
  { key: "recommended", label: "Recommended Jobs", to: "/student/recommended" },
  { key: "applications", label: "My Applications", to: "/student/applications" },
  { key: "messages", label: "Messages", to: "/messages" },
  { key: "appSettings", label: "Application Settings", to: "/app-settings" },
  { key: "account", label: "Account Settings", to: "/account-settings" }
];

export default function StudentLayout({ title, subtitle, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await API.get("/profile/me");
        setProfile(res.data?.data || null);
      } catch {
        setProfile(null);
      }
    };

    const loadUnread = async () => {
      try {
        const res = await API.get("/messages/conversations");
        const list = res.data?.data || [];
        const totalUnread = list.reduce((sum, item) => sum + Number(item.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch {
        setUnreadCount(0);
      }
    };

    loadProfile();
    loadUnread();
    const timer = setInterval(loadUnread, 15000);
    return () => clearInterval(timer);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    window.location.href = "/";
  };

  const unreadLabel = unreadCount > 99 ? "99+" : String(unreadCount);
  const menuTransition = useTransition(menuOpen, {
    from: {
      overlayOpacity: 0,
      menuX: "-100%"
    },
    enter: {
      overlayOpacity: 1,
      menuX: "0%"
    },
    leave: {
      overlayOpacity: 0,
      menuX: "-100%"
    },
    config: { mass: 0.75, tension: 340, friction: 22, clamp: true }
  });

  return (
    <div className="app-shell">
      <div className="page-wrap">
        <div className="page-header flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="btn-secondary !px-3 !py-2"
              aria-label="Open side menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            </button>
            <div>
              <h1 className="section-title">{title}</h1>
              {subtitle ? <p className="subtle">{subtitle}</p> : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/messages"
              className="relative flex items-center justify-center w-11 h-11 rounded-xl border border-slate-200 bg-white hover:border-slate-300 text-slate-700"
              title="Open Messages"
              aria-label="Open Messages"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-rose-600 text-white text-[10px] leading-[1.15rem] text-center font-bold">
                  {unreadLabel}
                </span>
              )}
            </Link>

            <Link to="/profile" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 hover:border-slate-300">
              <img
                src={profile?.profilePhoto ? toServerAssetUrl(profile.profilePhoto) : "https://via.placeholder.com/80"}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div className="text-left hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{profile?.name || "My Profile"}</p>
                <p className="text-xs text-slate-500">Open Profile</p>
              </div>
            </Link>
          </div>
        </div>

        {children}
      </div>

      {menuTransition((style, open) =>
        open ? (
          <div className="fixed inset-0 z-50">
            <animated.button
              type="button"
              aria-label="Close menu overlay"
              onClick={() => setMenuOpen(false)}
              className="absolute inset-0 bg-black/40"
              style={{ opacity: style.overlayOpacity }}
            />
            <animated.aside
              className="absolute left-0 top-16 h-[calc(100%-4rem)] w-[86%] max-w-xs panel panel-pad rounded-r-2xl border-r border-slate-200 overflow-y-auto"
              style={{ transform: style.menuX.to((x) => `translate3d(${x},0,0)`) }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="section-title text-lg">Side Menu</h2>
                <button type="button" className="side-menu-ripple-btn side-menu-ripple-btn-compact" onClick={() => setMenuOpen(false)}>
                  <span>X</span>
                  <span className="animation" aria-hidden="true" />
                </button>
              </div>

              <div className="grid gap-2">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.to;
                  return (
                    <Link
                      key={item.key}
                      to={item.to}
                      onClick={() => setMenuOpen(false)}
                      className={`side-menu-ripple-btn ${isActive ? "is-active" : ""}`}
                    >
                      <span>{item.label}</span>
                      <span className="animation" aria-hidden="true" />
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200">
                <button type="button" onClick={handleLogout} className="btn-danger w-full">
                  Logout
                </button>
              </div>
            </animated.aside>
          </div>
        ) : null
      )}
    </div>
  );
}

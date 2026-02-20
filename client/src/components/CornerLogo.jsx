import appLogo from "../assets/logo1.png";
import { Link, useLocation } from "react-router-dom";

export default function CornerLogo() {
  const location = useLocation();
  const role = localStorage.getItem("role");
  const homePath = role === "student" ? "/student" : role === "recruiter" ? "/recruiter" : "/";
  const isStaticLogoPage = location.pathname === "/" || location.pathname === "/info";

  return (
    <div className="pointer-events-none fixed left-2 top-2 z-[60] sm:left-3 sm:top-3">
      {isStaticLogoPage ? (
        <img
          src={appLogo}
          alt="Jobify logo"
          className="h-9 w-auto object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.28)] sm:h-11 md:h-12"
        />
      ) : (
        <Link to={homePath} className="pointer-events-auto inline-block" aria-label="Go to dashboard">
          <img
            src={appLogo}
            alt="Jobify logo"
            className="h-9 w-auto object-contain drop-shadow-[0_4px_14px_rgba(0,0,0,0.28)] sm:h-11 md:h-12"
          />
        </Link>
      )}
    </div>
  );
}

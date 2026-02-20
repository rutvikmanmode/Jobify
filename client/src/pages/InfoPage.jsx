import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

const sections = [
  {
    id: "about-us",
    title: "About Us",
    category: "Company",
    body: [
      "Jobify is a modern hiring platform built to simplify the way students and recruiters connect.",
      "Founded by Rutvik Sanjay Manmode, a Computer Science engineer from VIT Bhopal, Jobify was created to solve real-world hiring inefficiencies experienced by both job seekers and recruiters.",
      "Traditional hiring is fragmented: job posting on one platform, communication on another, tracking on spreadsheets, interviews managed separately.",
      "Jobify brings everything into one structured, intelligent ecosystem.",
      "Our mission is simple: Make hiring faster, smarter, and more human.",
    ],
    bullets: [
      "Transparent application tracking",
      "Real-time recruiter-candidate communication",
      "Streamlined interview scheduling",
      "Actionable hiring analytics",
    ],
  },
  {
    id: "careers",
    title: "Careers",
    category: "Company",
    body: [
      "We are building the future of structured hiring.",
      "If you are passionate about building impactful technology in the recruitment space, we would love to hear from you.",
      "Contact: careers@jobify.com",
    ],
    bullets: [
      "Clean engineering practices",
      "Scalable system design",
      "Data-driven product thinking",
      "User-first experiences",
    ],
  },
  {
    id: "press",
    title: "Press",
    category: "Company",
    body: [
      "Jobify is an emerging recruitment technology platform focused on bridging the gap between early talent and hiring teams.",
      "For press and media inquiries: press@jobify.com",
    ],
  },
  {
    id: "blog",
    title: "Blog",
    category: "Company",
    body: [
      "Our blog shares practical, research-driven content for both recruiters and candidates.",
    ],
    bullets: [
      "Hiring trends",
      "Student career preparation",
      "Recruitment analytics",
      "Interview best practices",
      "Engineering and system design",
    ],
  },
  {
    id: "for-students",
    title: "For Students",
    category: "Platform",
    body: [
      "Jobify empowers students with clear visibility into their hiring journey - no uncertainty, no silence.",
    ],
    bullets: [
      "Access to verified job opportunities",
      "Clear application status tracking",
      "Direct communication with recruiters",
      "Structured interview scheduling",
      "Secure document sharing",
    ],
  },
  {
    id: "for-recruiters",
    title: "For Recruiters",
    category: "Platform",
    body: [
      "Reduce time-to-hire. Improve decision-making. Hire smarter.",
    ],
    bullets: [
      "Centralized applicant tracking",
      "Hiring funnel visualization",
      "Real-time candidate messaging",
      "Interview scheduling tools",
      "Performance analytics dashboard",
    ],
  },
  {
    id: "features",
    title: "Features",
    category: "Platform",
    bullets: [
      "End-to-end Application Management",
      "Built-in Messaging System",
      "Interview Scheduling and Tracking",
      "Hiring Funnel Analytics",
      "Job Performance Metrics",
      "File and Resume Sharing",
      "Role-Based Secure Access",
      "Recruiter Productivity Insights",
      "Everything recruiters need without switching tools.",
    ],
  },
  {
    id: "pricing",
    title: "Pricing",
    category: "Platform",
    body: ["Contact sales for enterprise pricing."],
    planBlocks: [
      {
        name: "Free Plan",
        points: ["1 active job posting", "Basic messaging", "Limited applicant tracking"],
      },
      {
        name: "Professional Plan",
        points: [
          "Unlimited job postings",
          "Advanced analytics dashboard",
          "Interview scheduling tools",
          "Priority support",
        ],
      },
      {
        name: "Enterprise Plan",
        points: ["API access", "Custom integrations", "Dedicated onboarding", "Advanced reporting and insights"],
      },
    ],
  },
  {
    id: "privacy-policy",
    title: "Privacy Policy",
    category: "Legal",
    body: [
      "At Jobify, user privacy is a priority.",
      "We do not sell user data to third parties.",
      "All data is securely stored and access-controlled.",
      "For privacy inquiries: privacy@jobify.com",
    ],
    bullets: ["Account information", "Job application data", "Communication history", "Platform usage metrics"],
  },
  {
    id: "terms-of-service",
    title: "Terms of Service",
    category: "Legal",
    body: ["Violation may result in account suspension."],
    bullets: [
      "Provide accurate information",
      "Use the platform ethically",
      "Respect professional communication standards",
      "Avoid misuse of applicant or recruiter data",
    ],
  },
  {
    id: "cookie-policy",
    title: "Cookie Policy",
    category: "Legal",
    body: ["Users may control cookies through browser settings."],
    bullets: ["Maintain secure sessions", "Improve platform performance", "Analyze usage trends"],
  },
  {
    id: "gdpr",
    title: "GDPR",
    category: "Legal",
    body: [
      "Jobify complies with global data protection standards.",
      "For GDPR-related requests: gdpr@jobify.com",
    ],
    bullets: ["Access their data", "Request correction", "Request deletion", "Request data portability"],
  },
  {
    id: "help-center",
    title: "Help Center",
    category: "Support",
    body: [
      "The Jobify Help Center provides guidance to ensure smooth onboarding for all users.",
    ],
    bullets: [
      "Creating job listings",
      "Managing applications",
      "Scheduling interviews",
      "Using analytics dashboards",
      "Messaging and communication",
    ],
  },
  {
    id: "contact-us",
    title: "Contact Us",
    category: "Support",
    body: [
      "General Support: support@jobify.com",
      "Business and Partnerships: business@jobify.com",
      "Founder: Rutvik Sanjay Manmode, B.Tech Computer Science, BIT Bhopal",
    ],
  },
  {
    id: "status",
    title: "Status",
    category: "Support",
    body: [
      "Jobify infrastructure is continuously monitored to ensure high availability and reliability.",
      "Live system status and uptime reports are available through our status portal.",
    ],
  },
  {
    id: "api-docs",
    title: "API Docs",
    category: "Support",
    body: [
      "Jobify provides secure REST APIs for core platform features.",
      "Authentication is handled via JWT-based authorization.",
    ],
    bullets: ["Job management", "Application tracking", "Messaging", "Interview scheduling", "Analytics data retrieval"],
  },
];

const categories = ["Company", "Platform", "Legal", "Support"];

export default function InfoPage() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace("#", "");
    const target = document.getElementById(id);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Jobify</p>
            <h1 className="text-xl font-bold text-slate-900">Company, Platform, Legal and Support</h1>
          </div>
          <Link to="/" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
            Back to Home
          </Link>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">Quick Links</p>
          <div className="space-y-3">
            {categories.map((category) => (
              <div key={category}>
                <p className="mb-1 text-xs font-bold uppercase tracking-wide text-slate-500">{category}</p>
                <ul className="space-y-1">
                  {sections
                    .filter((section) => section.category === category)
                    .map((section) => (
                      <li key={section.id}>
                        <a href={`#${section.id}`} className="text-sm text-slate-700 hover:text-blue-700">
                          {section.title}
                        </a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <section className="space-y-4">
          {sections.map((section) => (
            <article id={section.id} key={section.id} className="rounded-2xl border border-slate-200 bg-white p-6">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{section.category}</p>
              <h2 className="mb-3 text-2xl font-bold text-slate-900">{section.title}</h2>

              {section.body?.map((line) => (
                <p key={line} className="mb-2 text-sm leading-6 text-slate-700">
                  {line}
                </p>
              ))}

              {section.bullets?.length ? (
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}

              {section.planBlocks?.length ? (
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {section.planBlocks.map((plan) => (
                    <div key={plan.name} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <h3 className="mb-2 text-sm font-bold text-slate-900">{plan.name}</h3>
                      <ul className="list-disc space-y-1 pl-4 text-sm text-slate-700">
                        {plan.points.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

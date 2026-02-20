import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle,
  Crosshair,
  FileText,
  Filter,
  Github,
  GraduationCap,
  LayoutDashboard,
  Linkedin,
  Mail,
  MapPin,
  Menu,
  Phone,
  Quote,
  Rocket,
  Send,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Twitter,
  Upload,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import heroIllustration from "../assets/hero-illustration.png";

const features = [
  {
    icon: FileText,
    title: "AI Resume Parsing",
    description:
      "Automatically extracts skills, experience, and education from PDF, DOCX, and text resumes.",
    gradient: "gradient-primary",
  },
  {
    icon: Zap,
    title: "Smart Skill Matching",
    description:
      "Ranks candidates by skill relevance and experience fit so hiring teams shortlist faster.",
    gradient: "gradient-accent",
  },
  {
    icon: LayoutDashboard,
    title: "Recruiter Dashboard",
    description:
      "Manage jobs, candidates, interviews, and pipeline activity in a single workspace.",
    gradient: "gradient-primary",
  },
  {
    icon: TrendingUp,
    title: "Hiring Analytics",
    description:
      "Track conversion, time-to-hire, and candidate quality to improve each hiring cycle.",
    gradient: "gradient-accent",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts",
    description:
      "Get instant updates for new matches, application status changes, and interview events.",
    gradient: "gradient-primary",
  },
];

const steps = [
  { icon: Upload, title: "Upload Your Resume", description: "Upload once and let AI parse your profile instantly.", gradient: "gradient-primary" },
  { icon: Crosshair, title: "Get Matched", description: "Receive role recommendations based on your skills.", gradient: "gradient-accent" },
  { icon: Send, title: "Apply Quickly", description: "Submit job applications in a few clicks.", gradient: "gradient-primary" },
  { icon: Trophy, title: "Get Hired", description: "Track progress and land interviews faster.", gradient: "gradient-accent" },
];

const studentBenefits = [
  { icon: BookOpen, title: "Smart Resume Analysis", description: "Build a skill profile automatically." },
  { icon: Star, title: "Personalized Job Matches", description: "See opportunities that fit your strengths." },
  { icon: Rocket, title: "One-Click Applications", description: "Apply across roles with your profile." },
];

const recruiterBenefits = [
  { icon: Filter, title: "Candidate Ranking", description: "Prioritize candidates by actual skill fit." },
  { icon: UserCheck, title: "Verified Profiles", description: "Review clearer candidate strengths and gaps." },
  { icon: TrendingUp, title: "Pipeline Insights", description: "Measure and optimize hiring outcomes." },
];

const stats = [
  { icon: Briefcase, value: 125000, suffix: "+", label: "Jobs Posted", color: "text-secondary" },
  { icon: Users, value: 850000, suffix: "+", label: "Candidates Matched", color: "text-accent" },
  { icon: Building2, value: 12000, suffix: "+", label: "Companies Registered", color: "text-secondary" },
  { icon: TrendingUp, value: 94, suffix: "%", label: "Match Accuracy", color: "text-accent" },
];

const faqs = [
  {
    question: "How does Jobify parse resumes?",
    answer:
      "Jobify uses NLP to extract experience, projects, skills, and education into a structured candidate profile.",
  },
  {
    question: "Is Jobify free for students?",
    answer:
      "Yes, students can create profiles, discover matched jobs, and apply without a paid plan.",
  },
  {
    question: "How accurate is matching?",
    answer:
      "Matching emphasizes skill relevance and role requirements, improving shortlisting quality over keyword-only filtering.",
  },
  {
    question: "Can recruiters discover candidates?",
    answer:
      "Yes. Visibility controls let candidates opt in while recruiters can search and rank qualified profiles.",
  },
];

const testimonials = [
  {
    name: "Aisha Patel",
    role: "Software Engineer",
    company: "Google",
    avatar: "AP",
    avatarBg: "gradient-primary",
    text: "Jobify surfaced matching internships in under two weeks and the recommendations were highly relevant.",
  },
  {
    name: "Marcus Johnson",
    role: "HR Director",
    company: "TechCorp",
    avatar: "MJ",
    avatarBg: "gradient-accent",
    text: "Our hiring cycle got much shorter because candidate ranking helped us interview stronger profiles first.",
  },
  {
    name: "Priya Sharma",
    role: "Data Science Student",
    company: "IIT Mumbai",
    avatar: "PS",
    avatarBg: "gradient-primary",
    text: "I got better internship matches in my first week than with any other portal I tried.",
  },
];

const footerLinks = {
  Company: [
    { label: "About Us", href: "/info#about-us" },
    { label: "Careers", href: "/info#careers" },
    { label: "Press", href: "/info#press" },
    { label: "Blog", href: "/info#blog" },
  ],
  Platform: [
    { label: "For Students", href: "/info#for-students" },
    { label: "For Recruiters", href: "/info#for-recruiters" },
    { label: "Features", href: "/info#features" },
    { label: "Pricing", href: "/info#pricing" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "/info#privacy-policy" },
    { label: "Terms of Service", href: "/info#terms-of-service" },
    { label: "Cookie Policy", href: "/info#cookie-policy" },
    { label: "GDPR", href: "/info#gdpr" },
  ],
  Support: [
    { label: "Help Center", href: "/info#help-center" },
    { label: "Contact Us", href: "/info#contact-us" },
    { label: "Status", href: "/info#status" },
    { label: "API Docs", href: "/info#api-docs" },
  ],
};

function useCountUp(target, duration, active) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const increment = target / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [active, duration, target]);

  return count;
}

function formatNumber(value) {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${Math.round(value / 1000)}K`;
  return `${value}`;
}

function StatCard({ stat, active }) {
  const count = useCountUp(stat.value, 2000, active);
  const Icon = stat.icon;

  return (
    <div className="text-center">
      <div className="gradient-primary shadow-blue mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl">
        <Icon size={24} className="text-white" />
      </div>
      <div className={`font-display mb-1 text-4xl font-bold md:text-5xl ${stat.color}`}>
        {formatNumber(count)}
        {stat.suffix}
      </div>
      <p className="font-medium text-white/75">{stat.label}</p>
    </div>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white/95 py-3 shadow-md backdrop-blur-md" : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="w-24 sm:w-28" aria-hidden="true" />

        <div className="hidden items-center gap-6 md:flex">
          <a href="#features" className={`text-sm font-medium ${scrolled ? "text-foreground hover:text-secondary" : "text-white/90 hover:text-white"}`}>
            Features
          </a>
          <a href="#how-it-works" className={`text-sm font-medium ${scrolled ? "text-foreground hover:text-secondary" : "text-white/90 hover:text-white"}`}>
            How It Works
          </a>
          <a href="#students" className={`text-sm font-medium ${scrolled ? "text-foreground hover:text-secondary" : "text-white/90 hover:text-white"}`}>
            For Students
          </a>
          <a href="#recruiters" className={`text-sm font-medium ${scrolled ? "text-foreground hover:text-secondary" : "text-white/90 hover:text-white"}`}>
            For Recruiters
          </a>
          <a href="#faq" className={`text-sm font-medium ${scrolled ? "text-foreground hover:text-secondary" : "text-white/90 hover:text-white"}`}>
            FAQ
          </a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              scrolled ? "text-primary hover:bg-muted" : "text-white hover:bg-white/10"
            }`}
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="gradient-accent rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-green transition-all hover:scale-105 hover:opacity-90"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`rounded-lg p-2 md:hidden ${
            scrolled ? "text-foreground hover:bg-muted" : "text-white hover:bg-white/10"
          }`}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3 border-t border-border bg-white px-4 py-4 shadow-lg md:hidden">
          <a href="#features" className="block border-b border-border py-2 text-sm font-medium text-foreground hover:text-secondary" onClick={() => setIsOpen(false)}>
            Features
          </a>
          <a href="#how-it-works" className="block border-b border-border py-2 text-sm font-medium text-foreground hover:text-secondary" onClick={() => setIsOpen(false)}>
            How It Works
          </a>
          <a href="#students" className="block border-b border-border py-2 text-sm font-medium text-foreground hover:text-secondary" onClick={() => setIsOpen(false)}>
            For Students
          </a>
          <a href="#recruiters" className="block border-b border-border py-2 text-sm font-medium text-foreground hover:text-secondary" onClick={() => setIsOpen(false)}>
            For Recruiters
          </a>
          <Link to="/login" className="block rounded-lg border border-primary px-4 py-2.5 text-center text-sm font-semibold text-primary">
            Sign In
          </Link>
          <Link to="/register" className="gradient-accent block rounded-lg px-4 py-2.5 text-center text-sm font-semibold text-white">
            Get Started
          </Link>
        </div>
      )}
    </nav>
  );
}

function LandingPage() {
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStatsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="gradient-hero relative flex min-h-screen items-center overflow-hidden pt-20">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-blue-brand/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-green-brand/10 blur-3xl" />
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="animate-fade-in space-y-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
                <Sparkles size={14} className="text-green-brand" />
                <span>AI-Powered Smart Hiring Platform</span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Powering the Next Generation of Hiring
              </h1>

              <p className="max-w-lg text-lg leading-relaxed text-white/80 md:text-xl">
                Jobify connects students and recruiters through resume parsing and skill-based matching.
              </p>

              <div className="flex flex-col gap-3 text-sm text-white/70 sm:flex-row">
                {[
                  "Resume Parsing",
                  "Skill Matching",
                  "Real-Time Alerts",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={14} className="text-green-brand" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Link to="/register" className="gradient-accent inline-flex items-center justify-center gap-2 rounded-xl px-7 py-3.5 font-semibold text-white shadow-green transition-all hover:scale-105 hover:opacity-90">
                  Get Started Free
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/15 px-7 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/25">
                  Sign In
                </Link>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute -left-4 -top-6 z-10 rounded-2xl bg-white p-3 shadow-lg animate-float">
                <p className="text-xs font-semibold text-foreground">AI Match Score</p>
                <p className="text-sm font-bold text-green-brand">94% Match</p>
              </div>

              <div className="absolute -bottom-4 -right-4 z-10 rounded-2xl bg-white p-3 shadow-lg animate-float-delay">
                <p className="text-xs font-semibold text-foreground">New Applications</p>
                <p className="text-sm font-bold text-secondary">+128 Today</p>
              </div>

              <div className="animate-float relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-sm">
                <img src={heroIllustration} alt="AI hiring dashboard" className="w-full max-w-lg rounded-2xl" />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80L1440 80L1440 20C1200 70 960 90 720 60C480 30 240 10 0 40L0 80Z" fill="white" />
          </svg>
        </div>
      </section>

      <section id="features" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">Platform Features</span>
            <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Everything You Need to Hire <span className="text-gradient-primary">Smarter</span>
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-blue">
                  <div className="relative z-10">
                    <div className={`${feature.gradient} mb-4 flex h-12 w-12 items-center justify-center rounded-xl shadow-md transition-transform duration-300 group-hover:scale-110`}>
                      <Icon size={22} className="text-white" />
                    </div>
                    <h3 className="font-display mb-2 text-lg font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="gradient-section py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">Simple Process</span>
            <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">From Resume to Hired in 4 Steps</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="text-center">
                  <div className={`${step.gradient} relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg`}>
                    <Icon size={28} className="text-white" />
                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary shadow-md">{index + 1}</div>
                  </div>
                  <h3 className="font-display mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            <div id="students" className="gradient-primary relative overflow-hidden rounded-3xl p-8 text-white md:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-4 py-1.5 text-sm font-medium">
                <GraduationCap size={14} />
                For Students
              </div>
              <h2 className="font-display mb-3 text-2xl font-bold md:text-3xl">Land Your Next Opportunity</h2>
              <p className="mb-8 text-white/80">Build a profile once and get matched to relevant roles.</p>
              <div className="mb-8 space-y-4">
                {studentBenefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{benefit.title}</h4>
                        <p className="text-sm text-white/70">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-semibold text-primary transition-all hover:scale-105 hover:bg-white/90">
                Create Student Profile
                <ArrowRight size={16} />
              </Link>
            </div>

            <div id="recruiters" className="rounded-3xl border border-border bg-gradient-to-br from-accent/5 via-white to-secondary/5 p-8 md:p-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">
                <Building2 size={14} />
                For Recruiters
              </div>
              <h2 className="font-display mb-3 text-2xl font-bold text-foreground md:text-3xl">Find Qualified Talent Faster</h2>
              <p className="mb-8 text-muted-foreground">Prioritize candidates with better skill-level fit.</p>
              <div className="mb-8 space-y-4">
                {recruiterBenefits.map((benefit) => {
                  const Icon = benefit.icon;
                  return (
                    <div key={benefit.title} className="flex items-start gap-4">
                      <div className="gradient-accent flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link to="/register" className="gradient-accent inline-flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-green transition-all hover:scale-105 hover:opacity-90">
                Post a Job
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="gradient-hero relative overflow-hidden py-20" ref={statsRef}>
        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center text-white">
            <span className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1.5 text-sm font-semibold text-green-brand">Platform Stats</span>
            <h2 className="font-display mb-4 text-3xl font-bold md:text-4xl">Trusted by Thousands Worldwide</h2>
          </div>

          <div className="grid grid-cols-2 gap-8 md:gap-12 lg:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} active={statsVisible} />
            ))}
          </div>
        </div>
      </section>

      <section className="gradient-section py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-semibold text-secondary">Testimonials</span>
            <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">Loved by Students and Recruiters</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="group rounded-2xl border border-border bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-blue">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={`${testimonial.name}-${i}`} size={14} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <Quote size={24} className="text-muted-foreground/30" />
                </div>
                <p className="mb-6 text-sm italic leading-relaxed text-muted-foreground">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`${testimonial.avatarBg} flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white`}>
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role} - {testimonial.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <span className="mb-4 inline-block rounded-full bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent">FAQ</span>
            <h2 className="font-display mb-4 text-3xl font-bold text-foreground md:text-4xl">Frequently Asked Questions</h2>
          </div>

          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((faq) => (
              <details key={faq.question} className="overflow-hidden rounded-xl border border-border bg-white px-6 shadow-sm">
                <summary className="cursor-pointer py-5 font-semibold text-foreground">{faq.question}</summary>
                <p className="pb-5 leading-relaxed text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="gradient-hero text-white">
        <div className="border-b border-white/10">
          <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col items-center justify-between gap-6 rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur-sm md:flex-row md:p-8">
              <div>
                <h3 className="font-display mb-1 text-xl font-bold">Stay Ahead in Your Career</h3>
                <p className="text-sm text-white/70">Get weekly job alerts and hiring insights.</p>
              </div>
              <div className="flex w-full gap-2 md:w-auto">
                <input type="email" placeholder="Enter your email" className="w-full flex-1 rounded-lg border border-white/20 bg-white/15 px-4 py-2.5 text-sm text-white placeholder:text-white/50 focus:outline-none md:w-64" />
                <button type="button" className="gradient-accent flex flex-shrink-0 items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-all hover:scale-105 hover:opacity-90">
                  Subscribe
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-14">
          <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
            <div className="col-span-2">
              <a href="#" className="mb-4 inline-flex items-center gap-2 text-xl font-bold text-white">
                Jobify
              </a>
              <p className="mb-6 max-w-xs text-sm leading-relaxed text-white/70">
                AI-powered hiring platform connecting students and recruiters through intelligent skill matching.
              </p>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Mail size={14} className="text-green-brand" />
                  <span>hello@jobify.com</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Phone size={14} className="text-green-brand" />
                  <span>+1 (800) JOB-IFYX</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin size={14} className="text-green-brand" />
                  <span>San Francisco, CA 94105</span>
                </div>
              </div>
            </div>

            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 className="mb-4 font-semibold text-white">{category}</h4>
                <ul className="space-y-2.5">
                  {links.map((item) => (
                    <li key={item.label}>
                      <Link to={item.href} className="inline-block text-sm text-white/65 transition-colors hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-5 sm:flex-row">
            <p className="text-sm text-white/50">© {new Date().getFullYear()} Jobify Inc. All rights reserved.</p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.linkedin.com/in/rutvik-manmode-740942251?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-all hover:scale-110 hover:bg-white/20 hover:text-white"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="https://x.com/Rutvikmanmode"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-all hover:scale-110 hover:bg-white/20 hover:text-white"
              >
                <X size={15} />
              </a>
              <a
                href="https://github.com/rutvikmanmode"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/70 transition-all hover:scale-110 hover:bg-white/20 hover:text-white"
              >
                <Github size={15} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;


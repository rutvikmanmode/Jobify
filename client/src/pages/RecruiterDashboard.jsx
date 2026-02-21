import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import RecruiterLayout from "../components/RecruiterLayout";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  Treemap,
  XAxis,
  YAxis
} from "recharts";

function SectionHeader({ step, title, subtitle }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <div className="mb-1 inline-flex items-center gap-2">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">{step}</span>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        </div>
        {subtitle ? <p className="text-xs text-slate-500">{subtitle}</p> : null}
      </div>
    </div>
  );
}

function RevealOnScroll({ children, delay = 0 }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(24px)",
        transition: `opacity 520ms ease ${delay}ms, transform 520ms ease ${delay}ms`
      }}
    >
      {children}
    </div>
  );
}

function NoData() {
  return <p className="subtle rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">No data available yet</p>;
}

function FunnelRadarChart({ title, items }) {
  const data = items.map((item) => ({ stage: String(item.label), count: Number(item.value || 0) }));

  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="01" title={title} subtitle="Stage-wise candidate movement through the funnel" />
      {data.length === 0 ? (
        <NoData />
      ) : (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data} margin={{ top: 16, right: 20, bottom: 16, left: 20 }}>
              <PolarGrid stroke="#cbd5e1" />
              <PolarAngleAxis dataKey="stage" tick={{ fill: "#334155", fontSize: 12 }} />
              <PolarRadiusAxis tick={{ fill: "#64748b", fontSize: 11 }} />
              <Tooltip />
              <Radar name="Applications" dataKey="count" stroke="#0f766e" fill="#14b8a6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function DropOffLineChart({ items }) {
  const data = items.map((item) => ({
    stage: `${item.from} -> ${item.to}`,
    rate: Number(item.dropOffRate || 0)
  }));

  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="02" title="Funnel Drop-off Rate" subtitle="Loss percentage between consecutive stages" />
      {data.length === 0 ? (
        <NoData />
      ) : (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="stage" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis unit="%" tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip formatter={(value) => [`${value}%`, "Drop-off"]} />
              <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function TimeToHireBarChart({ metrics }) {
  const data = [
    { metric: "App->Shortlist", days: Number(metrics?.averageApplicationToShortlistDays || 0) },
    { metric: "Shortlist->Interview", days: Number(metrics?.averageShortlistToInterviewDays || 0) },
    { metric: "Interview->Decision", days: Number(metrics?.averageInterviewToDecisionDays || 0) },
    { metric: "Overall", days: Number(metrics?.overallHiringDurationDays || 0) }
  ];

  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="03" title="Time-to-Hire Metrics" subtitle="Average process duration in days" />
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 18, bottom: 8, left: 18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} />
            <YAxis type="category" dataKey="metric" width={120} tick={{ fontSize: 11, fill: "#475569" }} />
            <Tooltip formatter={(value) => [`${value} days`, "Time"]} />
            <Bar dataKey="days" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function ApplicantsBarChart({ items }) {
  const data = items.map((item) => ({ name: item.title, applicants: Number(item.totalApplicants || 0) }));
  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="04" title="Job Performance - Applicants" subtitle="Total applicants received per job" />
      {data.length === 0 ? (
        <NoData />
      ) : (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip />
              <Bar dataKey="applicants" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function ConversionAreaChart({ items }) {
  const data = items.map((item) => ({ name: item.title, rate: Number(item.conversionRate || 0) }));
  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="05" title="Job Conversion Rate" subtitle="Applicant-to-selection conversion per job" />
      {data.length === 0 ? (
        <NoData />
      ) : (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis unit="%" tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip formatter={(value) => [`${value}%`, "Conversion"]} />
              <Area type="monotone" dataKey="rate" stroke="#22c55e" fill="#86efac" fillOpacity={0.45} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function InterviewAnalyticsChart({ analytics }) {
  const total = Number(analytics?.totalScheduled || 0);
  const completed = Number(analytics?.completed || 0);
  const cancelled = Number(analytics?.cancelled || 0);
  const pending = Math.max(0, total - completed - cancelled);
  const data = [
    { name: "Completed", value: completed, color: "#14b8a6" },
    { name: "Cancelled", value: cancelled, color: "#ef4444" },
    { name: "Pending", value: pending, color: "#94a3b8" }
  ];

  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="06" title="Interview Analytics" subtitle="Completion, cancellation and pending interview mix" />
      {total <= 0 ? (
        <NoData />
      ) : (
        <>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={2}>
                  {data.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 text-sm">
            <p>Completion Rate: <span className="font-semibold">{analytics?.completionRate || 0}%</span></p>
            <p>Interview to Selection: <span className="font-semibold">{analytics?.interviewToSelectionRatio || 0}%</span></p>
          </div>
        </>
      )}
    </div>
  );
}

function ApplicationsPerJobChart({ items }) {
  const data = items.map((item) => ({ name: item.title, applications: Number(item.count || 0) }));
  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="07" title="Applications Per Job" subtitle="Trend of applications across posted roles" />
      {data.length === 0 ? (
        <NoData />
      ) : (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#475569" }} />
              <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
              <Tooltip />
              <Line type="monotone" dataKey="applications" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function CandidateResponseChart({ analytics }) {
  const candidateHours = Number(analytics?.averageCandidateResponseHours || 0);
  const recruiterHours = Number(analytics?.averageRecruiterResponseHours || 0);
  const engagementRate = Number(analytics?.conversationEngagementRate || 0);
  const data = [
    {
      label: "Response + Engagement",
      candidateHours,
      recruiterHours,
      engagementRate
    }
  ];

  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="08" title="Candidate Response Analytics" subtitle="Response speed (hours) and engagement rate (%)" />
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 16, right: 24, bottom: 10, left: 12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#475569" }} />
            <YAxis yAxisId="hours" tick={{ fontSize: 11, fill: "#475569" }} label={{ value: "Hours", angle: -90, position: "insideLeft", fill: "#475569" }} />
            <YAxis yAxisId="percent" orientation="right" tick={{ fontSize: 11, fill: "#475569" }} domain={[0, 100]} label={{ value: "%", angle: 90, position: "insideRight", fill: "#475569" }} />
            <Tooltip />
            <Legend />
            <Bar yAxisId="hours" dataKey="candidateHours" name="Candidate Response (h)" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            <Bar yAxisId="hours" dataKey="recruiterHours" name="Recruiter Response (h)" fill="#14b8a6" radius={[6, 6, 0, 0]} />
            <Line yAxisId="percent" type="monotone" dataKey="engagementRate" name="Conversation Engagement (%)" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm mt-2">
        <p>Candidate Avg: <span className="font-semibold">{candidateHours}h</span></p>
        <p>Recruiter Avg: <span className="font-semibold">{recruiterHours}h</span></p>
        <p>Engagement: <span className="font-semibold">{engagementRate}%</span></p>
      </div>
    </div>
  );
}

function CommonSkillsTreemap({ items }) {
  const data = items.map((item) => ({ name: item.skill, size: Number(item.count || 0) }));
  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="09" title="Most Common Applicant Skills" subtitle="Skill demand intensity by area" />
      {data.length === 0 ? (
        <NoData />
      ) : (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <Treemap
              data={data}
              dataKey="size"
              stroke="#fff"
              fill="#0ea5e9"
              contentStyle={{ borderRadius: 8 }}
            />
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function ShortlistedSkillsPie({ items }) {
  const data = items.map((item) => ({ name: item.skill, value: Number(item.count || 0) })).filter((item) => item.value > 0);
  const colors = ["#14b8a6", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4", "#84cc16", "#64748b"];
  return (
    <div className="panel panel-pad bg-white/90">
      <SectionHeader step="10" title="Shortlisted Skill Distribution" subtitle="Skill composition among shortlisted applicants" />
      {data.length === 0 ? (
        <NoData />
      ) : (
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" outerRadius={95}>
                {data.map((item, idx) => (
                  <Cell key={item.name} fill={colors[idx % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchJobs();
    fetchAnalytics();
    const timer = setInterval(() => {
      fetchJobs();
      fetchAnalytics();
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await API.get("/jobs");
      setJobs(res.data.data || []);
    } catch {
      setJobs([]);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await API.get("/analytics/overview");
      setAnalytics(res.data.data || null);
    } catch {
      setAnalytics(null);
    }
  };

  const summaryCards = useMemo(() => {
    if (!analytics?.summary) return [];
    return [
      { label: "Total Jobs", value: analytics.summary.totalJobs || 0 },
      { label: "Total Applications", value: analytics.summary.totalApplications || 0 },
      { label: "Avg Applicant Score", value: `${analytics.summary.averageScore || 0}%` },
      { label: "Overall Conversion", value: `${analytics.summary.overallConversionRate || 0}%` },
      { label: "Pipeline Health", value: `${analytics.summary.pipelineHealthScore || 0}` }
    ];
  }, [analytics]);

  return (
    <RecruiterLayout
      title="Recruiter Dashboard"
      subtitle="Turn Applicants into Assets."
    >
      {!analytics ? (
        <div className="panel panel-pad bg-white/90">
          <p className="subtle">Loading analytics...</p>
        </div>
      ) : (
        <>
          <RevealOnScroll delay={20}>
            <div className="grid gap-4 mb-6 sm:grid-cols-2 lg:grid-cols-5">
            {summaryCards.map((card) => (
              <div key={card.label} className="panel panel-pad bg-white/90">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-2">{card.value}</p>
              </div>
            ))}
          </div>
          </RevealOnScroll>

          <RevealOnScroll delay={60}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <FunnelRadarChart
              title="Hiring Funnel Stages"
              items={Object.entries(analytics.hiringFunnelAnalytics?.stageCounts || {}).map(([label, value]) => ({ label, value }))}
            />
            <DropOffLineChart items={analytics.hiringFunnelAnalytics?.dropOffRates || []} />
            <TimeToHireBarChart metrics={analytics.timeToHireMetrics} />
          </div>
          </RevealOnScroll>

          <RevealOnScroll delay={90}>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
            <ApplicantsBarChart items={analytics.jobPerformanceAnalytics || []} />
            <ConversionAreaChart items={analytics.jobPerformanceAnalytics || []} />
          </div>
          </RevealOnScroll>

          <RevealOnScroll delay={120}>
            <div className="grid gap-4 mb-6 lg:grid-cols-2">
            <InterviewAnalyticsChart analytics={analytics.interviewAnalytics} />
            <ApplicationsPerJobChart items={analytics.applicationTrendAnalytics?.perJob || []} />
          </div>
          </RevealOnScroll>

          <RevealOnScroll delay={150}>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
            <CandidateResponseChart analytics={analytics.candidateResponseAnalytics} />
            <CommonSkillsTreemap items={analytics.skillDemandAnalytics?.mostCommonApplicantSkills || []} />
            <ShortlistedSkillsPie items={analytics.skillDemandAnalytics?.shortlistedSkillDistribution || []} />
          </div>
          </RevealOnScroll>

          <RevealOnScroll delay={180}>
            <div className="panel panel-pad mb-6 bg-white/90">
            <SectionHeader step="11" title="Skill Gap Analysis Per Job" subtitle="Top missing skills by role" />
            <div className="grid md:grid-cols-2 gap-3">
              {(analytics.skillDemandAnalytics?.skillGapByJob || []).map((item) => (
                <div key={item.jobId} className="border border-slate-200 rounded-xl p-3">
                  <p className="font-semibold mb-2">{item.title}</p>
                  {item.topMissingSkills?.length ? item.topMissingSkills.map((gap) => (
                    <p key={gap.skill} className="text-sm text-slate-700">{gap.skill}: {gap.count}</p>
                  )) : <p className="subtle">No major gaps</p>}
                </div>
              ))}
            </div>
          </div>
          </RevealOnScroll>

          <RevealOnScroll delay={210}>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="panel panel-pad bg-white/90">
              <SectionHeader step="12" title="Recruiter Activity Metrics" subtitle="Operational activity overview" />
              <p className="text-sm mb-1">Messages Sent: <span className="font-semibold">{analytics.recruiterActivityMetrics?.messagesSent || 0}</span></p>
              <p className="text-sm mb-1">Interviews Scheduled: <span className="font-semibold">{analytics.recruiterActivityMetrics?.interviewsScheduled || 0}</span></p>
              <p className="text-sm mb-1">Jobs Posted: <span className="font-semibold">{analytics.recruiterActivityMetrics?.jobsPosted || 0}</span></p>
              <p className="text-sm mb-1">Decisions Made: <span className="font-semibold">{analytics.recruiterActivityMetrics?.decisionsMade || 0}</span></p>
              <p className="text-sm">Active Conversations: <span className="font-semibold">{analytics.recruiterActivityMetrics?.activeConversations || 0}</span></p>
            </div>
            <div className="panel panel-pad bg-white/90">
              <SectionHeader step="13" title="Pipeline Health Score" subtitle="Composite effectiveness index" />
              <p className="text-4xl font-extrabold text-teal-700 mb-2">{analytics.pipelineHealth?.score || 0}</p>
              <p className="text-sm mb-1">Conversion Rate: {analytics.pipelineHealth?.components?.conversionRate || 0}%</p>
              <p className="text-sm mb-1">Interview Completion: {analytics.pipelineHealth?.components?.interviewCompletionRate || 0}%</p>
              <p className="text-sm mb-1">Hiring Time Score: {analytics.pipelineHealth?.components?.hiringTimeScore || 0}</p>
              <p className="text-sm">Applicant Quality Ratio: {analytics.pipelineHealth?.components?.applicantQualityRatio || 0}%</p>
            </div>
          </div>
          </RevealOnScroll>

          <RevealOnScroll delay={240}>
            <div className="panel panel-pad mb-6 bg-white/90">
            <SectionHeader step="14" title="Job Aging Analytics" subtitle="Aging and stagnation signals by role" />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-200">
                    <th className="py-2">Job</th>
                    <th>Status</th>
                    <th>Days Since Posted</th>
                    <th>Days Without New App</th>
                    <th>Since Last Interview</th>
                    <th>Without Status Change</th>
                  </tr>
                </thead>
                <tbody>
                  {(analytics.jobAgingAnalytics || []).map((item) => (
                    <tr key={item.jobId} className="border-b border-slate-100">
                      <td className="py-2 pr-2">{item.title}</td>
                      <td>{item.status}</td>
                      <td>{item.daysSincePosted}</td>
                      <td>{item.daysWithoutNewApplications}</td>
                      <td>{item.timeSinceLastInterviewDays ?? "N/A"}</td>
                      <td>{item.timeWithoutStatusChangeDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          </RevealOnScroll>
        </>
      )}

      <RevealOnScroll delay={80}>
        <div className="page-header flex items-center justify-between gap-3 mb-4">
        <h2 className="section-title text-lg">Posted Jobs</h2>
        <Link to="/recruiter/jobs" className="btn-primary">Manage Jobs</Link>
      </div>
      </RevealOnScroll>

      <RevealOnScroll delay={120}>
        <div className="grid md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div key={job._id} className="panel panel-pad">
            <h2 className="text-lg font-bold">{job.title}</h2>
            <p className="text-slate-600">{job.company}</p>
            <p className="text-sm text-emerald-700 font-semibold">Salary: {job.salary || "Not specified"}</p>
            <p className="text-sm text-slate-500 mt-1">Status: <span className="font-medium">{job.status}</span></p>
            <p className="text-sm text-slate-500">Expiry: {job.expiryDate ? new Date(job.expiryDate).toLocaleDateString() : "No expiry"}</p>
            <div className="mt-4">
              <Link to="/recruiter/jobs" className="btn-secondary">Open Job Manager</Link>
            </div>
          </div>
        ))}
      </div>
      </RevealOnScroll>
    </RecruiterLayout>
  );
}

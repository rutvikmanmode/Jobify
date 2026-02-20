const Job = require("../models/job");
const Application = require("../models/application");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MS_PER_HOUR = 1000 * 60 * 60;

const safeNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

const avg = (values = []) => {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const daysBetween = (from, to) => {
  if (!from || !to) return 0;
  return Math.max(0, (new Date(to).getTime() - new Date(from).getTime()) / MS_PER_DAY);
};

const dateKey = (date) => new Date(date).toISOString().slice(0, 10);

const weekKey = (date) => {
  const d = new Date(date);
  const dayNum = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(d.getUTCFullYear(), 0, 4));
  const diff = d - firstThursday;
  const week = 1 + Math.round(diff / (7 * MS_PER_DAY));
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
};

const monthKey = (date) => {
  const d = new Date(date);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
};

const normalizeSkill = (value = "") => String(value).trim().toLowerCase();

const buildBarSeriesLastDays = (map, days) => {
  const today = new Date();
  const out = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = dateKey(d);
    out.push({ label: key, value: map[key] || 0 });
  }
  return out;
};

const buildBarSeriesLastWeeks = (map, weeks) => {
  const now = new Date();
  const out = [];
  for (let i = weeks - 1; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    const key = weekKey(d);
    out.push({ label: key, value: map[key] || 0 });
  }
  return out;
};

const toPercent = (numerator, denominator) => {
  if (!denominator) return 0;
  return Number(((numerator / denominator) * 100).toFixed(1));
};

exports.getOverview = async (req, res) => {
  try {
    const recruiterId = String(req.user.id);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * MS_PER_DAY);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * MS_PER_DAY);

    const managedJobs = await Job.find({
      $or: [{ postedBy: recruiterId }, { recruiters: recruiterId }]
    }).select("_id title company status createdAt updatedAt requiredSkills postedBy");

    const jobIds = managedJobs.map((job) => job._id);
    const jobIdStrings = new Set(jobIds.map((id) => String(id)));

    const applications = await Application.find({ job: { $in: jobIds } })
      .populate("student", "_id name email skills")
      .populate("job", "_id title company requiredSkills createdAt updatedAt")
      .sort({ createdAt: -1 });

    const managedConversations = await Conversation.find({ participants: recruiterId })
      .select("_id participants job lastMessageAt createdAt")
      .sort({ lastMessageAt: -1 });

    const relevantConversationIds = managedConversations
      .filter((conversation) => {
        if (!conversation.job) return true;
        return jobIdStrings.has(String(conversation.job));
      })
      .map((conversation) => conversation._id);

    const messages = await Message.find({ conversation: { $in: relevantConversationIds } })
      .select("conversation sender messageType interview createdAt")
      .sort({ createdAt: 1 });

    const appByKey = new Map();
    applications.forEach((app) => {
      const key = `${String(app.job?._id || app.job)}:${String(app.student?._id || app.student)}`;
      appByKey.set(key, app);
    });

    const conversationMap = new Map();
    managedConversations.forEach((conversation) => {
      conversationMap.set(String(conversation._id), conversation);
    });

    const conversationMessagesMap = new Map();
    messages.forEach((message) => {
      const key = String(message.conversation);
      if (!conversationMessagesMap.has(key)) conversationMessagesMap.set(key, []);
      conversationMessagesMap.get(key).push(message);
    });

    const interviewByAppKey = new Map();
    let interviewsScheduled = 0;
    let interviewsCompleted = 0;
    let interviewsCancelled = 0;

    for (const conversation of managedConversations) {
      const conversationId = String(conversation._id);
      const list = conversationMessagesMap.get(conversationId) || [];
      const interviewMessages = list.filter((message) => message.messageType === "interview");
      if (!interviewMessages.length) continue;

      const participantIds = (conversation.participants || []).map((id) => String(id));
      const candidateId = participantIds.find((id) => id !== recruiterId);
      const jobId = conversation.job ? String(conversation.job) : "";
      const appKey = jobId && candidateId ? `${jobId}:${candidateId}` : "";

      let firstScheduledAt = null;
      let firstCompletedAt = null;

      for (const interviewMessage of interviewMessages) {
        const status = interviewMessage.interview?.status || "scheduled";
        if (status === "scheduled") interviewsScheduled += 1;
        if (status === "completed") interviewsCompleted += 1;
        if (status === "cancelled") interviewsCancelled += 1;

        const scheduledAt = interviewMessage.interview?.scheduledAt || interviewMessage.createdAt;
        if (!firstScheduledAt || new Date(scheduledAt) < new Date(firstScheduledAt)) {
          firstScheduledAt = scheduledAt;
        }

        if (status === "completed") {
          const completedAt = interviewMessage.createdAt;
          if (!firstCompletedAt || new Date(completedAt) < new Date(firstCompletedAt)) {
            firstCompletedAt = completedAt;
          }
        }
      }

      if (appKey) {
        interviewByAppKey.set(appKey, {
          firstScheduledAt,
          firstCompletedAt
        });
      }
    }

    const totalJobs = managedJobs.length;
    const totalApplications = applications.length;
    const averageScore =
      totalApplications === 0
        ? 0
        : Math.round(applications.reduce((sum, app) => sum + safeNumber(app.score), 0) / totalApplications);

    const topApplication = [...applications].sort((a, b) => safeNumber(b.score) - safeNumber(a.score))[0];
    const topCandidate = topApplication
      ? {
          name: topApplication.student?.name || "Unknown",
          email: topApplication.student?.email || "",
          score: safeNumber(topApplication.score)
        }
      : null;

    const funnel = {
      Applied: applications.filter((app) => app.status === "Applied").length,
      Shortlisted: applications.filter((app) => Boolean(app.shortlisted)).length,
      "Interview Scheduled": interviewsScheduled,
      "Interview Completed": interviewsCompleted,
      Selected: applications.filter((app) => app.status === "Offered").length,
      Rejected: applications.filter((app) => app.status === "Rejected").length
    };

    const funnelOrder = [
      "Applied",
      "Shortlisted",
      "Interview Scheduled",
      "Interview Completed",
      "Selected",
      "Rejected"
    ];

    const funnelDropOff = [];
    for (let i = 0; i < funnelOrder.length - 1; i += 1) {
      const from = funnelOrder[i];
      const to = funnelOrder[i + 1];
      const fromCount = funnel[from] || 0;
      const toCount = funnel[to] || 0;
      funnelDropOff.push({
        from,
        to,
        dropOffRate: fromCount === 0 ? 0 : Number((((fromCount - toCount) / fromCount) * 100).toFixed(1))
      });
    }

    const overallConversionRate = toPercent(funnel.Selected, funnel.Applied);

    const appToShortlistDays = [];
    const shortlistToInterviewDays = [];
    const interviewToDecisionDays = [];
    const overallHiringDurationDays = [];

    applications.forEach((app) => {
      const appKey = `${String(app.job?._id || app.job)}:${String(app.student?._id || app.student)}`;
      const interviewData = interviewByAppKey.get(appKey);

      if (app.shortlisted && app.statusUpdatedAt) {
        appToShortlistDays.push(daysBetween(app.createdAt, app.statusUpdatedAt));
      }

      if (app.shortlisted && interviewData?.firstScheduledAt && app.statusUpdatedAt) {
        shortlistToInterviewDays.push(daysBetween(app.statusUpdatedAt, interviewData.firstScheduledAt));
      }

      if (["Offered", "Rejected"].includes(app.status) && interviewData?.firstCompletedAt && app.statusUpdatedAt) {
        interviewToDecisionDays.push(daysBetween(interviewData.firstCompletedAt, app.statusUpdatedAt));
      }

      if (app.status === "Offered" && app.statusUpdatedAt) {
        overallHiringDurationDays.push(daysBetween(app.createdAt, app.statusUpdatedAt));
      }
    });

    const timeToHire = {
      averageApplicationToShortlistDays: Number(avg(appToShortlistDays).toFixed(1)),
      averageShortlistToInterviewDays: Number(avg(shortlistToInterviewDays).toFixed(1)),
      averageInterviewToDecisionDays: Number(avg(interviewToDecisionDays).toFixed(1)),
      overallHiringDurationDays: Number(avg(overallHiringDurationDays).toFixed(1))
    };

    const dailyTrendMap = {};
    const weeklyTrendMap = {};
    const perJobTrendMap = {};
    const monthlyTrendMap = {};

    applications.forEach((app) => {
      const day = dateKey(app.createdAt);
      const week = weekKey(app.createdAt);
      const month = monthKey(app.createdAt);
      const jobId = String(app.job?._id || app.job || "");

      dailyTrendMap[day] = (dailyTrendMap[day] || 0) + 1;
      weeklyTrendMap[week] = (weeklyTrendMap[week] || 0) + 1;
      monthlyTrendMap[month] = (monthlyTrendMap[month] || 0) + 1;

      if (jobId) {
        perJobTrendMap[jobId] = (perJobTrendMap[jobId] || 0) + 1;
      }
    });

    const applicationsPerJob = managedJobs.map((job) => ({
      jobId: String(job._id),
      title: job.title,
      count: perJobTrendMap[String(job._id)] || 0
    }));

    const jobPerformance = managedJobs.map((job) => {
      const apps = applications.filter((app) => String(app.job?._id || app.job) === String(job._id));
      const total = apps.length;
      const shortlisted = apps.filter((app) => app.shortlisted).length;
      const interviewed = apps.filter((app) => ["Interview", "Offered", "Rejected"].includes(app.status)).length;
      const selected = apps.filter((app) => app.status === "Offered").length;

      const recent = apps.filter((app) => new Date(app.createdAt) >= sevenDaysAgo).length;
      const previous = apps.filter((app) => {
        const created = new Date(app.createdAt);
        return created >= fourteenDaysAgo && created < sevenDaysAgo;
      }).length;

      const applicationGrowthRate =
        previous === 0 ? (recent > 0 ? 100 : 0) : Number((((recent - previous) / previous) * 100).toFixed(1));

      return {
        jobId: String(job._id),
        title: job.title,
        company: job.company,
        totalApplicants: total,
        shortlistedCount: shortlisted,
        interviewedCount: interviewed,
        selectedCount: selected,
        conversionRate: toPercent(selected, total),
        applicationGrowthRate
      };
    });

    const interviewAnalytics = {
      totalScheduled: interviewsScheduled,
      completed: interviewsCompleted,
      cancelled: interviewsCancelled,
      completionRate: toPercent(interviewsCompleted, interviewsScheduled),
      interviewToSelectionRatio: toPercent(funnel.Selected, interviewsCompleted)
    };

    const recruiterResponseHours = [];
    const candidateResponseHours = [];
    let engagedConversations = 0;

    for (const conversation of managedConversations) {
      const list = conversationMessagesMap.get(String(conversation._id)) || [];
      if (list.length >= 4) engagedConversations += 1;

      for (let i = 1; i < list.length; i += 1) {
        const prev = list[i - 1];
        const curr = list[i];
        const prevSender = String(prev.sender);
        const currSender = String(curr.sender);

        if (prevSender === currSender) continue;

        const diffHours = Math.max(0, (new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime()) / MS_PER_HOUR);

        if (prevSender === recruiterId && currSender !== recruiterId) {
          candidateResponseHours.push(diffHours);
        } else if (prevSender !== recruiterId && currSender === recruiterId) {
          recruiterResponseHours.push(diffHours);
        }
      }
    }

    const candidateResponseAnalytics = {
      averageCandidateResponseHours: Number(avg(candidateResponseHours).toFixed(2)),
      averageRecruiterResponseHours: Number(avg(recruiterResponseHours).toFixed(2)),
      conversationEngagementRate: toPercent(engagedConversations, managedConversations.length)
    };

    const applicantSkillMap = {};
    const shortlistedSkillMap = {};
    const skillGapByJob = [];

    for (const job of managedJobs) {
      const apps = applications.filter((app) => String(app.job?._id || app.job) === String(job._id));
      const required = (job.requiredSkills || []).map(normalizeSkill).filter(Boolean);

      const missingSkillCount = {};
      apps.forEach((app) => {
        const studentSkills = new Set((app.student?.skills || []).map(normalizeSkill).filter(Boolean));

        (app.student?.skills || []).forEach((skill) => {
          const key = normalizeSkill(skill);
          if (!key) return;
          applicantSkillMap[key] = (applicantSkillMap[key] || 0) + 1;
          if (app.shortlisted) shortlistedSkillMap[key] = (shortlistedSkillMap[key] || 0) + 1;
        });

        required.forEach((reqSkill) => {
          if (!studentSkills.has(reqSkill)) {
            missingSkillCount[reqSkill] = (missingSkillCount[reqSkill] || 0) + 1;
          }
        });
      });

      const topMissing = Object.entries(missingSkillCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([skill, count]) => ({ skill, count }));

      skillGapByJob.push({
        jobId: String(job._id),
        title: job.title,
        topMissingSkills: topMissing
      });
    }

    const skillDemandAnalytics = {
      mostCommonApplicantSkills: Object.entries(applicantSkillMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count })),
      skillGapByJob,
      shortlistedSkillDistribution: Object.entries(shortlistedSkillMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([skill, count]) => ({ skill, count }))
    };

    const recruiterMessagesSent = messages.filter((message) => String(message.sender) === recruiterId).length;
    const recruiterInterviewsScheduled = messages.filter(
      (message) => message.messageType === "interview" && String(message.sender) === recruiterId
    ).length;
    const jobsPosted = managedJobs.filter((job) => String(job.postedBy) === recruiterId).length;
    const decisionsMade = applications.filter((app) => ["Offered", "Rejected"].includes(app.status)).length;
    const activeConversations = managedConversations.filter(
      (conversation) => conversation.lastMessageAt && new Date(conversation.lastMessageAt) >= sevenDaysAgo
    ).length;

    const recruiterActivity = {
      messagesSent: recruiterMessagesSent,
      interviewsScheduled: recruiterInterviewsScheduled,
      jobsPosted,
      decisionsMade,
      activeConversations
    };

    const applicantQualityRatio = toPercent(
      applications.filter((app) => safeNumber(app.score) >= 70).length,
      applications.length
    );

    const hiringTimeScore =
      timeToHire.overallHiringDurationDays <= 0
        ? 0
        : Math.max(0, Math.min(100, Number((100 - (timeToHire.overallHiringDurationDays / 60) * 100).toFixed(1))));

    const pipelineHealthScore = Number(
      avg([
        overallConversionRate,
        interviewAnalytics.completionRate,
        hiringTimeScore,
        applicantQualityRatio
      ]).toFixed(1)
    );

    const jobAgingAnalytics = managedJobs.map((job) => {
      const apps = applications
        .filter((app) => String(app.job?._id || app.job) === String(job._id))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const lastAppAt = apps[0]?.createdAt || null;
      const daysWithoutNewApplications = lastAppAt
        ? Number(daysBetween(lastAppAt, now).toFixed(1))
        : Number(daysBetween(job.createdAt, now).toFixed(1));

      const lastInterviewAt = messages
        .filter((message) => {
          if (message.messageType !== "interview") return false;
          const conversation = conversationMap.get(String(message.conversation));
          return conversation?.job && String(conversation.job) === String(job._id);
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]?.createdAt;

      return {
        jobId: String(job._id),
        title: job.title,
        company: job.company,
        status: job.status,
        daysSincePosted: Number(daysBetween(job.createdAt, now).toFixed(1)),
        daysWithoutNewApplications,
        timeSinceLastInterviewDays: lastInterviewAt ? Number(daysBetween(lastInterviewAt, now).toFixed(1)) : null,
        timeWithoutStatusChangeDays: Number(daysBetween(job.updatedAt || job.createdAt, now).toFixed(1))
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalJobs,
          totalApplications,
          averageScore,
          topCandidate,
          overallConversionRate,
          pipelineHealthScore
        },
        hiringFunnelAnalytics: {
          stageCounts: funnel,
          dropOffRates: funnelDropOff,
          overallConversionRate
        },
        timeToHireMetrics: timeToHire,
        jobPerformanceAnalytics: jobPerformance,
        interviewAnalytics,
        applicationTrendAnalytics: {
          perDay: buildBarSeriesLastDays(dailyTrendMap, 30),
          perWeek: buildBarSeriesLastWeeks(weeklyTrendMap, 12),
          perJob: applicationsPerJob,
          seasonalTrends: Object.entries(monthlyTrendMap)
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([month, count]) => ({ month, count }))
        },
        candidateResponseAnalytics,
        skillDemandAnalytics,
        recruiterActivityMetrics: recruiterActivity,
        pipelineHealth: {
          score: pipelineHealthScore,
          components: {
            conversionRate: overallConversionRate,
            interviewCompletionRate: interviewAnalytics.completionRate,
            hiringTimeScore,
            applicantQualityRatio
          }
        },
        jobAgingAnalytics
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Analytics failed" });
  }
};

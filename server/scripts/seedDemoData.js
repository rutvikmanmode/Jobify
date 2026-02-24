require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/user");
const Job = require("../models/job");
const Application = require("../models/application");
const Post = require("../models/post");

const DEMO_PASSWORD = "Password@123";

const recruitersSeed = [
  {
    name: "Aisha Verma",
    email: "aisha.verma@neurostack.ai",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Senior Technical Recruiter",
      professionalBio: "Hiring backend, platform, and ML engineers for high-growth product teams.",
      linkedinProfileUrl: "https://linkedin.com/in/aishaverma-recruiter",
      profilePictureUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      companyName: "NeuroStack AI",
      companyLogoUrl: "https://dummyimage.com/200x200/0f172a/ffffff&text=NS",
      companyIndustry: "AI Infrastructure",
      companyWebsite: "https://neurostack.ai",
      companySize: "201-500",
      officeLocation: "Bengaluru",
      workEmail: "aisha.verma@neurostack.ai",
      workPhoneNumber: "+91-9876543210",
      preferredCommunicationMethod: "In-app messaging",
      availabilityResponseTime: "Usually responds within 1 day",
      hiringDomains: ["Backend", "DevOps", "ML Platform"],
      seniorityLevels: ["Internship", "Entry-level", "Mid-level"],
      atsId: "ATS-NS-AV-1001",
      subscriptionTier: "Enterprise",
      jobPostingCredits: 120,
      notificationPreferences: {
        newApplications: true,
        messages: true,
        interviewReminders: true
      },
      teamAccess: ["hiring.manager@neurostack.ai", "hr.ops@neurostack.ai"]
    }
  },
  {
    name: "Rohan Kapoor",
    email: "rohan.kapoor@neurostack.ai",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Talent Acquisition Manager",
      professionalBio: "Leading campus and early-career hiring programs across engineering and design.",
      linkedinProfileUrl: "https://linkedin.com/in/rohan-kapoor-ta",
      profilePictureUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      companyName: "NeuroStack AI",
      companyLogoUrl: "https://dummyimage.com/200x200/0f172a/ffffff&text=NS",
      companyIndustry: "AI Infrastructure",
      companyWebsite: "https://neurostack.ai",
      companySize: "201-500",
      officeLocation: "Bengaluru",
      workEmail: "rohan.kapoor@neurostack.ai",
      workPhoneNumber: "+91-9876500011",
      preferredCommunicationMethod: "Email",
      availabilityResponseTime: "Usually responds within 2 days",
      hiringDomains: ["Frontend", "Fullstack", "Product Design"],
      seniorityLevels: ["Internship", "Entry-level"],
      atsId: "ATS-NS-RK-1002",
      subscriptionTier: "Enterprise",
      jobPostingCredits: 95,
      notificationPreferences: {
        newApplications: true,
        messages: true,
        interviewReminders: false
      },
      teamAccess: ["design.lead@neurostack.ai"]
    }
  },
  {
    name: "Meera Nair",
    email: "meera.nair@finbyte.com",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Technical Recruiter",
      professionalBio: "Hiring fintech engineers focused on reliability, security, and scale.",
      linkedinProfileUrl: "https://linkedin.com/in/meera-nair-hiring",
      profilePictureUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      companyName: "FinByte Labs",
      companyLogoUrl: "https://dummyimage.com/200x200/1f2937/ffffff&text=FB",
      companyIndustry: "FinTech",
      companyWebsite: "https://finbyte.com",
      companySize: "501-1000",
      officeLocation: "Mumbai",
      workEmail: "meera.nair@finbyte.com",
      workPhoneNumber: "+91-9988776655",
      preferredCommunicationMethod: "LinkedIn",
      availabilityResponseTime: "Usually responds within 3 days",
      hiringDomains: ["Backend", "Security", "Data Engineering"],
      seniorityLevels: ["Entry-level", "Mid-level", "Senior"],
      atsId: "ATS-FB-MN-2001",
      subscriptionTier: "Premium",
      jobPostingCredits: 52,
      notificationPreferences: {
        newApplications: true,
        messages: false,
        interviewReminders: true
      },
      teamAccess: ["cto.office@finbyte.com"]
    }
  },
  {
    name: "Sanya Iyer",
    email: "sanya.iyer@neurostack.ai",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Campus Hiring Specialist",
      professionalBio: "Runs internship and graduate hiring across product and platform teams.",
      linkedinProfileUrl: "https://linkedin.com/in/sanya-iyer-hiring",
      profilePictureUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400",
      companyName: "NeuroStack AI",
      companyLogoUrl: "https://dummyimage.com/200x200/0f172a/ffffff&text=NS",
      companyIndustry: "AI Infrastructure",
      companyWebsite: "https://neurostack.ai",
      companySize: "201-500",
      officeLocation: "Bengaluru",
      workEmail: "sanya.iyer@neurostack.ai",
      workPhoneNumber: "+91-9876501144",
      preferredCommunicationMethod: "In-app messaging",
      availabilityResponseTime: "Usually responds within 1 day",
      hiringDomains: ["Internships", "Frontend", "QA"],
      seniorityLevels: ["Internship", "Entry-level"],
      atsId: "ATS-NS-SI-1003",
      subscriptionTier: "Enterprise",
      jobPostingCredits: 64,
      notificationPreferences: {
        newApplications: true,
        messages: true,
        interviewReminders: true
      },
      teamAccess: ["campus.programs@neurostack.ai"]
    }
  },
  {
    name: "Vikram Sethi",
    email: "vikram.sethi@finbyte.com",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Engineering Recruiter",
      professionalBio: "Focuses on backend, data platform, and reliability hiring for payments products.",
      linkedinProfileUrl: "https://linkedin.com/in/vikram-sethi-recruiting",
      profilePictureUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
      companyName: "FinByte Labs",
      companyLogoUrl: "https://dummyimage.com/200x200/1f2937/ffffff&text=FB",
      companyIndustry: "FinTech",
      companyWebsite: "https://finbyte.com",
      companySize: "501-1000",
      officeLocation: "Mumbai",
      workEmail: "vikram.sethi@finbyte.com",
      workPhoneNumber: "+91-9988778801",
      preferredCommunicationMethod: "Email",
      availabilityResponseTime: "Usually responds within 2 days",
      hiringDomains: ["Backend", "Data Engineering", "SRE"],
      seniorityLevels: ["Entry-level", "Mid-level"],
      atsId: "ATS-FB-VS-2002",
      subscriptionTier: "Premium",
      jobPostingCredits: 44,
      notificationPreferences: {
        newApplications: true,
        messages: true,
        interviewReminders: false
      },
      teamAccess: ["platform.hiring@finbyte.com"]
    }
  },
  {
    name: "Nidhi Rao",
    email: "nidhi.rao@finbyte.com",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Product Hiring Partner",
      professionalBio: "Partners with product and analytics leaders to close high-impact roles.",
      linkedinProfileUrl: "https://linkedin.com/in/nidhi-rao-talent",
      profilePictureUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400",
      companyName: "FinByte Labs",
      companyLogoUrl: "https://dummyimage.com/200x200/1f2937/ffffff&text=FB",
      companyIndustry: "FinTech",
      companyWebsite: "https://finbyte.com",
      companySize: "501-1000",
      officeLocation: "Mumbai",
      workEmail: "nidhi.rao@finbyte.com",
      workPhoneNumber: "+91-9988778802",
      preferredCommunicationMethod: "LinkedIn",
      availabilityResponseTime: "Usually responds within 3 days",
      hiringDomains: ["Product", "Analytics", "Customer Success"],
      seniorityLevels: ["Internship", "Entry-level", "Mid-level"],
      atsId: "ATS-FB-NR-2003",
      subscriptionTier: "Premium",
      jobPostingCredits: 37,
      notificationPreferences: {
        newApplications: true,
        messages: false,
        interviewReminders: true
      },
      teamAccess: ["product.ops@finbyte.com", "analytics.leads@finbyte.com"]
    }
  },
  {
    name: "Karan Malhotra",
    email: "karan.malhotra@cloudspring.io",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Senior Talent Partner",
      professionalBio: "Hiring fullstack and cloud-native engineers for B2B SaaS teams.",
      linkedinProfileUrl: "https://linkedin.com/in/karan-malhotra-talent",
      profilePictureUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
      companyName: "CloudSpring",
      companyLogoUrl: "https://dummyimage.com/200x200/0b3d5c/ffffff&text=CS",
      companyIndustry: "SaaS",
      companyWebsite: "https://cloudspring.io",
      companySize: "51-200",
      officeLocation: "Gurugram",
      workEmail: "karan.malhotra@cloudspring.io",
      workPhoneNumber: "+91-9898011201",
      preferredCommunicationMethod: "In-app messaging",
      availabilityResponseTime: "Usually responds within 1 day",
      hiringDomains: ["Fullstack", "Cloud", "Platform"],
      seniorityLevels: ["Internship", "Entry-level", "Mid-level"],
      atsId: "ATS-CS-KM-3001",
      subscriptionTier: "Enterprise",
      jobPostingCredits: 73,
      notificationPreferences: {
        newApplications: true,
        messages: true,
        interviewReminders: true
      },
      teamAccess: ["eng.ops@cloudspring.io"]
    }
  },
  {
    name: "Elena Dsouza",
    email: "elena.dsouza@cloudspring.io",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "People Operations Recruiter",
      professionalBio: "Drives hiring for QA, support engineering, and junior product roles.",
      linkedinProfileUrl: "https://linkedin.com/in/elena-dsouza-peopleops",
      profilePictureUrl: "https://images.unsplash.com/photo-1541534401786-2077eed87a72?w=400",
      companyName: "CloudSpring",
      companyLogoUrl: "https://dummyimage.com/200x200/0b3d5c/ffffff&text=CS",
      companyIndustry: "SaaS",
      companyWebsite: "https://cloudspring.io",
      companySize: "51-200",
      officeLocation: "Gurugram",
      workEmail: "elena.dsouza@cloudspring.io",
      workPhoneNumber: "+91-9898011202",
      preferredCommunicationMethod: "Email",
      availabilityResponseTime: "Usually responds within 2 days",
      hiringDomains: ["QA", "Support Engineering", "Product Ops"],
      seniorityLevels: ["Internship", "Entry-level"],
      atsId: "ATS-CS-ED-3002",
      subscriptionTier: "Enterprise",
      jobPostingCredits: 49,
      notificationPreferences: {
        newApplications: true,
        messages: true,
        interviewReminders: true
      },
      teamAccess: ["people.team@cloudspring.io"]
    }
  },
  {
    name: "Omar Khan",
    email: "omar.khan@brightlanehealth.com",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Technical Recruiter",
      professionalBio: "Building engineering and data teams for healthcare workflow products.",
      linkedinProfileUrl: "https://linkedin.com/in/omar-khan-hiring",
      profilePictureUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
      companyName: "BrightLane Health",
      companyLogoUrl: "https://dummyimage.com/200x200/065f46/ffffff&text=BL",
      companyIndustry: "HealthTech",
      companyWebsite: "https://brightlanehealth.com",
      companySize: "201-500",
      officeLocation: "Pune",
      workEmail: "omar.khan@brightlanehealth.com",
      workPhoneNumber: "+91-9810012201",
      preferredCommunicationMethod: "In-app messaging",
      availabilityResponseTime: "Usually responds within 1 day",
      hiringDomains: ["Backend", "Data", "Product Analytics"],
      seniorityLevels: ["Internship", "Entry-level", "Mid-level"],
      atsId: "ATS-BL-OK-4001",
      subscriptionTier: "Premium",
      jobPostingCredits: 42,
      notificationPreferences: {
        newApplications: true,
        messages: true,
        interviewReminders: true
      },
      teamAccess: ["eng-hiring@brightlanehealth.com"]
    }
  },
  {
    name: "Ritu Bansal",
    email: "ritu.bansal@brightlanehealth.com",
    role: "recruiter",
    recruiterProfile: {
      jobTitle: "Campus & Early Careers Recruiter",
      professionalBio: "Leads intern funnels and entry-level onboarding for product and QA teams.",
      linkedinProfileUrl: "https://linkedin.com/in/ritu-bansal-recruiting",
      profilePictureUrl: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400",
      companyName: "BrightLane Health",
      companyLogoUrl: "https://dummyimage.com/200x200/065f46/ffffff&text=BL",
      companyIndustry: "HealthTech",
      companyWebsite: "https://brightlanehealth.com",
      companySize: "201-500",
      officeLocation: "Pune",
      workEmail: "ritu.bansal@brightlanehealth.com",
      workPhoneNumber: "+91-9810012202",
      preferredCommunicationMethod: "Email",
      availabilityResponseTime: "Usually responds within 2 days",
      hiringDomains: ["QA", "Frontend", "Business Analysis"],
      seniorityLevels: ["Internship", "Entry-level"],
      atsId: "ATS-BL-RB-4002",
      subscriptionTier: "Premium",
      jobPostingCredits: 33,
      notificationPreferences: {
        newApplications: true,
        messages: false,
        interviewReminders: true
      },
      teamAccess: ["campus@brightlanehealth.com"]
    }
  }
];

const studentsSeed = [
  {
    name: "Arjun Menon",
    email: "arjun.menon@studentmail.com",
    role: "student",
    headline: "Final Year CSE Student | Backend & Cloud",
    bio: "Built distributed systems projects with Node.js, Kafka, and AWS. Looking for backend roles.",
    phone: "+91-9000011111",
    location: "Hyderabad",
    university: "IIIT Hyderabad",
    degree: "B.Tech",
    specialization: "Computer Science",
    linkedin: "https://linkedin.com/in/arjun-menon-dev",
    github: "https://github.com/arjunmenon",
    portfolio: "https://arjunmenon.dev",
    resume: "uploads/resume.pdf",
    resumeText: "Arjun Menon. Backend developer with Node, Express, PostgreSQL, Docker, AWS, Redis, microservices. Internship at ScaleGrid building APIs.",
    skills: ["node", "express", "postgresql", "docker", "aws", "redis", "microservices", "javascript", "sql"],
    internships: [
      {
        organization: "ScaleGrid",
        title: "Backend Intern",
        location: "Remote",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-06-10"),
        description: "Implemented auth and payment APIs with observability dashboards."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/resume.pdf",
        resumeText: "Arjun Menon resume v1",
        extractedSkills: ["node", "express", "postgresql", "aws"],
        source: "upload",
        createdAt: new Date("2025-11-15")
      },
      {
        resumePath: "uploads/test.pdf",
        resumeText: "Arjun Menon resume v2 improved",
        extractedSkills: ["node", "express", "postgresql", "aws", "redis", "docker"],
        source: "upload",
        createdAt: new Date("2026-01-10")
      }
    ],
    resumeBuilder: {
      fullName: "Arjun Menon",
      title: "Backend Developer",
      summary: "Backend engineer focused on scalable APIs",
      experience: ["Backend Intern at ScaleGrid"],
      education: ["B.Tech CSE - IIIT Hyderabad"],
      projects: ["Event-driven job queue system"],
      certifications: ["AWS Cloud Practitioner"]
    }
  },
  {
    name: "Priya Shah",
    email: "priya.shah@studentmail.com",
    role: "student",
    headline: "Frontend Engineer | React + TypeScript",
    bio: "Passionate about performant interfaces and design systems.",
    phone: "+91-9000022222",
    location: "Pune",
    university: "PES University",
    degree: "B.Tech",
    specialization: "Information Science",
    linkedin: "https://linkedin.com/in/priya-shah-ui",
    github: "https://github.com/priyashah",
    portfolio: "https://priyashah.dev",
    resume: "uploads/test.pdf",
    resumeText: "Priya Shah. React, TypeScript, Next.js, Tailwind, Redux, GraphQL, Jest, Cypress. UI intern at PixelForge.",
    skills: ["react", "typescript", "next.js", "tailwind", "redux", "graphql", "jest", "cypress", "javascript"],
    internships: [
      {
        organization: "PixelForge",
        title: "Frontend Intern",
        location: "Bengaluru",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-07-01"),
        description: "Built reusable UI libraries and improved Core Web Vitals by 28%."
      },
      {
        organization: "UXOrbit",
        title: "UI Engineer Intern",
        location: "Remote",
        startDate: new Date("2024-06-01"),
        endDate: new Date("2024-10-01"),
        description: "Implemented design token workflow and component tests."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/test.pdf",
        resumeText: "Priya Shah resume v1",
        extractedSkills: ["react", "typescript", "tailwind", "redux"],
        source: "upload",
        createdAt: new Date("2025-12-01")
      }
    ],
    resumeBuilder: {
      fullName: "Priya Shah",
      title: "Frontend Engineer",
      summary: "Building delightful interfaces",
      experience: ["Frontend Intern at PixelForge", "UI Engineer Intern at UXOrbit"],
      education: ["B.Tech IS - PES University"],
      projects: ["Design system playground", "Realtime dashboard"],
      certifications: ["Meta Frontend Developer"]
    }
  },
  {
    name: "Dev Patel",
    email: "dev.patel@studentmail.com",
    role: "student",
    headline: "Data & ML Engineer",
    bio: "Hands-on with data pipelines and ML deployment.",
    phone: "+91-9000033333",
    location: "Ahmedabad",
    university: "Nirma University",
    degree: "B.Tech",
    specialization: "AI & Data Science",
    linkedin: "https://linkedin.com/in/dev-patel-ml",
    github: "https://github.com/devpatel",
    portfolio: "https://devpatel.ai",
    resume: "uploads/resume.pdf",
    resumeText: "Dev Patel. Python, pandas, numpy, scikit-learn, tensorflow, docker, aws, sql, airflow.",
    skills: ["python", "pandas", "numpy", "tensorflow", "docker", "aws", "sql", "machine learning"],
    internships: [
      {
        organization: "DataWeave Labs",
        title: "ML Intern",
        location: "Ahmedabad",
        startDate: new Date("2025-03-05"),
        endDate: new Date("2025-08-20"),
        description: "Built classification pipelines and model monitoring alerts."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/resume.pdf",
        resumeText: "Dev Patel resume v1",
        extractedSkills: ["python", "pandas", "tensorflow", "sql"],
        source: "upload",
        createdAt: new Date("2026-01-25")
      }
    ],
    resumeBuilder: {
      fullName: "Dev Patel",
      title: "ML Engineer",
      summary: "Productionizing ML systems",
      experience: ["ML Intern at DataWeave Labs"],
      education: ["B.Tech AI & DS - Nirma University"],
      projects: ["Fraud detection model", "Feature store prototype"],
      certifications: ["TensorFlow Developer"]
    }
  },
  {
    name: "Neha Kulkarni",
    email: "neha.kulkarni@studentmail.com",
    role: "student",
    headline: "Fullstack Developer | React, Node, PostgreSQL",
    bio: "Built startup-style products end-to-end and enjoys shipping practical features quickly.",
    phone: "+91-9000044444",
    location: "Mumbai",
    university: "VJTI Mumbai",
    degree: "B.Tech",
    specialization: "Information Technology",
    linkedin: "https://linkedin.com/in/neha-kulkarni-dev",
    github: "https://github.com/nehakulkarni",
    portfolio: "https://nehakulkarni.dev",
    resume: "uploads/resume.pdf",
    resumeText: "Neha Kulkarni. React, Node.js, PostgreSQL, Redis, Docker, REST APIs, Jest, CI/CD.",
    skills: ["react", "node", "postgresql", "redis", "docker", "javascript", "jest", "rest api"],
    internships: [
      {
        organization: "HirePilot",
        title: "Fullstack Intern",
        location: "Mumbai",
        startDate: new Date("2025-02-15"),
        endDate: new Date("2025-08-15"),
        description: "Built applicant tracking flows and analytics pages."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/resume.pdf",
        resumeText: "Neha Kulkarni resume v1",
        extractedSkills: ["react", "node", "postgresql", "docker"],
        source: "upload",
        createdAt: new Date("2026-01-05")
      }
    ],
    resumeBuilder: {
      fullName: "Neha Kulkarni",
      title: "Fullstack Developer",
      summary: "Pragmatic engineer focused on product velocity and reliability",
      experience: ["Fullstack Intern at HirePilot"],
      education: ["B.Tech IT - VJTI Mumbai"],
      projects: ["ATS dashboard", "Realtime notifications service"],
      certifications: ["MongoDB Associate Developer"]
    }
  },
  {
    name: "Rahul Bhat",
    email: "rahul.bhat@studentmail.com",
    role: "student",
    headline: "Cloud & DevOps Enthusiast",
    bio: "Interested in infra automation, observability, and secure deployment practices.",
    phone: "+91-9000055555",
    location: "Bengaluru",
    university: "RV College of Engineering",
    degree: "B.E.",
    specialization: "Computer Science",
    linkedin: "https://linkedin.com/in/rahul-bhat-devops",
    github: "https://github.com/rahulbhat",
    portfolio: "https://rahulbhat.cloud",
    resume: "uploads/test.pdf",
    resumeText: "Rahul Bhat. AWS, Terraform, Docker, Kubernetes, Linux, Prometheus, Grafana, CI/CD.",
    skills: ["aws", "terraform", "docker", "kubernetes", "linux", "prometheus", "grafana", "ci/cd"],
    internships: [
      {
        organization: "OpsNest",
        title: "DevOps Intern",
        location: "Remote",
        startDate: new Date("2025-01-20"),
        endDate: new Date("2025-07-20"),
        description: "Automated deployment pipelines and reduced release failures."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/test.pdf",
        resumeText: "Rahul Bhat resume v1",
        extractedSkills: ["aws", "terraform", "docker", "kubernetes"],
        source: "upload",
        createdAt: new Date("2026-01-14")
      }
    ],
    resumeBuilder: {
      fullName: "Rahul Bhat",
      title: "DevOps Engineer",
      summary: "Automation-first engineer who cares about dependable delivery",
      experience: ["DevOps Intern at OpsNest"],
      education: ["B.E. CSE - RV College of Engineering"],
      projects: ["Kubernetes cost dashboard", "GitOps deployment template"],
      certifications: ["AWS Solutions Architect - Associate"]
    }
  },
  {
    name: "Sana Qureshi",
    email: "sana.qureshi@studentmail.com",
    role: "student",
    headline: "UI Engineer | Design Systems + Accessibility",
    bio: "Builds polished interfaces and accessible component systems for web apps.",
    phone: "+91-9000066666",
    location: "Delhi",
    university: "NSUT",
    degree: "B.Tech",
    specialization: "Computer Engineering",
    linkedin: "https://linkedin.com/in/sana-qureshi-ui",
    github: "https://github.com/sanaqureshi",
    portfolio: "https://sanaui.dev",
    resume: "uploads/resume.pdf",
    resumeText: "Sana Qureshi. React, Next.js, TypeScript, Storybook, Tailwind, accessibility, testing library.",
    skills: ["react", "next.js", "typescript", "storybook", "tailwind", "accessibility", "testing-library"],
    internships: [
      {
        organization: "StudioGrid",
        title: "UI Engineer Intern",
        location: "Delhi",
        startDate: new Date("2025-03-01"),
        endDate: new Date("2025-08-30"),
        description: "Created reusable components used across 4 product squads."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/resume.pdf",
        resumeText: "Sana Qureshi resume v1",
        extractedSkills: ["react", "typescript", "tailwind", "storybook"],
        source: "upload",
        createdAt: new Date("2026-01-18")
      }
    ],
    resumeBuilder: {
      fullName: "Sana Qureshi",
      title: "UI Engineer",
      summary: "Frontend developer with design-system and accessibility focus",
      experience: ["UI Engineer Intern at StudioGrid"],
      education: ["B.Tech CE - NSUT"],
      projects: ["Accessible component library", "Portfolio CMS"],
      certifications: ["Google UX Design Certificate"]
    }
  },
  {
    name: "Karthik Reddy",
    email: "karthik.reddy@studentmail.com",
    role: "student",
    headline: "Data Engineer | Python + Airflow + SQL",
    bio: "Enjoys building ETL pipelines and data quality systems for analytics teams.",
    phone: "+91-9000077777",
    location: "Chennai",
    university: "SRM Institute of Science and Technology",
    degree: "B.Tech",
    specialization: "Data Science",
    linkedin: "https://linkedin.com/in/karthik-reddy-data",
    github: "https://github.com/karthikreddy",
    portfolio: "https://karthikdata.dev",
    resume: "uploads/test.pdf",
    resumeText: "Karthik Reddy. Python, SQL, Airflow, dbt, AWS Glue, S3, Spark.",
    skills: ["python", "sql", "airflow", "dbt", "aws", "s3", "spark", "data engineering"],
    internships: [
      {
        organization: "QuantBridge",
        title: "Data Intern",
        location: "Chennai",
        startDate: new Date("2025-02-10"),
        endDate: new Date("2025-08-10"),
        description: "Built incremental ETL models and pipeline alerting."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/test.pdf",
        resumeText: "Karthik Reddy resume v1",
        extractedSkills: ["python", "sql", "airflow", "spark"],
        source: "upload",
        createdAt: new Date("2026-01-30")
      }
    ],
    resumeBuilder: {
      fullName: "Karthik Reddy",
      title: "Data Engineer",
      summary: "Data pipeline builder with strong SQL and workflow automation skills",
      experience: ["Data Intern at QuantBridge"],
      education: ["B.Tech Data Science - SRM IST"],
      projects: ["Realtime metrics pipeline", "Airflow health monitor"],
      certifications: ["Databricks Lakehouse Fundamentals"]
    }
  },
  {
    name: "Isha Singh",
    email: "isha.singh@studentmail.com",
    role: "student",
    headline: "Product Analyst | SQL, Python, BI",
    bio: "Translates product questions into data-backed decisions and clear dashboards.",
    phone: "+91-9000088888",
    location: "Noida",
    university: "Amity University",
    degree: "B.Tech",
    specialization: "Computer Science",
    linkedin: "https://linkedin.com/in/isha-singh-analytics",
    github: "https://github.com/ishasingh",
    portfolio: "https://ishasingh.me",
    resume: "uploads/resume.pdf",
    resumeText: "Isha Singh. SQL, Python, Tableau, Power BI, A/B testing, product analytics, statistics.",
    skills: ["sql", "python", "tableau", "power bi", "a/b testing", "product analytics", "statistics"],
    internships: [
      {
        organization: "GrowthMetric",
        title: "Product Analytics Intern",
        location: "Noida",
        startDate: new Date("2025-01-05"),
        endDate: new Date("2025-06-28"),
        description: "Supported funnel analysis and experiment readouts for app growth."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/resume.pdf",
        resumeText: "Isha Singh resume v1",
        extractedSkills: ["sql", "python", "tableau", "a/b testing"],
        source: "upload",
        createdAt: new Date("2026-01-21")
      }
    ],
    resumeBuilder: {
      fullName: "Isha Singh",
      title: "Product Analyst",
      summary: "Analytical storyteller with product sense and experimentation experience",
      experience: ["Product Analytics Intern at GrowthMetric"],
      education: ["B.Tech CSE - Amity University"],
      projects: ["Retention cohort dashboard", "Experiment scorecard tool"],
      certifications: ["Google Data Analytics Professional Certificate"]
    }
  },
  {
    name: "Aman Joshi",
    email: "aman.joshi@studentmail.com",
    role: "student",
    headline: "Security Engineering Student",
    bio: "Focused on secure coding, vulnerability testing, and incident automation.",
    phone: "+91-9000099999",
    location: "Jaipur",
    university: "MNIT Jaipur",
    degree: "B.Tech",
    specialization: "Cyber Security",
    linkedin: "https://linkedin.com/in/aman-joshi-security",
    github: "https://github.com/amanjoshi",
    portfolio: "https://amansec.dev",
    resume: "uploads/test.pdf",
    resumeText: "Aman Joshi. Linux, Python, OWASP, Burp Suite, SIEM, threat detection, AWS security.",
    skills: ["linux", "python", "security", "owasp", "siem", "aws", "incident response"],
    internships: [
      {
        organization: "SecureLoop",
        title: "Security Intern",
        location: "Remote",
        startDate: new Date("2025-03-10"),
        endDate: new Date("2025-08-25"),
        description: "Automated security checks and wrote incident response playbooks."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/test.pdf",
        resumeText: "Aman Joshi resume v1",
        extractedSkills: ["linux", "python", "security", "aws"],
        source: "upload",
        createdAt: new Date("2026-02-02")
      }
    ],
    resumeBuilder: {
      fullName: "Aman Joshi",
      title: "Security Analyst",
      summary: "Security-focused engineer with practical automation experience",
      experience: ["Security Intern at SecureLoop"],
      education: ["B.Tech Cyber Security - MNIT Jaipur"],
      projects: ["SIEM alert triage automation", "Web vuln scanner plugin"],
      certifications: ["CompTIA Security+"]
    }
  },
  {
    name: "Tanya Ghosh",
    email: "tanya.ghosh@studentmail.com",
    role: "student",
    headline: "QA Automation Engineer | Cypress + Playwright",
    bio: "Strong at test strategy, regression automation, and improving release confidence.",
    phone: "+91-9000011234",
    location: "Kolkata",
    university: "Jadavpur University",
    degree: "B.E.",
    specialization: "Software Engineering",
    linkedin: "https://linkedin.com/in/tanya-ghosh-qa",
    github: "https://github.com/tanyaghosh",
    portfolio: "https://tanyaghosh.dev",
    resume: "uploads/resume.pdf",
    resumeText: "Tanya Ghosh. Cypress, Playwright, Selenium, API testing, Postman, CI pipelines, JavaScript.",
    skills: ["cypress", "playwright", "selenium", "api testing", "postman", "ci/cd", "javascript"],
    internships: [
      {
        organization: "TestForge",
        title: "QA Automation Intern",
        location: "Kolkata",
        startDate: new Date("2025-02-01"),
        endDate: new Date("2025-07-31"),
        description: "Developed end-to-end test suites that cut regression time by 40%."
      }
    ],
    resumeVersions: [
      {
        resumePath: "uploads/resume.pdf",
        resumeText: "Tanya Ghosh resume v1",
        extractedSkills: ["cypress", "playwright", "postman", "javascript"],
        source: "upload",
        createdAt: new Date("2026-01-27")
      }
    ],
    resumeBuilder: {
      fullName: "Tanya Ghosh",
      title: "QA Automation Engineer",
      summary: "Quality-focused engineer who scales testing through automation",
      experience: ["QA Automation Intern at TestForge"],
      education: ["B.E. Software Engineering - Jadavpur University"],
      projects: ["Cross-browser E2E harness", "API regression monitor"],
      certifications: ["ISTQB Foundation Level"]
    }
  }
];

const hashPassword = async (plain) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
};

async function connect() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in server/.env");
  }
  await mongoose.connect(process.env.MONGO_URI);
}

async function upsertRecruiters(passwordHash) {
  const out = [];
  for (const rec of recruitersSeed) {
    const doc = await User.findOneAndUpdate(
      { email: rec.email },
      {
        $set: {
          ...rec,
          password: passwordHash
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    out.push(doc);
  }
  return out;
}

async function upsertStudents(passwordHash) {
  const out = [];
  for (const stu of studentsSeed) {
    const doc = await User.findOneAndUpdate(
      { email: stu.email },
      {
        $set: {
          ...stu,
          password: passwordHash
        }
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    out.push(doc);
  }
  return out;
}

function findByEmail(list, email) {
  return list.find((u) => u.email === email);
}

async function upsertJobs(recruiters) {
  const aisha = findByEmail(recruiters, "aisha.verma@neurostack.ai");
  const rohan = findByEmail(recruiters, "rohan.kapoor@neurostack.ai");
  const meera = findByEmail(recruiters, "meera.nair@finbyte.com");
  const karan = findByEmail(recruiters, "karan.malhotra@cloudspring.io");
  const omar = findByEmail(recruiters, "omar.khan@brightlanehealth.com");

  const coreJobs = [
    {
      title: "Backend Engineer Intern",
      company: "NeuroStack AI",
      description: "Build internal APIs, queues, and observability tooling.",
      requiredSkills: ["node", "express", "postgresql", "redis", "docker", "aws"],
      status: "open",
      expiryDate: new Date("2026-06-30"),
      postedBy: aisha._id,
      recruiters: [aisha._id, rohan._id]
    },
    {
      title: "Frontend Engineer Intern",
      company: "NeuroStack AI",
      description: "Develop user-facing dashboard with React and TypeScript.",
      requiredSkills: ["react", "typescript", "tailwind", "redux", "graphql"],
      status: "open",
      expiryDate: new Date("2026-05-15"),
      postedBy: rohan._id,
      recruiters: [rohan._id, aisha._id]
    },
    {
      title: "Data Engineer",
      company: "FinByte Labs",
      description: "Design ETL workflows and warehousing for analytics workloads.",
      requiredSkills: ["python", "sql", "aws", "docker", "airflow"],
      status: "open",
      expiryDate: new Date("2026-07-01"),
      postedBy: meera._id,
      recruiters: [meera._id]
    },
    {
      title: "Security Analyst",
      company: "FinByte Labs",
      description: "Support appsec and incident response automation.",
      requiredSkills: ["python", "linux", "aws", "security"],
      status: "draft",
      expiryDate: new Date("2026-08-01"),
      postedBy: meera._id,
      recruiters: [meera._id]
    },
    {
      title: "Fullstack Developer Intern",
      company: "CloudSpring",
      description: "Build customer-facing workflows with React, Node.js, and PostgreSQL.",
      requiredSkills: ["react", "node", "postgresql", "docker", "javascript"],
      status: "open",
      expiryDate: new Date("2026-06-20"),
      postedBy: karan._id,
      recruiters: [karan._id]
    },
    {
      title: "Product Analyst Intern",
      company: "BrightLane Health",
      description: "Analyze product funnels and build dashboards to guide roadmap decisions.",
      requiredSkills: ["sql", "python", "tableau", "statistics", "communication"],
      status: "open",
      expiryDate: new Date("2026-06-05"),
      postedBy: omar._id,
      recruiters: [omar._id]
    }
  ];

  const jobTemplates = [
    {
      title: "Software Engineer Intern",
      description: "Build product features end-to-end and ship production-ready code.",
      requiredSkills: ["javascript", "react", "node", "sql", "git"]
    },
    {
      title: "Backend Developer Intern",
      description: "Implement APIs, data access layers, and backend services.",
      requiredSkills: ["node", "express", "postgresql", "redis", "docker"]
    },
    {
      title: "Frontend Developer Intern",
      description: "Create accessible, high-performance UI flows for web products.",
      requiredSkills: ["react", "typescript", "tailwind", "testing-library", "accessibility"]
    },
    {
      title: "Data Analyst Intern",
      description: "Build dashboards, analyze funnels, and present product insights.",
      requiredSkills: ["sql", "python", "tableau", "statistics", "communication"]
    },
    {
      title: "QA Automation Intern",
      description: "Own regression suites and improve release confidence using automation.",
      requiredSkills: ["cypress", "playwright", "postman", "api testing", "ci/cd"]
    }
  ];

  const generatedJobs = [];
  for (const recruiter of recruiters) {
    const companyName = recruiter?.recruiterProfile?.companyName || "Company";
    const teamTag = recruiter.name.split(" ")[0];
    const domainSkills = (recruiter?.recruiterProfile?.hiringDomains || [])
      .map((d) => String(d).toLowerCase())
      .filter(Boolean);

    for (let i = 0; i < jobTemplates.length; i += 1) {
      const tpl = jobTemplates[i];
      const requiredSkills = [...new Set([...tpl.requiredSkills, ...domainSkills])];
      generatedJobs.push({
        title: `${tpl.title} - ${teamTag} Track ${i + 1}`,
        company: companyName,
        description: `${tpl.description} Team: ${teamTag}.`,
        requiredSkills,
        status: "open",
        expiryDate: new Date(`2026-${String(5 + i).padStart(2, "0")}-28`),
        postedBy: recruiter._id,
        recruiters: [recruiter._id]
      });
    }
  }

  const jobsSeed = [...coreJobs, ...generatedJobs];

  const out = [];
  for (const job of jobsSeed) {
    const doc = await Job.findOneAndUpdate(
      { title: job.title, company: job.company },
      { $set: job },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    out.push(doc);
  }
  return out;
}

async function upsertApplications(students, jobs) {
  const arjun = findByEmail(students, "arjun.menon@studentmail.com");
  const priya = findByEmail(students, "priya.shah@studentmail.com");
  const dev = findByEmail(students, "dev.patel@studentmail.com");
  const neha = findByEmail(students, "neha.kulkarni@studentmail.com");
  const rahul = findByEmail(students, "rahul.bhat@studentmail.com");
  const sana = findByEmail(students, "sana.qureshi@studentmail.com");
  const karthik = findByEmail(students, "karthik.reddy@studentmail.com");
  const isha = findByEmail(students, "isha.singh@studentmail.com");
  const aman = findByEmail(students, "aman.joshi@studentmail.com");
  const tanya = findByEmail(students, "tanya.ghosh@studentmail.com");

  const backendIntern = jobs.find((j) => j.title === "Backend Engineer Intern");
  const frontendIntern = jobs.find((j) => j.title === "Frontend Engineer Intern");
  const dataEngineer = jobs.find((j) => j.title === "Data Engineer");
  const fullstackIntern = jobs.find((j) => j.title === "Fullstack Developer Intern");
  const productAnalystIntern = jobs.find((j) => j.title === "Product Analyst Intern");

  const appSeed = [
    {
      student: arjun._id,
      job: backendIntern._id,
      status: "Interview",
      score: 86,
      shortlisted: true,
      internalNotes: "Strong backend depth. Move to final round.",
      createdAt: new Date("2026-02-01"),
      statusUpdatedAt: new Date("2026-02-10")
    },
    {
      student: priya._id,
      job: frontendIntern._id,
      status: "Screening",
      score: 82,
      shortlisted: true,
      internalNotes: "Great UI ownership. Need stronger testing examples.",
      createdAt: new Date("2026-02-03"),
      statusUpdatedAt: new Date("2026-02-08")
    },
    {
      student: dev._id,
      job: dataEngineer._id,
      status: "Offered",
      score: 91,
      shortlisted: true,
      internalNotes: "Best fit for data pipelines. Offer released.",
      createdAt: new Date("2026-01-20"),
      statusUpdatedAt: new Date("2026-02-12")
    },
    {
      student: arjun._id,
      job: dataEngineer._id,
      status: "Rejected",
      score: 58,
      shortlisted: false,
      internalNotes: "Good backend, but limited data platform experience.",
      createdAt: new Date("2026-01-25"),
      statusUpdatedAt: new Date("2026-02-04")
    },
    {
      student: neha._id,
      job: fullstackIntern._id,
      status: "Interview",
      score: 88,
      shortlisted: true,
      internalNotes: "Strong fullstack project depth and clean API design choices.",
      createdAt: new Date("2026-02-02"),
      statusUpdatedAt: new Date("2026-02-11")
    },
    {
      student: rahul._id,
      job: backendIntern._id,
      status: "Screening",
      score: 77,
      shortlisted: true,
      internalNotes: "Good infra fundamentals; evaluate backend coding in next round.",
      createdAt: new Date("2026-02-04"),
      statusUpdatedAt: new Date("2026-02-10")
    },
    {
      student: sana._id,
      job: frontendIntern._id,
      status: "Interview",
      score: 85,
      shortlisted: true,
      internalNotes: "Excellent accessibility focus and component architecture.",
      createdAt: new Date("2026-02-05"),
      statusUpdatedAt: new Date("2026-02-12")
    },
    {
      student: karthik._id,
      job: dataEngineer._id,
      status: "Screening",
      score: 79,
      shortlisted: true,
      internalNotes: "Good SQL and orchestration exposure. Verify ownership depth.",
      createdAt: new Date("2026-02-01"),
      statusUpdatedAt: new Date("2026-02-09")
    },
    {
      student: isha._id,
      job: productAnalystIntern._id,
      status: "Offered",
      score: 90,
      shortlisted: true,
      internalNotes: "Clear communication and strong experiment design skills.",
      createdAt: new Date("2026-01-28"),
      statusUpdatedAt: new Date("2026-02-13")
    },
    {
      student: aman._id,
      job: backendIntern._id,
      status: "Applied",
      score: 69,
      shortlisted: false,
      internalNotes: "Security profile is strong; backend fit still under review.",
      createdAt: new Date("2026-02-07"),
      statusUpdatedAt: new Date("2026-02-07")
    },
    {
      student: tanya._id,
      job: frontendIntern._id,
      status: "Screening",
      score: 74,
      shortlisted: true,
      internalNotes: "Good QA automation background for frontend quality ownership.",
      createdAt: new Date("2026-02-06"),
      statusUpdatedAt: new Date("2026-02-11")
    }
  ];

  for (const app of appSeed) {
    await Application.findOneAndUpdate(
      { student: app.student, job: app.job },
      { $set: app },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

function buildPostsForUser(user, index) {
  const roleLabel = user.role === "recruiter" ? "Hiring" : "Learning";
  const topics = [
    "Sharing progress update and key takeaways this week.",
    "Open to collaborations and meaningful conversations.",
    "Focused on consistent growth and practical outcomes."
  ];

  return topics.map((topic, postIndex) => ({
    text: `${roleLabel} update ${postIndex + 1}: ${user.name} - ${topic}`,
    imageUrl: "",
    likes: Math.max(0, (index + 1) * (postIndex + 2)),
    author: user._id
  }));
}

async function upsertPosts(recruiters, students) {
  const users = [...recruiters, ...students];
  const postsSeed = users.flatMap((user, index) => buildPostsForUser(user, index));

  for (const post of postsSeed) {
    await Post.findOneAndUpdate(
      { author: post.author, text: post.text },
      { $set: post },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
}

async function optionalClear() {
  const shouldClear = process.argv.includes("--reset");
  if (!shouldClear) return;

  await Application.deleteMany({});
  await Job.deleteMany({});
  await Post.deleteMany({});
  await User.deleteMany({
    email: {
      $in: [
        ...recruitersSeed.map((r) => r.email),
        ...studentsSeed.map((s) => s.email)
      ]
    }
  });
}

(async () => {
  try {
    await connect();
    await optionalClear();

    const passwordHash = await hashPassword(DEMO_PASSWORD);
    const recruiters = await upsertRecruiters(passwordHash);
    const students = await upsertStudents(passwordHash);
    const jobs = await upsertJobs(recruiters);
    await upsertApplications(students, jobs);
    await upsertPosts(recruiters, students);

    console.log("Demo data seeded successfully");
    console.log("Login password for all demo users:", DEMO_PASSWORD);
    console.log("Recruiters:", recruitersSeed.map((r) => r.email).join(", "));
    console.log("Students:", studentsSeed.map((s) => s.email).join(", "));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);
    try {
      await mongoose.connection.close();
    } catch {}
    process.exit(1);
  }
})();

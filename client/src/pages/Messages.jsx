import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { SERVER_BASE_URL } from "../utils/apiBase";
import { io } from "socket.io-client";

const QUICK_REPLIES = {
  recruiter: [
    "Thanks for applying. Can you share your availability this week?",
    "Please share your latest resume and portfolio link.",
    "Your profile looks strong. Let us schedule a quick interview."
  ],
  student: [
    "Thank you for your message. I am available this week.",
    "I am interested in this role. Could you share next steps?",
    "I have attached my resume. Happy to schedule an interview."
  ]
};

const formatTime = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleString();
};

const formatDay = (value) => {
  if (!value) return "";
  return new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric"
  });
};

const sortByRecent = (items) =>
  [...items].sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));

const normalizeConversations = (items) =>
  sortByRecent((items || []).map((conv) => ({ ...conv, unreadCount: Number(conv.unreadCount || 0) })));

const mergeUniqueMessages = (existing, incoming) => {
  if (!incoming?.length) return existing;
  const map = new Map(existing.map((item) => [item._id, item]));
  incoming.forEach((item) => {
    map.set(item._id, item);
  });
  return [...map.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const toIdString = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object" && value._id) return String(value._id);
  return String(value);
};

const getFileUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `${SERVER_BASE_URL}/${url}`;
};

const renderFilePreview = (m, mine) => {
  const file = m.file;
  if (!file) return null;

  const fileUrl = getFileUrl(file.fileUrl);
  const mimeType = file.mimeType || "";
  const isImage = mimeType.startsWith("image/");
  const isPdf = mimeType === "application/pdf" || file.fileName?.toLowerCase().endsWith(".pdf");

  const formatBytes = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  if (isImage) {
    return (
      <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 bg-white max-w-xs shadow-sm hover:shadow transition-shadow text-slate-800">
        <img
          src={fileUrl}
          alt={file.fileName}
          className="max-h-48 object-contain w-full cursor-pointer hover:opacity-95 transition-opacity"
          onClick={() => window.open(fileUrl, "_blank")}
        />
        <div className="p-2 bg-slate-50 flex items-center justify-between gap-2 border-t border-slate-100">
          <span className="truncate font-semibold text-xs text-slate-700">{file.fileName}</span>
          <span className="shrink-0 text-[10px] text-slate-500 font-mono">{formatBytes(file.size)}</span>
        </div>
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 bg-white max-w-sm w-full shadow-sm hover:shadow transition-shadow text-slate-800">
        <div className="p-2.5 bg-slate-50 flex items-center gap-2 border-b border-slate-100">
          <div className="p-1.5 bg-rose-100 rounded-lg shrink-0">
            <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-xs text-slate-700 truncate">{file.fileName}</p>
            <p className="text-[10px] text-slate-500 font-mono">{formatBytes(file.size)} • PDF</p>
          </div>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
          >
            Open
          </a>
        </div>
        <div className="h-44 bg-slate-100 w-full relative flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-slate-400 select-none">
            <svg className="w-10 h-10 text-rose-300 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <span className="text-xs font-semibold text-slate-600 max-w-[240px] truncate">{file.fileName}</span>
            <span className="text-[10px] text-slate-400 mt-1">Click to open PDF</span>
          </div>
          <iframe
            src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
            width="100%"
            height="100%"
            className="border-0 pointer-events-none absolute inset-0 w-full h-full z-10 bg-transparent"
            title={file.fileName || "PDF Preview"}
          />
          <div
            className="absolute inset-0 cursor-pointer z-20"
            onClick={() => window.open(fileUrl, "_blank")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2.5 max-w-xs flex items-center gap-2.5 shadow-sm hover:shadow transition-shadow text-slate-800">
      <div className="p-1.5 bg-teal-50 rounded-lg shrink-0">
        <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-xs text-slate-700 truncate">{file.fileName}</p>
        <p className="text-[10px] text-slate-500 font-mono">{formatBytes(file.size)}</p>
      </div>
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shrink-0 transition-colors"
      >
        Open
      </a>
    </div>
  );
};

export default function Messages() {
  const navigate = useNavigate();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMoreOlder, setHasMoreOlder] = useState(false);
  const [oldestCursor, setOldestCursor] = useState("");
  const [newestCursor, setNewestCursor] = useState("");
  const [error, setError] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [contactQuery, setContactQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [contactLoading, setContactLoading] = useState(false);
  const [creatingChatFor, setCreatingChatFor] = useState("");
  const [showInterviewBox, setShowInterviewBox] = useState(false);
  const [interviewForm, setInterviewForm] = useState({
    scheduledAt: "",
    durationMinutes: 30,
    meetingProvider: "google_meet",
    meetingLink: "",
    notes: ""
  });

  const currentUserId = localStorage.getItem("userId");
  const role = localStorage.getItem("role") || "student";
  const quickReplies = QUICK_REPLIES[role] || QUICK_REPLIES.student;
  const selectedConversationId = selectedConversation?._id || null;
  const messagePaneRef = useRef(null);
  const socketRef = useRef(null);

  const contactRole = role === "student" ? "recruiter" : "student";

  const getOtherParticipant = (conversation) => {
    const participants = conversation?.participants || [];
    const me = toIdString(currentUserId);
    return participants.find((p) => toIdString(p?._id || p) !== me) || participants[0];
  };

  const updateConversationInList = (conversationId, updates) => {
    setConversations((prev) =>
      sortByRecent(prev.map((item) => (item._id === conversationId ? { ...item, ...updates } : item)))
    );
  };

  const fetchConversations = async () => {
    const res = await API.get("/messages/conversations");
    const items = normalizeConversations(res.data.data || []);
    setConversations(items);

    if (selectedConversationId) {
      const active = items.find((item) => item._id === selectedConversationId);
      if (active) setSelectedConversation(active);
    }
    return items;
  };

  const fetchMessages = async (conversationId, options = {}) => {
    const { mode = "latest", cursor = "" } = options;
    const params = { limit: mode === "before" ? 40 : 60 };
    if (mode === "before" && cursor) params.before = cursor;
    if (mode === "after" && cursor) params.after = cursor;
    const res = await API.get(`/messages/conversations/${conversationId}/messages`, { params });
    return {
      conversation: res.data.conversation,
      data: res.data.data || [],
      meta: res.data.meta || {}
    };
  };

  const openConversation = async (conversationId, shouldPushToUrl = true) => {
    try {
      setError("");
      const { conversation, data, meta } = await fetchMessages(conversationId, { mode: "latest" });
      setSelectedConversation(conversation);
      setMessages(data);
      setHasMoreOlder(Boolean(meta.hasMore));
      setOldestCursor(meta.oldestAt || "");
      setNewestCursor(meta.newestAt || "");
      updateConversationInList(conversationId, { unreadCount: 0 });
      if (shouldPushToUrl) navigate(`/messages?conversation=${conversationId}`, { replace: true });
    } catch (error) {
      setError(error?.response?.data?.message || "Could not open this conversation.");
    }
  };

  const searchContacts = async (q = "") => {
    setContactLoading(true);
    try {
      const res = await API.get("/messages/contacts", { params: { q, role: contactRole, limit: 30 } });
      setContacts(res.data.data || []);
    } catch {
      setContacts([]);
    } finally {
      setContactLoading(false);
    }
  };

  const startNewChat = async (contact) => {
    if (!contact?._id || creatingChatFor) return;
    try {
      setCreatingChatFor(contact._id);
      const res = await API.post("/messages/conversations", { participantId: contact._id });
      const conv = res.data.data;
      await fetchConversations();
      await openConversation(conv._id, true);
      setShowNewChat(false);
      setContactQuery("");
      setContacts([]);
      setError("");
    } catch (error) {
      setError(error?.response?.data?.message || error?.response?.data?.msg || "Could not start a new chat.");
    } finally {
      setCreatingChatFor("");
    }
  };

  const initFromQuery = async (allConversations) => {
    const params = new URLSearchParams(location.search);
    const userId = params.get("userId");
    const jobId = params.get("jobId");
    const conversationId = params.get("conversation");

    if (userId) {
      const res = await API.post("/messages/conversations", {
        participantId: userId,
        ...(jobId ? { jobId } : {})
      });
      const conv = res.data.data;
      await fetchConversations();
      await openConversation(conv._id, true);
      return;
    }

    if (conversationId) {
      await openConversation(conversationId, false);
      return;
    }

    if (allConversations.length > 0) {
      await openConversation(allConversations[0]._id, true);
    }
  };

  const pollSelectedConversation = async () => {
    if (!selectedConversationId) return;
    const mode = newestCursor ? "after" : "latest";
    const { data, meta } = await fetchMessages(selectedConversationId, { mode, cursor: newestCursor });
    if (data.length > 0) {
      setMessages((prev) => mergeUniqueMessages(prev, data));
      setNewestCursor(meta.newestAt || newestCursor);
      updateConversationInList(selectedConversationId, {
        unreadCount: 0,
        lastMessageAt: data[data.length - 1]?.createdAt || new Date().toISOString()
      });
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const all = await fetchConversations();
        await initFromQuery(all);
      } catch {
        setError("Failed to load conversations. Please refresh.");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!showNewChat) return;
    const timer = setTimeout(() => {
      searchContacts(contactQuery);
    }, 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNewChat, contactQuery, contactRole]);

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SERVER_BASE_URL);
    socketRef.current = socket;

    if (currentUserId) {
      socket.emit("register", currentUserId);
    }

    // Real-time message listener
    socket.on("newMessage", ({ conversationId, message }) => {
      if (selectedConversationId && String(conversationId) === String(selectedConversationId)) {
        setMessages((prev) => mergeUniqueMessages(prev, [message]));
        // Mark conversation as read on backend
        API.patch(`/messages/conversations/${conversationId}/read`).catch(() => {});
      } else {
        // Increment unread count for other conversations in list
        setConversations((prev) =>
          prev.map((item) =>
            item._id === conversationId
              ? {
                  ...item,
                  unreadCount: Number(item.unreadCount || 0) + 1,
                  lastMessagePreview: message.text || "Shared an attachment",
                  lastMessageAt: message.createdAt
                }
              : item
          )
        );
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [selectedConversationId, currentUserId]);

  // Keep a background conversation list polling at a larger interval (30 seconds)
  useEffect(() => {
    const conversationTimer = setInterval(async () => {
      try {
        await fetchConversations();
      } catch {}
    }, 30000);

    return () => {
      clearInterval(conversationTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!messagePaneRef.current) return;
    messagePaneRef.current.scrollTop = messagePaneRef.current.scrollHeight;
  }, [messages.length, selectedConversationId]);

  useEffect(() => {
    setAttachedFile(null);
  }, [selectedConversationId]);

  const sendText = async () => {
    if (!selectedConversationId || sending) return;
    const outgoingText = text.trim();
    const hasFile = Boolean(attachedFile);
    if (!outgoingText && !hasFile) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      sender: { _id: currentUserId, name: "You", role },
      messageType: hasFile ? "file" : "text",
      text: outgoingText,
      file: attachedFile || undefined,
      createdAt: new Date().toISOString()
    };

    try {
      setSending(true);
      setText("");
      setAttachedFile(null);
      setMessages((prev) => [...prev, optimisticMessage]);

      const res = await API.post(`/messages/conversations/${selectedConversationId}/messages`, {
        text: outgoingText,
        messageType: hasFile ? "file" : "text",
        file: attachedFile || undefined
      });
      const saved = res.data.data;
      setMessages((prev) => {
        const alreadyExists = prev.some((m) => m._id === saved._id);
        if (alreadyExists) {
          return prev.filter((m) => m._id !== tempId);
        }
        return prev.map((m) => (m._id === tempId ? saved : m));
      });
      setNewestCursor(saved.createdAt || newestCursor);
      updateConversationInList(selectedConversationId, {
        lastMessagePreview: hasFile
          ? `Shared file: ${attachedFile.fileName || "attachment"}`
          : outgoingText,
        lastMessageAt: saved.createdAt || new Date().toISOString(),
        unreadCount: 0
      });
    } catch (error) {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
      setText(outgoingText);
      if (hasFile) {
        setAttachedFile(optimisticMessage.file);
      }
      setError(error?.response?.data?.message || error?.response?.data?.msg || "Could not send message.");
    } finally {
      setSending(false);
    }
  };

  const onEnterToSend = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendText();
    }
  };

  const uploadFileToAttach = async (file) => {
    if (!selectedConversationId || !file || uploading) return;
    const data = new FormData();
    data.append("file", file);
    try {
      setUploading(true);
      setError("");
      const uploadRes = await API.post("/messages/upload", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setAttachedFile(uploadRes.data.data);
    } catch {
      setError("File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const scheduleInterview = async () => {
    if (role !== "recruiter") {
      setError("Only recruiters can schedule interviews.");
      return;
    }
    if (!selectedConversationId || !interviewForm.scheduledAt || scheduling) return;
    try {
      setScheduling(true);
      const res = await API.post(`/messages/conversations/${selectedConversationId}/interviews`, interviewForm);
      const saved = res.data.data;
      setMessages((prev) => mergeUniqueMessages(prev, [saved]));
      setNewestCursor(saved.createdAt || newestCursor);
      setInterviewForm({
        scheduledAt: "",
        durationMinutes: 30,
        meetingProvider: "google_meet",
        meetingLink: "",
        notes: ""
      });
      setShowInterviewBox(false);
      updateConversationInList(selectedConversationId, {
        lastMessagePreview: "Interview scheduled",
        lastMessageAt: saved.createdAt || new Date().toISOString(),
        unreadCount: 0
      });
    } catch {
      setError("Could not schedule interview.");
    } finally {
      setScheduling(false);
    }
  };

  const updateInterviewStatus = async (messageId, status) => {
    try {
      await API.patch(`/messages/interviews/${messageId}/status`, { status });
      setMessages((prev) =>
        prev.map((item) => (item._id === messageId ? { ...item, interview: { ...item.interview, status } } : item))
      );
    } catch {
      setError("Could not update interview status.");
    }
  };

  const loadOlderMessages = async () => {
    if (!selectedConversationId || !oldestCursor || loadingOlder || !hasMoreOlder) return;
    try {
      setLoadingOlder(true);
      const { data, meta } = await fetchMessages(selectedConversationId, { mode: "before", cursor: oldestCursor });
      setMessages((prev) => mergeUniqueMessages(data, prev));
      setOldestCursor(meta.oldestAt || oldestCursor);
      setHasMoreOlder(Boolean(meta.hasMore));
    } catch {
      setError("Could not load older messages.");
    } finally {
      setLoadingOlder(false);
    }
  };

  const groupedMessages = useMemo(() => {
    const groups = [];
    let activeDay = "";
    messages.forEach((message) => {
      const day = formatDay(message.createdAt);
      if (day !== activeDay) {
        groups.push({ type: "day", key: `day-${day}`, day });
        activeDay = day;
      }
      groups.push({ type: "message", key: message._id, message });
    });
    return groups;
  }, [messages]);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conv) => {
      const other = getOtherParticipant(conv);
      const haystack = [other?.name, other?.role, conv.job?.title, conv.job?.company, conv.lastMessagePreview]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [conversations, search]);

  const baseUrl = SERVER_BASE_URL;

  if (loading) {
    return (
      <div className="app-shell">
        <div className="page-wrap">
          <div className="panel panel-pad">Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="page-wrap">
        <div className="page-header flex flex-wrap items-center justify-between gap-3 mb-6 float-in">
          <div>
            <h1 className="section-title">Messages</h1>
            <p className="subtle">Search, start new chats, share files, and coordinate interviews.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowNewChat(true)} className="btn-info">New Chat</button>
            <button onClick={() => fetchConversations()} className="btn-secondary">Refresh</button>
            <a href={role === "recruiter" ? "/recruiter" : "/student"} className="btn-primary">Back to Dashboard</a>
          </div>
        </div>

        {error && <p className="text-sm text-rose-700 mb-3">{error}</p>}

        <div className="grid lg:grid-cols-[340px_1fr] gap-4">
          <aside className="panel panel-pad h-[calc(100vh-180px)] min-h-[620px] flex flex-col">
            <div className="mb-3 flex gap-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations"
                className="input"
              />
            </div>

            <div className="overflow-y-auto pr-1 flex-1">
              {filteredConversations.length === 0 && (
                <div className="py-4">
                  <p className="subtle mb-3">No conversations yet.</p>
                  <button onClick={() => setShowNewChat(true)} className="btn-primary">Start first chat</button>
                </div>
              )}

              {filteredConversations.map((conv) => {
                const other = getOtherParticipant(conv);
                const isActive = selectedConversationId === conv._id;
                return (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv._id, true)}
                    className={`w-full text-left rounded-2xl border p-3 mb-2 transition ${
                      isActive ? "border-teal-500 bg-teal-50" : "border-amber-100 bg-white/70 hover:border-amber-200"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 truncate">{other?.name || "Unknown"}</p>
                      {conv.unreadCount > 0 && <span className="pill">{conv.unreadCount} new</span>}
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{other?.role || "member"}</p>
                    {conv.job && <p className="text-xs text-amber-700 mt-1 truncate">{conv.job.title} at {conv.job.company}</p>}
                    <p className="text-xs text-slate-500 mt-2">{conv.lastMessagePreview || "No messages yet"}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="panel panel-pad h-[calc(100vh-180px)] min-h-[620px] flex flex-col">
            {!selectedConversation ? (
              <div className="h-full grid place-items-center text-center">
                <div>
                  <h2 className="text-2xl font-bold">Start a conversation</h2>
                  <p className="subtle mt-2">Use "New Chat" to pick {role === "student" ? "a recruiter" : "a candidate"} and begin messaging.</p>
                  <button onClick={() => setShowNewChat(true)} className="btn-primary mt-4">New Chat</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-amber-100">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{getOtherParticipant(selectedConversation)?.name || "User"}</h2>
                    <p className="subtle text-xs">
                      {selectedConversation.job
                        ? `${selectedConversation.job.title} at ${selectedConversation.job.company}`
                        : "Direct conversation"}
                    </p>
                  </div>
                  <span className="pill">Auto-refresh every 5s</span>
                </div>

                <div className="py-2">
                  {hasMoreOlder && (
                    <button onClick={loadOlderMessages} disabled={loadingOlder} className="btn-secondary text-sm">
                      {loadingOlder ? "Loading..." : "Load older messages"}
                    </button>
                  )}
                </div>

                <div ref={messagePaneRef} className="flex-1 overflow-y-auto py-2 pr-1 space-y-2">
                  {groupedMessages.map((entry) => {
                    if (entry.type === "day") {
                      return (
                        <div key={entry.key} className="text-center py-1">
                          <span className="inline-flex text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">{entry.day}</span>
                        </div>
                      );
                    }

                    const m = entry.message;
                    const mine = toIdString(m.sender?._id) === toIdString(currentUserId);
                    return (
                      <div key={entry.key} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[88%] rounded-2xl p-3 border ${
                            mine ? "bg-teal-600 text-white border-teal-600" : "bg-white text-slate-800 border-amber-100"
                          }`}
                        >
                          <p className={`text-[11px] mb-1 ${mine ? "text-teal-100" : "text-slate-500"}`}>
                            {m.sender?.name || "User"} | {formatTime(m.createdAt)}
                          </p>
                          {m.messageType === "text" && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                          {m.messageType === "file" && (
                            <div className="space-y-2">
                              {m.text && <p className="whitespace-pre-wrap break-words">{m.text}</p>}
                              {renderFilePreview(m, mine)}
                            </div>
                          )}
                          {m.messageType === "interview" && (
                            <div className={`rounded-xl p-3 mt-1 ${mine ? "bg-teal-500/30" : "bg-amber-50"}`}>
                              <p className="font-semibold">Interview Scheduled</p>
                              <p className="text-sm">When: {m.interview?.scheduledAt ? formatTime(m.interview.scheduledAt) : "-"}</p>
                              <p className="text-sm">Duration: {m.interview?.durationMinutes || 30} mins</p>
                              <p className="text-sm">Provider: {m.interview?.meetingProvider || "other"}</p>
                              <p className="text-sm">Status: {m.interview?.status || "scheduled"}</p>
                              {m.interview?.meetingLink && (
                                <a
                                  href={m.interview.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={mine ? "text-white underline text-sm" : "text-sky-700 underline text-sm"}
                                >
                                  Join Meeting
                                </a>
                              )}
                              {m.interview?.notes && <p className="text-sm mt-1">Notes: {m.interview.notes}</p>}
                              <div className="flex gap-2 mt-2">
                                <button onClick={() => updateInterviewStatus(m._id, "completed")} className="btn-success text-xs px-2.5 py-1.5">Mark Completed</button>
                                <button onClick={() => updateInterviewStatus(m._id, "cancelled")} className="btn-danger text-xs px-2.5 py-1.5">Cancel</button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-amber-100 space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((quick, idx) => (
                      <button key={idx} onClick={() => setText(quick)} className="chip mr-0 mb-0">{quick}</button>
                    ))}
                  </div>

                  {attachedFile && (
                    <div className="flex items-center justify-between gap-3 p-3 bg-teal-50 border border-teal-200 rounded-xl max-w-md animate-fade-in shadow-sm">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="p-2 bg-teal-100 rounded-lg shrink-0 text-teal-600">
                          {attachedFile.mimeType === "application/pdf" || attachedFile.fileName?.toLowerCase().endsWith(".pdf") ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-teal-900 truncate">{attachedFile.fileName}</p>
                          <p className="text-[10px] text-teal-600 font-mono">
                            {(() => {
                              const bytes = attachedFile.size;
                              if (!bytes) return "0 Bytes";
                              const k = 1024;
                              const sizes = ["Bytes", "KB", "MB", "GB"];
                              const i = Math.floor(Math.log(bytes) / Math.log(k));
                              return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
                            })()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAttachedFile(null)}
                        className="p-1.5 hover:bg-teal-100 text-teal-600 hover:text-teal-800 rounded-full transition-colors shrink-0"
                        title="Remove attachment"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col md:flex-row gap-2">
                    <textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={onEnterToSend}
                      placeholder="Type a message. Press Enter to send, Shift+Enter for a new line."
                      className="input flex-1 min-h-[52px] max-h-[180px]"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={sendText}
                        disabled={sending || (!text.trim() && !attachedFile)}
                        className="btn-primary"
                      >
                        {sending ? "Sending..." : "Send"}
                      </button>
                      <label className="btn-info cursor-pointer">
                        {uploading ? "Uploading..." : "Share File"}
                        <input
                          type="file"
                          className="hidden"
                          disabled={uploading}
                          onChange={(e) => {
                            uploadFileToAttach(e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  {role === "recruiter" && (
                    <div className="flex justify-end">
                      <button onClick={() => setShowInterviewBox(true)} className="btn-warning">
                        Open Interview Scheduler
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="panel w-full max-w-2xl panel-pad max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="section-title text-xl">Start New Chat</h2>
              <button onClick={() => setShowNewChat(false)} className="btn-secondary">Close</button>
            </div>
            <input
              value={contactQuery}
              onChange={(e) => setContactQuery(e.target.value)}
              placeholder={`Search ${contactRole}s by name, email, company`}
              className="input mb-3"
            />

            {contactLoading && <p className="subtle">Searching...</p>}
            {!contactLoading && contacts.length === 0 && <p className="subtle">No matching contacts found.</p>}

            {!contactLoading && contacts.map((contact) => (
              <div key={contact._id} className="border border-amber-100 rounded-2xl p-3 mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900">{contact.name}</p>
                  <p className="text-xs text-slate-600">{contact.email} | {contact.role}</p>
                  {(contact.recruiterProfile?.companyName || contact.headline) && (
                    <p className="text-xs text-amber-700 mt-1">
                      {contact.recruiterProfile?.jobTitle ? `${contact.recruiterProfile.jobTitle} | ` : ""}
                      {contact.recruiterProfile?.companyName || contact.headline}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => startNewChat(contact)}
                  disabled={creatingChatFor === contact._id}
                  className="btn-primary"
                >
                  {creatingChatFor === contact._id ? "Opening..." : "Message"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {role === "recruiter" && showInterviewBox && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="panel w-full max-w-2xl panel-pad max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-3 mb-3">
              <h2 className="section-title text-xl">Interview Scheduling</h2>
              <button onClick={() => setShowInterviewBox(false)} className="btn-secondary">Close</button>
            </div>
            <div className="grid md:grid-cols-2 gap-2">
              <input
                type="datetime-local"
                value={interviewForm.scheduledAt}
                onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                className="input"
              />
              <input
                type="number"
                min="10"
                value={interviewForm.durationMinutes}
                onChange={(e) => setInterviewForm({ ...interviewForm, durationMinutes: Number(e.target.value) })}
                className="input"
                placeholder="Duration (mins)"
              />
              <select
                value={interviewForm.meetingProvider}
                onChange={(e) => setInterviewForm({ ...interviewForm, meetingProvider: e.target.value })}
                className="input"
              >
                <option value="google_meet">Google Meet</option>
                <option value="zoom">Zoom</option>
                <option value="other">Other</option>
              </select>
              <input
                value={interviewForm.meetingLink}
                onChange={(e) => setInterviewForm({ ...interviewForm, meetingLink: e.target.value })}
                className="input"
                placeholder="Meeting link (optional)"
              />
              <input
                value={interviewForm.notes}
                onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                className="input md:col-span-2"
                placeholder="Notes"
              />
            </div>
            <button onClick={scheduleInterview} disabled={scheduling} className="mt-3 btn-warning">
              {scheduling ? "Scheduling..." : "Schedule Interview"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

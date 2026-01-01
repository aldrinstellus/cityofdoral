"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Globe,
  Clock,
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  sessionId: string;
  messages: Message[];
  language: string;
  sentiment: string;
  escalated: boolean;
  feedback?: "positive" | "negative";
  timestamp: string;
  duration?: number;
}

// Animated counter component
function AnimatedCounter({ value, duration = 1 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(easeOut * value));
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue}</span>;
}

export default function ConversationLogs() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/log");
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error("Failed to fetch:", error);
        // Demo data
        setConversations([
          {
            id: "1",
            sessionId: "sess-abc123",
            messages: [
              { role: "user", content: "What are the park hours?" },
              { role: "assistant", content: "Most City of Doral parks are open from sunrise to sunset, 7 days a week." },
            ],
            language: "en",
            sentiment: "neutral",
            escalated: false,
            feedback: "positive",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            duration: 45,
          },
          {
            id: "2",
            sessionId: "sess-def456",
            messages: [
              { role: "user", content: "¿Cómo solicito un permiso de construcción?" },
              { role: "assistant", content: "Puede solicitar un permiso de construcción en línea a través del portal e-Permitting de la Ciudad." },
            ],
            language: "es",
            sentiment: "positive",
            escalated: false,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            duration: 120,
          },
          {
            id: "3",
            sessionId: "sess-ghi789",
            messages: [
              { role: "user", content: "This is ridiculous! I've been waiting for weeks!" },
              { role: "assistant", content: "I understand your frustration. Let me connect you with a representative who can help." },
            ],
            language: "en",
            sentiment: "negative",
            escalated: true,
            feedback: "negative",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            duration: 180,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = conv.messages.some((msg) => msg.content.toLowerCase().includes(search));
      if (!matchesSearch) return false;
    }
    if (filterLanguage !== "all" && conv.language !== filterLanguage) return false;
    if (filterSentiment !== "all" && conv.sentiment !== filterSentiment) return false;
    return true;
  });

  const handleExport = () => {
    const dataStr = JSON.stringify(filteredConversations, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversations-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getSentimentStyles = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return {
          bg: "bg-gradient-to-r from-green-50 to-emerald-50",
          text: "text-green-600",
          border: "border-green-100",
          icon: TrendingUp,
        };
      case "negative":
        return {
          bg: "bg-gradient-to-r from-red-50 to-rose-50",
          text: "text-red-600",
          border: "border-red-100",
          icon: TrendingDown,
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-50 to-slate-50",
          text: "text-[#666666]",
          border: "border-gray-200",
          icon: Minus,
        };
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "—";
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  const stats = {
    total: filteredConversations.length,
    english: filteredConversations.filter((c) => c.language === "en").length,
    spanish: filteredConversations.filter((c) => c.language === "es").length,
    escalated: filteredConversations.filter((c) => c.escalated).length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">Conversation Logs</h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <MessageSquare className="h-6 w-6 text-[#1D4F91]" />
            </motion.div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">Audit trail of all chatbot interactions</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleExport}
          className="h-11 px-6 bg-gradient-to-r from-white to-blue-50/50 border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-xl hover:shadow-lg hover:border-[#000080]/30 transition-all duration-300 flex items-center gap-2 w-fit"
        >
          <Download className="h-4 w-4" />
          Export JSON
        </motion.button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Shown", value: stats.total, color: "from-[#000080]", icon: MessageSquare },
          { label: "English", value: stats.english, color: "from-[#1D4F91]", icon: Globe },
          { label: "Spanish", value: stats.spanish, color: "from-[#006A52]", icon: Globe },
          { label: "Escalated", value: stats.escalated, color: "from-amber-500", icon: AlertTriangle },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.15)] transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-[#666666] font-medium uppercase tracking-wide">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} to-transparent/50 flex items-center justify-center`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-[#000034]">
              <AnimatedCounter value={stat.value} />
            </p>
          </motion.div>
        ))}
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-5 mb-6"
      >
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-10 pr-4 bg-white border border-[#E7EBF0] rounded-xl text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFilters(!showFilters)}
            className={`h-11 px-5 border rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
              showFilters
                ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white border-transparent shadow-lg shadow-[#000080]/25"
                : "bg-white text-[#363535] border-[#E7EBF0] hover:bg-gray-50 hover:border-[#000080]/30"
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5 pt-5 border-t border-[#E7EBF0]">
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">Language</label>
                  <select
                    value={filterLanguage}
                    onChange={(e) => setFilterLanguage(e.target.value)}
                    className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer transition-all duration-200"
                  >
                    <option value="all">All Languages</option>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide">Sentiment</label>
                  <select
                    value={filterSentiment}
                    onChange={(e) => setFilterSentiment(e.target.value)}
                    className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer transition-all duration-200"
                  >
                    <option value="all">All Sentiments</option>
                    <option value="positive">Positive</option>
                    <option value="neutral">Neutral</option>
                    <option value="negative">Negative</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Conversations Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] overflow-hidden"
      >
        {loading ? (
          <div className="p-12 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="h-8 w-8 text-[#000080] mx-auto mb-3" />
            </motion.div>
            <p className="text-[#666666] text-sm">Loading conversations...</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-12 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
              <p className="text-[#666666] text-sm">
                {searchTerm || filterLanguage !== "all" || filterSentiment !== "all"
                  ? "No conversations match your filters"
                  : "No conversations yet"}
              </p>
            </motion.div>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                <th className="px-6 py-4 font-medium w-8"></th>
                <th className="px-6 py-4 font-medium">Session</th>
                <th className="px-6 py-4 font-medium w-24">Language</th>
                <th className="px-6 py-4 font-medium w-28">Sentiment</th>
                <th className="px-6 py-4 font-medium w-24">Feedback</th>
                <th className="px-6 py-4 font-medium w-24">Duration</th>
                <th className="px-6 py-4 font-medium w-40">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7EBF0]">
              {filteredConversations.map((conv, idx) => {
                const sentimentStyles = getSentimentStyles(conv.sentiment);
                const SentimentIcon = sentimentStyles.icon;
                return (
                  <motion.tbody
                    key={conv.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <tr
                      className={`cursor-pointer transition-all duration-200 ${
                        idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"
                      } hover:bg-blue-50/50`}
                      onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                    >
                      <td className="px-6 py-4">
                        <motion.div
                          animate={{ rotate: expandedId === conv.id ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="h-4 w-4 text-[#666666]" />
                        </motion.div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {conv.escalated && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            >
                              <AlertTriangle className="h-4 w-4 text-amber-500" />
                            </motion.div>
                          )}
                          <span className="text-sm font-medium text-[#000034]">
                            {conv.sessionId.slice(0, 12)}...
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-[#666666]">
                          <Globe className="h-4 w-4" />
                          {conv.language.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg capitalize font-medium border ${sentimentStyles.bg} ${sentimentStyles.text} ${sentimentStyles.border}`}
                        >
                          <SentimentIcon className="h-3 w-3" />
                          {conv.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {conv.feedback === "positive" && (
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50"
                          >
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                          </motion.div>
                        )}
                        {conv.feedback === "negative" && (
                          <motion.div
                            whileHover={{ scale: 1.2 }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-50"
                          >
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                          </motion.div>
                        )}
                        {!conv.feedback && <span className="text-[#999]">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-[#666666]">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(conv.duration)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#666666]">
                        {new Date(conv.timestamp).toLocaleString()}
                      </td>
                    </tr>

                    <AnimatePresence>
                      {expandedId === conv.id && (
                        <motion.tr
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <td colSpan={7} className="bg-gradient-to-b from-[#F5F9FD] to-white px-6 py-5 border-t border-[#E7EBF0]">
                            <div className="space-y-4 max-w-3xl">
                              {conv.messages.map((msg, msgIdx) => (
                                <motion.div
                                  key={msgIdx}
                                  initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: msgIdx * 0.1 }}
                                  className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                                >
                                  <motion.div
                                    whileHover={{ scale: 1.1 }}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${
                                      msg.role === "assistant"
                                        ? "bg-gradient-to-br from-[#000080] to-[#1D4F91] text-white"
                                        : "bg-gradient-to-br from-[#E7EBF0] to-gray-200 text-[#666666]"
                                    }`}
                                  >
                                    {msg.role === "assistant" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                                  </motion.div>
                                  <div
                                    className={`flex-1 p-4 rounded-xl text-sm shadow-sm ${
                                      msg.role === "assistant"
                                        ? "bg-white border border-[#E7EBF0] text-[#363535]"
                                        : "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                                    }`}
                                  >
                                    {msg.content}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                            <p className="text-xs text-[#999] mt-5 pt-4 border-t border-[#E7EBF0] flex items-center gap-2">
                              <Sparkles className="h-3 w-3" />
                              Session ID: {conv.sessionId}
                            </p>
                          </td>
                        </motion.tr>
                      )}
                    </AnimatePresence>
                  </motion.tbody>
                );
              })}
            </tbody>
          </table>
        )}
      </motion.div>
    </div>
  );
}

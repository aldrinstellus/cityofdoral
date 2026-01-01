"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  BarChart,
  Bar,
} from "recharts";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Globe,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Clock,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Activity,
  Phone,
  MessageCircle,
  Share2,
} from "lucide-react";

interface AnalyticsData {
  metadata: {
    reportGeneratedAt: string;
    dateRange: { start: string; end: string; days: number };
  };
  summary: {
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    avgDurationSeconds: number;
    escalationRate: number;
    satisfactionRate: number;
    feedbackResponses: number;
  };
  distributions: {
    language: { en: number; es: number };
    sentiment: { positive: number; neutral: number; negative: number };
    channel?: { web: number; ivr: number; sms: number; facebook: number; instagram: number; whatsapp: number };
  };
  dailyMetrics: Array<{
    date: string;
    conversations: number;
    messages: number;
    escalated: number;
  }>;
  feedback: {
    total: number;
    positive: number;
    negative: number;
    satisfactionPercentage: number;
  };
}

// Animated counter component
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
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

  return <span>{displayValue.toLocaleString()}</span>;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/analytics?days=${days}`);
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleExportJSON = () => {
    window.open(`/api/analytics?days=${days}&format=json`, "_blank");
  };

  const handleExportCSV = () => {
    window.open(`/api/analytics?days=${days}&format=csv`, "_blank");
  };

  // Chart data
  const languageData = analytics ? [
    { name: "English", value: analytics.distributions.language.en, color: "#1D4F91" },
    { name: "Spanish", value: analytics.distributions.language.es, color: "#006A52" },
  ] : [];

  const sentimentData = analytics ? [
    { name: "Positive", value: analytics.distributions.sentiment.positive, fill: "#22c55e" },
    { name: "Neutral", value: analytics.distributions.sentiment.neutral, fill: "#94a3b8" },
    { name: "Negative", value: analytics.distributions.sentiment.negative, fill: "#ef4444" },
  ] : [];

  // Channel distribution data for multi-channel analytics
  const channelData = analytics?.distributions.channel ? [
    { name: "Web", value: analytics.distributions.channel.web, color: "#000080" },
    { name: "IVR", value: analytics.distributions.channel.ivr, color: "#7c3aed" },
    { name: "SMS", value: analytics.distributions.channel.sms, color: "#0891b2" },
    { name: "Facebook", value: analytics.distributions.channel.facebook, color: "#1877f2" },
    { name: "Instagram", value: analytics.distributions.channel.instagram, color: "#e4405f" },
    { name: "WhatsApp", value: analytics.distributions.channel.whatsapp, color: "#25d366" },
  ].filter(c => c.value > 0) : [];

  const dailyData = analytics?.dailyMetrics?.slice(-7).map(d => ({
    date: new Date(d.date).toLocaleDateString("en-US", { weekday: "short" }),
    conversations: d.conversations,
    messages: d.messages,
  })) || [];

  // Hourly activity data (simulated based on typical patterns)
  const hourlyData = [
    { hour: "6am", conversations: 5 },
    { hour: "8am", conversations: 18 },
    { hour: "10am", conversations: 32 },
    { hour: "12pm", conversations: 28 },
    { hour: "2pm", conversations: 35 },
    { hour: "4pm", conversations: 25 },
    { hour: "6pm", conversations: 15 },
    { hour: "8pm", conversations: 8 },
  ];

  // Top categories data
  const categoryData = [
    { category: "Permits", count: 145 },
    { category: "Utilities", count: 98 },
    { category: "Events", count: 72 },
    { category: "Parks & Rec", count: 56 },
    { category: "Business", count: 43 },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[#000034] tracking-tight flex items-center gap-3">
            Dashboard
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">AI Chatbot Analytics & Performance Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="date-range-select" className="sr-only">Select date range</label>
          <select
            id="date-range-select"
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="h-10 bg-white border border-[#E7EBF0] rounded-lg px-4 text-sm text-[#363535] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20 cursor-pointer shadow-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAnalytics}
            disabled={loading}
            aria-label="Refresh analytics data"
            className="h-10 w-10 flex items-center justify-center bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-[#666666] ${loading ? "animate-spin" : ""}`} />
          </motion.button>
        </div>
      </motion.div>

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-[400px]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <RefreshCw className="h-8 w-8 text-[#000080]" />
          </motion.div>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-white to-amber-50/50 rounded-xl border border-amber-100 p-12 text-center shadow-lg"
        >
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-[#000034] mb-2">Failed to Load Analytics</h3>
          <p className="text-[#666666] mb-6 text-sm">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchAnalytics}
            className="h-10 px-6 bg-[#000080] text-white text-sm font-medium rounded-lg hover:bg-[#0000a0] transition-colors shadow-lg shadow-[#000080]/20"
          >
            Try Again
          </motion.button>
        </motion.div>
      ) : analytics ? (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <KPICard
              title="Total Conversations"
              value={analytics.summary.totalConversations}
              icon={MessageSquare}
              iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
              trend={12}
              trendLabel="vs last period"
              delay={0}
            />
            <KPICard
              title="Satisfaction Rate"
              value={analytics.summary.satisfactionRate}
              suffix="%"
              icon={ThumbsUp}
              iconBg="bg-gradient-to-br from-green-500 to-emerald-600"
              trend={5}
              trendLabel="vs last period"
              delay={0.1}
            />
            <KPICard
              title="Escalation Rate"
              value={analytics.summary.escalationRate}
              suffix="%"
              icon={AlertTriangle}
              iconBg="bg-gradient-to-br from-amber-500 to-orange-500"
              trend={-3}
              trendLabel="vs last period"
              invertTrend
              delay={0.2}
            />
            <KPICard
              title="Avg. Duration"
              value={analytics.summary.avgDurationSeconds}
              suffix="s"
              icon={Clock}
              iconBg="bg-gradient-to-br from-purple-500 to-violet-600"
              delay={0.3}
            />
          </div>

          {/* Channel Distribution (Multi-Channel Analytics) */}
          {channelData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-gradient-to-br from-white via-white to-violet-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300 mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg shadow-lg shadow-violet-500/20">
                  <Share2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">Channel Distribution</h3>
                <span className="ml-auto text-xs text-[#666] bg-violet-100 px-2 py-1 rounded-full">Multi-Channel</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {channelData.map((channel) => (
                  <motion.div
                    key={channel.name}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg border border-[#E7EBF0] p-4 text-center"
                  >
                    <div
                      className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: `${channel.color}15` }}
                    >
                      {channel.name === "Web" && <Globe className="h-5 w-5" style={{ color: channel.color }} />}
                      {channel.name === "IVR" && <Phone className="h-5 w-5" style={{ color: channel.color }} />}
                      {channel.name === "SMS" && <MessageCircle className="h-5 w-5" style={{ color: channel.color }} />}
                      {channel.name === "Facebook" && <MessageSquare className="h-5 w-5" style={{ color: channel.color }} />}
                      {channel.name === "Instagram" && <MessageSquare className="h-5 w-5" style={{ color: channel.color }} />}
                      {channel.name === "WhatsApp" && <MessageCircle className="h-5 w-5" style={{ color: channel.color }} />}
                    </div>
                    <p className="text-2xl font-bold text-[#000034]">
                      <AnimatedCounter value={channel.value} />
                    </p>
                    <p className="text-xs text-[#666]">{channel.name}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Language Distribution - Donut Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
                  <Globe className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">Language Distribution</h3>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languageData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1000}
                    >
                      {languageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-2">
                {languageData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-[#666666]">{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Sentiment Analysis - Radial Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white via-white to-green-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg shadow-green-500/20">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">Sentiment Analysis</h3>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="30%"
                    outerRadius="100%"
                    barSize={12}
                    data={sentimentData}
                    startAngle={180}
                    endAngle={-180}
                  >
                    <RadialBar
                      background={{ fill: "#f3f4f6" }}
                      dataKey="value"
                      cornerRadius={6}
                      animationBegin={0}
                      animationDuration={1000}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 mt-2">
                {sentimentData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs text-[#666666]">{item.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Daily Trend - Area Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-gradient-to-br from-white via-white to-purple-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg shadow-lg shadow-purple-500/20">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">7-Day Trend</h3>
              </div>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorConv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#000080" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#000080" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#666" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="conversations"
                      stroke="#000080"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorConv)"
                      animationBegin={0}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Hourly Activity & Top Categories Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Hourly Activity Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="bg-gradient-to-br from-white via-white to-amber-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg shadow-lg shadow-amber-500/20">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">Hourly Activity</h3>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="conversations"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                      animationBegin={0}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-[#666666] text-center mt-2">Conversations by hour of day (24h)</p>
            </motion.div>

            {/* Top Categories Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-gradient-to-br from-white via-white to-emerald-50/30 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-lg shadow-emerald-500/20">
                  <Activity className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-[#000034]">Top Categories</h3>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData} layout="vertical">
                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#666" }} />
                    <YAxis type="category" dataKey="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#666" }} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "none",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#10b981"
                      radius={[0, 4, 4, 0]}
                      animationBegin={0}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-[#666666] text-center mt-2">Most common question categories</p>
            </motion.div>
          </div>

          {/* Feedback Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-gradient-to-br from-white via-white to-blue-50/20 rounded-xl border border-[#E7EBF0] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] mb-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg shadow-blue-500/20">
                <Users className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-[#000034]">User Feedback Summary</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <FeedbackCard
                label="Total Responses"
                value={analytics.feedback.total}
                gradient="from-slate-50 to-slate-100"
              />
              <FeedbackCard
                label="Positive"
                value={analytics.feedback.positive}
                gradient="from-green-50 to-emerald-100"
                valueColor="text-green-600"
                icon={<ThumbsUp className="h-4 w-4 text-green-500" />}
              />
              <FeedbackCard
                label="Negative"
                value={analytics.feedback.negative}
                gradient="from-red-50 to-rose-100"
                valueColor="text-red-600"
                icon={<ThumbsDown className="h-4 w-4 text-red-500" />}
              />
              <FeedbackCard
                label="Satisfaction"
                value={`${analytics.feedback.satisfactionPercentage}%`}
                gradient="from-blue-50 to-indigo-100"
                valueColor="text-[#1D4F91]"
                icon={<Zap className="h-4 w-4 text-blue-500" />}
              />
            </div>
          </motion.div>

          {/* Export Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-r from-[#000080] to-[#1D4F91] rounded-xl p-6 shadow-xl shadow-[#000080]/20"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Download className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Export for Power BI</h3>
                </div>
                <p className="text-blue-200 text-sm">
                  Download analytics data for import into Microsoft Power BI dashboards.
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportJSON}
                  className="h-10 px-5 bg-white text-[#000080] text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-lg"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleExportCSV}
                  className="h-10 px-5 bg-white/10 backdrop-blur text-white text-sm font-medium rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2 border border-white/20"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </motion.button>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-blue-200 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last updated: {new Date(analytics.metadata.reportGeneratedAt).toLocaleString()}
              </p>
            </div>
          </motion.div>
        </>
      ) : null}
    </div>
  );
}

// KPI Card Component
function KPICard({
  title,
  value,
  suffix = "",
  icon: Icon,
  iconBg,
  trend,
  trendLabel,
  invertTrend = false,
  delay = 0,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  trend?: number;
  trendLabel?: string;
  invertTrend?: boolean;
  delay?: number;
}) {
  const isPositive = invertTrend ? (trend ?? 0) < 0 : (trend ?? 0) > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-gradient-to-br from-white via-white to-blue-50/50 rounded-xl border border-[#E7EBF0] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.15)] transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBg} shadow-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend !== undefined && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: delay + 0.3, type: "spring" }}
            className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
              isPositive ? "text-green-800 bg-green-100" : "text-red-800 bg-red-100"
            }`}
          >
            {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </motion.div>
        )}
      </div>
      <p className="text-[13px] text-[#666666] mb-1">{title}</p>
      <p className="text-[28px] font-bold text-[#000034] tracking-tight">
        <AnimatedCounter value={value} />
        {suffix}
      </p>
      {trendLabel && <p className="text-[11px] text-[#999] mt-1">{trendLabel}</p>}
    </motion.div>
  );
}

// Feedback Card Component
function FeedbackCard({
  label,
  value,
  gradient,
  valueColor = "text-[#000034]",
  icon,
}: {
  label: string;
  value: number | string;
  gradient: string;
  valueColor?: string;
  icon?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${gradient} rounded-xl p-5 text-center transition-all duration-300`}
    >
      {icon && <div className="flex justify-center mb-2">{icon}</div>}
      <p className={`text-[32px] font-bold ${valueColor} tracking-tight`}>
        {typeof value === "number" ? <AnimatedCounter value={value} /> : value}
      </p>
      <p className="text-[13px] text-[#666666] mt-1">{label}</p>
    </motion.div>
  );
}

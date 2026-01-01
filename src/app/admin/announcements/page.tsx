"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Calendar,
  Clock,
  AlertTriangle,
  Info,
  CheckCircle2,
  Megaphone,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "alert" | "success";
  priority: "low" | "medium" | "high";
  language: "en" | "es" | "both";
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
  showInChat: boolean;
}

const typeConfig = {
  info: {
    icon: Info,
    color: "text-[#1D4F91]",
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50",
    border: "border-blue-200",
    glow: "shadow-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bg: "bg-gradient-to-br from-amber-50 to-yellow-100/50",
    border: "border-amber-200",
    glow: "shadow-amber-500/20",
  },
  alert: {
    icon: Megaphone,
    color: "text-red-600",
    bg: "bg-gradient-to-br from-red-50 to-rose-100/50",
    border: "border-red-200",
    glow: "shadow-red-500/20",
  },
  success: {
    icon: CheckCircle2,
    color: "text-[#006A52]",
    bg: "bg-gradient-to-br from-green-50 to-emerald-100/50",
    border: "border-green-200",
    glow: "shadow-green-500/20",
  },
};

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

// Initialize announcements from localStorage or defaults
function getInitialAnnouncements(): Announcement[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("doral-announcements");
  if (stored) {
    return JSON.parse(stored);
  }
  const defaults: Announcement[] = [
    {
      id: "1",
      title: "City Hall Holiday Hours",
      message: "City Hall will be closed on January 1st for New Year's Day. Regular hours resume January 2nd.",
      type: "info",
      priority: "medium",
      language: "both",
      isActive: true,
      startDate: "2026-01-01",
      endDate: "2026-01-02",
      createdAt: new Date().toISOString(),
      showInChat: true,
    },
    {
      id: "2",
      title: "System Maintenance Notice",
      message: "The e-Permitting portal will be undergoing maintenance this weekend. Some services may be temporarily unavailable.",
      type: "warning",
      priority: "high",
      language: "both",
      isActive: false,
      startDate: "2026-01-05",
      endDate: "2026-01-06",
      createdAt: new Date().toISOString(),
      showInChat: true,
    },
  ];
  localStorage.setItem("doral-announcements", JSON.stringify(defaults));
  return defaults;
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(getInitialAnnouncements);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  const saveAnnouncements = (updated: Announcement[]) => {
    setAnnouncements(updated);
    localStorage.setItem("doral-announcements", JSON.stringify(updated));
  };

  const handleSave = (announcement: Announcement) => {
    let updated: Announcement[];
    if (editingAnnouncement) {
      updated = announcements.map((a) => (a.id === announcement.id ? announcement : a));
    } else {
      announcement.id = Date.now().toString();
      announcement.createdAt = new Date().toISOString();
      updated = [announcement, ...announcements];
    }
    saveAnnouncements(updated);
    setEditingAnnouncement(null);
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this announcement?")) {
      const updated = announcements.filter((a) => a.id !== id);
      saveAnnouncements(updated);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = announcements.map((a) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    saveAnnouncements(updated);
  };

  const filteredAnnouncements = announcements.filter((a) => {
    if (filterActive === "active") return a.isActive;
    if (filterActive === "inactive") return !a.isActive;
    return true;
  });

  const activeCount = announcements.filter((a) => a.isActive).length;
  const highPriorityCount = announcements.filter((a) => a.priority === "high" && a.isActive).length;

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
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">Announcements</h1>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell className="h-6 w-6 text-amber-500" />
            </motion.div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">Manage system alerts and city notifications</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddForm(true)}
          className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2 w-fit"
        >
          <Plus className="h-4 w-4" />
          New Announcement
        </motion.button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total", value: announcements.length, icon: Bell, gradient: "from-[#000080]" },
          { label: "Active", value: activeCount, icon: Eye, gradient: "from-[#006A52]" },
          { label: "Inactive", value: announcements.length - activeCount, icon: EyeOff, gradient: "from-gray-500" },
          { label: "High Priority", value: highPriorityCount, icon: AlertTriangle, gradient: "from-amber-500" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.15)] transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} to-transparent/50 flex items-center justify-center shadow-lg`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-[#666666] font-medium uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-bold text-[#000034]">
                  <AnimatedCounter value={stat.value} />
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2 mb-6"
      >
        {(["all", "active", "inactive"] as const).map((filter) => (
          <motion.button
            key={filter}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setFilterActive(filter)}
            className={`relative h-11 px-6 rounded-xl text-sm font-medium transition-all duration-200 capitalize ${
              filterActive === filter
                ? "text-white"
                : "bg-white text-[#363535] hover:bg-gray-50 border border-[#E7EBF0]"
            }`}
          >
            {filterActive === filter && (
              <motion.div
                layoutId="activeFilterBg"
                className="absolute inset-0 bg-gradient-to-r from-[#000080] to-[#1D4F91] rounded-xl shadow-lg shadow-[#000080]/25"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{filter}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {(showAddForm || editingAnnouncement) && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] p-6 mb-6 overflow-hidden"
          >
            <h3 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center shadow-lg">
                {editingAnnouncement ? <Edit2 className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
              </div>
              {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
            </h3>
            <AnnouncementForm
              announcement={editingAnnouncement || undefined}
              onSave={handleSave}
              onCancel={() => {
                setEditingAnnouncement(null);
                setShowAddForm(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-12 text-center shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)]"
          >
            <Bell className="h-12 w-12 mx-auto mb-4 text-[#E7EBF0]" />
            <h3 className="font-medium text-[#000034] mb-2">No announcements</h3>
            <p className="text-sm text-[#666666]">
              Create your first announcement to display in the chatbot
            </p>
          </motion.div>
        ) : (
          filteredAnnouncements.map((announcement, idx) => {
            const config = typeConfig[announcement.type];
            const Icon = config.icon;
            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] transition-all duration-300 ${
                  !announcement.isActive ? "opacity-60" : ""
                } ${announcement.priority === "high" && announcement.isActive ? `shadow-lg ${config.glow}` : ""}`}
              >
                <div className="flex items-start gap-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`p-3.5 rounded-xl ${config.bg} ${config.border} border flex-shrink-0 shadow-sm`}
                  >
                    <Icon className={`h-6 w-6 ${config.color}`} />
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="font-semibold text-[#000034]">{announcement.title}</h3>
                      {announcement.priority === "high" && (
                        <motion.span
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="inline-flex items-center gap-1 text-xs bg-gradient-to-r from-red-50 to-rose-50 text-red-600 px-2.5 py-1 rounded-lg font-medium border border-red-100"
                        >
                          <Zap className="h-3 w-3" />
                          High Priority
                        </motion.span>
                      )}
                      {!announcement.isActive && (
                        <span className="text-xs bg-gray-100 text-[#666666] px-2.5 py-1 rounded-lg font-medium">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[#666666] mb-3 leading-relaxed">{announcement.message}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#999]">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Calendar className="h-3.5 w-3.5" />
                        {announcement.startDate} - {announcement.endDate}
                      </span>
                      <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-lg">
                        <Clock className="h-3.5 w-3.5" />
                        Created: {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      {/* Language Toggle Buttons */}
                      <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newLang = announcement.language === "en" ? "both" : announcement.language === "both" ? "es" : "en";
                            const updated = announcements.map((a) =>
                              a.id === announcement.id ? { ...a, language: newLang as "en" | "es" | "both" } : a
                            );
                            saveAnnouncements(updated);
                          }}
                          className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                            announcement.language === "en" || announcement.language === "both"
                              ? "bg-[#1D4F91] text-white shadow-sm"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title="English"
                        >
                          EN
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const newLang = announcement.language === "es" ? "both" : announcement.language === "both" ? "en" : "es";
                            const updated = announcements.map((a) =>
                              a.id === announcement.id ? { ...a, language: newLang as "en" | "es" | "both" } : a
                            );
                            saveAnnouncements(updated);
                          }}
                          className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                            announcement.language === "es" || announcement.language === "both"
                              ? "bg-[#006A52] text-white shadow-sm"
                              : "text-gray-400 hover:text-gray-600"
                          }`}
                          title="Spanish"
                        >
                          ES
                        </button>
                      </div>
                      {announcement.showInChat && (
                        <span className="flex items-center gap-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-[#1D4F91] px-2.5 py-1 rounded-lg font-medium border border-blue-100">
                          <Sparkles className="h-3 w-3" />
                          Shown in Chat
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleActive(announcement.id)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-50 transition-colors ${
                        announcement.isActive ? "text-[#006A52]" : "text-[#999]"
                      }`}
                      title={announcement.isActive ? "Deactivate" : "Activate"}
                    >
                      {announcement.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setEditingAnnouncement(announcement)}
                      className="w-9 h-9 flex items-center justify-center text-[#999] hover:text-[#1D4F91] hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDelete(announcement.id)}
                      className="w-9 h-9 flex items-center justify-center text-[#999] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}

// Announcement Form Component
function AnnouncementForm({
  announcement,
  onSave,
  onCancel,
}: {
  announcement?: Announcement;
  onSave: (announcement: Announcement) => void;
  onCancel: () => void;
}) {
  const { today, nextWeek } = useMemo(() => {
    const now = new Date();
    const next = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      today: now.toISOString().split("T")[0],
      nextWeek: next.toISOString().split("T")[0],
    };
  }, []);

  const [formData, setFormData] = useState<Announcement>({
    id: announcement?.id || "",
    title: announcement?.title || "",
    message: announcement?.message || "",
    type: announcement?.type || "info",
    priority: announcement?.priority || "medium",
    language: announcement?.language || "both",
    isActive: announcement?.isActive ?? true,
    startDate: announcement?.startDate || today,
    endDate: announcement?.endDate || nextWeek,
    createdAt: announcement?.createdAt || "",
    showInChat: announcement?.showInChat ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = "w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200";
  const labelClass = "block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={inputClass}
          placeholder="Announcement title..."
          required
        />
      </div>

      <div>
        <label className={labelClass}>Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200 min-h-[120px] resize-none"
          placeholder="Announcement message..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Type</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as Announcement["type"] })
            }
            className={`${inputClass} cursor-pointer`}
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert</option>
            <option value="success">Success</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Priority</label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as Announcement["priority"] })
            }
            className={`${inputClass} cursor-pointer`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Language</label>
          <select
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value as Announcement["language"] })
            }
            className={`${inputClass} cursor-pointer`}
          >
            <option value="both">Both (EN/ES)</option>
            <option value="en">English Only</option>
            <option value="es">Spanish Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className={`${inputClass} cursor-pointer`}
            required
          />
        </div>

        <div>
          <label className={labelClass}>End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className={`${inputClass} cursor-pointer`}
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-6 pt-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#000080] peer-checked:to-[#1D4F91] transition-all duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
          </div>
          <span className="text-sm text-[#363535] group-hover:text-[#000034] transition-colors">Active</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={formData.showInChat}
              onChange={(e) => setFormData({ ...formData, showInChat: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-[#000080] peer-checked:to-[#1D4F91] transition-all duration-300"></div>
            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 peer-checked:translate-x-5"></div>
          </div>
          <span className="text-sm text-[#363535] group-hover:text-[#000034] transition-colors">Show in Chatbot</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-[#E7EBF0]">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="h-11 px-6 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200 flex items-center gap-2"
        >
          <X className="h-4 w-4" />
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Announcement
        </motion.button>
      </div>
    </form>
  );
}

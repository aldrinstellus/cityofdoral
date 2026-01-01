"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Database,
  HelpCircle,
  Check,
  Globe,
  Sparkles,
  Layers,
  Clock,
  Calendar,
  Settings,
  Zap,
  Loader2,
  Filter,
  ArrowUpDown,
  Star,
  AlertCircle,
} from "lucide-react";

// Zod validation schema for FAQ
const faqSchema = z.object({
  question: z
    .string()
    .min(10, "Question must be at least 10 characters")
    .max(500, "Question must be less than 500 characters"),
  answer: z
    .string()
    .min(20, "Answer must be at least 20 characters")
    .max(2000, "Answer must be less than 2000 characters"),
  category: z.string().min(1, "Category is required"),
  language: z.enum(["en", "es", "both"]),
  priority: z.enum(["low", "medium", "high"]),
  isActive: z.boolean(),
});

const priorityColors = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-red-100 text-red-600",
};

// Highlight matching text component
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 text-[#000034] rounded px-0.5">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
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

interface KnowledgeItem {
  title: string;
  url: string;
  section: string;
  content: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  language: "en" | "es" | "both";
  priority: "low" | "medium" | "high";
  isActive: boolean;
  createdAt?: string;
}

const categories = [
  "General",
  "Permits & Licensing",
  "Parks & Recreation",
  "Utilities",
  "Police Department",
  "Public Works",
  "Events",
  "Other",
];

interface AutoScrapeSettings {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  lastRun: string | null;
  nextRun: string | null;
}

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<"knowledge" | "faqs">("knowledge");
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [faqsLoading, setFaqsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [showAutoScrapeSettings, setShowAutoScrapeSettings] = useState(false);
  const [autoScrapeSettings, setAutoScrapeSettings] = useState<AutoScrapeSettings>({
    enabled: true,
    frequency: "weekly",
    lastRun: null,
    nextRun: null,
  });
  // FAQ filtering/sorting/bulk state
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"question" | "category" | "priority">("question");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { confirm, DialogComponent } = useConfirmDialog();

  // Set date-dependent values after mount to avoid hydration mismatch
  useEffect(() => {
    setAutoScrapeSettings(prev => ({
      ...prev,
      lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  }, []);

  useEffect(() => {
    const fetchKnowledge = async () => {
      try {
        const response = await fetch("/knowledge-base.json");
        if (response.ok) {
          const data = await response.json();
          setKnowledgeItems(data.pages || []);
        }
      } catch (error) {
        console.error("Failed to fetch knowledge base:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchKnowledge();
  }, []);

  // Fetch FAQs from API
  const fetchFaqs = useCallback(async () => {
    setFaqsLoading(true);
    try {
      const response = await fetch("/api/faqs");
      if (response.ok) {
        const data = await response.json();
        // Map API response to local FAQ type
        const mappedFaqs: FAQ[] = data.faqs.map((faq: { id: string; question: string; answer: string; category: string; priority?: string; status?: string; isActive?: boolean; createdAt?: string }) => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          language: "both" as const,
          priority: (faq.priority as "low" | "medium" | "high") || "medium",
          isActive: faq.status === "active" || faq.isActive || false,
          createdAt: faq.createdAt,
        }));
        setFaqs(mappedFaqs);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
      toast.error("Failed to load FAQs");
    } finally {
      setFaqsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const groupedKnowledge = knowledgeItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);

  const filteredSections = Object.entries(groupedKnowledge).filter(([section, items]) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      section.toLowerCase().includes(search) ||
      items.some((item) => item.title.toLowerCase().includes(search) || item.content?.toLowerCase().includes(search))
    );
  });

  const filteredFaqs = faqs
    .filter((faq) => {
      if (filterCategory !== "all" && faq.category !== filterCategory) return false;
      if (filterStatus === "active" && !faq.isActive) return false;
      if (filterStatus === "inactive" && faq.isActive) return false;
      if (filterPriority !== "all" && faq.priority !== filterPriority) return false;
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return faq.question.toLowerCase().includes(search) || faq.answer.toLowerCase().includes(search);
    })
    .sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === "category") return a.category.localeCompare(b.category);
      return a.question.localeCompare(b.question);
    });

  // FAQ stats
  const stats = {
    total: faqs.length,
    active: faqs.filter(f => f.isActive).length,
    inactive: faqs.filter(f => !f.isActive).length,
    highPriority: faqs.filter(f => f.priority === "high").length,
  };

  const handleSaveFaq = async (faq: FAQ) => {
    setSaving(true);
    try {
      const apiData = {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        isActive: faq.isActive,
      };

      if (editingFaq) {
        const response = await fetch("/api/faqs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
        if (response.ok) {
          await fetchFaqs();
          toast.success("FAQ updated successfully");
        } else {
          toast.error("Failed to update FAQ");
        }
      } else {
        const response = await fetch("/api/faqs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        });
        if (response.ok) {
          await fetchFaqs();
          toast.success("FAQ created successfully");
        } else {
          toast.error("Failed to create FAQ");
        }
      }
      setEditingFaq(null);
      setShowAddFaq(false);
    } catch (error) {
      console.error("Failed to save FAQ:", error);
      toast.error("An error occurred while saving the FAQ");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFaq = (id: string) => {
    const faq = faqs.find((f) => f.id === id);
    confirm({
      title: "Delete FAQ",
      description: `Are you sure you want to delete "${faq?.question?.slice(0, 50)}..."? This action cannot be undone.`,
      confirmLabel: "Delete",
      variant: "danger",
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/faqs?id=${id}`, {
            method: "DELETE",
          });
          if (response.ok) {
            await fetchFaqs();
            toast.success("FAQ deleted successfully");
          } else {
            toast.error("Failed to delete FAQ");
          }
        } catch (error) {
          console.error("Failed to delete FAQ:", error);
          toast.error("An error occurred while deleting the FAQ");
        }
      },
    });
  };

  // Bulk selection handlers
  const handleSelectAll = () => {
    if (selectedIds.size === filteredFaqs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredFaqs.map((f) => f.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    confirm({
      title: "Delete Selected FAQs",
      description: `Are you sure you want to delete ${selectedIds.size} FAQ(s)? This action cannot be undone.`,
      confirmLabel: "Delete All",
      variant: "danger",
      onConfirm: async () => {
        try {
          const deletePromises = Array.from(selectedIds).map((id) =>
            fetch(`/api/faqs?id=${id}`, { method: "DELETE" })
          );
          await Promise.all(deletePromises);
          await fetchFaqs();
          setSelectedIds(new Set());
          toast.success(`${selectedIds.size} FAQ(s) deleted successfully`);
        } catch (error) {
          console.error("Failed to bulk delete:", error);
          toast.error("An error occurred while deleting FAQs");
        }
      },
    });
  };

  const handleBulkToggleStatus = async (activate: boolean) => {
    try {
      const updatePromises = Array.from(selectedIds).map((id) => {
        const faq = faqs.find((f) => f.id === id);
        return fetch("/api/faqs", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            status: activate ? "active" : "inactive",
            question: faq?.question,
            answer: faq?.answer,
            category: faq?.category,
            priority: faq?.priority,
          }),
        });
      });
      await Promise.all(updatePromises);
      await fetchFaqs();
      setSelectedIds(new Set());
      toast.success(`${selectedIds.size} FAQ(s) ${activate ? "activated" : "deactivated"}`);
    } catch (error) {
      console.error("Failed to bulk update:", error);
      toast.error("An error occurred while updating FAQs");
    }
  };

  const handleToggleStatus = async (id: string) => {
    const faq = faqs.find((f) => f.id === id);
    if (!faq) return;

    try {
      const response = await fetch("/api/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          status: faq.isActive ? "inactive" : "active",
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          priority: faq.priority,
        }),
      });
      if (response.ok) {
        await fetchFaqs();
        toast.success(`FAQ ${faq.isActive ? "deactivated" : "activated"} successfully`);
      } else {
        toast.error("Failed to update FAQ status");
      }
    } catch (error) {
      console.error("Failed to toggle FAQ status:", error);
      toast.error("An error occurred while updating the FAQ");
    }
  };

  const handleRefreshKnowledge = async () => {
    setLoading(true);
    try {
      const response = await fetch("/knowledge-base.json", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setKnowledgeItems(data.pages || []);
      }
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {DialogComponent}
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">Content Management</h1>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Sparkles className="h-6 w-6 text-amber-500" />
            </motion.div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">Manage knowledge base and custom FAQs</p>
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="relative w-full lg:w-80"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
          <input
            type="text"
            placeholder="Search content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-white border border-[#E7EBF0] rounded-xl text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200"
          />
        </motion.div>
      </motion.div>

      {/* Tab Navigation - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="relative flex gap-1 p-1.5 bg-gradient-to-r from-[#F3F4F6] to-[#E7EBF0] rounded-xl w-fit mb-6 shadow-inner"
      >
        {[
          { key: "knowledge", icon: Database, label: "Knowledge Base", count: knowledgeItems.length },
          { key: "faqs", icon: HelpCircle, label: "Custom FAQs", count: faqs.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as "knowledge" | "faqs")}
            className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "text-[#000034]"
                : "text-[#666666] hover:text-[#363535]"
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="activeTabBg"
                className="absolute inset-0 bg-white rounded-lg shadow-md"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <tab.icon className="h-4 w-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
            <motion.span
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className={`relative z-10 ml-1 px-2 py-0.5 text-xs rounded-full transition-colors ${
                activeTab === tab.key
                  ? "bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white"
                  : "bg-[#F5F9FD] text-[#1D4F91]"
              }`}
            >
              {tab.count}
            </motion.span>
          </button>
        ))}
      </motion.div>

      {/* Knowledge Base Tab */}
      <AnimatePresence mode="wait">
        {activeTab === "knowledge" && (
          <motion.div
            key="knowledge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#E7EBF0] flex items-center justify-between bg-gradient-to-r from-white to-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center shadow-lg">
                  <Layers className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#000034]">Scraped Knowledge Base</h3>
                  <p className="text-sm text-[#666666] mt-0.5">
                    {knowledgeItems.length} pages indexed from City websites
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowAutoScrapeSettings(!showAutoScrapeSettings)}
                  className={`h-10 px-4 border rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 shadow-sm ${
                    autoScrapeSettings.enabled
                      ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      : "bg-white border-[#E7EBF0] text-[#363535] hover:bg-gray-50"
                  }`}
                >
                  <Zap className="h-4 w-4" />
                  Auto-Scrape {autoScrapeSettings.enabled ? "On" : "Off"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRefreshKnowledge}
                  disabled={loading}
                  className="h-10 px-5 bg-white border border-[#E7EBF0] rounded-lg text-sm font-medium text-[#363535] hover:bg-gray-50 hover:border-[#000080]/30 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 shadow-sm"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Scrape Now
                </motion.button>
              </div>
            </div>

            {/* Auto-Scrape Settings Panel */}
            <AnimatePresence>
              {showAutoScrapeSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-[#E7EBF0] overflow-hidden"
                >
                  <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-[#000080]" />
                        <h4 className="font-semibold text-[#000034]">Auto-Scrape Settings</h4>
                      </div>
                      <button
                        onClick={() => setShowAutoScrapeSettings(false)}
                        className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4 text-[#666666]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#666666] mb-1.5">Status</label>
                        <button
                          onClick={() => setAutoScrapeSettings({
                            ...autoScrapeSettings,
                            enabled: !autoScrapeSettings.enabled
                          })}
                          className={`w-full h-10 px-4 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                            autoScrapeSettings.enabled
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                          }`}
                        >
                          {autoScrapeSettings.enabled ? (
                            <>
                              <Check className="h-4 w-4" /> Enabled
                            </>
                          ) : (
                            <>Disabled</>
                          )}
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#666666] mb-1.5">Frequency</label>
                        <select
                          value={autoScrapeSettings.frequency}
                          onChange={(e) => setAutoScrapeSettings({
                            ...autoScrapeSettings,
                            frequency: e.target.value as "daily" | "weekly" | "monthly"
                          })}
                          className="w-full h-10 px-3 border border-[#E7EBF0] rounded-lg text-sm bg-white focus:outline-none focus:border-[#000080] cursor-pointer"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekly">Weekly</option>
                          <option value="monthly">Monthly</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#666666] mb-1.5">Last Run</label>
                        <div className="h-10 px-3 bg-white border border-[#E7EBF0] rounded-lg flex items-center text-sm text-[#363535]">
                          <Clock className="h-4 w-4 text-[#666666] mr-2" />
                          {autoScrapeSettings.lastRun
                            ? new Date(autoScrapeSettings.lastRun).toLocaleDateString()
                            : "Never"}
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#666666] mb-1.5">Next Run</label>
                        <div className="h-10 px-3 bg-white border border-[#E7EBF0] rounded-lg flex items-center text-sm text-[#363535]">
                          <Calendar className="h-4 w-4 text-[#666666] mr-2" />
                          {autoScrapeSettings.enabled && autoScrapeSettings.nextRun
                            ? new Date(autoScrapeSettings.nextRun).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#666666] mt-3">
                      Auto-scrape automatically refreshes the knowledge base from cityofdoral.com on the selected schedule.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="p-12 text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="h-8 w-8 text-[#000080] mx-auto mb-3" />
                </motion.div>
                <p className="text-[#666666] text-sm">Loading knowledge base...</p>
              </div>
            ) : (
              <div className="divide-y divide-[#E7EBF0]">
                {filteredSections.map(([section, items], sectionIdx) => (
                  <motion.div
                    key={section}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: sectionIdx * 0.05 }}
                  >
                    <motion.button
                      whileHover={{ backgroundColor: "rgba(0, 0, 128, 0.03)" }}
                      onClick={() => setExpandedSection(expandedSection === section ? null : section)}
                      className="w-full px-6 py-4 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: expandedSection === section ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="h-4 w-4 text-[#666666]" />
                        </motion.div>
                        <span className="font-medium text-[#000034]">{section}</span>
                        <span className="px-2.5 py-1 bg-gradient-to-r from-[#F3F4F6] to-[#E7EBF0] text-[#666666] text-xs rounded-full font-medium">
                          {items.length} pages
                        </span>
                      </div>
                    </motion.button>

                    <AnimatePresence>
                      {expandedSection === section && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-gradient-to-b from-[#F5F9FD] to-white border-t border-[#E7EBF0] overflow-hidden"
                        >
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                                <th className="px-6 py-3 font-medium">Page Title</th>
                                <th className="px-6 py-3 font-medium">URL</th>
                                <th className="px-6 py-3 font-medium w-20">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[#E7EBF0]">
                              {items.slice(0, 10).map((item, idx) => (
                                <motion.tr
                                  key={idx}
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                  className={`${idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"} hover:bg-blue-50/50 transition-colors`}
                                >
                                  <td className="px-6 py-3 text-sm text-[#363535] font-medium">
                                    {item.title}
                                  </td>
                                  <td className="px-6 py-3 text-sm text-[#666666] truncate max-w-[300px]">
                                    {item.url}
                                  </td>
                                  <td className="px-6 py-3">
                                    <motion.a
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      href={`https://www.cityofdoral.com${item.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center justify-center w-8 h-8 text-[#1D4F91] hover:bg-blue-100 rounded-lg transition-colors"
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </motion.a>
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                          {items.length > 10 && (
                            <p className="text-center py-3 text-sm text-[#666666] bg-white border-t border-[#E7EBF0]">
                              + {items.length - 10} more pages
                            </p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* FAQs Tab */}
        {activeTab === "faqs" && (
          <motion.div
            key="faqs"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Total FAQs", value: stats.total, color: "from-blue-500 to-blue-600" },
                { label: "Active", value: stats.active, color: "from-green-500 to-emerald-600" },
                { label: "Inactive", value: stats.inactive, color: "from-gray-400 to-gray-500" },
                { label: "High Priority", value: stats.highPriority, color: "from-red-500 to-rose-600" },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-xl border border-[#E7EBF0] p-4 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <HelpCircle className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-[#000034]">
                    <AnimatedCounter value={stat.value} />
                  </p>
                  <p className="text-sm text-[#666666]">{stat.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Search and Filters */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                  <input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 transition-all"
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-[#666]" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                    className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                  >
                    <option value="all">All Priorities</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-[#666]" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "question" | "category" | "priority")}
                      className="h-10 px-3 bg-[#F5F9FD] border border-[#E7EBF0] rounded-lg text-sm text-[#363535] focus:outline-none focus:border-[#000080] cursor-pointer"
                    >
                      <option value="question">Sort by Question</option>
                      <option value="category">Sort by Category</option>
                      <option value="priority">Sort by Priority</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowAddFaq(true)}
                    className="h-10 px-5 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add FAQ
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* FAQ Editor */}
            <AnimatePresence>
              {(showAddFaq || editingFaq) && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-lg p-6 mb-6 overflow-hidden"
                >
                  <h3 className="font-semibold text-[#000034] mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#000080] to-[#1D4F91] flex items-center justify-center">
                      {editingFaq ? <Edit2 className="h-4 w-4 text-white" /> : <Plus className="h-4 w-4 text-white" />}
                    </div>
                    {editingFaq ? "Edit FAQ" : "Add New FAQ"}
                  </h3>
                  <FaqForm
                    faq={editingFaq || undefined}
                    onSave={handleSaveFaq}
                    onCancel={() => {
                      setEditingFaq(null);
                      setShowAddFaq(false);
                    }}
                    saving={saving}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
            >
              {faqsLoading ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                      <th className="px-4 py-4 w-12"><Skeleton className="h-4 w-4 bg-white/20" /></th>
                      <th className="px-6 py-4 font-medium">Question</th>
                      <th className="px-6 py-4 font-medium w-36">Category</th>
                      <th className="px-6 py-4 font-medium w-24">Priority</th>
                      <th className="px-6 py-4 font-medium w-24">Language</th>
                      <th className="px-6 py-4 font-medium w-20">Status</th>
                      <th className="px-6 py-4 font-medium w-28">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7EBF0]">
                    {[...Array(5)].map((_, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="px-4 py-4"><Skeleton className="h-4 w-4 bg-gray-200" /></td>
                        <td className="px-6 py-4">
                          <Skeleton className="h-4 w-3/4 mb-2 bg-gray-200" />
                          <Skeleton className="h-3 w-full bg-gray-100" />
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full bg-gray-200" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full bg-gray-200" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-12 bg-gray-200" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full bg-gray-200" /></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                            <Skeleton className="h-8 w-8 rounded-lg bg-gray-200" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <>
                  {/* Bulk Action Bar */}
                  <AnimatePresence>
                    {selectedIds.size > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-[#000080]/5 to-[#1D4F91]/5 border-b border-[#E7EBF0]"
                      >
                        <span className="text-sm font-medium text-[#000034]">
                          {selectedIds.size} item(s) selected
                        </span>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBulkToggleStatus(true)}
                            className="h-8 px-3 text-xs font-medium bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          >
                            Activate
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBulkToggleStatus(false)}
                            className="h-8 px-3 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            Deactivate
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleBulkDelete}
                            className="h-8 px-3 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </motion.button>
                          <button
                            onClick={() => setSelectedIds(new Set())}
                            className="h-8 px-3 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                        <th className="px-4 py-4 w-12">
                          <input
                            type="checkbox"
                            checked={selectedIds.size === filteredFaqs.length && filteredFaqs.length > 0}
                            onChange={handleSelectAll}
                            className="w-4 h-4 rounded border-white/30 text-white focus:ring-white/20 cursor-pointer"
                          />
                        </th>
                        <th className="px-6 py-4 font-medium">Question</th>
                        <th className="px-6 py-4 font-medium w-36">Category</th>
                        <th className="px-6 py-4 font-medium w-24">Priority</th>
                        <th className="px-6 py-4 font-medium w-24">Language</th>
                        <th className="px-6 py-4 font-medium w-20">Status</th>
                        <th className="px-6 py-4 font-medium w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E7EBF0]">
                      {filteredFaqs.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center">
                            <HelpCircle className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
                            <p className="text-[#666666] text-sm">
                              {searchTerm || filterCategory !== "all" || filterStatus !== "all" || filterPriority !== "all"
                                ? "No FAQs match your filters"
                                : "No FAQs yet. Add your first one!"}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredFaqs.map((faq, idx) => (
                          <motion.tr
                            key={faq.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`${idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"} hover:bg-blue-50/50 transition-colors ${selectedIds.has(faq.id) ? "bg-blue-50/80" : ""}`}
                          >
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.has(faq.id)}
                                onChange={() => handleSelectOne(faq.id)}
                                className="w-4 h-4 rounded border-gray-300 text-[#000080] focus:ring-[#000080]/20 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-[#000034]">
                                <HighlightText text={faq.question} highlight={searchTerm} />
                              </p>
                              <p className="text-xs text-[#666666] mt-1 line-clamp-1">
                                <HighlightText text={faq.answer} highlight={searchTerm} />
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1.5 bg-gradient-to-r from-[#F3F4F6] to-[#E7EBF0] text-[#363535] text-xs rounded-lg font-medium">
                                {faq.category}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-xs rounded-lg font-medium capitalize flex items-center gap-1 w-fit ${priorityColors[faq.priority]}`}>
                                {faq.priority === "high" && <Star className="h-3 w-3" />}
                                {faq.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                                <Globe className="h-3.5 w-3.5" />
                                {faq.language === "both" ? "EN/ES" : faq.language.toUpperCase()}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleToggleStatus(faq.id)}
                                className="focus:outline-none"
                              >
                                {faq.isActive ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-600 text-xs rounded-lg font-medium border border-green-100 hover:bg-green-100 transition-colors">
                                    <Check className="h-3 w-3" />
                                    Active
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 bg-gray-100 text-[#666666] text-xs rounded-lg font-medium hover:bg-gray-200 transition-colors">
                                    Inactive
                                  </span>
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => setEditingFaq(faq)}
                                  className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-[#1D4F91] hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteFaq(faq.id)}
                                  className="w-8 h-8 flex items-center justify-center text-[#666666] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {filteredFaqs.length > 0 && (
                    <div className="px-6 py-3 bg-[#F5F9FD] border-t border-[#E7EBF0] text-sm text-[#666666]">
                      Showing {filteredFaqs.length} of {faqs.length} FAQs
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqForm({
  faq,
  onSave,
  onCancel,
  saving = false,
}: {
  faq?: FAQ;
  onSave: (faq: FAQ) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [formData, setFormData] = useState<FAQ>({
    id: faq?.id || "",
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "General",
    language: faq?.language || "both",
    priority: faq?.priority || "medium",
    isActive: faq?.isActive ?? true,
    createdAt: faq?.createdAt || new Date().toISOString(),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate with Zod
    const result = faqSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSave(formData);
  };

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#363535] mb-2">Question</label>
        <input
          type="text"
          value={formData.question}
          onChange={(e) => {
            setFormData({ ...formData, question: e.target.value });
            clearError("question");
          }}
          className={`w-full h-11 px-4 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${
            errors.question
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : "border-[#E7EBF0] focus:border-[#000080] focus:ring-[#000080]/10"
          }`}
          placeholder="Enter the question..."
        />
        {errors.question && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.question}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#363535] mb-2">Answer</label>
        <textarea
          value={formData.answer}
          onChange={(e) => {
            setFormData({ ...formData, answer: e.target.value });
            clearError("answer");
          }}
          className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all min-h-[120px] resize-none ${
            errors.answer
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/10"
              : "border-[#E7EBF0] focus:border-[#000080] focus:ring-[#000080]/10"
          }`}
          placeholder="Enter the answer..."
        />
        {errors.answer && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {errors.answer}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer transition-all"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as "low" | "medium" | "high" })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer transition-all"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value as "en" | "es" | "both" })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer transition-all"
          >
            <option value="both">Both (EN/ES)</option>
            <option value="en">English Only</option>
            <option value="es">Spanish Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Status</label>
          <select
            value={formData.isActive ? "active" : "inactive"}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer transition-all"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="h-11 px-6 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-lg hover:bg-gray-50 transition-all"
        >
          <X className="h-4 w-4 inline mr-2" />
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: saving ? 1 : 1.02, y: saving ? 0 : -2 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
          type="submit"
          disabled={saving}
          className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving..." : "Save FAQ"}
        </motion.button>
      </div>
    </form>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";

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
  isActive: boolean;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [showAutoScrapeSettings, setShowAutoScrapeSettings] = useState(false);
  const [autoScrapeSettings, setAutoScrapeSettings] = useState<AutoScrapeSettings>({
    enabled: true,
    frequency: "weekly",
    lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
  });

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

  useEffect(() => {
    const storedFaqs = localStorage.getItem("doral-faqs");
    if (storedFaqs) {
      setFaqs(JSON.parse(storedFaqs));
    } else {
      const defaultFaqs: FAQ[] = [
        {
          id: "1",
          question: "How do I apply for a building permit?",
          answer: "You can apply for a building permit online through the City's e-Permitting portal or visit the Building Department at City Hall.",
          category: "Permits & Licensing",
          language: "both",
          isActive: true,
        },
        {
          id: "2",
          question: "What are the park hours?",
          answer: "Most City of Doral parks are open from sunrise to sunset, 7 days a week. Some facilities may have extended hours.",
          category: "Parks & Recreation",
          language: "both",
          isActive: true,
        },
      ];
      setFaqs(defaultFaqs);
      localStorage.setItem("doral-faqs", JSON.stringify(defaultFaqs));
    }
  }, []);

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

  const filteredFaqs = faqs.filter((faq) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return faq.question.toLowerCase().includes(search) || faq.answer.toLowerCase().includes(search);
  });

  const handleSaveFaq = (faq: FAQ) => {
    let updatedFaqs: FAQ[];
    if (editingFaq) {
      updatedFaqs = faqs.map((f) => (f.id === faq.id ? faq : f));
    } else {
      faq.id = Date.now().toString();
      updatedFaqs = [...faqs, faq];
    }
    setFaqs(updatedFaqs);
    localStorage.setItem("doral-faqs", JSON.stringify(updatedFaqs));
    setEditingFaq(null);
    setShowAddFaq(false);
  };

  const handleDeleteFaq = (id: string) => {
    const updatedFaqs = faqs.filter((f) => f.id !== id);
    setFaqs(updatedFaqs);
    localStorage.setItem("doral-faqs", JSON.stringify(updatedFaqs));
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
            <div className="flex justify-end mb-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowAddFaq(true)}
                className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add FAQ
              </motion.button>
            </div>

            {/* FAQ Editor */}
            <AnimatePresence>
              {(showAddFaq || editingFaq) && (
                <motion.div
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_8px_30px_-4px_rgba(0,0,128,0.12)] p-6 mb-6 overflow-hidden"
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
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ Table */}
            <div className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-[#1D4F91] to-[#000080] text-white text-left text-sm">
                    <th className="px-6 py-4 font-medium">Question</th>
                    <th className="px-6 py-4 font-medium w-36">Category</th>
                    <th className="px-6 py-4 font-medium w-24">Language</th>
                    <th className="px-6 py-4 font-medium w-20">Status</th>
                    <th className="px-6 py-4 font-medium w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7EBF0]">
                  {filteredFaqs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <FileText className="h-12 w-12 mx-auto mb-3 text-[#E7EBF0]" />
                          <p className="text-[#666666] text-sm">
                            {searchTerm ? "No FAQs match your search" : "No FAQs yet. Add your first one!"}
                          </p>
                        </motion.div>
                      </td>
                    </tr>
                  ) : (
                    filteredFaqs.map((faq, idx) => (
                      <motion.tr
                        key={faq.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`${idx % 2 === 0 ? "bg-white" : "bg-[#F5F9FD]/50"} hover:bg-blue-50/50 transition-all duration-200`}
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-[#000034]">{faq.question}</p>
                          <p className="text-xs text-[#666666] mt-1 line-clamp-1">{faq.answer}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 bg-gradient-to-r from-[#F3F4F6] to-[#E7EBF0] text-[#363535] text-xs rounded-lg font-medium">
                            {faq.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                            <Globe className="h-3.5 w-3.5" />
                            {faq.language === "both" ? "EN/ES" : faq.language.toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {faq.isActive ? (
                            <motion.span
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 text-xs rounded-lg font-medium border border-green-100"
                            >
                              <Check className="h-3 w-3" />
                              Active
                            </motion.span>
                          ) : (
                            <span className="px-2.5 py-1 bg-gray-100 text-[#666666] text-xs rounded-lg font-medium">
                              Inactive
                            </span>
                          )}
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
            </div>
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
}: {
  faq?: FAQ;
  onSave: (faq: FAQ) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<FAQ>({
    id: faq?.id || "",
    question: faq?.question || "",
    answer: faq?.answer || "",
    category: faq?.category || "General",
    language: faq?.language || "both",
    isActive: faq?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#363535] mb-2">Question</label>
        <input
          type="text"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200"
          placeholder="Enter the question..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#363535] mb-2">Answer</label>
        <textarea
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          className="w-full px-4 py-3 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200 min-h-[120px] resize-none"
          placeholder="Enter the answer..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer transition-all duration-200"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#363535] mb-2">Language</label>
          <select
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value as "en" | "es" | "both" })}
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer transition-all duration-200"
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
            className="w-full h-11 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 cursor-pointer transition-all duration-200"
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
          className="h-11 px-6 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-lg hover:bg-gray-50 transition-all duration-200"
        >
          Cancel
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save FAQ
        </motion.button>
      </div>
    </form>
  );
}

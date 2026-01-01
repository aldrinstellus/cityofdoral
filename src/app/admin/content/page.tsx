"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Plus,
  Search,
  Edit2,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface KnowledgeItem {
  title: string;
  url: string;
  section: string;
  content: string;
  lastUpdated?: string;
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

export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState<"knowledge" | "faqs">("knowledge");
  const [knowledgeItems, setKnowledgeItems] = useState<KnowledgeItem[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [showAddFaq, setShowAddFaq] = useState(false);

  // Fetch knowledge base
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

  // Load FAQs from localStorage (demo)
  useEffect(() => {
    const storedFaqs = localStorage.getItem("doral-faqs");
    if (storedFaqs) {
      setFaqs(JSON.parse(storedFaqs));
    } else {
      // Default FAQs
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

  // Group knowledge items by section
  const groupedKnowledge = knowledgeItems.reduce((acc, item) => {
    const section = item.section || "Other";
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, KnowledgeItem[]>);

  // Filter knowledge items
  const filteredSections = Object.entries(groupedKnowledge).filter(([section, items]) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      section.toLowerCase().includes(search) ||
      items.some(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.content?.toLowerCase().includes(search)
      )
    );
  });

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      faq.question.toLowerCase().includes(search) ||
      faq.answer.toLowerCase().includes(search) ||
      faq.category.toLowerCase().includes(search)
    );
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
      console.error("Failed to refresh knowledge base:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#000034]">Content Management</h1>
          <p className="text-gray-500 mt-1">Manage knowledge base and FAQs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] w-64"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("knowledge")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === "knowledge"
              ? "bg-[#000080] text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-[#E7EBF0]"
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Knowledge Base ({knowledgeItems.length})
        </button>
        <button
          onClick={() => setActiveTab("faqs")}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            activeTab === "faqs"
              ? "bg-[#000080] text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-[#E7EBF0]"
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Custom FAQs ({faqs.length})
        </button>
      </div>

      {/* Knowledge Base Tab */}
      {activeTab === "knowledge" && (
        <Card className="bg-white border-[#E7EBF0]">
          <div className="p-4 border-b border-[#E7EBF0] flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-[#000034]">Scraped Knowledge Base</h3>
              <p className="text-sm text-gray-500">
                {knowledgeItems.length} pages indexed from City websites
              </p>
            </div>
            <Button
              onClick={handleRefreshKnowledge}
              variant="outline"
              className="border-[#E7EBF0]"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin text-[#000080]" />
            </div>
          ) : (
            <div className="divide-y divide-[#E7EBF0]">
              {filteredSections.map(([section, items]) => (
                <div key={section}>
                  <button
                    onClick={() =>
                      setExpandedSection(expandedSection === section ? null : section)
                    }
                    className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {expandedSection === section ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="font-medium text-[#000034]">{section}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {items.length} pages
                      </span>
                    </div>
                  </button>

                  {expandedSection === section && (
                    <div className="bg-[#F5F9FD] px-4 py-2">
                      <div className="space-y-2">
                        {items.slice(0, 10).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between bg-white p-3 rounded-lg border border-[#E7EBF0]"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-[#000034] truncate">
                                {item.title}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{item.url}</p>
                            </div>
                            <a
                              href={`https://www.cityofdoral.com${item.url}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 p-1.5 text-[#1D4F91] hover:bg-blue-50 rounded"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        ))}
                        {items.length > 10 && (
                          <p className="text-xs text-gray-500 text-center py-2">
                            + {items.length - 10} more pages
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <>
          <div className="flex justify-end mb-4">
            <Button
              onClick={() => setShowAddFaq(true)}
              className="bg-[#000080] hover:bg-[#0000a0]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>

          {/* FAQ Editor Modal */}
          {(showAddFaq || editingFaq) && (
            <Card className="mb-6 p-6 bg-white border-[#E7EBF0]">
              <h3 className="font-semibold text-[#000034] mb-4">
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
            </Card>
          )}

          {/* FAQ List */}
          <div className="space-y-3">
            {filteredFaqs.map((faq) => (
              <Card key={faq.id} className="p-4 bg-white border-[#E7EBF0]">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {faq.isActive ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                      <span className="text-xs bg-[#1D4F91] text-white px-2 py-0.5 rounded">
                        {faq.category}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {faq.language === "both" ? "EN/ES" : faq.language.toUpperCase()}
                      </span>
                    </div>
                    <h4 className="font-medium text-[#000034] mb-1">{faq.question}</h4>
                    <p className="text-sm text-gray-600">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingFaq(faq)}
                      className="p-2 text-gray-400 hover:text-[#1D4F91] hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}

            {filteredFaqs.length === 0 && (
              <Card className="p-8 text-center bg-white border-[#E7EBF0]">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="font-medium text-gray-600 mb-2">No FAQs found</h3>
                <p className="text-sm text-gray-500">
                  {searchTerm ? "Try a different search term" : "Add your first FAQ to get started"}
                </p>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// FAQ Form Component
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
        <input
          type="text"
          value={formData.question}
          onChange={(e) => setFormData({ ...formData, question: e.target.value })}
          className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
          placeholder="Enter the question..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
        <textarea
          value={formData.answer}
          onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
          className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080] min-h-[100px]"
          placeholder="Enter the answer..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value as "en" | "es" | "both" })
            }
            className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
          >
            <option value="both">Both (EN/ES)</option>
            <option value="en">English Only</option>
            <option value="es">Spanish Only</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.isActive ? "active" : "inactive"}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "active" })}
            className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#E7EBF0]">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" className="bg-[#000080] hover:bg-[#0000a0]">
          <Save className="h-4 w-4 mr-2" />
          Save FAQ
        </Button>
      </div>
    </form>
  );
}

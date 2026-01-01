"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
  warning: { icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
  alert: { icon: Megaphone, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
  success: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  // Load announcements from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("doral-announcements");
    if (stored) {
      setAnnouncements(JSON.parse(stored));
    } else {
      // Default announcements
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
      setAnnouncements(defaults);
      localStorage.setItem("doral-announcements", JSON.stringify(defaults));
    }
  }, []);

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

  // Filter announcements
  const filteredAnnouncements = announcements.filter((a) => {
    if (filterActive === "active") return a.isActive;
    if (filterActive === "inactive") return !a.isActive;
    return true;
  });

  const activeCount = announcements.filter((a) => a.isActive).length;

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#000034]">Announcements</h1>
          <p className="text-gray-500 mt-1">
            Manage system alerts and city notifications
          </p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-[#000080] hover:bg-[#0000a0]"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 bg-white border-[#E7EBF0]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Bell className="h-5 w-5 text-[#1D4F91]" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-[#000034]">{announcements.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-[#E7EBF0]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold text-green-600">{activeCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-[#E7EBF0]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <EyeOff className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Inactive</p>
              <p className="text-xl font-bold text-gray-600">
                {announcements.length - activeCount}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-white border-[#E7EBF0]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">High Priority</p>
              <p className="text-xl font-bold text-amber-600">
                {announcements.filter((a) => a.priority === "high" && a.isActive).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "active", "inactive"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setFilterActive(filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              filterActive === filter
                ? "bg-[#000080] text-white"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-[#E7EBF0]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingAnnouncement) && (
        <Card className="mb-6 p-6 bg-white border-[#E7EBF0]">
          <h3 className="font-semibold text-[#000034] mb-4">
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
        </Card>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length === 0 ? (
          <Card className="p-8 text-center bg-white border-[#E7EBF0]">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-medium text-gray-600 mb-2">No announcements</h3>
            <p className="text-sm text-gray-500">
              Create your first announcement to display in the chatbot
            </p>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const config = typeConfig[announcement.type];
            const Icon = config.icon;
            return (
              <Card
                key={announcement.id}
                className={`p-5 bg-white border-[#E7EBF0] ${
                  !announcement.isActive ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${config.bg}`}>
                    <Icon className={`h-6 w-6 ${config.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#000034]">{announcement.title}</h3>
                      {announcement.priority === "high" && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          High Priority
                        </span>
                      )}
                      {!announcement.isActive && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{announcement.message}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {announcement.startDate} - {announcement.endDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Created: {new Date(announcement.createdAt).toLocaleDateString()}
                      </span>
                      <span className="bg-gray-100 px-2 py-0.5 rounded">
                        {announcement.language === "both"
                          ? "EN/ES"
                          : announcement.language.toUpperCase()}
                      </span>
                      {announcement.showInChat && (
                        <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                          Shown in Chat
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleActive(announcement.id)}
                      className={`p-2 rounded hover:bg-gray-100 ${
                        announcement.isActive ? "text-green-500" : "text-gray-400"
                      }`}
                      title={announcement.isActive ? "Deactivate" : "Activate"}
                    >
                      {announcement.isActive ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingAnnouncement(announcement)}
                      className="p-2 text-gray-400 hover:text-[#1D4F91] hover:bg-blue-50 rounded"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
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
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
          placeholder="Announcement title..."
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080] min-h-[100px]"
          placeholder="Announcement message..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as Announcement["type"] })
            }
            className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
          >
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="alert">Alert</option>
            <option value="success">Success</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as Announcement["priority"] })
            }
            className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
          <select
            value={formData.language}
            onChange={(e) =>
              setFormData({ ...formData, language: e.target.value as Announcement["language"] })
            }
            className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
          >
            <option value="both">Both (EN/ES)</option>
            <option value="en">English Only</option>
            <option value="es">Spanish Only</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
          />
          <span className="text-sm text-gray-700">Active</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.showInChat}
            onChange={(e) => setFormData({ ...formData, showInChat: e.target.checked })}
            className="w-4 h-4 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
          />
          <span className="text-sm text-gray-700">Show in Chatbot</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} className="border-[#E7EBF0]">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" className="bg-[#000080] hover:bg-[#0000a0]">
          <Save className="h-4 w-4 mr-2" />
          Save Announcement
        </Button>
      </div>
    </form>
  );
}

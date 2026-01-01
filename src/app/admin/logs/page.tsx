"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Bot,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Globe,
  Clock,
  Download,
  RefreshCw,
  X,
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
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

export default function ConversationLogs() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filterLanguage, setFilterLanguage] = useState<string>("all");
  const [filterSentiment, setFilterSentiment] = useState<string>("all");
  const [filterEscalated, setFilterEscalated] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await fetch("/api/log");
        if (response.ok) {
          const data = await response.json();
          setConversations(data.conversations || []);
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        // Demo data if API fails
        setConversations([
          {
            id: "demo-1",
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
            id: "demo-2",
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
            id: "demo-3",
            sessionId: "sess-ghi789",
            messages: [
              { role: "user", content: "This is ridiculous! I've been waiting for weeks!" },
              { role: "assistant", content: "I understand your frustration. Let me connect you with a representative who can help resolve this quickly." },
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

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch = conv.messages.some((msg) =>
        msg.content.toLowerCase().includes(search)
      );
      if (!matchesSearch) return false;
    }

    // Language filter
    if (filterLanguage !== "all" && conv.language !== filterLanguage) return false;

    // Sentiment filter
    if (filterSentiment !== "all" && conv.sentiment !== filterSentiment) return false;

    // Escalated filter
    if (filterEscalated === "yes" && !conv.escalated) return false;
    if (filterEscalated === "no" && conv.escalated) return false;

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

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50";
      case "negative":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#000034]">Conversation Logs</h1>
          <p className="text-gray-500 mt-1">
            Audit trail of all chatbot interactions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleExport} variant="outline" className="border-[#E7EBF0]">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6 bg-white border-[#E7EBF0]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-[#E7EBF0]"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? (
              <ChevronUp className="h-4 w-4 ml-2" />
            ) : (
              <ChevronDown className="h-4 w-4 ml-2" />
            )}
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#E7EBF0]">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Language</label>
              <select
                value={filterLanguage}
                onChange={(e) => setFilterLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              >
                <option value="all">All Languages</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Sentiment</label>
              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Escalated</label>
              <select
                value={filterEscalated}
                onChange={(e) => setFilterEscalated(e.target.value)}
                className="w-full px-3 py-2 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080]"
              >
                <option value="all">All</option>
                <option value="yes">Escalated Only</option>
                <option value="no">Not Escalated</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-[#E7EBF0]">
          <p className="text-xs text-gray-500">Total Shown</p>
          <p className="text-xl font-bold text-[#000034]">{filteredConversations.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E7EBF0]">
          <p className="text-xs text-gray-500">English</p>
          <p className="text-xl font-bold text-[#1D4F91]">
            {filteredConversations.filter((c) => c.language === "en").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E7EBF0]">
          <p className="text-xs text-gray-500">Spanish</p>
          <p className="text-xl font-bold text-[#006A52]">
            {filteredConversations.filter((c) => c.language === "es").length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-[#E7EBF0]">
          <p className="text-xs text-gray-500">Escalated</p>
          <p className="text-xl font-bold text-amber-600">
            {filteredConversations.filter((c) => c.escalated).length}
          </p>
        </div>
      </div>

      {/* Conversation List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#000080]" />
        </div>
      ) : filteredConversations.length === 0 ? (
        <Card className="p-8 text-center bg-white border-[#E7EBF0]">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="font-medium text-gray-600 mb-2">No conversations found</h3>
          <p className="text-sm text-gray-500">
            {searchTerm || filterLanguage !== "all" || filterSentiment !== "all" || filterEscalated !== "all"
              ? "Try adjusting your filters"
              : "Conversations will appear here as users interact with the chatbot"}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredConversations.map((conv) => (
            <Card
              key={conv.id}
              className="bg-white border-[#E7EBF0] overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === conv.id ? null : conv.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {conv.escalated && (
                      <AlertTriangle className="h-4 w-4 text-amber-500" />
                    )}
                    <Globe className="h-4 w-4 text-[#1D4F91]" />
                    <span className="text-xs font-medium text-gray-600 uppercase">
                      {conv.language}
                    </span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${getSentimentColor(
                      conv.sentiment
                    )}`}
                  >
                    {conv.sentiment}
                  </span>
                  {conv.feedback && (
                    <span className="flex items-center">
                      {conv.feedback === "positive" ? (
                        <ThumbsUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <ThumbsDown className="h-4 w-4 text-red-500" />
                      )}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <p className="text-gray-600">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(conv.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {formatDuration(conv.duration)}
                  </div>
                  {expandedId === conv.id ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </button>

              {/* Expanded Messages */}
              {expandedId === conv.id && (
                <div className="border-t border-[#E7EBF0] bg-[#F5F9FD] p-4">
                  <div className="space-y-3">
                    {conv.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 ${
                          msg.role === "assistant" ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-full ${
                            msg.role === "assistant"
                              ? "bg-[#000080] text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {msg.role === "assistant" ? (
                            <Bot className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div
                          className={`flex-1 p-3 rounded-lg ${
                            msg.role === "assistant"
                              ? "bg-white border border-[#E7EBF0]"
                              : "bg-[#000080] text-white"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E7EBF0] text-xs text-gray-500">
                    <p>Session ID: {conv.sessionId}</p>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

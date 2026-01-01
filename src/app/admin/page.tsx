"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Globe,
  Download,
  RefreshCw,
  BarChart3,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";

interface AnalyticsData {
  metadata: {
    reportGeneratedAt: string;
    dateRange: {
      start: string;
      end: string;
      days: number;
    };
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
    language: {
      en: number;
      es: number;
    };
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
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

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  const fetchAnalytics = async () => {
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
  };

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const handleExportJSON = () => {
    window.open(`/api/analytics?days=${days}&format=json`, "_blank");
  };

  const handleExportCSV = () => {
    window.open(`/api/analytics?days=${days}&format=csv`, "_blank");
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#000034]">Dashboard</h1>
          <p className="text-gray-500 mt-1">AI Chatbot Analytics Overview</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="bg-white border border-[#E7EBF0] rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-[#000080]"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button
            variant="outline"
            size="icon"
            onClick={fetchAnalytics}
            className="border-[#E7EBF0]"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-[#000080]" />
        </div>
      ) : error ? (
        <Card className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed to Load Analytics</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={fetchAnalytics} className="bg-[#000080] hover:bg-[#0000a0]">
            Try Again
          </Button>
        </Card>
      ) : analytics ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-5 bg-white border-[#E7EBF0]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <MessageSquare className="h-6 w-6 text-[#1D4F91]" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Conversations</p>
                  <p className="text-2xl font-bold text-[#000034]">
                    {analytics.summary.totalConversations}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white border-[#E7EBF0]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Satisfaction Rate</p>
                  <p className="text-2xl font-bold text-[#000034]">
                    {analytics.summary.satisfactionRate}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white border-[#E7EBF0]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Escalation Rate</p>
                  <p className="text-2xl font-bold text-[#000034]">
                    {analytics.summary.escalationRate}%
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-5 bg-white border-[#E7EBF0]">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-50 rounded-xl">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Avg Duration</p>
                  <p className="text-2xl font-bold text-[#000034]">
                    {analytics.summary.avgDurationSeconds}s
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Language Distribution */}
            <Card className="p-6 bg-white border-[#E7EBF0]">
              <h3 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-[#1D4F91]" />
                Language Distribution
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">English</span>
                    <span className="text-gray-500">{analytics.distributions.language.en} conversations</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1D4F91] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          analytics.summary.totalConversations > 0
                            ? (analytics.distributions.language.en / analytics.summary.totalConversations) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Spanish</span>
                    <span className="text-gray-500">{analytics.distributions.language.es} conversations</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#006A52] rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          analytics.summary.totalConversations > 0
                            ? (analytics.distributions.language.es / analytics.summary.totalConversations) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Sentiment Distribution */}
            <Card className="p-6 bg-white border-[#E7EBF0]">
              <h3 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#1D4F91]" />
                Sentiment Analysis
              </h3>
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-500" /> Positive
                    </span>
                    <span className="text-gray-500">{analytics.distributions.sentiment.positive}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          analytics.summary.totalConversations > 0
                            ? (analytics.distributions.sentiment.positive / analytics.summary.totalConversations) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">Neutral</span>
                    <span className="text-gray-500">{analytics.distributions.sentiment.neutral}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-400 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          analytics.summary.totalConversations > 0
                            ? (analytics.distributions.sentiment.neutral / analytics.summary.totalConversations) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700 flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-500" /> Negative
                    </span>
                    <span className="text-gray-500">{analytics.distributions.sentiment.negative}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          analytics.summary.totalConversations > 0
                            ? (analytics.distributions.sentiment.negative / analytics.summary.totalConversations) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Feedback Summary */}
          <Card className="p-6 bg-white border-[#E7EBF0] mb-8">
            <h3 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-[#1D4F91]" />
              User Feedback Summary
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center p-5 bg-gray-50 rounded-xl">
                <p className="text-3xl font-bold text-[#000034]">{analytics.feedback.total}</p>
                <p className="text-sm text-gray-500 mt-1">Total Responses</p>
              </div>
              <div className="text-center p-5 bg-green-50 rounded-xl">
                <p className="text-3xl font-bold text-green-600">{analytics.feedback.positive}</p>
                <p className="text-sm text-gray-500 mt-1">Positive</p>
              </div>
              <div className="text-center p-5 bg-red-50 rounded-xl">
                <p className="text-3xl font-bold text-red-600">{analytics.feedback.negative}</p>
                <p className="text-sm text-gray-500 mt-1">Negative</p>
              </div>
              <div className="text-center p-5 bg-blue-50 rounded-xl">
                <p className="text-3xl font-bold text-[#1D4F91]">{analytics.feedback.satisfactionPercentage}%</p>
                <p className="text-sm text-gray-500 mt-1">Satisfaction</p>
              </div>
            </div>
          </Card>

          {/* Export Section */}
          <Card className="p-6 bg-white border-[#E7EBF0]">
            <h3 className="text-lg font-semibold text-[#000034] mb-2 flex items-center gap-2">
              <Download className="h-5 w-5 text-[#1D4F91]" />
              Export for Power BI
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Download analytics data in JSON or CSV format for import into Microsoft Power BI.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportJSON} className="bg-[#000080] hover:bg-[#0000a0]">
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="border-[#E7EBF0]">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Last updated: {new Date(analytics.metadata.reportGeneratedAt).toLocaleString()}
            </p>
          </Card>
        </>
      ) : null}
    </div>
  );
}

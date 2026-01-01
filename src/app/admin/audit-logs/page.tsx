"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Search,
  Filter,
  RefreshCw,
  Download,
  LogIn,
  LogOut,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileDown,
  User,
  Clock,
  AlertCircle,
} from "lucide-react";

interface AuditLog {
  id: string;
  timestamp: string;
  adminUser: string;
  adminEmail: string;
  action: "LOGIN" | "LOGOUT" | "CREATE" | "UPDATE" | "DELETE" | "VIEW_PII" | "EXPORT" | "VIEW";
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
}

const actionConfig = {
  LOGIN: { icon: LogIn, color: "bg-green-100 text-green-700", label: "Login" },
  LOGOUT: { icon: LogOut, color: "bg-gray-100 text-gray-700", label: "Logout" },
  CREATE: { icon: Plus, color: "bg-blue-100 text-blue-700", label: "Create" },
  UPDATE: { icon: Edit, color: "bg-amber-100 text-amber-700", label: "Update" },
  DELETE: { icon: Trash2, color: "bg-red-100 text-red-700", label: "Delete" },
  VIEW_PII: { icon: Eye, color: "bg-purple-100 text-purple-700", label: "View PII" },
  EXPORT: { icon: FileDown, color: "bg-indigo-100 text-indigo-700", label: "Export" },
  VIEW: { icon: Eye, color: "bg-slate-100 text-slate-700", label: "View" },
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("7d");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (searchQuery) params.set("search", searchQuery);
      params.set("days", dateFilter.replace("d", ""));

      const response = await fetch(`/api/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setLoading(false);
    }
  }, [actionFilter, dateFilter, searchQuery]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const handleExport = () => {
    // Export logs as CSV
    const csvContent = [
      ["Timestamp", "Admin", "Action", "Resource", "Details", "IP Address"].join(","),
      ...logs.map((log) =>
        [
          new Date(log.timestamp).toISOString(),
          log.adminUser,
          log.action,
          log.resource,
          `"${log.details.replace(/"/g, '""')}"`,
          log.ipAddress,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-[32px] font-bold text-[#000034] tracking-tight flex items-center gap-3">
            <Shield className="h-8 w-8 text-[#000080]" />
            Audit Logs
          </h1>
          <p className="text-[#666666] mt-1 text-[15px]">
            Track all administrative actions for security and compliance
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            className="h-10 px-4 flex items-center gap-2 bg-white border border-[#E7EBF0] rounded-lg hover:bg-gray-50 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchLogs}
            disabled={loading}
            className="h-10 px-4 flex items-center gap-2 bg-[#000080] text-white rounded-lg hover:bg-[#0000a0] transition-all shadow-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </div>
      </motion.div>

      {/* Compliance Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-6"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900">Security & Compliance</h3>
            <p className="text-sm text-blue-700 mt-1">
              All administrative actions are logged for security auditing and regulatory compliance.
              Logs are retained for 90 days and cannot be modified or deleted.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl border border-[#E7EBF0] p-4 mb-6 shadow-sm"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by admin, resource, or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/20"
              />
            </div>
          </form>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="VIEW_PII">View PII</option>
              <option value="EXPORT">Export</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-10 px-4 border border-[#E7EBF0] rounded-lg text-sm focus:outline-none focus:border-[#000080] cursor-pointer"
            >
              <option value="1d">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Logs Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl border border-[#E7EBF0] shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 text-[#000080] animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-[#000034] mb-1">No Audit Logs</h3>
            <p className="text-[#666666] text-sm">
              No logs match your current filters
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-[#E7EBF0]">
                <tr>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">
                    Timestamp
                  </th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">
                    Admin
                  </th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">
                    Action
                  </th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">
                    Details
                  </th>
                  <th className="text-left text-xs font-semibold text-[#666666] uppercase tracking-wider px-6 py-4">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7EBF0]">
                {logs.map((log, index) => {
                  const config = actionConfig[log.action];
                  const ActionIcon = config.icon;
                  return (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-[#000034]">
                              {new Date(log.timestamp).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#000080] to-[#1D4F91] rounded-full flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#000034]">{log.adminUser}</p>
                            <p className="text-xs text-gray-500">{log.adminEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
                          <ActionIcon className="h-3 w-3" />
                          {config.label}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">{log.resource}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[#363535] max-w-md truncate" title={log.details}>
                          {log.details}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {log.ipAddress}
                        </code>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination info */}
        {logs.length > 0 && (
          <div className="px-6 py-4 border-t border-[#E7EBF0] bg-gray-50">
            <p className="text-sm text-[#666666]">
              Showing {logs.length} log entries
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

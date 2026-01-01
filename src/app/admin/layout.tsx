"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  HelpCircle,
  User,
  Sparkles,
  AlertTriangle,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/content", label: "Content", icon: FileText },
  { href: "/admin/logs", label: "Conversations", icon: MessageSquare },
  { href: "/admin/escalations", label: "Escalations", icon: AlertTriangle, badge: true },
  { href: "/admin/announcements", label: "Announcements", icon: Bell },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: Shield },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-[#F5F9FD]" style={{ fontFamily: '"Figtree", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Mobile Header */}
      <header className="lg:hidden bg-gradient-to-r from-[#000080] to-[#000060] text-white px-4 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-lg shadow-[#000080]/20">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/Doral_mark_White.png"
                alt="City of Doral"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-semibold text-sm">City of Doral Admin</span>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="User profile"
        >
          <User className="h-5 w-5" />
        </motion.button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? "w-[72px]" : "w-[260px]"}
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        style={{
          background: "linear-gradient(180deg, #000080 0%, #000050 50%, #000040 100%)",
        }}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

        {/* Glowing accent line */}
        <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-blue-400/20 via-blue-300/10 to-transparent" />

        {/* Logo Section */}
        <div className={`relative h-16 flex items-center border-b border-white/10 ${sidebarCollapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-10 h-10 flex items-center justify-center flex-shrink-0 cursor-pointer"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <img
                src="/Doral_mark_White.png"
                alt="City of Doral"
                className="w-full h-full object-contain"
              />
            </motion.button>
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="overflow-hidden"
              >
                <p className="font-bold text-sm tracking-wide text-white">CITY OF DORAL</p>
                <p className="text-[11px] text-blue-200 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Admin Portal
                </p>
              </motion.div>
            )}
          </div>
          {!sidebarCollapsed && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSidebarCollapsed(true)}
              className="hidden lg:flex p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </motion.button>
          )}
        </div>

        {/* Navigation */}
        <nav className="relative p-3 space-y-1">
          {!sidebarCollapsed && (
            <p className="px-3 py-2 text-[10px] font-semibold text-blue-300/70 uppercase tracking-wider">
              Main Menu
            </p>
          )}
          {navItems.map((item, index) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                    ${sidebarCollapsed ? "justify-center" : ""}
                    ${active
                      ? "bg-white text-[#000080] font-semibold shadow-lg shadow-black/10"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  {/* Active indicator glow */}
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-blue-600"
                      style={{
                        boxShadow: "0 0 12px 2px rgba(59, 130, 246, 0.5)",
                      }}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: active ? 0 : 5 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${active ? "text-[#000080]" : ""}`} />
                  </motion.div>
                  {!sidebarCollapsed && (
                    <span className="text-sm">{item.label}</span>
                  )}
                  {/* Notification badges */}
                  {item.label === "Escalations" && !sidebarCollapsed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full shadow-lg"
                    >
                      3
                    </motion.span>
                  )}
                  {item.label === "Announcements" && !sidebarCollapsed && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg"
                    >
                      2
                    </motion.span>
                  )}
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10">
          {!sidebarCollapsed && (
            <div className="p-3">
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-all text-sm group"
              >
                <motion.div whileHover={{ rotate: 15 }}>
                  <HelpCircle className="h-5 w-5 flex-shrink-0" />
                </motion.div>
                <span>Help & Support</span>
              </Link>
            </div>
          )}
          <div className={`p-3 ${sidebarCollapsed ? "" : "pt-0"}`}>
            <Link
              href="/"
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-all group
                ${sidebarCollapsed ? "justify-center" : ""}
              `}
              title={sidebarCollapsed ? "Back to Website" : undefined}
            >
              <motion.div
                whileHover={{ x: -3 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <LogOut className="h-5 w-5 flex-shrink-0" />
              </motion.div>
              {!sidebarCollapsed && <span className="text-sm">Back to Website</span>}
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
          transition-all duration-300 min-h-screen
          pt-[60px] lg:pt-0
          ${sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"}
        `}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

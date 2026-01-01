"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Save,
  Bell,
  Shield,
  Database,
  Palette,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Key,
  Bot,
  Clock,
  Sparkles,
} from "lucide-react";

interface ChatbotSettings {
  // General
  chatbotName: string;
  welcomeMessage: string;
  welcomeMessageEs: string;
  defaultLanguage: "en" | "es";

  // Behavior
  enableSentimentAnalysis: boolean;
  enableAutoEscalation: boolean;
  escalationThreshold: number;
  maxMessagesPerSession: number;
  sessionTimeout: number;

  // Appearance
  primaryColor: string;
  position: "bottom-right" | "bottom-left";
  showSources: boolean;
  showFeedback: boolean;

  // LLM
  primaryLLM: "openai" | "claude";
  backupLLM: "openai" | "claude" | "none";
  temperature: number;
  maxTokens: number;

  // Notifications
  enableEmailAlerts: boolean;
  alertEmail: string;
  alertOnEscalation: boolean;
  alertOnNegativeFeedback: boolean;
}

const defaultSettings: ChatbotSettings = {
  chatbotName: "Doral Assistant",
  welcomeMessage: "Hello! I'm the City of Doral AI Assistant. How can I help you today?",
  welcomeMessageEs: "¡Hola! Soy el Asistente de IA de la Ciudad de Doral. ¿Cómo puedo ayudarte hoy?",
  defaultLanguage: "en",
  enableSentimentAnalysis: true,
  enableAutoEscalation: true,
  escalationThreshold: 2,
  maxMessagesPerSession: 50,
  sessionTimeout: 30,
  primaryColor: "#000080",
  position: "bottom-right",
  showSources: true,
  showFeedback: true,
  primaryLLM: "openai",
  backupLLM: "claude",
  temperature: 0.7,
  maxTokens: 1024,
  enableEmailAlerts: false,
  alertEmail: "",
  alertOnEscalation: true,
  alertOnNegativeFeedback: true,
};

function getInitialSettings(): ChatbotSettings {
  if (typeof window === "undefined") return defaultSettings;
  const stored = localStorage.getItem("doral-chatbot-settings");
  if (stored) {
    return { ...defaultSettings, ...JSON.parse(stored) };
  }
  return defaultSettings;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<ChatbotSettings>(getInitialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("general");

  const handleSave = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    localStorage.setItem("doral-chatbot-settings", JSON.stringify(settings));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset all settings to defaults? This cannot be undone.")) {
      setSettings(defaultSettings);
      localStorage.removeItem("doral-chatbot-settings");
    }
  };

  const sections = [
    { id: "general", label: "General", icon: Settings, gradient: "from-blue-500" },
    { id: "behavior", label: "Behavior", icon: Bot, gradient: "from-purple-500" },
    { id: "appearance", label: "Appearance", icon: Palette, gradient: "from-pink-500" },
    { id: "llm", label: "LLM Settings", icon: Database, gradient: "from-orange-500" },
    { id: "notifications", label: "Notifications", icon: Bell, gradient: "from-amber-500" },
    { id: "security", label: "Security", icon: Shield, gradient: "from-green-500" },
  ];

  const inputClass = "w-full h-11 px-4 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200";
  const labelClass = "block text-xs font-medium text-[#666666] mb-2 uppercase tracking-wide";
  const textareaClass = "w-full px-4 py-3 bg-white border border-[#E7EBF0] rounded-lg text-sm text-[#363535] placeholder:text-[#999] focus:outline-none focus:border-[#000080] focus:ring-2 focus:ring-[#000080]/10 focus:shadow-[0_0_0_4px_rgba(0,0,128,0.05)] transition-all duration-200 min-h-[100px] resize-none";

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
            <h1 className="text-[32px] font-bold text-[#000034] tracking-tight">Settings</h1>
            <motion.div
              animate={{ rotate: [0, 180, 360] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Settings className="h-6 w-6 text-[#1D4F91]" />
            </motion.div>
          </div>
          <p className="text-[#666666] mt-1 text-[15px]">Configure chatbot behavior and appearance</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="h-11 px-6 bg-white border border-[#E7EBF0] text-[#363535] text-sm font-medium rounded-xl hover:bg-gray-50 hover:border-[#000080]/30 transition-all duration-200 flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="h-11 px-6 bg-gradient-to-r from-[#000080] to-[#1D4F91] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#000080]/25 transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                <RefreshCw className="h-4 w-4" />
              </motion.div>
            ) : saved ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <CheckCircle2 className="h-4 w-4" />
              </motion.div>
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </motion.button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section Navigation */}
        <motion.nav
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:w-56 flex-shrink-0"
        >
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {sections.map((section, idx) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              return (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveSection(section.id)}
                  className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                    isActive
                      ? "text-white"
                      : "bg-white text-[#363535] hover:bg-gray-50 border border-[#E7EBF0] hover:border-[#000080]/30"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeSettingsSection"
                      className="absolute inset-0 bg-gradient-to-r from-[#000080] to-[#1D4F91] rounded-xl shadow-lg shadow-[#000080]/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={`relative z-10 ${isActive ? "" : `w-7 h-7 rounded-lg bg-gradient-to-br ${section.gradient} to-transparent/50 flex items-center justify-center`}`}>
                    <Icon className={`h-4 w-4 ${isActive ? "" : "text-white"}`} />
                  </div>
                  <span className="relative z-10">{section.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.nav>

        {/* Settings Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {/* General Settings */}
            {activeSection === "general" && (
              <motion.div
                key="general"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  General Settings
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Chatbot Name</label>
                    <input
                      type="text"
                      value={settings.chatbotName}
                      onChange={(e) => setSettings({ ...settings, chatbotName: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Welcome Message (English)</label>
                    <textarea
                      value={settings.welcomeMessage}
                      onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                      className={textareaClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Welcome Message (Spanish)</label>
                    <textarea
                      value={settings.welcomeMessageEs}
                      onChange={(e) => setSettings({ ...settings, welcomeMessageEs: e.target.value })}
                      className={textareaClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Default Language</label>
                    <select
                      value={settings.defaultLanguage}
                      onChange={(e) =>
                        setSettings({ ...settings, defaultLanguage: e.target.value as "en" | "es" })
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Behavior Settings */}
            {activeSection === "behavior" && (
              <motion.div
                key="behavior"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-purple-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  Behavior Settings
                </h2>

                <div className="space-y-5">
                  <AnimatedToggleCard
                    label="Sentiment Analysis"
                    description="Detect user emotions and adjust responses"
                    checked={settings.enableSentimentAnalysis}
                    onChange={(checked) => setSettings({ ...settings, enableSentimentAnalysis: checked })}
                  />

                  <AnimatedToggleCard
                    label="Auto Escalation"
                    description="Automatically escalate frustrated users"
                    checked={settings.enableAutoEscalation}
                    onChange={(checked) => setSettings({ ...settings, enableAutoEscalation: checked })}
                  />

                  <div>
                    <label className={labelClass}>Escalation Threshold (negative messages)</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={settings.escalationThreshold}
                      onChange={(e) =>
                        setSettings({ ...settings, escalationThreshold: parseInt(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Max Messages Per Session</label>
                    <input
                      type="number"
                      min="10"
                      max="200"
                      value={settings.maxMessagesPerSession}
                      onChange={(e) =>
                        setSettings({ ...settings, maxMessagesPerSession: parseInt(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Session Timeout (minutes)</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#999]" />
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.sessionTimeout}
                        onChange={(e) =>
                          setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                        }
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Appearance Settings */}
            {activeSection === "appearance" && (
              <motion.div
                key="appearance"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-pink-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  Appearance Settings
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Primary Color</label>
                    <div className="flex items-center gap-3">
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                        <input
                          type="color"
                          value={settings.primaryColor}
                          onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                          className="w-14 h-11 border border-[#E7EBF0] rounded-lg cursor-pointer shadow-sm"
                        />
                      </motion.div>
                      <input
                        type="text"
                        value={settings.primaryColor}
                        onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Widget Position</label>
                    <select
                      value={settings.position}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          position: e.target.value as "bottom-right" | "bottom-left",
                        })
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                    </select>
                  </div>

                  <AnimatedToggleCard
                    label="Show Sources"
                    description="Display source links with responses"
                    checked={settings.showSources}
                    onChange={(checked) => setSettings({ ...settings, showSources: checked })}
                  />

                  <AnimatedToggleCard
                    label="Show Feedback Buttons"
                    description="Allow users to rate responses"
                    checked={settings.showFeedback}
                    onChange={(checked) => setSettings({ ...settings, showFeedback: checked })}
                  />
                </div>
              </motion.div>
            )}

            {/* LLM Settings */}
            {activeSection === "llm" && (
              <motion.div
                key="llm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-orange-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                    <Database className="h-5 w-5 text-white" />
                  </div>
                  LLM Settings
                </h2>

                <div className="space-y-5">
                  <div>
                    <label className={labelClass}>Primary LLM</label>
                    <select
                      value={settings.primaryLLM}
                      onChange={(e) =>
                        setSettings({ ...settings, primaryLLM: e.target.value as "openai" | "claude" })
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="openai">OpenAI (GPT-4o-mini)</option>
                      <option value="claude">Anthropic (Claude)</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Backup LLM</label>
                    <select
                      value={settings.backupLLM}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          backupLLM: e.target.value as "openai" | "claude" | "none",
                        })
                      }
                      className={`${inputClass} cursor-pointer`}
                    >
                      <option value="claude">Anthropic (Claude)</option>
                      <option value="openai">OpenAI (GPT-4o-mini)</option>
                      <option value="none">None (No Backup)</option>
                    </select>
                    <p className="text-xs text-[#999] mt-2">
                      Used when primary LLM is unavailable (ITN 3.2.3)
                    </p>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Temperature: <span className="font-bold text-[#000034]">{settings.temperature}</span>
                    </label>
                    <div className="relative pt-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) =>
                          setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                        }
                        className="w-full h-2 bg-gradient-to-r from-blue-200 to-orange-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br [&::-webkit-slider-thumb]:from-[#000080] [&::-webkit-slider-thumb]:to-[#1D4F91] [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-[#999] mt-2">
                        <span>Precise (0)</span>
                        <span>Creative (1)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Max Response Tokens</label>
                    <input
                      type="number"
                      min="256"
                      max="4096"
                      value={settings.maxTokens}
                      onChange={(e) =>
                        setSettings({ ...settings, maxTokens: parseInt(e.target.value) })
                      }
                      className={inputClass}
                    />
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                  >
                    <div className="flex items-center gap-2 text-[#1D4F91] mb-2">
                      <Key className="h-4 w-4" />
                      <span className="font-medium text-sm">API Keys</span>
                    </div>
                    <p className="text-sm text-[#666666]">
                      API keys are stored securely in environment variables. Update them in your
                      server configuration.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Notifications Settings */}
            {activeSection === "notifications" && (
              <motion.div
                key="notifications"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-amber-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  Notification Settings
                </h2>

                <div className="space-y-5">
                  <AnimatedToggleCard
                    label="Email Alerts"
                    description="Receive email notifications for events"
                    checked={settings.enableEmailAlerts}
                    onChange={(checked) => setSettings({ ...settings, enableEmailAlerts: checked })}
                  />

                  <AnimatePresence>
                    {settings.enableEmailAlerts && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5 overflow-hidden"
                      >
                        <div>
                          <label className={labelClass}>Alert Email Address</label>
                          <input
                            type="email"
                            value={settings.alertEmail}
                            onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                            placeholder="admin@cityofdoral.com"
                            className={inputClass}
                          />
                        </div>

                        <AnimatedToggleCard
                          label="Alert on Escalation"
                          description="Notify when user is escalated"
                          checked={settings.alertOnEscalation}
                          onChange={(checked) => setSettings({ ...settings, alertOnEscalation: checked })}
                        />

                        <AnimatedToggleCard
                          label="Alert on Negative Feedback"
                          description="Notify when user gives thumbs down"
                          checked={settings.alertOnNegativeFeedback}
                          onChange={(checked) => setSettings({ ...settings, alertOnNegativeFeedback: checked })}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* Security Settings */}
            {activeSection === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-white via-white to-green-50/30 rounded-xl border border-[#E7EBF0] shadow-[0_4px_20px_-4px_rgba(0,0,128,0.08)] p-6"
              >
                <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Security & Compliance
                </h2>

                <div className="space-y-4">
                  {[
                    { icon: CheckCircle2, title: "PII Encryption", desc: "All conversation data is encrypted at rest and in transit (ITN 3.1.3)", status: "success" },
                    { icon: CheckCircle2, title: "Audit Trail", desc: "All interactions are logged for compliance (ITN 3.1.3)", status: "success" },
                    { icon: CheckCircle2, title: "WCAG 2.1 Compliance", desc: "Chatbot meets accessibility standards (ITN 3.2.1)", status: "success" },
                    { icon: AlertTriangle, title: "Data Retention", desc: "Conversation logs are retained for 90 days. Configure data retention policies in your database settings.", status: "warning" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <ComplianceCard
                        icon={<item.icon className="h-4 w-4" />}
                        title={item.title}
                        description={item.desc}
                        status={item.status as "success" | "warning"}
                      />
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="p-5 bg-gradient-to-br from-[#F5F9FD] to-blue-50/50 rounded-xl border border-[#E7EBF0]"
                  >
                    <h3 className="font-medium text-[#000034] mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-[#1D4F91]" />
                      Compliance References
                    </h3>
                    <ul className="text-sm text-[#666666] space-y-2.5">
                      {["Florida Public Records Law (Ch. 119)", "Local, State, Federal Data Protection", "E-Verify Compliance"].map((item, idx) => (
                        <motion.li
                          key={item}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + idx * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#000080] to-[#1D4F91]" />
                          {item}
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Animated Toggle Card Component
function AnimatedToggleCard({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <motion.label
      whileHover={{ scale: 1.01 }}
      className="flex items-center justify-between p-5 bg-gradient-to-br from-[#F5F9FD] to-blue-50/30 rounded-xl cursor-pointer hover:shadow-md transition-all duration-300 border border-transparent hover:border-[#000080]/10"
    >
      <div>
        <p className="font-medium text-[#000034]">{label}</p>
        <p className="text-sm text-[#666666]">{description}</p>
      </div>
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <motion.div
          animate={{ backgroundColor: checked ? "#000080" : "#E5E7EB" }}
          className="w-12 h-7 rounded-full transition-colors duration-300"
        />
        <motion.div
          animate={{ x: checked ? 22 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-md"
        />
      </div>
    </motion.label>
  );
}

// Compliance Card Component
function ComplianceCard({
  icon,
  title,
  description,
  status,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "success" | "warning";
}) {
  const bgColor = status === "success" ? "from-green-50 to-emerald-50" : "from-amber-50 to-yellow-50";
  const borderColor = status === "success" ? "border-green-100" : "border-amber-100";
  const textColor = status === "success" ? "text-[#006A52]" : "text-amber-600";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-5 bg-gradient-to-br ${bgColor} rounded-xl border ${borderColor} transition-all duration-200`}
    >
      <div className={`flex items-center gap-2 ${textColor} mb-2`}>
        {icon}
        <span className="font-medium text-sm">{title}</span>
      </div>
      <p className="text-sm text-[#666666]">{description}</p>
    </motion.div>
  );
}

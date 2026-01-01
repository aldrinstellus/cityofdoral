"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Settings,
  Save,
  Globe,
  MessageSquare,
  Bell,
  Shield,
  Database,
  Palette,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Key,
  Bot,
  Clock,
  Volume2,
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

export default function SettingsPage() {
  const [settings, setSettings] = useState<ChatbotSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("general");

  // Load settings
  useEffect(() => {
    const stored = localStorage.getItem("doral-chatbot-settings");
    if (stored) {
      setSettings({ ...defaultSettings, ...JSON.parse(stored) });
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
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
    { id: "general", label: "General", icon: Settings },
    { id: "behavior", label: "Behavior", icon: Bot },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "llm", label: "LLM Settings", icon: Database },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#000034]">Settings</h1>
          <p className="text-gray-500 mt-1">Configure chatbot behavior and appearance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleReset} className="border-[#E7EBF0]">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#000080] hover:bg-[#0000a0]"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {saved ? "Saved!" : "Save Changes"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Section Navigation */}
        <nav className="lg:w-56 flex-shrink-0">
          <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    activeSection === section.id
                      ? "bg-[#000080] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50 border border-[#E7EBF0]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Settings Content */}
        <div className="flex-1">
          {/* General Settings */}
          {activeSection === "general" && (
            <Card className="p-6 bg-white border-[#E7EBF0]">
              <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#1D4F91]" />
                General Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chatbot Name
                  </label>
                  <input
                    type="text"
                    value={settings.chatbotName}
                    onChange={(e) => setSettings({ ...settings, chatbotName: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Welcome Message (English)
                  </label>
                  <textarea
                    value={settings.welcomeMessage}
                    onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080] min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Welcome Message (Spanish)
                  </label>
                  <textarea
                    value={settings.welcomeMessageEs}
                    onChange={(e) => setSettings({ ...settings, welcomeMessageEs: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080] min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Language
                  </label>
                  <select
                    value={settings.defaultLanguage}
                    onChange={(e) =>
                      setSettings({ ...settings, defaultLanguage: e.target.value as "en" | "es" })
                    }
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Behavior Settings */}
          {activeSection === "behavior" && (
            <Card className="p-6 bg-white border-[#E7EBF0]">
              <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
                <Bot className="h-5 w-5 text-[#1D4F91]" />
                Behavior Settings
              </h2>

              <div className="space-y-5">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Sentiment Analysis</p>
                    <p className="text-sm text-gray-500">Detect user emotions and adjust responses</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableSentimentAnalysis}
                    onChange={(e) =>
                      setSettings({ ...settings, enableSentimentAnalysis: e.target.checked })
                    }
                    className="w-5 h-5 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Auto Escalation</p>
                    <p className="text-sm text-gray-500">Automatically escalate frustrated users</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableAutoEscalation}
                    onChange={(e) =>
                      setSettings({ ...settings, enableAutoEscalation: e.target.checked })
                    }
                    className="w-5 h-5 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
                  />
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Escalation Threshold (negative messages)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={settings.escalationThreshold}
                    onChange={(e) =>
                      setSettings({ ...settings, escalationThreshold: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Messages Per Session
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="200"
                    value={settings.maxMessagesPerSession}
                    onChange={(e) =>
                      setSettings({ ...settings, maxMessagesPerSession: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={settings.sessionTimeout}
                    onChange={(e) =>
                      setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* Appearance Settings */}
          {activeSection === "appearance" && (
            <Card className="p-6 bg-white border-[#E7EBF0]">
              <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
                <Palette className="h-5 w-5 text-[#1D4F91]" />
                Appearance Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="w-12 h-10 border border-[#E7EBF0] rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={settings.primaryColor}
                      onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                      className="flex-1 px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Widget Position
                  </label>
                  <select
                    value={settings.position}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        position: e.target.value as "bottom-right" | "bottom-left",
                      })
                    }
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Show Sources</p>
                    <p className="text-sm text-gray-500">Display source links with responses</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showSources}
                    onChange={(e) => setSettings({ ...settings, showSources: e.target.checked })}
                    className="w-5 h-5 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Show Feedback Buttons</p>
                    <p className="text-sm text-gray-500">Allow users to rate responses</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showFeedback}
                    onChange={(e) => setSettings({ ...settings, showFeedback: e.target.checked })}
                    className="w-5 h-5 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
                  />
                </label>
              </div>
            </Card>
          )}

          {/* LLM Settings */}
          {activeSection === "llm" && (
            <Card className="p-6 bg-white border-[#E7EBF0]">
              <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
                <Database className="h-5 w-5 text-[#1D4F91]" />
                LLM Settings
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary LLM
                  </label>
                  <select
                    value={settings.primaryLLM}
                    onChange={(e) =>
                      setSettings({ ...settings, primaryLLM: e.target.value as "openai" | "claude" })
                    }
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  >
                    <option value="openai">OpenAI (GPT-4o-mini)</option>
                    <option value="claude">Anthropic (Claude)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup LLM
                  </label>
                  <select
                    value={settings.backupLLM}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        backupLLM: e.target.value as "openai" | "claude" | "none",
                      })
                    }
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  >
                    <option value="claude">Anthropic (Claude)</option>
                    <option value="openai">OpenAI (GPT-4o-mini)</option>
                    <option value="none">None (No Backup)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Used when primary LLM is unavailable (ITN 3.2.3)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature: {settings.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.temperature}
                    onChange={(e) =>
                      setSettings({ ...settings, temperature: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Precise (0)</span>
                    <span>Creative (1)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Response Tokens
                  </label>
                  <input
                    type="number"
                    min="256"
                    max="4096"
                    value={settings.maxTokens}
                    onChange={(e) =>
                      setSettings({ ...settings, maxTokens: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                  />
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 text-[#1D4F91] mb-2">
                    <Key className="h-4 w-4" />
                    <span className="font-medium text-sm">API Keys</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    API keys are stored securely in environment variables. Update them in your
                    server configuration.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Notifications Settings */}
          {activeSection === "notifications" && (
            <Card className="p-6 bg-white border-[#E7EBF0]">
              <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#1D4F91]" />
                Notification Settings
              </h2>

              <div className="space-y-5">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-700">Email Alerts</p>
                    <p className="text-sm text-gray-500">Receive email notifications for events</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.enableEmailAlerts}
                    onChange={(e) =>
                      setSettings({ ...settings, enableEmailAlerts: e.target.checked })
                    }
                    className="w-5 h-5 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
                  />
                </label>

                {settings.enableEmailAlerts && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alert Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.alertEmail}
                        onChange={(e) => setSettings({ ...settings, alertEmail: e.target.value })}
                        placeholder="admin@cityofdoral.com"
                        className="w-full px-4 py-2 border border-[#E7EBF0] rounded-lg focus:outline-none focus:border-[#000080]"
                      />
                    </div>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">Alert on Escalation</p>
                        <p className="text-sm text-gray-500">Notify when user is escalated</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.alertOnEscalation}
                        onChange={(e) =>
                          setSettings({ ...settings, alertOnEscalation: e.target.checked })
                        }
                        className="w-5 h-5 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-700">Alert on Negative Feedback</p>
                        <p className="text-sm text-gray-500">Notify when user gives thumbs down</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.alertOnNegativeFeedback}
                        onChange={(e) =>
                          setSettings({ ...settings, alertOnNegativeFeedback: e.target.checked })
                        }
                        className="w-5 h-5 text-[#000080] border-[#E7EBF0] rounded focus:ring-[#000080]"
                      />
                    </label>
                  </>
                )}
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeSection === "security" && (
            <Card className="p-6 bg-white border-[#E7EBF0]">
              <h2 className="text-lg font-semibold text-[#000034] mb-6 flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#1D4F91]" />
                Security & Compliance
              </h2>

              <div className="space-y-5">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium text-sm">PII Encryption</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    All conversation data is encrypted at rest and in transit (ITN 3.1.3)
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium text-sm">Audit Trail</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    All interactions are logged for compliance (ITN 3.1.3)
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-medium text-sm">WCAG 2.1 Compliance</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Chatbot meets accessibility standards (ITN 3.2.1)
                  </p>
                </div>

                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-medium text-sm">Data Retention</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Conversation logs are retained for 90 days. Configure data retention policies
                    in your database settings.
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Compliance References</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Florida Public Records Law (Ch. 119)</li>
                    <li>• Local, State, Federal Data Protection</li>
                    <li>• E-Verify Compliance</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

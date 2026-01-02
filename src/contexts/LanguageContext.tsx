"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Translation dictionary
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.analytics": "Analytics",
    "nav.content": "Content",
    "nav.conversations": "Conversations",
    "nav.escalations": "Escalations",
    "nav.notifications": "Notifications",
    "nav.announcements": "Announcements",
    "nav.auditLogs": "Audit Logs",
    "nav.settings": "Settings",
    "nav.mainMenu": "Main Menu",
    "nav.backToWebsite": "Back to Website",

    // Dashboard
    "dashboard.title": "Dashboard",
    "dashboard.liveStatus": "System Online",
    "dashboard.offline": "System Offline",
    "dashboard.activeSessions": "Active Sessions",
    "dashboard.lastUpdate": "Last update",
    "dashboard.refresh": "Refresh",
    "dashboard.todaySnapshot": "Today's Snapshot",
    "dashboard.todayConversations": "Today's Conversations",
    "dashboard.resolved": "Resolved",
    "dashboard.pending": "Pending",
    "dashboard.avgWaitTime": "Avg Wait Time",
    "dashboard.activeConversations": "Active Conversations",
    "dashboard.activeNow": "Active Now",
    "dashboard.inQueue": "In Queue",
    "dashboard.longestWait": "Longest Wait",
    "dashboard.channelHealth": "Channel Health",
    "dashboard.recentActivity": "Recent Activity",
    "dashboard.todayVsYesterday": "Today vs Yesterday",
    "dashboard.conversations": "Conversations",
    "dashboard.satisfaction": "Satisfaction",
    "dashboard.avgDuration": "Avg Duration",
    "dashboard.escalations": "Escalations",
    "dashboard.pendingActions": "Pending Actions",
    "dashboard.escalationsPending": "Escalations Pending",
    "dashboard.negativeFeedback": "Negative Feedback",
    "dashboard.allOperational": "All channels operational",
    "dashboard.responseTime": "Response Time",
    "dashboard.under1min": "Under 1 min",
    "dashboard.oneToFive": "1-5 min",
    "dashboard.over5min": "Over 5 min",
    "dashboard.view": "View",
    "dashboard.review": "Review",

    // Activity types
    "activity.resolved": "resolved",
    "activity.escalated": "escalated",
    "activity.started": "started",
    "activity.completed": "completed",

    // Channels
    "channel.web": "Web",
    "channel.ivr": "IVR",
    "channel.sms": "SMS",
    "channel.facebook": "Facebook",
    "channel.instagram": "Instagram",
    "channel.whatsapp": "WhatsApp",

    // Analytics
    "analytics.title": "Analytics",
    "analytics.totalConversations": "Total Conversations",
    "analytics.satisfactionRate": "Satisfaction Rate",
    "analytics.escalationRate": "Escalation Rate",
    "analytics.avgDuration": "Avg Duration",
    "analytics.conversationTrend": "Conversation Trend",
    "analytics.languageDistribution": "Language Distribution",
    "analytics.sentimentAnalysis": "Sentiment Analysis",
    "analytics.topCategories": "Top Categories",
    "analytics.topQuestions": "Top Questions",
    "analytics.export": "Export",

    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.all": "All",
    "common.today": "Today",
    "common.yesterday": "Yesterday",
    "common.language": "Language",
    "common.english": "English",
    "common.spanish": "Spanish",

    // Settings
    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.team": "Team",
    "settings.permissions": "Permissions",
    "settings.integrations": "Integrations",
    "settings.chatbot": "Chatbot",

    // Announcements
    "announcements.title": "Announcements",
    "announcements.create": "Create Announcement",
    "announcements.type": "Type",
    "announcements.audience": "Audience",
    "announcements.everyone": "Everyone",
    "announcements.residents": "Residents",
    "announcements.businesses": "Businesses",

    // User
    "user.adminUser": "Admin User",
    "user.systemAdmin": "System Administrator",
  },
  es: {
    // Navigation
    "nav.dashboard": "Panel",
    "nav.analytics": "Analíticas",
    "nav.content": "Contenido",
    "nav.conversations": "Conversaciones",
    "nav.escalations": "Escalaciones",
    "nav.notifications": "Notificaciones",
    "nav.announcements": "Anuncios",
    "nav.auditLogs": "Registros",
    "nav.settings": "Configuración",
    "nav.mainMenu": "Menú Principal",
    "nav.backToWebsite": "Volver al Sitio",

    // Dashboard
    "dashboard.title": "Panel",
    "dashboard.liveStatus": "Sistema En Línea",
    "dashboard.offline": "Sistema Fuera de Línea",
    "dashboard.activeSessions": "Sesiones Activas",
    "dashboard.lastUpdate": "Última actualización",
    "dashboard.refresh": "Actualizar",
    "dashboard.todaySnapshot": "Resumen de Hoy",
    "dashboard.todayConversations": "Conversaciones de Hoy",
    "dashboard.resolved": "Resueltas",
    "dashboard.pending": "Pendientes",
    "dashboard.avgWaitTime": "Tiempo Promedio",
    "dashboard.activeConversations": "Conversaciones Activas",
    "dashboard.activeNow": "Activas Ahora",
    "dashboard.inQueue": "En Cola",
    "dashboard.longestWait": "Mayor Espera",
    "dashboard.channelHealth": "Estado de Canales",
    "dashboard.recentActivity": "Actividad Reciente",
    "dashboard.todayVsYesterday": "Hoy vs Ayer",
    "dashboard.conversations": "Conversaciones",
    "dashboard.satisfaction": "Satisfacción",
    "dashboard.avgDuration": "Duración Prom.",
    "dashboard.escalations": "Escalaciones",
    "dashboard.pendingActions": "Acciones Pendientes",
    "dashboard.escalationsPending": "Escalaciones Pendientes",
    "dashboard.negativeFeedback": "Comentarios Negativos",
    "dashboard.allOperational": "Todos los canales operativos",
    "dashboard.responseTime": "Tiempo de Respuesta",
    "dashboard.under1min": "Menos de 1 min",
    "dashboard.oneToFive": "1-5 min",
    "dashboard.over5min": "Más de 5 min",
    "dashboard.view": "Ver",
    "dashboard.review": "Revisar",

    // Activity types
    "activity.resolved": "resuelta",
    "activity.escalated": "escalada",
    "activity.started": "iniciada",
    "activity.completed": "completada",

    // Channels
    "channel.web": "Web",
    "channel.ivr": "IVR",
    "channel.sms": "SMS",
    "channel.facebook": "Facebook",
    "channel.instagram": "Instagram",
    "channel.whatsapp": "WhatsApp",

    // Analytics
    "analytics.title": "Analíticas",
    "analytics.totalConversations": "Total de Conversaciones",
    "analytics.satisfactionRate": "Tasa de Satisfacción",
    "analytics.escalationRate": "Tasa de Escalación",
    "analytics.avgDuration": "Duración Promedio",
    "analytics.conversationTrend": "Tendencia de Conversaciones",
    "analytics.languageDistribution": "Distribución de Idiomas",
    "analytics.sentimentAnalysis": "Análisis de Sentimiento",
    "analytics.topCategories": "Categorías Principales",
    "analytics.topQuestions": "Preguntas Frecuentes",
    "analytics.export": "Exportar",

    // Common
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.all": "Todos",
    "common.today": "Hoy",
    "common.yesterday": "Ayer",
    "common.language": "Idioma",
    "common.english": "Inglés",
    "common.spanish": "Español",

    // Settings
    "settings.title": "Configuración",
    "settings.profile": "Perfil",
    "settings.team": "Equipo",
    "settings.permissions": "Permisos",
    "settings.integrations": "Integraciones",
    "settings.chatbot": "Chatbot",

    // Announcements
    "announcements.title": "Anuncios",
    "announcements.create": "Crear Anuncio",
    "announcements.type": "Tipo",
    "announcements.audience": "Audiencia",
    "announcements.everyone": "Todos",
    "announcements.residents": "Residentes",
    "announcements.businesses": "Negocios",

    // User
    "user.adminUser": "Usuario Admin",
    "user.systemAdmin": "Administrador del Sistema",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("admin-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "es")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("admin-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

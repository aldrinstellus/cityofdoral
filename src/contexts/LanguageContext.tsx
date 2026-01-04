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

    // Common Actions (new)
    "common.export": "Export",
    "common.exportJSON": "Export JSON",
    "common.exportCSV": "Export CSV",
    "common.refresh": "Refresh",
    "common.apply": "Apply",
    "common.reset": "Reset",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.create": "Create",
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.next": "Next",
    "common.view": "View",
    "common.details": "Details",
    "common.status": "Status",
    "common.active": "Active",
    "common.inactive": "Inactive",
    "common.total": "Total",
    "common.to": "to",

    // Priority/Severity
    "common.low": "Low",
    "common.medium": "Medium",
    "common.high": "High",
    "common.priority": "Priority",

    // Dashboard Additional
    "dashboard.subtitle": "Real-time operational overview",
    "dashboard.requiresAttention": "Requires Attention",
    "dashboard.allClear": "All clear! No pending items",
    "dashboard.sessions": "sessions",

    // Analytics Additional
    "analytics.subtitle": "Detailed chatbot performance metrics and insights",
    "analytics.powerBIReady": "Power BI Ready",
    "analytics.custom": "Custom",
    "analytics.peakHours": "Peak Hours",
    "analytics.sentiment": "Sentiment",
    "analytics.channelPerformance": "Channel Performance",
    "analytics.resolutionTime": "Resolution Time Distribution",
    "analytics.tryAgain": "Try Again",
    "analytics.dateRange": "Date Range",

    // Notifications
    "notifications.title": "Notifications",
    "notifications.subtitle": "System alerts, user activity, and scheduled reminders",
    "notifications.markAllRead": "Mark All Read",
    "notifications.all": "All",
    "notifications.unread": "Unread",
    "notifications.system": "System",
    "notifications.activity": "Activity",
    "notifications.scheduled": "Scheduled",
    "notifications.noNotifications": "No Notifications",
    "notifications.allCaughtUp": "You're all caught up!",
    "notifications.viewDetails": "View details",

    // Announcements Additional
    "announcements.subtitle": "Manage system alerts and city notifications",
    "announcements.newAnnouncement": "New Announcement",
    "announcements.searchPlaceholder": "Search announcements by title or content...",
    "announcements.filters": "Filters",
    "announcements.newestFirst": "Newest First",
    "announcements.oldestFirst": "Oldest First",
    "announcements.allTypes": "All Types",
    "announcements.info": "Info",
    "announcements.warning": "Warning",
    "announcements.alert": "Alert",
    "announcements.success": "Success",
    "announcements.resetFilters": "Reset Filters",
    "announcements.noAnnouncements": "No announcements",
    "announcements.createFirst": "Create your first announcement to display in the chatbot",
    "announcements.highPriority": "High Priority",
    "announcements.shownInChat": "Shown in Chat",

    // Escalations
    "escalations.title": "Escalations",
    "escalations.subtitle": "Manage human assistance requests from chatbot users",
    "escalations.pending": "Pending",
    "escalations.inProgress": "In Progress",
    "escalations.resolved": "Resolved",
    "escalations.searchPlaceholder": "Search by name, contact, or reason...",
    "escalations.noEscalations": "No Escalations",
    "escalations.allClear": "All escalations have been handled",
    "escalations.avgResponseTime": "Avg Response Time",
    "escalations.todayResolved": "Today Resolved",

    // Audit Logs
    "auditLogs.title": "Audit Logs",
    "auditLogs.subtitle": "Track all administrative actions for security and compliance",
    "auditLogs.searchPlaceholder": "Search by admin, resource, or details...",
    "auditLogs.allActions": "All Actions",
    "auditLogs.login": "Login",
    "auditLogs.logout": "Logout",
    "auditLogs.update": "Update",
    "auditLogs.viewPII": "View PII",
    "auditLogs.noLogs": "No Audit Logs",
    "auditLogs.noLogsMatch": "No logs match your current filters",
    "auditLogs.adjustFilters": "Try adjusting your filters",
    "auditLogs.securityCompliance": "Security & Compliance",
    "auditLogs.complianceNotice": "All administrative actions are logged for security auditing and regulatory compliance. Logs are retained for 90 days and cannot be modified or deleted.",

    // Conversations
    "conversations.title": "Conversation Logs",
    "conversations.subtitle": "Audit trail of all chatbot interactions",
    "conversations.searchPlaceholder": "Search conversations...",
    "conversations.allSentiments": "All Sentiments",
    "conversations.positive": "Positive",
    "conversations.neutral": "Neutral",
    "conversations.negative": "Negative",
    "conversations.noConversations": "No conversations yet",
    "conversations.noMatch": "No conversations match your filters",
    "conversations.messageCount": "messages",
    "conversations.loading": "Loading conversations...",
    "common.filters": "Filters",

    // Content
    "content.title": "Content",
    "content.subtitle": "Manage FAQs, knowledge base, and web crawler",
    "content.faqs": "FAQs",
    "content.knowledgeBase": "Knowledge Base",
    "content.crawler": "Web Crawler",
    "content.addFAQ": "Add FAQ",
    "content.question": "Question",
    "content.answer": "Answer",
    "content.category": "Category",

    // Settings Additional
    "settings.subtitle": "Configure system preferences and integrations",
    "settings.general": "General",
    "settings.security": "Security",
    "settings.appearance": "Appearance",
    "settings.loading": "Loading settings...",
    "settings.profileSubtitle": "Manage your account profile and security",
    "settings.teamSubtitle": "Manage team members and access",
    "settings.permissionsSubtitle": "Configure role-based permissions",
    "settings.integrationsSubtitle": "Configure external service connections",
    "settings.chatbotSubtitle": "Configure chatbot behavior and appearance",
    "settings.unsavedChanges": "Unsaved changes",
    "common.saveChanges": "Save Changes",
    "common.saved": "Saved!",
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

    // Common Actions (new)
    "common.export": "Exportar",
    "common.exportJSON": "Exportar JSON",
    "common.exportCSV": "Exportar CSV",
    "common.refresh": "Actualizar",
    "common.apply": "Aplicar",
    "common.reset": "Restablecer",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.create": "Crear",
    "common.close": "Cerrar",
    "common.confirm": "Confirmar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.view": "Ver",
    "common.details": "Detalles",
    "common.status": "Estado",
    "common.active": "Activo",
    "common.inactive": "Inactivo",
    "common.total": "Total",
    "common.to": "a",

    // Priority/Severity
    "common.low": "Bajo",
    "common.medium": "Medio",
    "common.high": "Alto",
    "common.priority": "Prioridad",

    // Dashboard Additional
    "dashboard.subtitle": "Vista operacional en tiempo real",
    "dashboard.requiresAttention": "Requiere Atención",
    "dashboard.allClear": "¡Todo en orden! Sin elementos pendientes",
    "dashboard.sessions": "sesiones",

    // Analytics Additional
    "analytics.subtitle": "Métricas detalladas de rendimiento del chatbot",
    "analytics.powerBIReady": "Listo para Power BI",
    "analytics.custom": "Personalizado",
    "analytics.peakHours": "Horas Pico",
    "analytics.sentiment": "Sentimiento",
    "analytics.channelPerformance": "Rendimiento por Canal",
    "analytics.resolutionTime": "Distribución de Tiempo de Resolución",
    "analytics.tryAgain": "Intentar de Nuevo",
    "analytics.dateRange": "Rango de Fechas",

    // Notifications
    "notifications.title": "Notificaciones",
    "notifications.subtitle": "Alertas del sistema, actividad de usuarios y recordatorios",
    "notifications.markAllRead": "Marcar Todo Leído",
    "notifications.all": "Todas",
    "notifications.unread": "Sin Leer",
    "notifications.system": "Sistema",
    "notifications.activity": "Actividad",
    "notifications.scheduled": "Programadas",
    "notifications.noNotifications": "Sin Notificaciones",
    "notifications.allCaughtUp": "¡Estás al día!",
    "notifications.viewDetails": "Ver detalles",

    // Announcements Additional
    "announcements.subtitle": "Administrar alertas del sistema y notificaciones de la ciudad",
    "announcements.newAnnouncement": "Nuevo Anuncio",
    "announcements.searchPlaceholder": "Buscar anuncios por título o contenido...",
    "announcements.filters": "Filtros",
    "announcements.newestFirst": "Más Recientes",
    "announcements.oldestFirst": "Más Antiguos",
    "announcements.allTypes": "Todos los Tipos",
    "announcements.info": "Información",
    "announcements.warning": "Advertencia",
    "announcements.alert": "Alerta",
    "announcements.success": "Éxito",
    "announcements.resetFilters": "Restablecer Filtros",
    "announcements.noAnnouncements": "Sin anuncios",
    "announcements.createFirst": "Crea tu primer anuncio para mostrar en el chatbot",
    "announcements.highPriority": "Alta Prioridad",
    "announcements.shownInChat": "Mostrado en Chat",

    // Escalations
    "escalations.title": "Escalaciones",
    "escalations.subtitle": "Gestionar solicitudes de asistencia humana del chatbot",
    "escalations.pending": "Pendiente",
    "escalations.inProgress": "En Progreso",
    "escalations.resolved": "Resuelto",
    "escalations.searchPlaceholder": "Buscar por nombre, contacto o razón...",
    "escalations.noEscalations": "Sin Escalaciones",
    "escalations.allClear": "Todas las escalaciones han sido atendidas",
    "escalations.avgResponseTime": "Tiempo Promedio de Respuesta",
    "escalations.todayResolved": "Resueltas Hoy",

    // Audit Logs
    "auditLogs.title": "Registros de Auditoría",
    "auditLogs.subtitle": "Seguimiento de acciones administrativas para seguridad y cumplimiento",
    "auditLogs.searchPlaceholder": "Buscar por admin, recurso o detalles...",
    "auditLogs.allActions": "Todas las Acciones",
    "auditLogs.login": "Inicio de Sesión",
    "auditLogs.logout": "Cierre de Sesión",
    "auditLogs.update": "Actualizar",
    "auditLogs.viewPII": "Ver PII",
    "auditLogs.noLogs": "Sin Registros de Auditoría",
    "auditLogs.noLogsMatch": "Ningún registro coincide con tus filtros",
    "auditLogs.adjustFilters": "Intenta ajustar los filtros",
    "auditLogs.securityCompliance": "Seguridad y Cumplimiento",
    "auditLogs.complianceNotice": "Todas las acciones administrativas se registran para auditoría de seguridad y cumplimiento normativo. Los registros se conservan durante 90 días y no pueden modificarse ni eliminarse.",

    // Conversations
    "conversations.title": "Registro de Conversaciones",
    "conversations.subtitle": "Historial de todas las interacciones del chatbot",
    "conversations.searchPlaceholder": "Buscar conversaciones...",
    "conversations.allSentiments": "Todos los Sentimientos",
    "conversations.positive": "Positivo",
    "conversations.neutral": "Neutral",
    "conversations.negative": "Negativo",
    "conversations.noConversations": "Sin conversaciones aún",
    "conversations.noMatch": "Ninguna conversación coincide con tus filtros",
    "conversations.messageCount": "mensajes",
    "conversations.loading": "Cargando conversaciones...",
    "common.filters": "Filtros",

    // Content
    "content.title": "Contenido",
    "content.subtitle": "Administrar FAQs, base de conocimiento y rastreador web",
    "content.faqs": "Preguntas Frecuentes",
    "content.knowledgeBase": "Base de Conocimiento",
    "content.crawler": "Rastreador Web",
    "content.addFAQ": "Agregar FAQ",
    "content.question": "Pregunta",
    "content.answer": "Respuesta",
    "content.category": "Categoría",

    // Settings Additional
    "settings.subtitle": "Configurar preferencias del sistema e integraciones",
    "settings.general": "General",
    "settings.security": "Seguridad",
    "settings.appearance": "Apariencia",
    "settings.loading": "Cargando configuración...",
    "settings.profileSubtitle": "Administra tu perfil de cuenta y seguridad",
    "settings.teamSubtitle": "Administrar miembros del equipo y acceso",
    "settings.permissionsSubtitle": "Configurar permisos basados en roles",
    "settings.integrationsSubtitle": "Configurar conexiones de servicios externos",
    "settings.chatbotSubtitle": "Configurar comportamiento y apariencia del chatbot",
    "settings.unsavedChanges": "Cambios sin guardar",
    "common.saveChanges": "Guardar Cambios",
    "common.saved": "¡Guardado!",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  // Load saved language preference on mount - only runs on client
  useEffect(() => {
    const savedLang = localStorage.getItem("admin-language") as Language;
    if (savedLang && (savedLang === "en" || savedLang === "es")) {
      setLanguageState(savedLang); // eslint-disable-line
    }
    setIsHydrated(true);  
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("admin-language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Prevent hydration mismatch by not rendering until client-side hydration is complete
  // This ensures server and client render the same initial content
  if (!isHydrated) {
    return (
      <LanguageContext.Provider value={{ language: "en", setLanguage, t: (key) => translations.en[key] || key }}>
        {children}
      </LanguageContext.Provider>
    );
  }

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

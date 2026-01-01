// Local JSON file-based data store for demo purposes
// In production, replace with a proper database

import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
async function ensureDataDir(): Promise<void> {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// Generic read function
export async function readJsonFile<T>(filename: string, defaultValue: T): Promise<T> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch {
    // If file doesn't exist, create it with default value
    await writeJsonFile(filename, defaultValue);
    return defaultValue;
  }
}

// Generic write function
export async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  await ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// FAQ Types
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  views: number;
  helpful: number;
  notHelpful: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

// Announcement Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'urgent';
  startDate: string;
  endDate: string;
  targetAudience: 'all' | 'residents' | 'businesses';
  language: 'en' | 'es' | 'both';
  isActive: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Settings Types
export interface Settings {
  general: {
    botName: string;
    welcomeMessage: string;
    welcomeMessageEs: string; // Spanish welcome message
    defaultLanguage: 'en' | 'es';
    enableBilingual: boolean;
    officeHours: {
      start: string;
      end: string;
      timezone: string;
    };
  };
  chatbot: {
    maxMessagesPerSession: number;
    sessionTimeout: number;
    enableSentimentAnalysis: boolean;
    autoEscalateNegative: boolean;
    escalationThreshold: number; // 1-10 sensitivity scale
    responseDelay: number;
  };
  appearance: {
    primaryColor: string; // Hex color e.g., '#1a237e'
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    showSources: boolean;
    showFeedback: boolean;
  };
  llm: {
    primaryLLM: 'claude-3-haiku' | 'claude-3-sonnet' | 'claude-3-opus' | 'gpt-4o-mini' | 'gpt-4o';
    backupLLM: 'claude-3-haiku' | 'claude-3-sonnet' | 'claude-3-opus' | 'gpt-4o-mini' | 'gpt-4o' | 'none';
    temperature: number; // 0.0 to 1.0
    maxTokens: number;
  };
  notifications: {
    emailAlerts: boolean;
    escalationEmail: string;
    dailyDigest: boolean;
    digestTime: string;
    alertOnEscalation: boolean;
    alertOnNegativeFeedback: boolean;
  };
  integration: {
    enableIVR: boolean;
    enableSMS: boolean;
    enableSocial: boolean;
    twilioPhone: string;
  };
  integrations: {
    crmEnabled: boolean;
    crmProvider: 'salesforce' | 'dynamics' | 'none';
    sharePointEnabled: boolean;
  };
}

// Escalation Types
export interface Escalation {
  id: string;
  sessionId: string;
  userName: string;
  contactMethod: 'email' | 'phone';
  contactValue: string;
  reason: string;
  status: 'pending' | 'in_progress' | 'resolved';
  requestedAt: string;
  assignedTo?: string;
  resolvedAt?: string;
  notes: string;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

// Default data
const DEFAULT_FAQS: FAQ[] = [
  {
    id: 'faq-1',
    question: 'How do I pay my water bill?',
    answer: 'You can pay your water bill online at cityofdoral.com/utilities, by phone at (305) 593-6725, by mail, or in person at City Hall.',
    category: 'Utilities',
    priority: 'high',
    views: 1250,
    helpful: 892,
    notHelpful: 45,
    status: 'active',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'faq-2',
    question: 'What are the City Hall hours?',
    answer: 'City Hall is open Monday through Friday, 8:00 AM to 5:00 PM. We are closed on weekends and federal holidays.',
    category: 'General',
    priority: 'high',
    views: 980,
    helpful: 756,
    notHelpful: 23,
    status: 'active',
    createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'faq-3',
    question: 'How do I apply for a building permit?',
    answer: 'Building permits can be applied for online through our Building Department portal or in person at City Hall. Required documents include project plans, contractor information, and applicable fees.',
    category: 'Permits',
    priority: 'medium',
    views: 567,
    helpful: 423,
    notHelpful: 67,
    status: 'active',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'faq-4',
    question: 'How do I report a pothole?',
    answer: 'Potholes can be reported through the Doral 311 app, by calling 311, or online at cityofdoral.com/311. Please provide the street address and a description of the issue.',
    category: 'Public Works',
    priority: 'medium',
    views: 423,
    helpful: 378,
    notHelpful: 12,
    status: 'active',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'faq-5',
    question: 'Where can I find information about parks and recreation programs?',
    answer: 'Information about parks and recreation programs is available at cityofdoral.com/parks or by calling the Parks & Recreation Department at (305) 593-6600.',
    category: 'Recreation',
    priority: 'low',
    views: 312,
    helpful: 267,
    notHelpful: 18,
    status: 'active',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Holiday Hours - City Hall Closure',
    content: 'City Hall will be closed on January 1st for New Year\'s Day. Normal hours resume January 2nd.',
    type: 'info',
    startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: 'all',
    language: 'both',
    isActive: true,
    views: 1523,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'ann-2',
    title: 'Water Main Maintenance Notice',
    content: 'Scheduled water main maintenance in the Downtown area on January 5th from 10 PM to 4 AM. Temporary water service interruption expected.',
    type: 'warning',
    startDate: new Date(Date.now()).toISOString(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    targetAudience: 'residents',
    language: 'both',
    isActive: true,
    views: 876,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_SETTINGS: Settings = {
  general: {
    botName: 'Doral AI Assistant',
    welcomeMessage: 'Hello! I\'m the City of Doral AI Assistant. How can I help you today?',
    welcomeMessageEs: '¡Hola! Soy el Asistente de IA de la Ciudad de Doral. ¿Cómo puedo ayudarle hoy?',
    defaultLanguage: 'en',
    enableBilingual: true,
    officeHours: {
      start: '08:00',
      end: '17:00',
      timezone: 'America/New_York',
    },
  },
  chatbot: {
    maxMessagesPerSession: 50,
    sessionTimeout: 30,
    enableSentimentAnalysis: true,
    autoEscalateNegative: true,
    escalationThreshold: 5,
    responseDelay: 500,
  },
  appearance: {
    primaryColor: '#1a237e',
    position: 'bottom-right',
    showSources: true,
    showFeedback: true,
  },
  llm: {
    primaryLLM: 'claude-3-haiku',
    backupLLM: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 1000,
  },
  notifications: {
    emailAlerts: true,
    escalationEmail: 'admin@cityofdoral.com',
    dailyDigest: true,
    digestTime: '09:00',
    alertOnEscalation: true,
    alertOnNegativeFeedback: true,
  },
  integration: {
    enableIVR: true,
    enableSMS: true,
    enableSocial: true,
    twilioPhone: '+13055930000',
  },
  integrations: {
    crmEnabled: false,
    crmProvider: 'none',
    sharePointEnabled: false,
  },
};

const DEFAULT_ESCALATIONS: Escalation[] = [
  {
    id: 'esc-001',
    sessionId: 'sess-abc123def',
    userName: 'Maria Garcia',
    contactMethod: 'phone',
    contactValue: '(305) 555-0123',
    reason: 'Need help with building permit application - chatbot couldn\'t answer specific zoning questions',
    status: 'pending',
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notes: '',
  },
  {
    id: 'esc-002',
    sessionId: 'sess-xyz789ghi',
    userName: 'John Smith',
    contactMethod: 'email',
    contactValue: 'john.smith@email.com',
    reason: 'Business license renewal - need clarification on required documents',
    status: 'in_progress',
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: 'Admin',
    notes: 'Called back, waiting for document submission',
  },
  {
    id: 'esc-003',
    sessionId: 'sess-mno456pqr',
    userName: 'Ana Rodriguez',
    contactMethod: 'phone',
    contactValue: '(786) 555-0456',
    reason: 'Water bill dispute - need to speak with billing department',
    status: 'resolved',
    requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Issue resolved - billing adjustment applied',
  },
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [];

// Data access functions
export async function getFAQs(): Promise<FAQ[]> {
  return readJsonFile('faqs.json', DEFAULT_FAQS);
}

export async function saveFAQs(faqs: FAQ[]): Promise<void> {
  return writeJsonFile('faqs.json', faqs);
}

export async function getAnnouncements(): Promise<Announcement[]> {
  return readJsonFile('announcements.json', DEFAULT_ANNOUNCEMENTS);
}

export async function saveAnnouncements(announcements: Announcement[]): Promise<void> {
  return writeJsonFile('announcements.json', announcements);
}

export async function getSettings(): Promise<Settings> {
  return readJsonFile('settings.json', DEFAULT_SETTINGS);
}

export async function saveSettings(settings: Settings): Promise<void> {
  return writeJsonFile('settings.json', settings);
}

export async function getEscalations(): Promise<Escalation[]> {
  return readJsonFile('escalations.json', DEFAULT_ESCALATIONS);
}

export async function saveEscalations(escalations: Escalation[]): Promise<void> {
  return writeJsonFile('escalations.json', escalations);
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  return readJsonFile('audit-logs.json', DEFAULT_AUDIT_LOGS);
}

export async function saveAuditLogs(logs: AuditLog[]): Promise<void> {
  return writeJsonFile('audit-logs.json', logs);
}

// Helper to add audit log
export async function addAuditLog(
  user: string,
  action: string,
  resource: string,
  resourceId: string,
  details: Record<string, unknown> = {}
): Promise<void> {
  const logs = await getAuditLogs();
  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user,
    action,
    resource,
    resourceId,
    details,
  };
  logs.unshift(newLog);
  // Keep only last 1000 logs
  if (logs.length > 1000) {
    logs.splice(1000);
  }
  await saveAuditLogs(logs);
}

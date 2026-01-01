import { NextRequest, NextResponse } from "next/server";

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

// Generate realistic demo audit logs
function generateDemoLogs(): AuditLog[] {
  const actions: AuditLog["action"][] = ["LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "VIEW_PII", "EXPORT", "VIEW"];
  const resources = ["FAQ", "Announcement", "Escalation", "Settings", "Analytics", "Conversation", "User"];
  const admins = [
    { user: "Admin User", email: "admin@cityofdoral.com" },
    { user: "John Manager", email: "john.m@cityofdoral.com" },
    { user: "Sarah Editor", email: "sarah.e@cityofdoral.com" },
  ];

  const logs: AuditLog[] = [];
  const now = Date.now();

  // Generate 50 sample logs over the past 7 days
  for (let i = 0; i < 50; i++) {
    const action = actions[Math.floor(Math.random() * actions.length)];
    const resource = resources[Math.floor(Math.random() * resources.length)];
    const admin = admins[Math.floor(Math.random() * admins.length)];
    const hoursAgo = Math.floor(Math.random() * 168); // 7 days in hours

    let details = "";
    switch (action) {
      case "LOGIN":
        details = "Successfully authenticated via admin portal";
        break;
      case "LOGOUT":
        details = "Session ended";
        break;
      case "CREATE":
        details = `Created new ${resource.toLowerCase()}: "${generateTitle(resource)}"`;
        break;
      case "UPDATE":
        details = `Updated ${resource.toLowerCase()} #${1000 + i}: Changed status/content`;
        break;
      case "DELETE":
        details = `Deleted ${resource.toLowerCase()} #${1000 + i}`;
        break;
      case "VIEW_PII":
        details = `Viewed personal information for user in ${resource.toLowerCase()}`;
        break;
      case "EXPORT":
        details = `Exported ${resource.toLowerCase()} data to CSV (${Math.floor(Math.random() * 100) + 10} records)`;
        break;
      case "VIEW":
        details = `Viewed ${resource.toLowerCase()} details page`;
        break;
    }

    logs.push({
      id: `audit-${Date.now()}-${i}`,
      timestamp: new Date(now - hoursAgo * 60 * 60 * 1000).toISOString(),
      adminUser: admin.user,
      adminEmail: admin.email,
      action,
      resource,
      resourceId: action !== "LOGIN" && action !== "LOGOUT" ? `${1000 + i}` : undefined,
      details,
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    });
  }

  // Sort by timestamp (newest first)
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function generateTitle(resource: string): string {
  const titles: Record<string, string[]> = {
    FAQ: ["How to apply for a permit?", "What are the office hours?", "Where to pay utilities?"],
    Announcement: ["Holiday Schedule 2026", "New Online Services", "Community Event"],
    Escalation: ["Building permit inquiry", "Billing dispute", "Parking concern"],
    Settings: ["System configuration", "Email templates", "API keys"],
    Analytics: ["Monthly report", "Usage statistics", "Performance metrics"],
    Conversation: ["Chat session review", "Feedback analysis", "Support inquiry"],
    User: ["Staff account", "Admin profile", "Service account"],
  };
  const options = titles[resource] || ["Item"];
  return options[Math.floor(Math.random() * options.length)];
}

// Cache the logs so they stay consistent during the session
let cachedLogs: AuditLog[] | null = null;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get("action");
  const search = searchParams.get("search");
  const days = parseInt(searchParams.get("days") || "7");

  // Generate logs if not cached
  if (!cachedLogs) {
    cachedLogs = generateDemoLogs();
  }

  let filtered = [...cachedLogs];

  // Filter by date range
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  filtered = filtered.filter((log) => new Date(log.timestamp) >= cutoffDate);

  // Filter by action
  if (action && action !== "all") {
    filtered = filtered.filter((log) => log.action === action);
  }

  // Filter by search query
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (log) =>
        log.adminUser.toLowerCase().includes(query) ||
        log.adminEmail.toLowerCase().includes(query) ||
        log.resource.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query)
    );
  }

  return NextResponse.json({
    logs: filtered,
    total: filtered.length,
    dateRange: {
      start: cutoffDate.toISOString(),
      end: new Date().toISOString(),
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminUser: body.adminUser || "System",
      adminEmail: body.adminEmail || "system@cityofdoral.com",
      action: body.action || "VIEW",
      resource: body.resource || "Unknown",
      resourceId: body.resourceId,
      details: body.details || "",
      ipAddress: body.ipAddress || "127.0.0.1",
      userAgent: body.userAgent,
    };

    // Add to cache
    if (cachedLogs) {
      cachedLogs.unshift(newLog);
    }

    return NextResponse.json(newLog, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 });
  }
}

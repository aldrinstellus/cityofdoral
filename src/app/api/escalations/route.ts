import { NextRequest, NextResponse } from "next/server";

// In-memory storage for demo (replace with database in production)
const escalations = [
  {
    id: "esc-001",
    sessionId: "sess-abc123def",
    userName: "Maria Garcia",
    contactMethod: "phone" as const,
    contactValue: "(305) 555-0123",
    reason: "Need help with building permit application - chatbot couldn't answer specific zoning questions",
    status: "pending" as const,
    requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    notes: "",
  },
  {
    id: "esc-002",
    sessionId: "sess-xyz789ghi",
    userName: "John Smith",
    contactMethod: "email" as const,
    contactValue: "john.smith@email.com",
    reason: "Business license renewal - need clarification on required documents",
    status: "in_progress" as const,
    requestedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    assignedTo: "Admin",
    notes: "Called back, waiting for document submission",
  },
  {
    id: "esc-003",
    sessionId: "sess-mno456pqr",
    userName: "Ana Rodriguez",
    contactMethod: "phone" as const,
    contactValue: "(786) 555-0456",
    reason: "Water bill dispute - need to speak with billing department",
    status: "resolved" as const,
    requestedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    resolvedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    notes: "Issue resolved - billing adjustment applied",
  },
  {
    id: "esc-004",
    sessionId: "sess-stu123vwx",
    userName: "Carlos Mendez",
    contactMethod: "email" as const,
    contactValue: "carlos.m@business.com",
    reason: "Special event permit - complex multi-day event requirements",
    status: "pending" as const,
    requestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    notes: "",
  },
  {
    id: "esc-005",
    sessionId: "sess-yza789bcd",
    userName: "Elena Torres",
    contactMethod: "phone" as const,
    contactValue: "(305) 555-0789",
    reason: "Parking permit for disabled resident - need accessibility information",
    status: "in_progress" as const,
    requestedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    assignedTo: "Admin",
    notes: "Sending accessible parking form via email",
  },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let filtered = [...escalations];

  // Filter by status
  if (status && status !== "all") {
    filtered = filtered.filter((e) => e.status === status);
  }

  // Filter by search query
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.userName.toLowerCase().includes(query) ||
        e.contactValue.toLowerCase().includes(query) ||
        e.reason.toLowerCase().includes(query)
    );
  }

  // Sort by requestedAt (newest first), pending first
  filtered.sort((a, b) => {
    // Pending items first
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    // Then by date
    return new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime();
  });

  return NextResponse.json({
    escalations: filtered,
    total: filtered.length,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const newEscalation = {
      id: `esc-${Date.now()}`,
      sessionId: body.sessionId || `sess-${Math.random().toString(36).slice(2, 11)}`,
      userName: body.userName || "Anonymous User",
      contactMethod: body.contactMethod || "email",
      contactValue: body.contactValue || "",
      reason: body.reason || "General inquiry",
      status: "pending" as const,
      requestedAt: new Date().toISOString(),
      notes: "",
    };

    escalations.unshift(newEscalation);

    // Log the escalation creation
    await logAuditAction("CREATE", "escalation", newEscalation.id, {
      userName: newEscalation.userName,
      reason: newEscalation.reason,
    });

    return NextResponse.json(newEscalation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create escalation" }, { status: 500 });
  }
}

// Helper function to log audit actions
async function logAuditAction(action: string, resource: string, resourceId: string, details: object) {
  try {
    // This would normally call the audit logs API or database
    console.log(`[AUDIT] ${action} ${resource}:${resourceId}`, details);
  } catch (error) {
    console.error("Failed to log audit action:", error);
  }
}

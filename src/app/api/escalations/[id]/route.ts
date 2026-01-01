import { NextRequest, NextResponse } from "next/server";

// Reference the same in-memory storage (in production, use database)
// This is a simplified version - in real app, use shared state or database

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, notes, assignedTo } = body;

    // In production, update database
    // For demo, we log the update
    console.log(`[ESCALATION UPDATE] ${id}:`, { status, notes, assignedTo });

    const updatedEscalation = {
      id,
      status,
      notes,
      assignedTo,
      resolvedAt: status === "resolved" ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    // Log audit action
    console.log(`[AUDIT] UPDATE escalation:${id}`, {
      newStatus: status,
      notes: notes?.slice(0, 50)
    });

    return NextResponse.json(updatedEscalation);
  } catch {
    return NextResponse.json(
      { error: "Failed to update escalation" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // In production, fetch from database
  return NextResponse.json({
    id,
    message: "Escalation details would be fetched from database",
  });
}

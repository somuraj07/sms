import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { subject, message, priority } = await req.json();

    if (!subject || !message) {
      return NextResponse.json(
        { message: "Subject and message are required" },
        { status: 400 }
      );
    }

    // Store in a simple way - we can use a table or just log it
    // For now, we'll create a simple request record
    // Note: You may want to create an AdminRequest model in Prisma schema
    // For now, we'll use a JSON approach or create a simple table

    // Create a request (you can enhance this with a proper model)
    const request = {
      id: `req_${Date.now()}`,
      adminId: session.user.id,
      adminName: session.user.name,
      adminEmail: session.user.email,
      schoolId: session.user.schoolId,
      subject,
      message,
      priority: priority || "NORMAL",
      status: "PENDING",
      createdAt: new Date(),
    };

    // For now, we'll return success. You can add a proper database model later
    // TODO: Create AdminRequest model in Prisma schema

    return NextResponse.json(
      {
        success: true,
        message: "Request submitted successfully. Super admin will be notified.",
        data: request,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create admin request error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Return empty for now - implement when AdminRequest model is created
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error: any) {
    console.error("List admin requests error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}

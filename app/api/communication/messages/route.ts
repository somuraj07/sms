import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get messages between current user and selected user
    // For now, using a simple approach - in production, use appointments or create a direct message system
    const messages = await prisma.chatMessage.findMany({
      where: {
        OR: [
          { senderId: session.user.id, appointment: { studentId: userId } },
          { senderId: userId, appointment: { studentId: session.user.id } },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        appointment: {
          include: {
            student: {
              include: { user: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Transform to simpler format
    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      message: msg.content,
      senderId: msg.senderId,
      receiverId: msg.appointment.student.user.id,
      sender: { name: msg.sender.name },
      receiver: { name: msg.appointment.student.user.name },
      createdAt: msg.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedMessages,
    });
  } catch (error: any) {
    console.error("List messages error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

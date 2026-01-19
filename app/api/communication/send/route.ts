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

    const { receiverId, message } = await req.json();

    if (!receiverId || !message) {
      return NextResponse.json(
        { message: "Receiver ID and message are required" },
        { status: 400 }
      );
    }

    // Find or create an appointment for communication
    // In a real system, you'd have a direct messaging system
    // For now, we'll use appointments as a workaround
    let appointment = await prisma.appointment.findFirst({
      where: {
        OR: [
          { studentId: receiverId, teacherId: session.user.id },
          { studentId: session.user.id, teacherId: receiverId },
        ],
      },
    });

    if (!appointment) {
      // Create a virtual appointment for messaging
      const student = await prisma.student.findFirst({
        where: {
          userId: session.user.role === "STUDENT" ? session.user.id : receiverId,
        },
      });

      if (!student) {
        return NextResponse.json(
          { message: "Student not found" },
          { status: 400 }
        );
      }

      appointment = await prisma.appointment.create({
        data: {
          studentId: student.id,
          teacherId: session.user.role === "TEACHER" ? session.user.id : receiverId,
          date: new Date(),
          time: new Date(),
          reason: "Chat Communication",
          status: "SCHEDULED",
          schoolId: session.user.schoolId!,
        },
      });
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        appointmentId: appointment.id,
        senderId: session.user.id,
        content: message,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Message sent successfully",
      data: chatMessage,
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

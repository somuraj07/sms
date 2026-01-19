import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { ICommunicationRepository } from "@/domain/repositories/ICommunicationRepository";
import { PrismaCommunicationRepository } from "@/infrastructure/repositories/PrismaCommunicationRepository";
import prisma from "@/lib/db";

// GET: list appointments for current user (student or teacher)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const repository = new PrismaCommunicationRepository();
    let appointments;

    if (session.user.role === "STUDENT") {
      const student = await prisma.student.findUnique({
        where: { userId: session.user.id },
      });
      if (!student) {
        return NextResponse.json({ message: "Student profile not found" }, { status: 400 });
      }
      appointments = await repository.findAppointmentsByStudent(student.id);
    } else if (session.user.role === "TEACHER") {
      appointments = await repository.findAppointmentsByTeacher(session.user.id);
    } else {
      return NextResponse.json(
        { message: "Only students or teachers can view appointments" },
        { status: 403 }
      );
    }

    // Enrich with relations
    const enriched = await Promise.all(
      appointments.map(async (appt) => {
        const student = await prisma.student.findUnique({
          where: { id: appt.studentId },
          include: {
            user: { select: { name: true } },
            class: { select: { name: true } },
          },
        });
        const teacher = await prisma.user.findUnique({
          where: { id: appt.teacherId },
          select: { name: true },
        });
        return {
          ...appt,
          studentName: student?.user?.name || "Student",
          studentClass: student?.class?.name || "Class Not Set",
          teacherName: teacher?.name || "Teacher",
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    console.error("List appointments error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}

// POST: create appointment (student)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { message: "Only students can request appointments" },
        { status: 403 }
      );
    }

    const { teacherId, scheduledAt, note } = await req.json();

    if (!teacherId) {
      return NextResponse.json(
        { message: "teacherId is required" },
        { status: 400 }
      );
    }

    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student profile not found" },
        { status: 400 }
      );
    }

    if (!session.user.schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const repository = new PrismaCommunicationRepository();
    const appointment = await repository.createAppointment({
      studentId: student.id,
      teacherId,
      schoolId: session.user.schoolId,
      note: note || null,
    });

    // Update scheduledAt if provided
    if (scheduledAt) {
      await repository.updateAppointmentStatus(
        appointment.id,
        "APPROVED",
        new Date(scheduledAt)
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Appointment requested", 
        data: appointment 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create appointment error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}


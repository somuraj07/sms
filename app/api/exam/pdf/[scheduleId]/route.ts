import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { PrismaExamRepository } from "@/infrastructure/repositories/PrismaExamRepository";
import prisma from "@/lib/db";
// Note: pdfkit requires additional setup for Next.js
// For now, we'll return JSON. PDF generation can be implemented with a proper PDF library

export async function GET(
  req: Request,
  { params }: { params: { scheduleId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { scheduleId } = params;

    const repository = new PrismaExamRepository();
    const allocations = await repository.findAllocationsBySchedule(scheduleId);

    const schedule = await prisma.examSchedule.findUnique({
      where: { id: scheduleId },
      include: {
        room: true,
        invigilator: true,
        allocations: {
          include: {
            student: {
              include: {
                user: true,
                class: true,
              },
            },
          },
          orderBy: [{ benchNumber: "asc" }, { seatPosition: "asc" }],
        },
      },
    });

    if (!schedule) {
      return NextResponse.json(
        { message: "Schedule not found" },
        { status: 404 }
      );
    }

    // Return JSON data for now - PDF generation can be implemented on frontend
    // or with a server-side PDF library like puppeteer or jsPDF
    return NextResponse.json(
      {
        schedule: {
          examName: schedule.examName,
          subject: schedule.subject,
          examDate: schedule.examDate,
          room: schedule.room.roomNumber,
          invigilator: schedule.invigilator?.name,
        },
        allocations: schedule.allocations.map((alloc) => ({
          rollNumber: alloc.rollNumber,
          studentName: alloc.student.user.name,
          className: alloc.student.class?.name,
          benchNumber: alloc.benchNumber,
          seatPosition: alloc.seatPosition,
        })),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Generate PDF error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

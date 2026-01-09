import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { PrismaExamRepository } from "@/infrastructure/repositories/PrismaExamRepository";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scheduleId = searchParams.get("scheduleId");

    if (!scheduleId) {
      return NextResponse.json(
        { message: "Schedule ID is required" },
        { status: 400 }
      );
    }

    const repository = new PrismaExamRepository();
    const allocations = await repository.findAllocationsBySchedule(scheduleId);

    // Enrich with student and room data
    const enrichedAllocations = await Promise.all(
      allocations.map(async (alloc) => {
        const student = await prisma.student.findUnique({
          where: { id: alloc.studentId },
          include: { user: { select: { name: true } } },
        });

        const room = await prisma.examRoom.findUnique({
          where: { id: alloc.roomId },
          select: { roomNumber: true },
        });

        return {
          id: alloc.id,
          studentName: student?.user?.name || "Unknown",
          benchNumber: alloc.benchNumber,
          seatPosition: alloc.seatPosition,
          rollNumber: alloc.rollNumber,
          roomNumber: room?.roomNumber || "Unknown",
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enrichedAllocations,
    });
  } catch (error: any) {
    console.error("List exam allocations error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

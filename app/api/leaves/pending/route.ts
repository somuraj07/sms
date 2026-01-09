import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { LeaveUseCase } from "@/application/use-cases/LeaveUseCase";
import { PrismaLeaveRepository } from "@/infrastructure/repositories/PrismaLeaveRepository";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const repository = new PrismaLeaveRepository();
    const useCase = new LeaveUseCase(repository);

    const leaves = await useCase.getPendingLeaves(schoolId);

    // Enrich with teacher info
    const enriched = await Promise.all(
      leaves.map(async (leave) => {
        const teacher = await prisma.user.findUnique({
          where: { id: leave.teacherId },
          select: {
            id: true,
            name: true,
            email: true,
            mobile: true,
          },
        });
        return {
          ...leave,
          teacher,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: enriched,
    });
  } catch (error: any) {
    console.error("List pending leaves error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}

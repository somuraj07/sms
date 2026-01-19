import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { BusBookingUseCase } from "@/application/use-cases/BusBookingUseCase";
import { PrismaBusRepository } from "@/infrastructure/repositories/PrismaBusRepository";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const className = searchParams.get("className");
    const busId = searchParams.get("busId");
    const schoolId = session.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const repository = new PrismaBusRepository();
    const useCase = new BusBookingUseCase(repository);

    let schedules;
    if (busId) {
      // Get schedules by busId
      schedules = await prisma.busSchedule.findMany({
        where: {
          busId,
          bus: {
            schoolId,
          },
        },
        orderBy: {
          departureTime: "asc",
        },
      });
    } else if (className) {
      schedules = await useCase.getSchedulesByClass(className, schoolId);
    } else {
      // Get all schedules for the school
      schedules = await prisma.busSchedule.findMany({
        where: {
          bus: {
            schoolId,
          },
        },
        include: {
          bus: {
            select: {
              id: true,
              busNumber: true,
              busName: true,
            },
          },
        },
        orderBy: {
          departureTime: "asc",
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: schedules,
    });
  } catch (error: any) {
    console.error("List bus schedules error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

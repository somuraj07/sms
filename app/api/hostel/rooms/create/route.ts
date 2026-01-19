import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { HostelBookingUseCase } from "@/application/use-cases/HostelBookingUseCase";
import { PrismaHostelRepository } from "@/infrastructure/repositories/PrismaHostelRepository";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only admin can create rooms
    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { name, capacity, gender } = await req.json();

    if (!name || !capacity || !gender) {
      return NextResponse.json(
        { message: "Name, capacity, and gender are required" },
        { status: 400 }
      );
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const repository = new PrismaHostelRepository();
    const useCase = new HostelBookingUseCase(repository);

    const room = await useCase.createRoom({
      name,
      capacity: parseInt(capacity),
      gender,
      schoolId,
    });

    return NextResponse.json(
      { message: "Room created successfully", room },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create hostel room error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

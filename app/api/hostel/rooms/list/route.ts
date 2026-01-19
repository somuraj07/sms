import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { HostelBookingUseCase } from "@/application/use-cases/HostelBookingUseCase";
import { PrismaHostelRepository } from "@/infrastructure/repositories/PrismaHostelRepository";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const gender = searchParams.get("gender") as "MALE" | "FEMALE" | "OTHER" | null;

    const repository = new PrismaHostelRepository();
    const useCase = new HostelBookingUseCase(repository);

    let rooms;
    if (gender) {
      rooms = await useCase.getAvailableRooms(schoolId, gender);
    } else {
      rooms = await useCase.getAvailableRooms(schoolId, "MALE");
      const femaleRooms = await useCase.getAvailableRooms(schoolId, "FEMALE");
      rooms = [...rooms, ...femaleRooms];
    }

    // Get availability for each room
    const roomsWithAvailability = await Promise.all(
      rooms.map(async (room) => {
        const availability = await useCase.getRoomAvailability(room.id);
        return {
          ...room,
          totalCots: availability.totalCots,
          availableCots: availability.availableCots.length,
          occupiedCots: availability.occupiedCots,
        };
      })
    );

    return NextResponse.json({ rooms: roomsWithAvailability }, { status: 200 });
  } catch (error: any) {
    console.error("List hostel rooms error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

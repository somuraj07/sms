import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { HostelBookingUseCase } from "@/application/use-cases/HostelBookingUseCase";
import { PrismaHostelRepository } from "@/infrastructure/repositories/PrismaHostelRepository";

export async function GET(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { roomId } = params;

    const repository = new PrismaHostelRepository();
    const useCase = new HostelBookingUseCase(repository);

    const availability = await useCase.getRoomAvailability(roomId);

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error: any) {
    console.error("Get hostel availability error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

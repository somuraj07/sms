import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { BusBookingUseCase } from "@/application/use-cases/BusBookingUseCase";
import { PrismaBusRepository } from "@/infrastructure/repositories/PrismaBusRepository";

export async function GET(
  req: Request,
  { params }: { params: { busId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { busId } = params;
    const { searchParams } = new URL(req.url);
    const travelDate = searchParams.get("travelDate");

    const repository = new PrismaBusRepository();
    const useCase = new BusBookingUseCase(repository);

    const availability = await useCase.getBusAvailability(
      busId,
      travelDate ? new Date(travelDate) : undefined
    );

    return NextResponse.json({ availability }, { status: 200 });
  } catch (error: any) {
    console.error("Get bus availability error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

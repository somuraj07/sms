import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { BusBookingUseCase } from "@/application/use-cases/BusBookingUseCase";
import { PrismaBusRepository } from "@/infrastructure/repositories/PrismaBusRepository";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { busId, seatId, scheduleId, travelDate } = await req.json();

    if (!busId || !seatId || !travelDate) {
      return NextResponse.json(
        { message: "Bus ID, seat ID, and travel date are required" },
        { status: 400 }
      );
    }

    const repository = new PrismaBusRepository();
    const useCase = new BusBookingUseCase(repository);

    const booking = await useCase.bookSeat({
      studentId: session.user.id,
      busId,
      seatId,
      scheduleId: scheduleId || null,
      travelDate: new Date(travelDate),
    });

    return NextResponse.json(
      { message: "Seat booked successfully", booking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Book bus seat error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

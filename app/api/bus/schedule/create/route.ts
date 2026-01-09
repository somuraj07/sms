import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { BusBookingUseCase } from "@/application/use-cases/BusBookingUseCase";
import { PrismaBusRepository } from "@/infrastructure/repositories/PrismaBusRepository";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { busId, className, departureTime, arrivalTime, pickupPoint, dropPoint } = await req.json();

    if (!busId || !className || !departureTime || !arrivalTime) {
      return NextResponse.json(
        { message: "Bus ID, class name, departure time, and arrival time are required" },
        { status: 400 }
      );
    }

    const repository = new PrismaBusRepository();
    const useCase = new BusBookingUseCase(repository);

    const schedule = await useCase.createSchedule({
      busId,
      className,
      departureTime: new Date(departureTime),
      arrivalTime: new Date(arrivalTime),
      pickupPoint: pickupPoint || null,
      dropPoint: dropPoint || null,
    });

    return NextResponse.json(
      { message: "Schedule created successfully", schedule },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create bus schedule error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

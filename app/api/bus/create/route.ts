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

    const { busNumber, busName, totalSeats, routeName } = await req.json();

    if (!busNumber || !totalSeats || !routeName) {
      return NextResponse.json(
        { message: "Bus number, total seats, and route name are required" },
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

    const repository = new PrismaBusRepository();
    const useCase = new BusBookingUseCase(repository);

    const bus = await useCase.createBus({
      busNumber,
      busName: busName || null,
      totalSeats: parseInt(totalSeats),
      routeName,
      schoolId,
    });

    return NextResponse.json(
      { message: "Bus created successfully", bus },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create bus error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

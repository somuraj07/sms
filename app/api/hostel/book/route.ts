import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { HostelBookingUseCase } from "@/application/use-cases/HostelBookingUseCase";
import { PrismaHostelRepository } from "@/infrastructure/repositories/PrismaHostelRepository";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Only students can book
    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { roomId, cotId, checkInDate } = await req.json();

    if (!roomId || !cotId || !checkInDate) {
      return NextResponse.json(
        { message: "Room ID, cot ID, and check-in date are required" },
        { status: 400 }
      );
    }

    // Get student ID from user
    const student = await prisma.student.findUnique({
      where: { userId: session.user.id },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    const repository = new PrismaHostelRepository();
    const useCase = new HostelBookingUseCase(repository);

    const booking = await useCase.bookCot({
      studentId: session.user.id,
      roomId,
      cotId,
      checkInDate: new Date(checkInDate),
    });

    return NextResponse.json(
      { message: "Cot booked successfully", booking },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Book hostel cot error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

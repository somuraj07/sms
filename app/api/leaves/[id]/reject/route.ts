import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { LeaveUseCase } from "@/application/use-cases/LeaveUseCase";
import { PrismaLeaveRepository } from "@/infrastructure/repositories/PrismaLeaveRepository";

export async function POST(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { remarks } = await req.json();

    if (!remarks) {
      return NextResponse.json(
        { message: "Remarks are required for rejection" },
        { status: 400 }
      );
    }

    const repository = new PrismaLeaveRepository();
    const useCase = new LeaveUseCase(repository);

    const leave = await useCase.rejectLeave(id, session.user.id, remarks);

    return NextResponse.json(
      { 
        success: true,
        message: "Leave rejected successfully",
        data: leave 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Reject leave error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Unable to reject leave" 
      },
      { status: 500 }
    );
  }
}

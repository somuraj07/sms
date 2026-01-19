import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { SuperAdminUseCase } from "@/application/use-cases/SuperAdminUseCase";
import { PrismaSchoolRepository } from "@/infrastructure/repositories/PrismaSchoolRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const schoolRepository = new PrismaSchoolRepository();
    const authRepository = new PrismaAuthRepository();
    const useCase = new SuperAdminUseCase(schoolRepository, authRepository);

    const stats = await useCase.getDashboardStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error("Get dashboard stats error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}

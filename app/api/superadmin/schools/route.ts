import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { SuperAdminUseCase } from "@/application/use-cases/SuperAdminUseCase";
import { PrismaSchoolRepository } from "@/infrastructure/repositories/PrismaSchoolRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") ?? 1);
    const limit = Number(searchParams.get("limit") ?? 8);
    const search = searchParams.get("search") ?? undefined;

    const schoolRepository = new PrismaSchoolRepository();
    const authRepository = new PrismaAuthRepository();
    const useCase = new SuperAdminUseCase(schoolRepository, authRepository);

    const result = await useCase.getColleges(page, limit, search);

    return NextResponse.json({
      success: true,
      data: result.colleges,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
      },
    });
  } catch (error: any) {
    console.error("Get colleges error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to fetch colleges" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { SuperAdminUseCase } from "@/application/use-cases/SuperAdminUseCase";
import { PrismaSchoolRepository } from "@/infrastructure/repositories/PrismaSchoolRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";

export async function POST(
  req: Request,
  { params }: { params: { schoolId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { schoolId } = params;

    const schoolRepository = new PrismaSchoolRepository();
    const authRepository = new PrismaAuthRepository();
    const useCase = new SuperAdminUseCase(schoolRepository, authRepository);

    const school = await useCase.activateCollege(schoolId);

    return NextResponse.json(
      {
        message: "College activated successfully",
        college: {
          id: school.id,
          name: school.name,
          isActive: school.isActive,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Activate college error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

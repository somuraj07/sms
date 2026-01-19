import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { SuperAdminUseCase } from "@/application/use-cases/SuperAdminUseCase";
import { PrismaSchoolRepository } from "@/infrastructure/repositories/PrismaSchoolRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";
import { BcryptPasswordService } from "@/infrastructure/services/BcryptPasswordService";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const {
      name,
      address,
      location,
      icon,
      pincode,
      district,
      state,
      city,
      subdomain,
      adminName,
      adminEmail,
      adminPassword,
      adminMobile,
    } = await req.json();

    if (!name || !address || !location || !pincode || !district || !state || !city || !subdomain || !adminName || !adminEmail || !adminPassword) {
      return NextResponse.json(
        { message: "All required fields are missing" },
        { status: 400 }
      );
    }

    const schoolRepository = new PrismaSchoolRepository();
    const authRepository = new PrismaAuthRepository();
    const passwordService = new BcryptPasswordService();

    // Hash admin password
    const hashedPassword = await passwordService.hash(adminPassword);

    const useCase = new SuperAdminUseCase(schoolRepository, authRepository);

    const result = await useCase.createCollege({
      name,
      address,
      location,
      icon: icon || null,
      pincode,
      district,
      state,
      city,
      subdomain: subdomain.toLowerCase(),
      adminName,
      adminEmail,
      adminPassword: hashedPassword,
      adminMobile: adminMobile || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        message: "College created successfully",
        data: {
          college: {
            id: result.school.id,
            name: result.school.name,
            subdomain: result.school.subdomain,
          },
          admin: {
            id: result.admin.id,
            name: result.admin.name,
            email: result.admin.email,
          },
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create college error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}

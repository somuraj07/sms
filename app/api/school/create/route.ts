import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { SuperAdminUseCase } from "@/application/use-cases/SuperAdminUseCase";
import { PrismaSchoolRepository } from "@/infrastructure/repositories/PrismaSchoolRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";
import { BcryptPasswordService } from "@/infrastructure/services/BcryptPasswordService";

/**
 * This route is kept for backward compatibility
 * New route: /api/superadmin/colleges/create
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json(
        { message: "Only super admin can create schools" },
        { status: 403 }
      );
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
      schoolAdminId, // Legacy support
    } = await req.json();

    if (!name || !address || !location || !pincode || !district || !state || !city) {
      return NextResponse.json(
        { message: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Use new clean architecture approach
    const schoolRepository = new PrismaSchoolRepository();
    const authRepository = new PrismaAuthRepository();
    const passwordService = new BcryptPasswordService();

    // If using new format with subdomain and admin details
    if (subdomain && adminName && adminEmail && adminPassword) {
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
        { message: "School created successfully", school: result.school },
        { status: 201 }
      );
    }

    // Legacy format - create school without subdomain
    const school = await prisma.school.create({
      data: {
        name,
        address,
        location,
        icon,
        pincode,
        district,
        state,
        city,
        admins: schoolAdminId
          ? { connect: { id: schoolAdminId } }
          : undefined,
      },
    });

    if (schoolAdminId) {
      await prisma.user.update({
        where: { id: schoolAdminId },
        data: { schoolId: school.id },
      });
    }

    return NextResponse.json(
      { message: "School created successfully", school },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create school error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

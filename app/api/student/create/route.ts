import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { StudentUseCase } from "@/application/use-cases/StudentUseCase";
import { PrismaStudentRepository } from "@/infrastructure/repositories/PrismaStudentRepository";
import { PrismaAuthRepository } from "@/infrastructure/repositories/PrismaAuthRepository";
import { BcryptPasswordService } from "@/infrastructure/services/BcryptPasswordService";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    let schoolId = session.user.schoolId;

    // Fallback: find school where the admin belongs
    if (!schoolId) {
      const adminSchool = await prisma.school.findFirst({
        where: { admins: { some: { id: session.user.id } } },
        select: { id: true },
      });
      schoolId = adminSchool?.id ?? null;

      if (schoolId) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { schoolId },
        });
      }
    }

    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const {
      name,
      email,
      fatherName,
      aadhaarNo,
      phoneNo,
      dob,
      AdmissionNo,
      classId,
      address,
      totalFee,
      discountPercent,
      gender,
    } = await req.json();

    if (!name || !dob || !fatherName || !aadhaarNo || !phoneNo || !AdmissionNo) {
      return NextResponse.json(
        { message: "Missing required fields: name, dob, fatherName, aadhaarNo, phoneNo and AdmissionNo are required" },
        { status: 400 }
      );
    }

    const studentRepository = new PrismaStudentRepository();
    const authRepository = new PrismaAuthRepository();
    const passwordService = new BcryptPasswordService();
    const useCase = new StudentUseCase(studentRepository, authRepository, passwordService);

    const student = await useCase.createStudent({
      name,
      email: email || null,
      fatherName,
      aadhaarNo,
      phoneNo,
      dob: new Date(dob),
      admissionNo: AdmissionNo,
      classId: classId || null,
      address: address || null,
      gender: gender || "OTHER",
      schoolId,
      totalFee: totalFee || 0,
      discountPercent: discountPercent || 0,
    });

    // Enrich with relations
    const enriched = await prisma.student.findUnique({
      where: { id: student.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
        class: true,
      },
    });

    return NextResponse.json(
      { 
        success: true,
        message: "Student created successfully", 
        data: enriched 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Student creation error:", error);

    if (error?.code === "P2002") {
      const field = error?.meta?.target?.[0];
      if (field === "email") {
        return NextResponse.json(
          { success: false, message: "Email already exists" },
          { status: 400 }
        );
      }
      if (field === "aadhaarNo") {
        return NextResponse.json(
          { success: false, message: "Aadhaar number already exists" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}


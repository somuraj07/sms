import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    /* ---------- Auth ---------- */
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {
      schoolId, // 👈 required only for SUPERADMIN
      name,
      address,
      location,
      icon,
      pincode,
      district,
      state,
      city,
    } = await req.json();

    let targetSchoolId: string | null = null;

    /* ---------- SCHOOL ADMIN ---------- */
    if (session.user.role === "SCHOOLADMIN") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { schoolId: true },
      });

      if (!user?.schoolId) {
        return NextResponse.json(
          { message: "You have not created a school yet" },
          { status: 400 }
        );
      }

      targetSchoolId = user.schoolId;
    }

    /* ---------- SUPER ADMIN ---------- */
    if (session.user.role === "SUPERADMIN") {
      if (!schoolId) {
        return NextResponse.json(
          { message: "schoolId is required for super admin" },
          { status: 400 }
        );
      }
      targetSchoolId = schoolId;
    }

    /* ---------- Update ---------- */
    const updated = await prisma.school.update({
      where: { id: targetSchoolId! },
      data: {
        name,
        address,
        location,
        icon,
        pincode,
        district,
        state,
        city,
      },
    });

    return NextResponse.json(
      { message: "School updated successfully", updated },
      { status: 200 }
    );
  } catch (error) {
    console.error("School update error:", error);
    return NextResponse.json(
      { message: "Error updating school" },
      { status: 500 }
    );
  }
}

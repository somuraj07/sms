import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Get all colleges with their details
    const colleges = await prisma.school.findMany({
      include: {
        students: {
          select: { id: true },
        },
        teachers: {
          select: { id: true },
        },
      },
    });

    // Colleges by State
    const collegesByState: Record<string, number> = {};
    colleges.forEach((college) => {
      const state = college.state || "Unknown";
      collegesByState[state] = (collegesByState[state] || 0) + 1;
    });

    // Colleges by City
    const collegesByCity: Record<string, number> = {};
    colleges.forEach((college) => {
      const city = college.city || "Unknown";
      collegesByCity[city] = (collegesByCity[city] || 0) + 1;
    });

    // Top Colleges by Enrollment
    const topColleges = colleges
      .map((college) => ({
        name: college.name,
        subdomain: college.subdomain || "",
        students: college.students.length,
        teachers: college.teachers.length,
      }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 10);

    // Growth Data (last 6 months)
    const growthData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleString("default", { month: "short", year: "numeric" });
      
      const collegesInMonth = await prisma.school.count({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), 1),
            lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
          },
        },
      });

      const studentsInMonth = await prisma.student.count({
        where: {
          createdAt: {
            gte: new Date(date.getFullYear(), date.getMonth(), 1),
            lt: new Date(date.getFullYear(), date.getMonth() + 1, 1),
          },
        },
      });

      growthData.push({
        month: monthName,
        colleges: collegesInMonth,
        students: studentsInMonth,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        collegesByState,
        collegesByCity,
        topColleges,
        growthData,
      },
    });
  } catch (error: any) {
    console.error("Get analysis error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to load analysis data" },
      { status: 500 }
    );
  }
}

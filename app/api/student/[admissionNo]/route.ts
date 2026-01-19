import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: { admissionNo: string } }) {
  try {
    const { admissionNo } = params;

    if (!admissionNo) {
      return NextResponse.json({ error: "Admission number is required" }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { AdmissionNo: admissionNo },
      include: {
        user: true,
        class: true,
        school: true,
        fee: true,
        payments: true,
        marks: {
          include: {
            exam: true,
            class: true,
            teacher: { select: { name: true } },
          },
        },
        homeworkSubmissions: {
          include: { homework: true },
        },
        attendances: true,
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ student });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

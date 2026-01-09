import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.schoolId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const exams = await prisma.exam.findMany({
    where: {
      schoolId: session.user.schoolId,
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({ 
    success: true,
    data: exams 
  });
}

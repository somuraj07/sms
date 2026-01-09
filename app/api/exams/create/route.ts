import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { name } = await req.json();

  if (!name) {
    return NextResponse.json({ message: "Exam name required" }, { status: 400 });
  }

  if (!session.user.schoolId) {
    return NextResponse.json({ message: "School ID not found" }, { status: 400 });
  }

  const exam = await prisma.exam.create({
    data: {
      name,
      schoolId: session.user.schoolId,
    },
  });

  return NextResponse.json({ exam }, { status: 201 });
}

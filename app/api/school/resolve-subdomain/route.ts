import { NextResponse } from "next/server";
import { headers } from "next/headers";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const headersList = await headers();
    const subdomain = headersList.get("x-subdomain") || req.headers.get("x-subdomain");

    if (!subdomain) {
      return NextResponse.json(
        { message: "Subdomain not found" },
        { status: 400 }
      );
    }

    const school = await prisma.school.findUnique({
      where: { subdomain },
      select: { id: true, name: true, isActive: true },
    });

    if (!school) {
      return NextResponse.json(
        { message: "School not found" },
        { status: 404 }
      );
    }

    if (!school.isActive) {
      return NextResponse.json(
        { message: "School is inactive", school },
        { status: 403 }
      );
    }

    return NextResponse.json({ school }, { status: 200 });
  } catch (error: any) {
    console.error("Resolve subdomain error:", error);
    return NextResponse.json(
      { message: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

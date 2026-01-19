import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { NewsFeedUseCase } from "@/application/use-cases/NewsFeedUseCase";
import { PrismaNewsFeedRepository } from "@/infrastructure/repositories/PrismaNewsFeedRepository";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!["ADMIN", "TEACHER", "SUPERADMIN"].includes(session.user.role)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const { title, description, mediaUrl, mediaType, tagline } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { message: "Title and description are required" },
        { status: 400 }
      );
    }

    const schoolId = session.user.schoolId;
    if (!schoolId) {
      return NextResponse.json(
        { message: "School not found in session" },
        { status: 400 }
      );
    }

    const repository = new PrismaNewsFeedRepository();
    const useCase = new NewsFeedUseCase(repository);

    const newsFeed = await useCase.createNewsFeed({
      title,
      description,
      tagline: tagline || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      schoolId,
      createdById: session.user.id,
    });

    // Enrich with creator info
    const enriched = await prisma.newsFeed.findUnique({
      where: { id: newsFeed.id },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return NextResponse.json(
      { 
        success: true,
        message: "News feed created successfully", 
        data: enriched 
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create news feed error:", error);
    return NextResponse.json(
      { 
        success: false,
        message: error?.message || "Internal server error" 
      },
      { status: 500 }
    );
  }
}

import { authOptions } from "@/lib/authOptions"
import prisma from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const leaves = await prisma.leaveRequest.findMany({
      where: {
        teacherId: session.user.id
      },
      include: {
        approver: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ 
      success: true,
      data: leaves 
    })
  } catch (error: any) {
    console.error("Get my leaves error:", error)
    return NextResponse.json({ 
      success: false,
      message: error?.message || "Internal error" 
    }, { status: 500 })
  }
}

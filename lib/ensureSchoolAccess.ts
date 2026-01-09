import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import prisma from "@/lib/db";

/**
 * Ensures user has access to the specified school
 * Returns schoolId if access is granted
 */
export async function ensureSchoolAccess(requestedSchoolId?: string | null): Promise<string> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  // Super admin can access any school
  if (session.user.role === "SUPERADMIN") {
    if (requestedSchoolId) {
      return requestedSchoolId;
    }
    throw new Error("School ID required for super admin");
  }

  // Other users can only access their own school
  const userSchoolId = session.user.schoolId;
  if (!userSchoolId) {
    throw new Error("User is not associated with any school");
  }

  // If a specific school is requested, verify access
  if (requestedSchoolId && requestedSchoolId !== userSchoolId) {
    throw new Error("Access denied to this school");
  }

  return userSchoolId;
}

/**
 * Get school context for current user
 */
export async function getSchoolContext(): Promise<{
  schoolId: string | null;
  isSuperAdmin: boolean;
  role: string;
}> {
  const session = await getServerSession(authOptions);

  if (!session) {
    throw new Error("Unauthorized");
  }

  return {
    schoolId: session.user.schoolId,
    isSuperAdmin: session.user.role === "SUPERADMIN",
    role: session.user.role,
  };
}

import { headers } from "next/headers";
import prisma from "./db";

/**
 * Get school ID from request headers (set by middleware)
 */
export async function getSchoolFromRequest(): Promise<{ id: string; name: string } | null> {
  const headersList = await headers();
  const schoolId = headersList.get("x-school-id");
  const schoolName = headersList.get("x-school-name");

  if (schoolId && schoolName) {
    return { id: schoolId, name: schoolName };
  }

  return null;
}

/**
 * Get school by subdomain
 */
export async function getSchoolBySubdomain(subdomain: string) {
  return prisma.school.findUnique({
    where: { subdomain },
  });
}

import { ISchoolRepository, CreateSchoolData } from "@/domain/repositories/ISchoolRepository";
import { School } from "@/domain/entities/School.entity";
import prisma from "@/lib/db";

export class PrismaSchoolRepository implements ISchoolRepository {
  async create(data: CreateSchoolData): Promise<School> {
    try {
      const school = await prisma.school.create({ data });
      return this.toSchoolEntity(school);
    } catch (error: any) {
      // Handle unique constraint violation for subdomain
      if (error?.code === "P2002" && error?.meta?.target?.includes("subdomain")) {
        throw new Error("Subdomain already exists");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<School | null> {
    const school = await prisma.school.findUnique({ where: { id } });
    return school ? this.toSchoolEntity(school) : null;
  }

  async findBySubdomain(subdomain: string): Promise<School | null> {
    if (!subdomain) return null;
    try {
      // Use findFirst with direct field access
      const school = await prisma.school.findFirst({
        where: { 
          subdomain: subdomain,
        },
      });
      return school ? this.toSchoolEntity(school) : null;
    } catch (error: any) {
      // Fallback: use raw SQL query if Prisma client doesn't recognize the field
      console.warn("Prisma client doesn't recognize subdomain, using raw SQL:", error.message);
      try {
        const result = await prisma.$queryRaw<any[]>`
          SELECT * FROM "School" WHERE "subdomain" = ${subdomain} LIMIT 1
        `;
        if (result && result.length > 0) {
          return this.toSchoolEntity(result[0]);
        }
        return null;
      } catch (rawError: any) {
        // Try with lowercase table name
        try {
          const result = await prisma.$queryRaw<any[]>`
            SELECT * FROM "school" WHERE "subdomain" = ${subdomain} LIMIT 1
          `;
          if (result && result.length > 0) {
            return this.toSchoolEntity(result[0]);
          }
          return null;
        } catch (finalError) {
          console.error("All findBySubdomain methods failed:", finalError);
          return null;
        }
      }
    }
  }

  async findAll(): Promise<School[]> {
    const schools = await prisma.school.findMany({
      orderBy: { name: "asc" },
    });
    return schools.map(this.toSchoolEntity);
  }

  async update(id: string, data: Partial<CreateSchoolData>): Promise<School> {
    const school = await prisma.school.update({
      where: { id },
      data,
    });
    return this.toSchoolEntity(school);
  }

  async activate(id: string): Promise<School> {
    const school = await prisma.school.update({
      where: { id },
      data: { isActive: true },
    });
    return this.toSchoolEntity(school);
  }

  async deactivate(id: string): Promise<School> {
    const school = await prisma.school.update({
      where: { id },
      data: { isActive: false },
    });
    return this.toSchoolEntity(school);
  }

  async existsBySubdomain(subdomain: string): Promise<boolean> {
    if (!subdomain) return false;
    try {
      // Try using count with where clause
      const count = await prisma.school.count({
        where: { 
          subdomain: subdomain,
        },
      });
      return count > 0;
    } catch (error: any) {
      // If Prisma client doesn't recognize subdomain field, use raw SQL query
      console.warn("Prisma client doesn't recognize subdomain, using raw SQL:", error.message);
      try {
        // Use Prisma's table name (usually lowercase)
        const result = await prisma.$queryRaw<Array<{ count: number }>>`
          SELECT COUNT(*)::int as count FROM "School" WHERE "subdomain" = ${subdomain}
        `;
        return (Number(result[0]?.count) ?? 0) > 0;
      } catch (rawError: any) {
        // Try with lowercase table name
        try {
          const result = await prisma.$queryRaw<Array<{ count: number }>>`
            SELECT COUNT(*)::int as count FROM "school" WHERE "subdomain" = ${subdomain}
          `;
          return (Number(result[0]?.count) ?? 0) > 0;
        } catch (finalError) {
          console.error("All subdomain check methods failed:", finalError);
          // Last resort: return false and let the create operation handle the unique constraint error
          return false;
        }
      }
    }
  }

  private toSchoolEntity(prismaSchool: any): School {
    return new School(
      prismaSchool.id,
      prismaSchool.name,
      prismaSchool.address,
      prismaSchool.location,
      prismaSchool.icon,
      prismaSchool.pincode,
      prismaSchool.district,
      prismaSchool.state,
      prismaSchool.city,
      prismaSchool.subdomain,
      prismaSchool.isActive,
      prismaSchool.createdAt,
      prismaSchool.updatedAt
    );
  }
}

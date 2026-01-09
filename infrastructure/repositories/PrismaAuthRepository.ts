import { IAuthRepository, CreateUserData } from "@/domain/repositories/IAuthRepository";
import { User } from "@/domain/entities/User.entity";
import prisma from "@/lib/db";

/**
 * Infrastructure Layer - Repository Implementation
 * Handles data persistence using Prisma
 */
export class PrismaAuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        school: {
          select: { name: true },
        },
      },
    });

    if (!user) return null;

    return this.toDomainEntity(user);
  }

  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        school: {
          select: { name: true },
        },
      },
    });

    if (!user) return null;

    return this.toDomainEntity(user);
  }

  async create(user: CreateUserData): Promise<User> {
    const created = await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        schoolId: user.schoolId,
      },
    });

    return this.toDomainEntity(created);
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  /**
   * Maps Prisma model to Domain Entity
   */
  private toDomainEntity(prismaUser: any): User {
    return new User(
      prismaUser.id,
      prismaUser.name || "",
      prismaUser.email || "",
      prismaUser.password || "",
      prismaUser.role,
      prismaUser.schoolId,
      prismaUser.createdAt,
      prismaUser.updatedAt
    );
  }
}

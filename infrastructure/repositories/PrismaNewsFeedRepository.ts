import { INewsFeedRepository, CreateNewsFeedData } from "@/domain/repositories/INewsFeedRepository";
import { NewsFeed } from "@/domain/entities/NewsFeed.entity";
import prisma from "@/lib/db";

export class PrismaNewsFeedRepository implements INewsFeedRepository {
  async create(data: CreateNewsFeedData): Promise<NewsFeed> {
    const newsFeed = await prisma.newsFeed.create({ data });
    return this.toNewsFeedEntity(newsFeed);
  }

  async findById(id: string): Promise<NewsFeed | null> {
    const newsFeed = await prisma.newsFeed.findUnique({ where: { id } });
    return newsFeed ? this.toNewsFeedEntity(newsFeed) : null;
  }

  async findBySchool(schoolId: string): Promise<NewsFeed[]> {
    const newsFeeds = await prisma.newsFeed.findMany({
      where: { schoolId },
      orderBy: { createdAt: "desc" },
    });
    return newsFeeds.map(this.toNewsFeedEntity);
  }

  async update(id: string, data: Partial<CreateNewsFeedData>): Promise<NewsFeed> {
    const newsFeed = await prisma.newsFeed.update({
      where: { id },
      data,
    });
    return this.toNewsFeedEntity(newsFeed);
  }

  async delete(id: string): Promise<void> {
    await prisma.newsFeed.delete({ where: { id } });
  }

  private toNewsFeedEntity(prismaNewsFeed: any): NewsFeed {
    return new NewsFeed(
      prismaNewsFeed.id,
      prismaNewsFeed.title,
      prismaNewsFeed.description,
      prismaNewsFeed.tagline,
      prismaNewsFeed.mediaUrl,
      prismaNewsFeed.mediaType,
      prismaNewsFeed.schoolId,
      prismaNewsFeed.createdById,
      prismaNewsFeed.createdAt,
      prismaNewsFeed.updatedAt
    );
  }
}

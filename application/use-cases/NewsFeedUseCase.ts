import { INewsFeedRepository } from "@/domain/repositories/INewsFeedRepository";
import { NewsFeed, MediaType } from "@/domain/entities/NewsFeed.entity";

export interface CreateNewsFeedRequest {
  title: string;
  description: string;
  tagline: string | null;
  mediaUrl: string | null;
  mediaType: MediaType;
  schoolId: string;
  createdById: string;
}

export class NewsFeedUseCase {
  constructor(private readonly newsFeedRepository: INewsFeedRepository) {}

  async createNewsFeed(request: CreateNewsFeedRequest): Promise<NewsFeed> {
    if (!request.title || !request.description) {
      throw new Error("Title and description are required");
    }

    return this.newsFeedRepository.create(request);
  }

  async getNewsFeedsBySchool(schoolId: string): Promise<NewsFeed[]> {
    return this.newsFeedRepository.findBySchool(schoolId);
  }

  async updateNewsFeed(id: string, data: Partial<CreateNewsFeedRequest>): Promise<NewsFeed> {
    return this.newsFeedRepository.update(id, data);
  }

  async deleteNewsFeed(id: string): Promise<void> {
    await this.newsFeedRepository.delete(id);
  }
}

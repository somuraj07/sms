import { NewsFeed, MediaType } from "../entities/NewsFeed.entity";

export interface CreateNewsFeedData {
  title: string;
  description: string;
  tagline: string | null;
  mediaUrl: string | null;
  mediaType: MediaType;
  schoolId: string;
  createdById: string;
}

export interface INewsFeedRepository {
  create(data: CreateNewsFeedData): Promise<NewsFeed>;
  findById(id: string): Promise<NewsFeed | null>;
  findBySchool(schoolId: string): Promise<NewsFeed[]>;
  update(id: string, data: Partial<CreateNewsFeedData>): Promise<NewsFeed>;
  delete(id: string): Promise<void>;
}

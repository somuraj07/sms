/**
 * Domain Entity - News Feed
 */
export type MediaType = "PHOTO" | "VIDEO" | null;

export class NewsFeed {
  constructor(
    public readonly id: string,
    public readonly title: string,
    public readonly description: string,
    public readonly tagline: string | null,
    public readonly mediaUrl: string | null,
    public readonly mediaType: MediaType,
    public readonly schoolId: string,
    public readonly createdById: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Domain method: Check if news feed has media
   */
  hasMedia(): boolean {
    return this.mediaUrl !== null && this.mediaType !== null;
  }
}

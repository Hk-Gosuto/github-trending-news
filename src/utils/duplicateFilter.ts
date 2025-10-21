import { DatabaseManager } from './database';
import { GitHubTrendingItem } from './supabaseClient';

export class DuplicateFilter {
  private db: DatabaseManager;

  constructor() {
    this.db = new DatabaseManager();
  }

  /**
   * Filter out repositories that were already trending today
   */
  async filterNewTrending(items: GitHubTrendingItem[], date: string): Promise<GitHubTrendingItem[]> {
    const newItems: GitHubTrendingItem[] = [];

    for (const item of items) {
      const fullName = this.extractFullNameFromHref(item.href);
      const alreadyTrending = await this.db.isAlreadyTrending(fullName, date);

      if (!alreadyTrending) {
        newItems.push(item);
      } else {
        console.log(`⏭️  Skipping ${fullName} - already recorded for ${date}`);
      }
    }

    return newItems;
  }

  /**
   * Extract full name from GitHub URL
   */
  private extractFullNameFromHref(href: string): string {
    const match = href.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : href;
  }
}
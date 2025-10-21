import { supabase, Repository, TrendRecord, GitHubTrendingItem } from './supabaseClient';

export class DatabaseManager {

  /**
   * Insert or update a repository record
   */
  async upsertRepository(repoData: GitHubTrendingItem): Promise<Repository | null> {
    try {
      // Parse full_name from href (e.g., https://github.com/owner/repo -> owner/repo)
      const fullName = this.extractFullNameFromHref(repoData.href);

      const repository: Omit<Repository, 'id'> = {
        full_name: fullName,
        description: repoData.description || undefined,
        language: repoData.language || undefined,
        topics: [], // GitHub trending doesn't provide topics, will be empty for now
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('repositories')
        .upsert(repository, {
          onConflict: 'full_name',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error upserting repository:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in upsertRepository:', error);
      return null;
    }
  }

  /**
   * Record trending data for a repository
   */
  async recordTrendingData(repositoryId: number, repoData: GitHubTrendingItem, trendDate: string): Promise<TrendRecord | null> {
    try {
      const trendRecord: Omit<TrendRecord, 'id'> = {
        repository_id: repositoryId,
        trend_date: trendDate,
        stars: this.parseNumber(repoData.star),
        forks: this.parseNumber(repoData.fork),
        metadata: {
          language: repoData.language,
          description: repoData.description,
          href: repoData.href
        }
      };

      const { data, error } = await supabase
        .from('trend_records')
        .insert(trendRecord)
        .select()
        .single();

      if (error) {
        console.error('Error recording trending data:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in recordTrendingData:', error);
      return null;
    }
  }

  /**
   * Process and store all trending data
   */
  async processTrendingData(trendingItems: GitHubTrendingItem[], trendDate: string): Promise<void> {
    console.log(`Processing ${trendingItems.length} trending repositories for date: ${trendDate}`);

    for (const item of trendingItems) {
      try {
        // First, upsert the repository
        const repository = await this.upsertRepository(item);

        if (repository && repository.id) {
          // Then record the trending data
          const trendRecord = await this.recordTrendingData(repository.id, item, trendDate);

          if (trendRecord) {
            console.log(`✅ Recorded trending data for: ${repository.full_name}`);
          } else {
            console.warn(`❌ Failed to record trending data for: ${repository.full_name}`);
          }
        } else {
          console.warn(`❌ Failed to upsert repository: ${this.extractFullNameFromHref(item.href)}`);
        }
      } catch (error) {
        console.error(`Error processing repository ${item.href}:`, error);
      }
    }
  }

  /**
   * Check if a repository was already trending on a specific date
   */
  async isAlreadyTrending(fullName: string, trendDate: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('repositories')
        .select(`
          id,
          trend_records!inner(trend_date)
        `)
        .eq('full_name', fullName)
        .eq('trend_records.trend_date', trendDate)
        .limit(1);

      if (error) {
        console.error('Error checking trending status:', error);
        return false;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error('Error in isAlreadyTrending:', error);
      return false;
    }
  }

  /**
   * Get trending repositories for a specific date
   */
  async getTrendingByDate(trendDate: string): Promise<(Repository & TrendRecord)[]> {
    try {
      const { data, error } = await supabase
        .from('trend_records')
        .select(`
          *,
          repositories(*)
        `)
        .eq('trend_date', trendDate)
        .order('stars', { ascending: false });

      if (error) {
        console.error('Error getting trending by date:', error);
        return [];
      }

      return data?.map(record => ({
        ...record.repositories,
        ...record
      })) || [];
    } catch (error) {
      console.error('Error in getTrendingByDate:', error);
      return [];
    }
  }

  /**
   * Extract full name from GitHub URL
   */
  private extractFullNameFromHref(href: string): string {
    // Extract owner/repo from https://github.com/owner/repo
    const match = href.match(/github\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : href;
  }

  /**
   * Parse number from string (handles commas and k notation)
   */
  private parseNumber(numStr: string): number {
    if (!numStr || numStr.trim() === '') return 0;

    // Remove commas and convert k to thousands
    let cleaned = numStr.replace(/,/g, '').toLowerCase();

    if (cleaned.includes('k')) {
      const num = parseFloat(cleaned.replace('k', ''));
      return Math.round(num * 1000);
    }

    return parseInt(cleaned, 10) || 0;
  }
}
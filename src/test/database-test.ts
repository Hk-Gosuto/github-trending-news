import { DatabaseManager } from '../utils/database';
import { GitHubTrendingItem } from '../utils/supabaseClient';

async function testDatabaseConnection() {
  console.log('🧪 Testing Supabase database connection and operations...');

  const db = new DatabaseManager();

  // Create test data
  const testData: GitHubTrendingItem[] = [
    {
      title: 'test-repo',
      href: 'https://github.com/test-owner/test-repo',
      description: 'This is a test repository',
      language: 'TypeScript',
      star: '1,234',
      fork: '567'
    }
  ];

  const testDate = new Date().toISOString().substring(0, 10);

  try {
    // Test repository creation
    console.log('📝 Testing repository upsert...');
    const repository = await db.upsertRepository(testData[0]);

    if (repository) {
      console.log('✅ Repository upsert successful:', repository.full_name);

      // Test trend record creation
      console.log('📊 Testing trend record creation...');
      const trendRecord = await db.recordTrendingData(repository.id!, testData[0], testDate);

      if (trendRecord) {
        console.log('✅ Trend record creation successful:', trendRecord.id);
      } else {
        console.error('❌ Failed to create trend record');
      }
    } else {
      console.error('❌ Failed to upsert repository');
    }

    // Test querying data
    console.log('🔍 Testing data retrieval...');
    const trendingRepos = await db.getTrendingByDate(testDate);
    console.log(`✅ Found ${trendingRepos.length} trending repositories for ${testDate}`);

    console.log('🎉 All database tests completed successfully!');
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

// Run the test
testDatabaseConnection();
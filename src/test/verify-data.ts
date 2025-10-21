import { DatabaseManager } from '../utils/database';

async function verifyStoredData() {
  console.log('🔍 Verifying stored data in Supabase...');

  const db = new DatabaseManager();
  const today = new Date().toISOString().substring(0, 10);

  try {
    // Get trending repositories for today
    const trendingRepos = await db.getTrendingByDate(today);

    console.log(`📊 Found ${trendingRepos.length} trending repositories for ${today}:`);
    console.log();

    trendingRepos.forEach((repo, index) => {
      console.log(`${index + 1}. ${repo.full_name}`);
      console.log(`   Language: ${repo.language || 'N/A'}`);
      console.log(`   Stars: ${repo.stars}`);
      console.log(`   Forks: ${repo.forks}`);
      console.log(`   Description: ${repo.description ? repo.description.substring(0, 80) + '...' : 'N/A'}`);
      console.log();
    });

    console.log('✅ Data verification complete!');
  } catch (error) {
    console.error('❌ Error verifying data:', error);
  }
}

// Run verification
verifyStoredData();
// Debug script to check tech data in database
const debugTechSearch = async () => {
  try {
    console.log('🔍 Debugging tech search...\n');
    
    // Test 1: Get all techs to see what data we have
    console.log('1. Getting all techs...');
    const allResponse = await fetch('/api/tech/search');
    const allData = await allResponse.json();
    
    if (allData.techs && allData.techs.length > 0) {
      console.log(`✅ Found ${allData.techs.length} total techs`);
      
      // Show sample data
      console.log('\n📋 Sample tech data:');
      allData.techs.slice(0, 3).forEach((tech, index) => {
        console.log(`Tech ${index + 1}:`);
        console.log(`  - ID: ${tech.id}`);
        console.log(`  - Business Name: "${tech.businessName}"`);
        console.log(`  - Username: "${tech.user?.username}"`);
        console.log(`  - Location: "${tech.location}"`);
        console.log(`  - Bio: "${tech.bio?.substring(0, 50)}..."`);
        console.log('');
      });
      
      // Check for specific searches
      console.log('\n🔍 Looking for specific terms:');
      
      // Check for "simply" in usernames
      const simplyTechs = allData.techs.filter(tech => 
        tech.user?.username?.toLowerCase().includes('simply') ||
        tech.businessName?.toLowerCase().includes('simply') ||
        tech.bio?.toLowerCase().includes('simply')
      );
      console.log(`"simply" matches: ${simplyTechs.length}`);
      simplyTechs.forEach(tech => {
        console.log(`  - ${tech.user?.username} (${tech.businessName}) in ${tech.location}`);
      });
      
      // Check for "apopka" in locations
      const apopkaTechs = allData.techs.filter(tech => 
        tech.location?.toLowerCase().includes('apopka')
      );
      console.log(`"apopka" location matches: ${apopkaTechs.length}`);
      apopkaTechs.forEach(tech => {
        console.log(`  - ${tech.user?.username} (${tech.businessName}) in ${tech.location}`);
      });
      
    } else {
      console.log('❌ No techs found');
    }
    
    // Test 2: Test specific searches
    console.log('\n2. Testing specific searches...');
    
    // Test "simply" search
    console.log('\nTesting query="simply":');
    const simplyResponse = await fetch('/api/tech/search?q=simply');
    const simplyData = await simplyResponse.json();
    console.log(`Results: ${simplyData.techs?.length || 0} techs`);
    
    // Test "apopka" location search
    console.log('\nTesting location="apopka":');
    const apopkaResponse = await fetch('/api/tech/search?location=apopka');
    const apopkaData = await apopkaResponse.json();
    console.log(`Results: ${apopkaData.techs?.length || 0} techs`);
    
    // Test case variations
    console.log('\nTesting case variations:');
    const tests = [
      { q: 'Simply', desc: 'Simply (capital S)' },
      { q: 'SIMPLY', desc: 'SIMPLY (all caps)' },
      { location: 'Apopka', desc: 'Apopka (capital A)' },
      { location: 'APOPKA', desc: 'APOPKA (all caps)' },
    ];
    
    for (const test of tests) {
      const params = new URLSearchParams();
      if (test.q) params.append('q', test.q);
      if (test.location) params.append('location', test.location);
      
      const response = await fetch(`/api/tech/search?${params}`);
      const data = await response.json();
      console.log(`${test.desc}: ${data.techs?.length || 0} results`);
    }
    
  } catch (error) {
    console.error('❌ Error debugging tech search:', error);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.debugTechSearch = debugTechSearch;
  console.log('Run debugTechSearch() in the console to debug tech search');
}

module.exports = { debugTechSearch };
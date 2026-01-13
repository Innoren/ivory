// Quick test script to verify tech search functionality
const testTechSearch = async () => {
  try {
    console.log('Testing tech search API...');
    
    // Test 1: Get all techs (no parameters)
    console.log('\n1. Testing: Get all techs');
    const allTechsResponse = await fetch('http://localhost:3000/api/tech/search');
    const allTechsData = await allTechsResponse.json();
    console.log(`Status: ${allTechsResponse.status}`);
    console.log(`Found ${allTechsData.techs?.length || 0} techs`);
    
    // Test 2: Search by query
    console.log('\n2. Testing: Search by query');
    const queryResponse = await fetch('http://localhost:3000/api/tech/search?q=nail');
    const queryData = await queryResponse.json();
    console.log(`Status: ${queryResponse.status}`);
    console.log(`Found ${queryData.techs?.length || 0} techs with query "nail"`);
    
    // Test 3: Search by location
    console.log('\n3. Testing: Search by location');
    const locationResponse = await fetch('http://localhost:3000/api/tech/search?location=New York');
    const locationData = await locationResponse.json();
    console.log(`Status: ${locationResponse.status}`);
    console.log(`Found ${locationData.techs?.length || 0} techs in "New York"`);
    
    // Test 4: Search by both query and location
    console.log('\n4. Testing: Search by query and location');
    const bothResponse = await fetch('http://localhost:3000/api/tech/search?q=nail&location=New York');
    const bothData = await bothResponse.json();
    console.log(`Status: ${bothResponse.status}`);
    console.log(`Found ${bothData.techs?.length || 0} techs with query "nail" in "New York"`);
    
    // Show sample tech data if available
    if (allTechsData.techs && allTechsData.techs.length > 0) {
      console.log('\nSample tech data:');
      const sampleTech = allTechsData.techs[0];
      console.log({
        id: sampleTech.id,
        businessName: sampleTech.businessName,
        location: sampleTech.location,
        username: sampleTech.user?.username,
        rating: sampleTech.rating,
        servicesCount: sampleTech.services?.length || 0
      });
    }
    
  } catch (error) {
    console.error('Error testing tech search:', error);
  }
};

// Run the test if this is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  const fetch = require('node-fetch');
  testTechSearch();
} else {
  // Browser environment
  console.log('Run testTechSearch() in the browser console');
}

module.exports = { testTechSearch };
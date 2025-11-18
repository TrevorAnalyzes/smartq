// Test API Endpoints Script
async function testAPIEndpoints() {
  console.log('🔍 Testing API Endpoints...\n')

  const baseUrl = 'http://localhost:3000'
  let passedTests = 0
  let failedTests = 0

  async function testEndpoint(name: string, url: string, expectedStatus = 200) {
    try {
      console.log(`Testing: ${name}`)
      const response = await fetch(url)
      const data = await response.json()

      if (response.status === expectedStatus) {
        console.log(`   ✅ Status: ${response.status}`)
        console.log(`   ✅ Response: ${JSON.stringify(data).substring(0, 100)}...`)
        passedTests++
      } else {
        console.log(`   ❌ Expected status ${expectedStatus}, got ${response.status}`)
        console.log(`   ❌ Response: ${JSON.stringify(data)}`)
        failedTests++
      }
      console.log('')
      return data
    } catch (error) {
      console.log(`   ❌ Error: ${error}`)
      console.log('')
      failedTests++
      return null
    }
  }

  // Test 1: Organizations API
  console.log('1️⃣ Organizations API\n')
  await testEndpoint('GET /api/organizations', `${baseUrl}/api/organizations`)

  // Test 2: Conversations API - TechCorp UK
  console.log('2️⃣ Conversations API - TechCorp UK\n')
  const techCorpConvs = await testEndpoint(
    'GET /api/conversations?organizationId=org-techcorp-uk',
    `${baseUrl}/api/conversations?organizationId=org-techcorp-uk`
  )
  if (techCorpConvs?.conversations) {
    console.log(`   📊 Found ${techCorpConvs.conversations.length} conversations`)
    console.log(`   📊 Total: ${techCorpConvs.pagination.total}`)
    console.log('')
  }

  // Test 3: Conversations API - HealthPlus
  console.log('3️⃣ Conversations API - HealthPlus Medical Services\n')
  const healthPlusConvs = await testEndpoint(
    'GET /api/conversations?organizationId=demo-org-id',
    `${baseUrl}/api/conversations?organizationId=demo-org-id`
  )
  if (healthPlusConvs?.conversations) {
    console.log(`   📊 Found ${healthPlusConvs.conversations.length} conversations`)
    console.log(`   📊 Total: ${healthPlusConvs.pagination.total}`)
    console.log('')
  }

  // Test 4: Conversations API - RetailHub
  console.log('4️⃣ Conversations API - RetailHub Commerce\n')
  const retailHubConvs = await testEndpoint(
    'GET /api/conversations?organizationId=org-retailhub',
    `${baseUrl}/api/conversations?organizationId=org-retailhub`
  )
  if (retailHubConvs?.conversations) {
    console.log(`   📊 Found ${retailHubConvs.conversations.length} conversations`)
    console.log(`   📊 Total: ${retailHubConvs.pagination.total}`)
    console.log('')
  }

  // Test 5: Voice Agents API - TechCorp UK
  console.log('5️⃣ Voice Agents API - TechCorp UK\n')
  const techCorpAgents = await testEndpoint(
    'GET /api/agents?organizationId=org-techcorp-uk',
    `${baseUrl}/api/agents?organizationId=org-techcorp-uk`
  )
  if (techCorpAgents?.agents) {
    console.log(`   📊 Found ${techCorpAgents.agents.length} agents`)
    console.log('')
  }

  // Test 6: Voice Agents API - HealthPlus
  console.log('6️⃣ Voice Agents API - HealthPlus Medical Services\n')
  const healthPlusAgents = await testEndpoint(
    'GET /api/agents?organizationId=demo-org-id',
    `${baseUrl}/api/agents?organizationId=demo-org-id`
  )
  if (healthPlusAgents?.agents) {
    console.log(`   📊 Found ${healthPlusAgents.agents.length} agents`)
    console.log('')
  }

  // Test 7: Users API
  console.log('7️⃣ Users API\n')
  await testEndpoint('GET /api/users', `${baseUrl}/api/users`)

  // Test 8: Activities API
  console.log('8️⃣ Activities API\n')
  await testEndpoint('GET /api/activities', `${baseUrl}/api/activities`)

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`📊 Test Summary:`)
  console.log(`   ✅ Passed: ${passedTests}`)
  console.log(`   ❌ Failed: ${failedTests}`)
  console.log(
    `   📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`
  )
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  if (failedTests === 0) {
    console.log('🎉 All API tests passed successfully!\n')
  } else {
    console.log('⚠️  Some API tests failed. Please review the errors above.\n')
    process.exit(1)
  }
}

testAPIEndpoints()

/**
 * SmartQ Full System Diagnostic
 * Comprehensive health check for database, backend, and frontend
 * Usage: npx tsx scripts/full-diagnostic.ts
 */

import 'dotenv/config'

interface DiagnosticResult {
  category: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: any
}

const results: DiagnosticResult[] = []

function logResult(result: DiagnosticResult) {
  results.push(result)
  const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️'
  console.log(`   ${icon} ${result.message}`)
  if (result.details) {
    console.log(`      ${JSON.stringify(result.details)}`)
  }
}

async function runDiagnostics() {
  console.log('\n🔍 SmartQ System Diagnostic Report')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Environment Variables Check
  console.log('1️⃣ ENVIRONMENT VARIABLES\n')
  await checkEnvironmentVariables()
  console.log('')

  // 2. Database Connectivity
  console.log('2️⃣ DATABASE CONNECTIVITY\n')
  await checkDatabase()
  console.log('')

  // 3. Backend API Endpoints
  console.log('3️⃣ BACKEND API ENDPOINTS\n')
  await checkBackendAPIs()
  console.log('')

  // 4. External Services
  console.log('4️⃣ EXTERNAL SERVICES\n')
  await checkExternalServices()
  console.log('')

  // 5. Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  printSummary()
}

async function checkEnvironmentVariables() {
  const requiredVars = {
    Database: ['DATABASE_URL', 'DIRECT_URL'],
    'Next.js': ['NEXT_PUBLIC_APP_URL', 'NODE_ENV'],
    Telnyx: [
      'TELNYX_API_KEY',
      'TELNYX_CONNECTION_ID',
      'TELNYX_FROM_NUMBER',
      'TELNYX_WEBHOOK_BASE_URL',
      'TELNYX_MEDIA_STREAM_URL',
    ],
    OpenAI: ['OPENAI_API_KEY'],
  }

  for (const vars of Object.values(requiredVars)) {
    for (const varName of vars) {
      const value = process.env[varName]
      if (value && value !== 'your_openai_api_key_here') {
        logResult({
          category: 'Environment',
          status: 'pass',
          message: `${varName} is set`,
        })
      } else {
        logResult({
          category: 'Environment',
          status: 'fail',
          message: `${varName} is missing or placeholder`,
        })
      }
    }
  }
}

async function checkDatabase() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Test connection
    try {
      await prisma.$connect()
      logResult({
        category: 'Database',
        status: 'pass',
        message: 'Database connection successful',
      })

      // Check tables
      const organizations = await prisma.organization.count()
      const agents = await prisma.voiceAgent.count()
      const conversations = await prisma.conversation.count()
      const users = await prisma.user.count()

      logResult({
        category: 'Database',
        status: 'pass',
        message: 'Database schema verified',
        details: { organizations, agents, conversations, users },
      })
    } catch (error: any) {
      logResult({
        category: 'Database',
        status: 'fail',
        message: 'Database connection failed',
        details: error.message,
      })
    } finally {
      await prisma.$disconnect()
    }
  } catch (error: any) {
    logResult({
      category: 'Database',
      status: 'fail',
      message: 'Prisma client error',
      details: error.message,
    })
  }
}

async function checkBackendAPIs() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const endpoints = [
    { name: 'Organizations API', url: '/api/organizations' },
    { name: 'Agents API', url: '/api/agents?organizationId=org-techcorp-uk' },
    { name: 'Conversations API', url: '/api/conversations?organizationId=org-techcorp-uk' },
    { name: 'Users API', url: '/api/users' },
    { name: 'Activities API', url: '/api/activities' },
    { name: 'Telnyx Status', url: '/api/telnyx/status' },
  ]

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${baseUrl}${endpoint.url}`)
      const data = await response.json()

      if (response.ok) {
        logResult({
          category: 'API',
          status: 'pass',
          message: `${endpoint.name} - Status ${response.status}`,
        })
      } else {
        logResult({
          category: 'API',
          status: 'warning',
          message: `${endpoint.name} - Status ${response.status}`,
          details: data.error || data,
        })
      }
    } catch (error: any) {
      logResult({
        category: 'API',
        status: 'fail',
        message: `${endpoint.name} - Connection failed`,
        details: error.message,
      })
    }
  }
}

async function checkExternalServices() {
  // Check Telnyx
  if (process.env.TELNYX_API_KEY) {
    logResult({
      category: 'External Services',
      status: 'warning',
      message: 'Telnyx - API key set (not validated)',
    })
  } else {
    logResult({
      category: 'External Services',
      status: 'warning',
      message: 'Telnyx - API key not configured',
    })
  }

  // Check OpenAI (basic validation)
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    logResult({
      category: 'External Services',
      status: 'warning',
      message: 'OpenAI - API key set (not validated)',
    })
  } else {
    logResult({
      category: 'External Services',
      status: 'fail',
      message: 'OpenAI - API key missing or placeholder',
    })
  }
}

function printSummary() {
  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const warnings = results.filter(r => r.status === 'warning').length
  const total = results.length

  console.log('\n📊 DIAGNOSTIC SUMMARY\n')
  console.log(`   ✅ Passed:   ${passed}/${total}`)
  console.log(`   ❌ Failed:   ${failed}/${total}`)
  console.log(`   ⚠️  Warnings: ${warnings}/${total}`)
  console.log(`   📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%\n`)

  if (failed > 0) {
    console.log('🔴 CRITICAL ISSUES:\n')
    results
      .filter(r => r.status === 'fail')
      .forEach(r => {
        console.log(`   • ${r.message}`)
      })
    console.log('')
  }

  if (warnings > 0) {
    console.log('⚠️  WARNINGS:\n')
    results
      .filter(r => r.status === 'warning')
      .forEach(r => {
        console.log(`   • ${r.message}`)
      })
    console.log('')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

runDiagnostics().catch(console.error)

/* eslint-disable @typescript-eslint/no-require-imports */

'use strict'

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// Initializes the public schema from Prisma datamodel SQL.
// Generated via: npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script

const schemaSql = `
-- CreateEnum
CREATE TYPE "AgentStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'ERROR');

-- CreateEnum
CREATE TYPE "AccentType" AS ENUM ('BRITISH_RP', 'BRITISH_COCKNEY', 'BRITISH_SCOTTISH', 'BRITISH_WELSH', 'BRITISH_NORTHERN');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('CONNECTED', 'RINGING', 'ENDED', 'FAILED');

-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'AGENT', 'VIEWER');

-- CreateEnum
CREATE TYPE "OrganizationPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "CRMProvider" AS ENUM ('HUBSPOT', 'SALESFORCE', 'PIPEDRIVE');

-- CreateEnum
CREATE TYPE "CRMStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "plan" "OrganizationPlan" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "monthlyCallLimit" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "defaultAccent" "AccentType" NOT NULL DEFAULT 'BRITISH_RP',
    "crmProvider" "CRMProvider",
    "crmApiKey" TEXT,
    "emailAlerts" BOOLEAN NOT NULL DEFAULT true,
    "smsAlerts" BOOLEAN NOT NULL DEFAULT false,
    "webhookUrl" TEXT,
    "brandingPrimaryColor" TEXT NOT NULL DEFAULT '#0066CC',
    "brandingLogo" TEXT,
    "brandingCompanyName" TEXT,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "organizationId" TEXT NOT NULL,
    "permissions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceAgent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "AgentStatus" NOT NULL DEFAULT 'INACTIVE',
    "accentType" "AccentType" NOT NULL DEFAULT 'BRITISH_RP',
    "phoneNumber" TEXT,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "customerName" TEXT,
    "status" "ConversationStatus" NOT NULL DEFAULT 'RINGING',
    "duration" INTEGER,
    "transcript" TEXT,
    "sentiment" "Sentiment",
    "outcome" TEXT,
    "topic" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CRMIntegration" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "provider" "CRMProvider" NOT NULL,
    "status" "CRMStatus" NOT NULL DEFAULT 'DISCONNECTED',
    "apiKey" TEXT,
    "webhookUrl" TEXT,
    "lastSync" TIMESTAMP(3),
    "contactsCount" INTEGER NOT NULL DEFAULT 0,
    "dealsCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CRMIntegration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "units" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "agentName" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "duration" TEXT,
    "outcome" TEXT,
    "status" TEXT,
    "sentiment" "Sentiment",
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_domain_key" ON "Organization"("domain");

-- CreateIndex
CREATE INDEX "Organization_domain_idx" ON "Organization"("domain");

-- CreateIndex
CREATE INDEX "Organization_plan_idx" ON "Organization"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "VoiceAgent_organizationId_idx" ON "VoiceAgent"("organizationId");

-- CreateIndex
CREATE INDEX "VoiceAgent_status_idx" ON "VoiceAgent"("status");

-- CreateIndex
CREATE INDEX "VoiceAgent_accentType_idx" ON "VoiceAgent"("accentType");

-- CreateIndex
CREATE INDEX "Conversation_agentId_idx" ON "Conversation"("agentId");

-- CreateIndex
CREATE INDEX "Conversation_organizationId_idx" ON "Conversation"("organizationId");

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "Conversation_sentiment_idx" ON "Conversation"("sentiment");

-- CreateIndex
CREATE INDEX "Conversation_startedAt_idx" ON "Conversation"("startedAt");

-- CreateIndex
CREATE INDEX "Conversation_customerPhone_idx" ON "Conversation"("customerPhone");

-- CreateIndex
CREATE UNIQUE INDEX "CRMIntegration_organizationId_key" ON "CRMIntegration"("organizationId");

-- CreateIndex
CREATE INDEX "CRMIntegration_organizationId_idx" ON "CRMIntegration"("organizationId");

-- CreateIndex
CREATE INDEX "CRMIntegration_provider_idx" ON "CRMIntegration"("provider");

-- CreateIndex
CREATE INDEX "CRMIntegration_status_idx" ON "CRMIntegration"("status");

-- CreateIndex
CREATE INDEX "UsageEvent_organizationId_idx" ON "UsageEvent"("organizationId");

-- CreateIndex
CREATE INDEX "UsageEvent_type_idx" ON "UsageEvent"("type");

-- CreateIndex
CREATE INDEX "UsageEvent_createdAt_idx" ON "UsageEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Activity_organizationId_idx" ON "Activity"("organizationId");

-- CreateIndex
CREATE INDEX "Activity_type_idx" ON "Activity"("type");

-- CreateIndex
CREATE INDEX "Activity_timestamp_idx" ON "Activity"("timestamp");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceAgent" ADD CONSTRAINT "VoiceAgent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "VoiceAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CRMIntegration" ADD CONSTRAINT "CRMIntegration_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageEvent" ADD CONSTRAINT "UsageEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`

async function main() {
  console.log('Applying Prisma schema SQL to database...')

  const statements = []
  let currentLines = []

  for (const line of schemaSql.split('\n')) {
    const trimmedLine = line.trim()

    // Skip completely empty lines when we haven't started a statement yet
    if (!trimmedLine && currentLines.length === 0) {
      continue
    }

    currentLines.push(line)

    // A statement is complete when a line ends with a semicolon
    if (trimmedLine.endsWith(';')) {
      const stmt = currentLines.join('\n').trim()
      if (stmt) {
        statements.push(stmt)
      }
      currentLines = []
    }
  }

  for (const stmt of statements) {
    const preview = stmt.split('\n')[0]
    console.log('Executing:', preview)
    try {
      await prisma.$executeRawUnsafe(stmt)
    } catch (error) {
      console.error('Error executing statement:', preview)
      console.error(error)
      throw error
    }
  }

  console.log('Schema initialization complete.')
}

main()
  .catch(error => {
    console.error('Failed to initialize schema:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

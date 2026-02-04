// Helper to get current user's organizationId from Supabase session
// This ensures all API calls are scoped to the correct organization

import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'

export async function getCurrentOrganizationId(): Promise<string | null> {
  try {
    const supabase = await createClient()

    // Get current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // First check if organizationId is in user metadata
    if (user.user_metadata?.organizationId) {
      return user.user_metadata.organizationId
    }

    // Otherwise, fetch from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { organizationId: true },
    })

    return dbUser?.organizationId || null
  } catch (error) {
    console.error('Error getting organization ID:', error)
    return null
  }
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) {
      return null
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: authUser.email! },
      include: {
        organization: true,
      },
    })

    return dbUser
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

export async function requireOrganization(): Promise<string> {
  const organizationId = await getCurrentOrganizationId()

  if (!organizationId) {
    throw new Error('Unauthorized: No organization found')
  }

  return organizationId
}


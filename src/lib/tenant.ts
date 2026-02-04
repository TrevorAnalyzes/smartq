import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

/**
 * Derives the current organizationId from the authenticated user.
 * Uses Supabase auth to get the current user, then fetches their organization.
 *
 * @throws Error if organizationId is not found or user is not authenticated
 */
export async function getOrganizationIdFromRequest(_req: NextRequest): Promise<string> {
  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            } catch {
              // Ignore errors in Server Components
            }
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized: User not authenticated')
    }

    // Check if organizationId is in user metadata
    if (user.user_metadata?.organizationId) {
      return user.user_metadata.organizationId
    }

    // Otherwise, fetch from database
    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
      select: { organizationId: true },
    })

    if (!dbUser?.organizationId) {
      throw new Error('Organization not found for user')
    }

    return dbUser.organizationId
  } catch (error) {
    console.error('Error getting organization ID:', error)
    throw error
  }
}

/**
 * Safely gets organizationId from request, returns null if not found.
 * Use this when organizationId is optional.
 */
export async function getOrganizationIdFromRequestSafe(req: NextRequest): Promise<string | null> {
  try {
    return await getOrganizationIdFromRequest(req)
  } catch {
    return null
  }
}

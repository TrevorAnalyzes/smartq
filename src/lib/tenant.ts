import { NextRequest } from 'next/server'

/**
 * Derives the current organizationId from the request.
 *
 * For now, we expect it in the query string as `?organizationId=...`.
 * In the future, you can change this to use auth or subdomains without
 * touching every API route.
 *
 * @throws Error if organizationId is not found
 */
export function getOrganizationIdFromRequest(req: NextRequest): string {
  const orgId = req.nextUrl.searchParams.get('organizationId') || process.env.DEFAULT_ORG_ID

  if (!orgId) {
    throw new Error('Organization ID is required')
  }

  return orgId
}

/**
 * Safely gets organizationId from request, returns null if not found.
 * Use this when organizationId is optional.
 */
export function getOrganizationIdFromRequestSafe(req: NextRequest): string | null {
  const orgId = req.nextUrl.searchParams.get('organizationId') || process.env.DEFAULT_ORG_ID
  return orgId || null
}


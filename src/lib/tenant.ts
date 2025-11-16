import { NextRequest } from 'next/server'

/**
 * Derives the current organizationId from the request.
 *
 * For now, we expect it in the query string as `?organizationId=...`.
 * In the future, you can change this to use auth or subdomains without
 * touching every API route.
 */
export function getOrganizationIdFromRequest(req: NextRequest): string {
  const orgId = req.nextUrl.searchParams.get('organizationId') || process.env.DEFAULT_ORG_ID

  if (!orgId) {
    throw new Error('organizationId is required')
  }

  return orgId
}


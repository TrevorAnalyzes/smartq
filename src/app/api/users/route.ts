import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { userSchema } from '@/lib/validations'
import { UserWhereInput, toErrorWithMessage } from '@/lib/types'
import { UserRole } from '@prisma/client'

// GET /api/users - Get all users (filtered by organization)
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    // Build where clause
    const where: UserWhereInput = { organizationId }
    if (role) where.role = role.toUpperCase() as UserRole

    // Fetch users
    const users = await prisma.user.findMany({
      where,
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    // Get total count for pagination
    const totalCount = await prisma.user.count({ where })

    // Transform data to match frontend format
    const transformedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      organizationId: user.organizationId,
      permissions: user.permissions,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      updatedAt: user.updatedAt,
      organization: user.organization,
    }))

    return NextResponse.json({
      users: transformedUsers,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/users - Create new user (invite)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = userSchema.parse(body)

    // Ensure organizationId is provided
    if (!body.organizationId) {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    // Check if organization exists
    const organization = await prisma.organization.findUnique({
      where: { id: body.organizationId },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check if user with email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email already exists' }, { status: 400 })
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        role: validatedData.role.toUpperCase() as UserRole,
        organizationId: body.organizationId,
        permissions: body.permissions || [],
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            domain: true,
          },
        },
      },
    })

    // Transform data to match frontend format
    const transformedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.toLowerCase(),
      organizationId: user.organizationId,
      permissions: user.permissions,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      updatedAt: user.updatedAt,
      organization: user.organization,
    }

    return NextResponse.json(transformedUser, { status: 201 })
  } catch (error: unknown) {
    console.error('Error creating user:', error)

    const errorWithMessage = toErrorWithMessage(error)

    if (errorWithMessage.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid request data', details: error }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}


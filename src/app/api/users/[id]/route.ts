import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getOrganizationIdFromRequest } from '@/lib/tenant'
import { UserUpdateInput } from '@/lib/types'

// GET /api/users/[id] - Get single user
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    let organizationId: string
    try {
      organizationId = getOrganizationIdFromRequest(request)
    } catch {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id },
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

    if (!user || user.organizationId !== organizationId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

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

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PATCH /api/users/[id] - Update user
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    let organizationId: string
    try {
      organizationId = getOrganizationIdFromRequest(request)
    } catch {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser || existingUser.organizationId !== organizationId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Build update data
    const updateData: UserUpdateInput = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.email !== undefined) updateData.email = body.email
    if (body.role !== undefined) updateData.role = body.role.toUpperCase()
    if (body.permissions !== undefined) updateData.permissions = body.permissions
    if (body.lastLoginAt !== undefined) updateData.lastLoginAt = new Date(body.lastLoginAt)

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(transformedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    let organizationId: string
    try {
      organizationId = getOrganizationIdFromRequest(request)
    } catch {
      return NextResponse.json({ error: 'organizationId is required' }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser || existingUser.organizationId !== organizationId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}

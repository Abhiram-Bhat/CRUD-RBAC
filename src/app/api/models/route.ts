import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const models = await db.modelDefinition.findMany({
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(models)
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, tableName, fields, ownerField, rbac } = body

    if (!name || !fields || !Array.isArray(fields) || fields.length === 0) {
      return NextResponse.json(
        { error: 'Invalid model definition' },
        { status: 400 }
      )
    }

    const modelDefinition = await db.modelDefinition.create({
      data: {
        name,
        tableName,
        definition: JSON.stringify({ fields, ownerField, rbac }),
        // createdBy is optional, so don't set it for now
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(modelDefinition, { status: 201 })
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json(
      { error: 'Failed to create model' },
      { status: 500 }
    )
  }
}
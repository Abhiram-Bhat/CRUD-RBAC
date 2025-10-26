import { NextRequest, NextResponse } from 'next/server'
import { modelPersistence } from '@/lib/model-persistence'

// Dynamic CRUD handler for any model
export async function GET(
  request: NextRequest,
  { params }: { params: { modelName: string } }
) {
  try {
    const { modelName } = params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    // Load model definition
    const modelDef = await modelPersistence.loadModel(modelName)
    if (!modelDef) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Check RBAC permissions (simplified for demo)
    const userRole = 'Admin' // In real app, get from auth context
    const permissions = modelDef.rbac[userRole] || []
    
    if (!permissions.includes('read')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // For now, return mock data since we don't have dynamic Prisma models
    if (id) {
      // Get single record
      return NextResponse.json({
        id,
        ...getMockData(modelDef),
      })
    } else {
      // Get all records
      const mockRecords = Array.from({ length: 5 }, (_, i) => ({
        id: `mock-${i + 1}`,
        ...getMockData(modelDef),
      }))
      
      return NextResponse.json(mockRecords)
    }
  } catch (error) {
    console.error('Error in CRUD GET:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { modelName: string } }
) {
  try {
    const { modelName } = params
    const body = await request.json()

    // Load model definition
    const modelDef = await modelPersistence.loadModel(modelName)
    if (!modelDef) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Check RBAC permissions
    const userRole = 'Admin' // In real app, get from auth context
    const permissions = modelDef.rbac[userRole] || []
    
    if (!permissions.includes('create')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Validate required fields
    for (const field of modelDef.fields) {
      if (field.required && !body[field.name]) {
        return NextResponse.json(
          { error: `Field '${field.name}' is required` },
          { status: 400 }
        )
      }
    }

    // Create new record (mock implementation)
    const newRecord = {
      id: `mock-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    console.error('Error in CRUD POST:', error)
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { modelName: string } }
) {
  try {
    const { modelName } = params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    // Load model definition
    const modelDef = await modelPersistence.loadModel(modelName)
    if (!modelDef) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Check RBAC permissions
    const userRole = 'Admin' // In real app, get from auth context
    const permissions = modelDef.rbac[userRole] || []
    
    if (!permissions.includes('update')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check ownership if ownerField is specified
    if (modelDef.ownerField) {
      const currentUserId = 'user-1' // In real app, get from auth context
      // In real implementation, fetch the record and check ownership
      if (body[modelDef.ownerField] !== currentUserId && userRole !== 'Admin') {
        return NextResponse.json(
          { error: 'You can only update your own records' },
          { status: 403 }
        )
      }
    }

    // Update record (mock implementation)
    const updatedRecord = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json(updatedRecord)
  } catch (error) {
    console.error('Error in CRUD PUT:', error)
    return NextResponse.json(
      { error: 'Failed to update record' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { modelName: string } }
) {
  try {
    const { modelName } = params
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      )
    }

    // Load model definition
    const modelDef = await modelPersistence.loadModel(modelName)
    if (!modelDef) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    // Check RBAC permissions
    const userRole = 'Admin' // In real app, get from auth context
    const permissions = modelDef.rbac[userRole] || []
    
    if (!permissions.includes('delete')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Check ownership if ownerField is specified
    if (modelDef.ownerField) {
      const currentUserId = 'user-1' // In real app, get from auth context
      // In real implementation, fetch the record and check ownership
      if (userRole !== 'Admin') {
        return NextResponse.json(
          { error: 'You can only delete your own records' },
          { status: 403 }
        )
      }
    }

    // Delete record (mock implementation)
    return NextResponse.json({ message: 'Record deleted successfully' })
  } catch (error) {
    console.error('Error in CRUD DELETE:', error)
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    )
  }
}

// Helper function to generate mock data based on model definition
function getMockData(modelDef: any) {
  const data: any = {}
  
  for (const field of modelDef.fields) {
    switch (field.type) {
      case 'string':
        data[field.name] = field.default || `Sample ${field.name}`
        break
      case 'number':
        data[field.name] = field.default ? parseFloat(field.default) : Math.floor(Math.random() * 100)
        break
      case 'boolean':
        data[field.name] = field.default ? field.default === 'true' : Math.random() > 0.5
        break
      case 'date':
        data[field.name] = field.default || new Date().toISOString()
        break
      case 'text':
        data[field.name] = field.default || `Sample text for ${field.name}`
        break
    }
  }
  
  return data
}
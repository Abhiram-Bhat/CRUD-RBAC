import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { modelPersistence } from '@/lib/model-persistence'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const model = await db.modelDefinition.findUnique({
      where: { id: params.id },
    })

    if (!model) {
      return NextResponse.json(
        { error: 'Model not found' },
        { status: 404 }
      )
    }

    const definition = JSON.parse(model.definition)
    
    // Save model definition to file
    await modelPersistence.saveModel({
      name: model.name,
      tableName: model.tableName,
      ...definition,
    })

    // Mark model as published in database
    const updatedModel = await db.modelDefinition.update({
      where: { id: params.id },
      data: {
        isPublished: true,
      },
    })

    return NextResponse.json({
      message: 'Model published successfully',
      model: updatedModel,
    })
  } catch (error) {
    console.error('Error publishing model:', error)
    return NextResponse.json(
      { error: 'Failed to publish model' },
      { status: 500 }
    )
  }
}
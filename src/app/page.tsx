'use client'

import { useState } from 'react'
import { ModelDefinitionForm } from '@/components/model-definition-form'
import { ModelList } from '@/components/model-list'
import { ModelDataAdmin } from '@/components/model-data-admin'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Settings, BarChart3 } from 'lucide-react'

interface ModelDefinition {
  id: string
  name: string
  tableName?: string
  definition: string
  isPublished: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

type ViewMode = 'list' | 'create' | 'edit' | 'manage' | null

export default function Home() {
  const [viewMode, setViewMode] = useState<ViewMode>(null)
  const [selectedModel, setSelectedModel] = useState<ModelDefinition | null>(null)
  const [editingModel, setEditingModel] = useState<ModelDefinition | null>(null)

  const handleCreateModel = () => {
    setViewMode('create')
    setSelectedModel(null)
    setEditingModel(null)
  }

  const handleEditModel = (model: ModelDefinition) => {
    setViewMode('edit')
    setSelectedModel(model)
    setEditingModel(model)
    
    // Parse the definition to populate the form
    const definition = JSON.parse(model.definition)
    const formData = {
      name: model.name,
      tableName: model.tableName,
      fields: definition.fields,
      ownerField: definition.ownerField,
      rbac: definition.rbac,
    }
  }

  const handleViewModel = (model: ModelDefinition) => {
    setSelectedModel(model)
  }

  const handleDeleteModel = (modelId: string) => {
    // This will be handled by the ModelList component
  }

  const handlePublishModel = (modelId: string) => {
    // This will be handled by the ModelList component
  }

  const handleManageData = (model: ModelDefinition) => {
    setViewMode('manage')
    setSelectedModel(model)
  }

  const handleBackToList = () => {
    setViewMode(null)
    setSelectedModel(null)
    setEditingModel(null)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      let response
      if (editingModel) {
        // Update existing model
        response = await fetch(`/api/models/${editingModel.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
      } else {
        // Create new model
        response = await fetch('/api/models', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        })
      }

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to save model: ${errorText}`)
      }

      const result = await response.json()
      console.log('Model saved successfully:', result)
      handleBackToList()
    } catch (error) {
      console.error('Error saving model:', error)
      alert(`Failed to save model: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const renderContent = () => {
    switch (viewMode) {
      case 'create':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToList}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Models
              </button>
              <h2 className="text-2xl font-bold">Create New Model</h2>
            </div>
            <ModelDefinitionForm onSubmit={handleFormSubmit} />
          </div>
        )

      case 'edit':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToList}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                ← Back to Models
              </button>
              <h2 className="text-2xl font-bold">Edit Model: {editingModel?.name}</h2>
            </div>
            {editingModel && (
              <ModelDefinitionForm
                onSubmit={handleFormSubmit}
                initialData={{
                  name: editingModel.name,
                  tableName: editingModel.tableName,
                  ...JSON.parse(editingModel.definition),
                }}
              />
            )}
          </div>
        )

      case 'manage':
        return selectedModel ? (
          <ModelDataAdmin model={selectedModel} onBack={handleBackToList} />
        ) : null

      default:
        return (
          <ModelList
            onCreateModel={handleCreateModel}
            onEditModel={handleEditModel}
            onViewModel={handleViewModel}
            onDeleteModel={handleDeleteModel}
            onPublishModel={handlePublishModel}
            onManageData={handleManageData}
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">CRUD + RBAC Platform</h1>
          </div>
          <p className="text-xl text-muted-foreground">
            Define data models, generate CRUD APIs, and manage role-based access control
          </p>
        </div>

        {viewMode === null && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Models Defined</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Data models created
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">APIs Generated</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  CRUD endpoints active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Records Managed</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  Total records across models
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="bg-card rounded-lg border">
          <div className="p-6">
            {renderContent()}
          </div>
        </div>

        {viewMode === null && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>How It Works</CardTitle>
                <CardDescription>
                  Learn how to use the CRUD + RBAC platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">1</span>
                    </div>
                    <h3 className="font-semibold mb-2">Define Model</h3>
                    <p className="text-sm text-muted-foreground">
                      Create your data model with fields and configure RBAC permissions
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">2</span>
                    </div>
                    <h3 className="font-semibold mb-2">Publish Model</h3>
                    <p className="text-sm text-muted-foreground">
                      Publish your model to generate CRUD APIs and write to file system
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">3</span>
                    </div>
                    <h3 className="font-semibold mb-2">Manage Data</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the admin interface to create, read, update, and delete records
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold">4</span>
                    </div>
                    <h3 className="font-semibold mb-2">Enforce RBAC</h3>
                    <p className="text-sm text-muted-foreground">
                      Role-based access control is automatically enforced on all operations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
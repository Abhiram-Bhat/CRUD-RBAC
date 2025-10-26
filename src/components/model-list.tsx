'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Eye, Edit, Trash2, Database, Users, Settings } from 'lucide-react'

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

interface ModelListProps {
  onCreateModel: () => void
  onEditModel: (model: ModelDefinition) => void
  onViewModel: (model: ModelDefinition) => void
  onDeleteModel: (modelId: string) => void
  onPublishModel: (modelId: string) => void
  onManageData: (model: ModelDefinition) => void
}

export function ModelList({
  onCreateModel,
  onEditModel,
  onViewModel,
  onDeleteModel,
  onPublishModel,
  onManageData,
}: ModelListProps) {
  const [models, setModels] = useState<ModelDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchModels()
  }, [])

  const fetchModels = async () => {
    try {
      const response = await fetch('/api/models')
      if (!response.ok) {
        throw new Error('Failed to fetch models')
      }
      const data = await response.json()
      setModels(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (modelId: string) => {
    if (!confirm('Are you sure you want to delete this model?')) {
      return
    }

    try {
      const response = await fetch(`/api/models/${modelId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to delete model')
      }
      await fetchModels()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handlePublish = async (modelId: string) => {
    try {
      const response = await fetch(`/api/models/${modelId}/publish`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error('Failed to publish model')
      }
      await fetchModels()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const parseDefinition = (definition: string) => {
    try {
      return JSON.parse(definition)
    } catch {
      return null
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading models...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Model Definitions</h2>
          <p className="text-muted-foreground">Manage your data models and their CRUD APIs</p>
        </div>
        <Button onClick={onCreateModel}>
          <Plus className="w-4 h-4 mr-2" />
          Create Model
        </Button>
      </div>

      {models.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64 space-y-4">
            <Database className="w-12 h-12 text-muted-foreground" />
            <div className="text-center">
              <h3 className="text-lg font-semibold">No models defined yet</h3>
              <p className="text-muted-foreground">Create your first data model to get started</p>
            </div>
            <Button onClick={onCreateModel}>
              <Plus className="w-4 h-4 mr-2" />
              Create Model
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Defined Models</CardTitle>
            <CardDescription>
              List of all data models with their status and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Table Name</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => {
                  const definition = parseDefinition(model.definition)
                  const fieldCount = definition?.fields?.length || 0
                  
                  return (
                    <TableRow key={model.id}>
                      <TableCell className="font-medium">{model.name}</TableCell>
                      <TableCell>{model.tableName || model.name.toLowerCase() + 's'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{fieldCount} fields</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={model.isPublished ? "default" : "secondary"}>
                          {model.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(model.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onViewModel(model)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>Model Definition: {model.name}</DialogTitle>
                                <DialogDescription>
                                  Complete model definition and configuration
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <h4 className="font-semibold mb-2">Basic Info</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <span className="font-medium">Name:</span> {model.name}
                                    </div>
                                    <div>
                                      <span className="font-medium">Table:</span> {model.tableName || model.name.toLowerCase() + 's'}
                                    </div>
                                    <div>
                                      <span className="font-medium">Status:</span> {model.isPublished ? "Published" : "Draft"}
                                    </div>
                                    <div>
                                      <span className="font-medium">Created:</span> {new Date(model.createdAt).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                                
                                {definition && (
                                  <>
                                    <div>
                                      <h4 className="font-semibold mb-2">Fields</h4>
                                      <div className="space-y-2">
                                        {definition.fields?.map((field: any, index: number) => (
                                          <div key={index} className="flex items-center gap-2 text-sm">
                                            <Badge variant="outline">{field.type}</Badge>
                                            <span className="font-medium">{field.name}</span>
                                            {field.required && <Badge variant="destructive">required</Badge>}
                                            {field.unique && <Badge variant="secondary">unique</Badge>}
                                            {field.default && <span className="text-muted-foreground">default: {field.default}</span>}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    {definition.rbac && (
                                      <div>
                                        <h4 className="font-semibold mb-2">RBAC Configuration</h4>
                                        <div className="grid grid-cols-3 gap-4">
                                          {Object.entries(definition.rbac).map(([role, perms]: [string, any]) => (
                                            <div key={role}>
                                              <h5 className="font-medium">{role}</h5>
                                              <div className="flex flex-wrap gap-1 mt-1">
                                                {perms.map((perm: string) => (
                                                  <Badge key={perm} variant="secondary" className="text-xs">
                                                    {perm}
                                                  </Badge>
                                                ))}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditModel(model)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onManageData(model)}
                          >
                            <Users className="w-4 h-4" />
                          </Button>

                          {!model.isPublished && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handlePublish(model.id)}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(model.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
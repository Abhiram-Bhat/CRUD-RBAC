'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Edit, Trash2, Save, ArrowLeft } from 'lucide-react'

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

interface ModelDataAdminProps {
  model: ModelDefinition
  onBack: () => void
}

interface RecordData {
  id: string
  [key: string]: any
}

export function ModelDataAdmin({ model, onBack }: ModelDataAdminProps) {
  const [records, setRecords] = useState<RecordData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingRecord, setEditingRecord] = useState<RecordData | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const modelDef = JSON.parse(model.definition)
  const modelName = model.name.toLowerCase()

  useEffect(() => {
    fetchRecords()
  }, [modelName])

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/crud/${modelName}`)
      if (!response.ok) {
        throw new Error('Failed to fetch records')
      }
      const data = await response.json()
      setRecords(Array.isArray(data) ? data : [data])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const createRecordSchema = z.object(
    modelDef.fields.reduce((acc: any, field: any) => {
      if (field.required) {
        acc[field.name] = z.string().min(1, `${field.name} is required`)
      } else {
        acc[field.name] = z.string().optional()
      }
      return acc
    }, {})
  )

  const createForm = useForm({
    resolver: zodResolver(createRecordSchema),
    defaultValues: modelDef.fields.reduce((acc: any, field: any) => {
      acc[field.name] = field.default || ''
      return acc
    }, {}),
  })

  const editForm = useForm({
    resolver: zodResolver(createRecordSchema),
    defaultValues: {},
  })

  const handleCreateRecord = async (data: any) => {
    try {
      const response = await fetch(`/api/crud/${modelName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to create record')
      }

      await fetchRecords()
      setIsCreateDialogOpen(false)
      createForm.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleUpdateRecord = async (data: any) => {
    if (!editingRecord) return

    try {
      const response = await fetch(`/api/crud/${modelName}?id=${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to update record')
      }

      await fetchRecords()
      setIsEditDialogOpen(false)
      setEditingRecord(null)
      editForm.reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this record?')) {
      return
    }

    try {
      const response = await fetch(`/api/crud/${modelName}?id=${recordId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete record')
      }

      await fetchRecords()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const openEditDialog = (record: RecordData) => {
    setEditingRecord(record)
    
    // Set form values
    const formValues: any = {}
    modelDef.fields.forEach((field: any) => {
      formValues[field.name] = record[field.name] || ''
    })
    editForm.reset(formValues)
    
    setIsEditDialogOpen(true)
  }

  const renderFormField = (field: any, form: any, control: any) => {
    const commonProps = {
      control,
      name: field.name,
      render: ({ field: formField }: any) => (
        <FormItem>
          <FormLabel className="capitalize">
            {field.name}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {field.type === 'boolean' ? (
              <Switch
                checked={formField.value === 'true' || formField.value === true}
                onCheckedChange={formField.onChange}
              />
            ) : field.type === 'text' ? (
              <Textarea
                placeholder={`Enter ${field.name}`}
                {...formField}
                value={formField.value || ''}
              />
            ) : field.type === 'date' ? (
              <Input
                type="datetime-local"
                placeholder={`Enter ${field.name}`}
                {...formField}
                value={formField.value || ''}
              />
            ) : (
              <Input
                type={field.type === 'number' ? 'number' : 'text'}
                placeholder={`Enter ${field.name}`}
                {...formField}
                value={formField.value || ''}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      ),
    }

    return <FormField key={field.name} {...commonProps} />
  }

  const formatFieldValue = (value: any, type: string) => {
    if (value === null || value === undefined || value === '') {
      return '-'
    }

    switch (type) {
      case 'boolean':
        return value ? 'Yes' : 'No'
      case 'date':
        return new Date(value).toLocaleDateString()
      case 'number':
        return Number(value).toLocaleString()
      default:
        return String(value)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading records...</p>
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Models
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{model.name} Data</h2>
            <p className="text-muted-foreground">
              Manage records for {model.name} model
            </p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Record
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New {model.name} Record</DialogTitle>
              <DialogDescription>
                Fill in the form to create a new record
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(handleCreateRecord)} className="space-y-4">
                {modelDef.fields.map((field: any) => renderFormField(field, createForm, createForm.control))}
                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Create Record
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>
            {records.length} records found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No records found. Create your first record to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    {modelDef.fields.map((field: any) => (
                      <TableHead key={field.name} className="capitalize">
                        {field.name}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </TableHead>
                    ))}
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono text-sm">
                        {record.id}
                      </TableCell>
                      {modelDef.fields.map((field: any) => (
                        <TableCell key={field.name}>
                          {formatFieldValue(record[field.name], field.type)}
                        </TableCell>
                      ))}
                      <TableCell>
                        {new Date(record.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(record)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Edit {model.name} Record</DialogTitle>
                                <DialogDescription>
                                  Update the record information
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(handleUpdateRecord)} className="space-y-4">
                                  {modelDef.fields.map((field: any) => renderFormField(field, editForm, editForm.control))}
                                  <div className="flex justify-end">
                                    <Button type="submit">
                                      <Save className="w-4 h-4 mr-2" />
                                      Update Record
                                    </Button>
                                  </div>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
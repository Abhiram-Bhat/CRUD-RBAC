'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Plus, Trash2, Save } from 'lucide-react'

const fieldTypes = ['string', 'number', 'boolean', 'date', 'text'] as const
const roles = ['Admin', 'Manager', 'Viewer'] as const
const permissions = ['create', 'read', 'update', 'delete'] as const

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(fieldTypes),
  required: z.boolean().default(false),
  default: z.string().optional(),
  unique: z.boolean().default(false),
  relation: z.string().optional(),
})

const rbacSchema = z.record(z.enum(roles), z.array(z.enum(permissions)))

const modelSchema = z.object({
  name: z.string().min(1, 'Model name is required'),
  tableName: z.string().optional(),
  fields: z.array(fieldSchema).min(1, 'At least one field is required'),
  ownerField: z.string().optional(),
  rbac: rbacSchema,
})

type ModelFormData = z.infer<typeof modelSchema>
type FieldFormData = z.infer<typeof fieldSchema>

interface ModelDefinitionFormProps {
  onSubmit: (data: ModelFormData) => void
  initialData?: Partial<ModelFormData>
}

export function ModelDefinitionForm({ onSubmit, initialData }: ModelDefinitionFormProps) {
  const [fields, setFields] = useState<FieldFormData[]>(
    initialData?.fields || [{ name: '', type: 'string', required: false, unique: false }]
  )
  const [rbac, setRbac] = useState<Record<string, string[]>>(
    initialData?.rbac || {
      Admin: ['create', 'read', 'update', 'delete'],
      Manager: ['create', 'read', 'update'],
      Viewer: ['read'],
    }
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: initialData?.name || '',
      tableName: initialData?.tableName || '',
      fields: fields,
      ownerField: initialData?.ownerField || '',
      rbac: rbac,
    },
  })

  // Update form when fields or rbac change
  useEffect(() => {
    form.setValue('fields', fields)
    form.setValue('rbac', rbac)
  }, [fields, rbac, form])

  const addField = () => {
    const newField: FieldFormData = { name: '', type: 'string', required: false, unique: false }
    setFields([...fields, newField])
  }

  const removeField = (index: number) => {
    if (fields.length > 1) {
      setFields(fields.filter((_, i) => i !== index))
    }
  }

  const updateField = (index: number, field: Partial<FieldFormData>) => {
    const updatedFields = [...fields]
    updatedFields[index] = { ...updatedFields[index], ...field }
    setFields(updatedFields)
  }

  const togglePermission = (role: string, permission: string) => {
    setRbac(prev => {
      const currentPermissions = prev[role] || []
      const updatedPermissions = currentPermissions.includes(permission)
        ? currentPermissions.filter(p => p !== permission)
        : [...currentPermissions, permission]
      
      return {
        ...prev,
        [role]: updatedPermissions,
      }
    })
  }

  const handleSubmit = async (data: ModelFormData) => {
    setIsSubmitting(true)
    try {
      const formData = {
        ...data,
        fields,
        rbac,
      }
      await onSubmit(formData)
    } catch (error) {
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Model Definition</CardTitle>
        <CardDescription>
          Define your data model with fields and role-based access control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="fields">Fields</TabsTrigger>
                <TabsTrigger value="rbac">RBAC</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Product, Employee, Student" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of your model (will be capitalized)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tableName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Table Name (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., products, employees, students" {...field} />
                      </FormControl>
                      <FormDescription>
                        Database table name (defaults to lowercase plural of model name)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownerField"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Field (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., ownerId, userId" {...field} />
                      </FormControl>
                      <FormDescription>
                        Field name for ownership rules in RBAC
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="fields" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Model Fields</h3>
                  <Button type="button" onClick={addField} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Field
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={index} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Field Name</label>
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          placeholder="e.g., name, age, price"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Select
                          value={field.type}
                          onValueChange={(value) => updateField(index, { type: value as typeof fieldTypes[number] })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {fieldTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Default Value</label>
                        <Input
                          value={field.default || ''}
                          onChange={(e) => updateField(index, { default: e.target.value })}
                          placeholder="e.g., true, 0, 'default'"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Actions</label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            onClick={() => updateField(index, { required: !field.required })}
                            variant={field.required ? "default" : "outline"}
                            size="sm"
                          >
                            Required
                          </Button>
                          <Button
                            type="button"
                            onClick={() => updateField(index, { unique: !field.unique })}
                            variant={field.unique ? "default" : "outline"}
                            size="sm"
                          >
                            Unique
                          </Button>
                          <Button
                            type="button"
                            onClick={() => removeField(index)}
                            variant="destructive"
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="rbac" className="space-y-4">
                <h3 className="text-lg font-semibold">Role-Based Access Control</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {roles.map((role) => (
                    <Card key={role} className="p-4">
                      <h4 className="font-semibold mb-3">{role}</h4>
                      <div className="space-y-2">
                        {permissions.map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Switch
                              checked={rbac[role]?.includes(permission) || false}
                              onCheckedChange={() => togglePermission(role, permission)}
                            />
                            <label className="text-sm capitalize">{permission}</label>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">Permissions:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rbac[role]?.map((perm) => (
                            <Badge key={perm} variant="secondary" className="text-xs">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
              <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Model Definition
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
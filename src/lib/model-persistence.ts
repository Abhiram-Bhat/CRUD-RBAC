import { promises as fs } from 'fs'
import path from 'path'

export interface ModelDefinition {
  name: string
  tableName?: string
  fields: Array<{
    name: string
    type: 'string' | 'number' | 'boolean' | 'date' | 'text'
    required?: boolean
    default?: string
    unique?: boolean
    relation?: string
  }>
  ownerField?: string
  rbac: Record<string, string[]>
}

export class ModelPersistence {
  private modelsDir: string

  constructor(modelsDir: string = './models') {
    this.modelsDir = modelsDir
  }

  async ensureModelsDirectory(): Promise<void> {
    try {
      await fs.access(this.modelsDir)
    } catch {
      await fs.mkdir(this.modelsDir, { recursive: true })
    }
  }

  async saveModel(model: ModelDefinition): Promise<void> {
    await this.ensureModelsDirectory()
    
    const fileName = `${model.name}.json`
    const filePath = path.join(this.modelsDir, fileName)
    
    const modelWithMetadata = {
      ...model,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    await fs.writeFile(filePath, JSON.stringify(modelWithMetadata, null, 2))
  }

  async loadModel(modelName: string): Promise<ModelDefinition | null> {
    try {
      const fileName = `${modelName}.json`
      const filePath = path.join(this.modelsDir, fileName)
      
      const content = await fs.readFile(filePath, 'utf-8')
      return JSON.parse(content)
    } catch {
      return null
    }
  }

  async loadAllModels(): Promise<ModelDefinition[]> {
    await this.ensureModelsDirectory()
    
    try {
      const files = await fs.readdir(this.modelsDir)
      const modelFiles = files.filter(file => file.endsWith('.json'))
      
      const models: ModelDefinition[] = []
      for (const file of modelFiles) {
        try {
          const filePath = path.join(this.modelsDir, file)
          const content = await fs.readFile(filePath, 'utf-8')
          const model = JSON.parse(content)
          models.push(model)
        } catch (error) {
          console.error(`Error loading model from ${file}:`, error)
        }
      }
      
      return models
    } catch {
      return []
    }
  }

  async deleteModel(modelName: string): Promise<boolean> {
    try {
      const fileName = `${modelName}.json`
      const filePath = path.join(this.modelsDir, fileName)
      
      await fs.unlink(filePath)
      return true
    } catch {
      return false
    }
  }

  async updateModel(modelName: string, updates: Partial<ModelDefinition>): Promise<boolean> {
    try {
      const existingModel = await this.loadModel(modelName)
      if (!existingModel) {
        return false
      }
      
      const updatedModel = {
        ...existingModel,
        ...updates,
        updatedAt: new Date().toISOString(),
      }
      
      await this.saveModel(updatedModel)
      return true
    } catch {
      return false
    }
  }

  async modelExists(modelName: string): Promise<boolean> {
    try {
      const fileName = `${modelName}.json`
      const filePath = path.join(this.modelsDir, fileName)
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  getModelFilePath(modelName: string): string {
    return path.join(this.modelsDir, `${modelName}.json`)
  }

  generatePrismaSchema(model: ModelDefinition): string {
    const { name, tableName, fields, ownerField } = model
    
    let schema = `model ${name} {\n`
    schema += `  id        String   @id @default(cuid())\n`
    
    if (ownerField) {
      schema += `  ${ownerField} String\n`
    }
    
    fields.forEach(field => {
      let fieldLine = `  ${field.name}  `
      
      switch (field.type) {
        case 'string':
          fieldLine += 'String'
          break
        case 'number':
          fieldLine += 'Float'
          break
        case 'boolean':
          fieldLine += 'Boolean'
          break
        case 'date':
          fieldLine += 'DateTime'
          break
        case 'text':
          fieldLine += 'String'
          break
      }
      
      if (field.required) {
        fieldLine += ' @db.NotNull'
      }
      
      if (field.unique) {
        fieldLine += ' @unique'
      }
      
      if (field.default) {
        if (field.type === 'boolean') {
          fieldLine += ` @default(${field.default})`
        } else if (field.type === 'number') {
          fieldLine += ` @default(${field.default})`
        } else {
          fieldLine += ` @default("${field.default}")`
        }
      }
      
      schema += fieldLine + '\n'
    })
    
    schema += `  createdAt DateTime @default(now())\n`
    schema += `  updatedAt DateTime @updatedAt\n`
    schema += `}\n`
    
    return schema
  }
}

export const modelPersistence = new ModelPersistence()
import { NextRequest, NextResponse } from 'next/server'
import { modelPersistence } from '@/lib/model-persistence'

export interface User {
  id: string
  email: string
  name?: string
  role: string
}

export interface RBACContext {
  user: User
  modelName: string
  action: 'create' | 'read' | 'update' | 'delete'
  resourceId?: string
}

export class RBACMiddleware {
  /**
   * Check if user has permission to perform action on a model
   */
  async checkPermission(context: RBACContext): Promise<boolean> {
    try {
      const { user, modelName, action, resourceId } = context

      // Load model definition
      const modelDef = await modelPersistence.loadModel(modelName)
      if (!modelDef) {
        return false
      }

      // Get user permissions for this model
      const userPermissions = modelDef.rbac[user.role] || []
      
      // Check if user has the required permission
      if (!userPermissions.includes(action)) {
        return false
      }

      // For update and delete actions, check ownership if ownerField is specified
      if ((action === 'update' || action === 'delete') && modelDef.ownerField) {
        // Admin can update/delete any record
        if (user.role === 'Admin') {
          return true
        }

        // For other roles, check ownership
        if (resourceId) {
          return await this.checkOwnership(modelName, resourceId, modelDef.ownerField, user.id)
        }
      }

      return true
    } catch (error) {
      console.error('Error checking RBAC permission:', error)
      return false
    }
  }

  /**
   * Check if user owns the resource
   */
  private async checkOwnership(
    modelName: string,
    resourceId: string,
    ownerField: string,
    userId: string
  ): Promise<boolean> {
    try {
      // In a real implementation, this would query the database
      // For now, we'll simulate the check
      const response = await fetch(`/api/crud/${modelName}?id=${resourceId}`)
      if (!response.ok) {
        return false
      }

      const record = await response.json()
      return record[ownerField] === userId
    } catch (error) {
      console.error('Error checking ownership:', error)
      return false
    }
  }

  /**
   * Middleware function to protect routes
   */
  async middleware(
    request: NextRequest,
    options: {
      modelName: string
      action: 'create' | 'read' | 'update' | 'delete'
      getResourceId?: (request: NextRequest) => string | undefined
    }
  ): Promise<NextResponse | null> {
    try {
      // In a real app, get user from authentication token/session
      const user: User = {
        id: 'user-1',
        email: 'user@example.com',
        name: 'Demo User',
        role: 'Admin', // Default to Admin for demo
      }

      // Extract resource ID if needed
      const resourceId = options.getResourceId?.(request)

      // Check permission
      const hasPermission = await this.checkPermission({
        user,
        modelName: options.modelName,
        action: options.action,
        resourceId,
      })

      if (!hasPermission) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }

      // Permission granted, continue with the request
      return null
    } catch (error) {
      console.error('RBAC middleware error:', error)
      return NextResponse.json(
        { error: 'Authentication error' },
        { status: 500 }
      )
    }
  }
}

// Helper functions for common middleware patterns
export const rbac = new RBACMiddleware()

/**
 * Create a middleware factory for a specific model
 */
export function createModelMiddleware(modelName: string) {
  return {
    /**
     * Protect create operations
     */
    create: async (request: NextRequest): Promise<NextResponse | null> => {
      return rbac.middleware(request, {
        modelName,
        action: 'create',
      })
    },

    /**
     * Protect read operations
     */
    read: async (request: NextRequest): Promise<NextResponse | null> => {
      const resourceId = new URL(request.url).searchParams.get('id') || undefined
      return rbac.middleware(request, {
        modelName,
        action: 'read',
        getResourceId: () => resourceId,
      })
    },

    /**
     * Protect update operations
     */
    update: async (request: NextRequest): Promise<NextResponse | null> => {
      const resourceId = new URL(request.url).searchParams.get('id') || undefined
      return rbac.middleware(request, {
        modelName,
        action: 'update',
        getResourceId: () => resourceId,
      })
    },

    /**
     * Protect delete operations
     */
    delete: async (request: NextRequest): Promise<NextResponse | null> => {
      const resourceId = new URL(request.url).searchParams.get('id') || undefined
      return rbac.middleware(request, {
        modelName,
        action: 'delete',
        getResourceId: () => resourceId,
      })
    },
  }
}

/**
 * Higher-order function to wrap API handlers with RBAC protection
 */
export function withRBAC(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>,
  options: {
    modelName: string
    action: 'create' | 'read' | 'update' | 'delete'
    getResourceId?: (request: NextRequest) => string | undefined
  }
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const middlewareResult = await rbac.middleware(request, options)
    if (middlewareResult) {
      return middlewareResult
    }
    
    return handler(request, context)
  }
}
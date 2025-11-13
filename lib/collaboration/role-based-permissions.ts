// Role-Based Permissions System
export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  permissions: Permission[]
  lastActive: Date
  createdAt: Date
}

export interface UserRole {
  id: string
  name: string
  description: string
  level: number
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
  conditions?: PermissionCondition[]
}

export interface PermissionCondition {
  field: string
  operator: 'equals' | 'not_equals' | 'in' | 'not_in' | 'greater_than' | 'less_than'
  value: any
}

export interface AuditLog {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string
  changes: any
  timestamp: Date
  ipAddress: string
  userAgent: string
}

export class RoleBasedPermissions {
  private roles: Map<string, UserRole>
  private permissions: Map<string, Permission>
  private auditLogs: AuditLog[]

  constructor() {
    this.roles = new Map()
    this.permissions = new Map()
    this.auditLogs = []
    this.initializeDefaultRoles()
  }

  // Role Management
  createRole(role: Omit<UserRole, 'id'>): UserRole {
    const id = `role_${Date.now()}`
    const newRole = { ...role, id }
    this.roles.set(id, newRole)
    return newRole
  }

  updateRole(roleId: string, updates: Partial<UserRole>): UserRole | null {
    const role = this.roles.get(roleId)
    if (!role) return null

    const updatedRole = { ...role, ...updates }
    this.roles.set(roleId, updatedRole)
    return updatedRole
  }

  deleteRole(roleId: string): boolean {
    return this.roles.delete(roleId)
  }

  getRole(roleId: string): UserRole | null {
    return this.roles.get(roleId) || null
  }

  getAllRoles(): UserRole[] {
    return Array.from(this.roles.values())
  }

  // Permission Management
  createPermission(permission: Omit<Permission, 'id'>): Permission {
    const id = `perm_${Date.now()}`
    const newPermission = { ...permission, id }
    this.permissions.set(id, newPermission)
    return newPermission
  }

  updatePermission(permissionId: string, updates: Partial<Permission>): Permission | null {
    const permission = this.permissions.get(permissionId)
    if (!permission) return null

    const updatedPermission = { ...permission, ...updates }
    this.permissions.set(permissionId, updatedPermission)
    return updatedPermission
  }

  deletePermission(permissionId: string): boolean {
    return this.permissions.delete(permissionId)
  }

  getPermission(permissionId: string): Permission | null {
    return this.permissions.get(permissionId) || null
  }

  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values())
  }

  // User Permission Checking
  hasPermission(user: User, resource: string, action: string, context?: any): boolean {
    // Check if user has explicit permission
    const hasExplicitPermission = user.permissions.some(perm => 
      perm.resource === resource && 
      perm.action === action &&
      this.evaluateConditions(perm.conditions, context)
    )

    if (hasExplicitPermission) return true

    // Check role-based permissions
    const role = this.roles.get(user.role.id)
    if (!role) return false

    return role.permissions.some(perm => 
      perm.resource === resource && 
      perm.action === action &&
      this.evaluateConditions(perm.conditions, context)
    )
  }

  canAccessResource(user: User, resource: string, resourceId?: string): boolean {
    return this.hasPermission(user, resource, 'read', { resourceId })
  }

  canModifyResource(user: User, resource: string, resourceId?: string): boolean {
    return this.hasPermission(user, resource, 'write', { resourceId })
  }

  canDeleteResource(user: User, resource: string, resourceId?: string): boolean {
    return this.hasPermission(user, resource, 'delete', { resourceId })
  }

  canAdminResource(user: User, resource: string): boolean {
    return this.hasPermission(user, resource, 'admin')
  }

  // Audit Logging
  logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    changes: any,
    ipAddress: string,
    userAgent: string
  ): void {
    const auditLog: AuditLog = {
      id: `audit_${Date.now()}`,
      userId,
      action,
      resource,
      resourceId,
      changes,
      timestamp: new Date(),
      ipAddress,
      userAgent
    }

    this.auditLogs.push(auditLog)
  }

  getAuditLogs(
    userId?: string,
    resource?: string,
    startDate?: Date,
    endDate?: Date
  ): AuditLog[] {
    return this.auditLogs.filter(log => {
      if (userId && log.userId !== userId) return false
      if (resource && log.resource !== resource) return false
      if (startDate && log.timestamp < startDate) return false
      if (endDate && log.timestamp > endDate) return false
      return true
    })
  }

  // Helper Methods
  private evaluateConditions(conditions: PermissionCondition[] | undefined, context: any): boolean {
    if (!conditions || conditions.length === 0) return true

    return conditions.every(condition => {
      const fieldValue = this.getNestedValue(context, condition.field)
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'not_equals':
          return fieldValue !== condition.value
        case 'in':
          return Array.isArray(condition.value) && condition.value.includes(fieldValue)
        case 'not_in':
          return Array.isArray(condition.value) && !condition.value.includes(fieldValue)
        case 'greater_than':
          return fieldValue > condition.value
        case 'less_than':
          return fieldValue < condition.value
        default:
          return false
      }
    })
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  private initializeDefaultRoles(): void {
    // Founder/CEO Role
    const founderRole = this.createRole({
      name: 'Founder',
      description: 'Full access to all features and data',
      level: 100,
      permissions: [
        this.createPermission({
          name: 'Full Access',
          resource: '*',
          action: '*'
        })
      ]
    })

    // CFO Role
    const cfoRole = this.createRole({
      name: 'CFO',
      description: 'Financial oversight and reporting access',
      level: 90,
      permissions: [
        this.createPermission({
          name: 'Financial Data Access',
          resource: 'financial_data',
          action: '*'
        }),
        this.createPermission({
          name: 'Reporting Access',
          resource: 'reports',
          action: '*'
        }),
        this.createPermission({
          name: 'User Management',
          resource: 'users',
          action: 'read'
        })
      ]
    })

    // Accountant Role
    const accountantRole = this.createRole({
      name: 'Accountant',
      description: 'Accounting and bookkeeping access',
      level: 70,
      permissions: [
        this.createPermission({
          name: 'Transaction Access',
          resource: 'transactions',
          action: '*'
        }),
        this.createPermission({
          name: 'Chart of Accounts',
          resource: 'chart_of_accounts',
          action: '*'
        }),
        this.createPermission({
          name: 'Financial Reports',
          resource: 'reports',
          action: 'read'
        })
      ]
    })

    // Analyst Role
    const analystRole = this.createRole({
      name: 'Financial Analyst',
      description: 'Analysis and reporting access',
      level: 60,
      permissions: [
        this.createPermission({
          name: 'Read Financial Data',
          resource: 'financial_data',
          action: 'read'
        }),
        this.createPermission({
          name: 'Create Reports',
          resource: 'reports',
          action: 'write'
        }),
        this.createPermission({
          name: 'View Analytics',
          resource: 'analytics',
          action: 'read'
        })
      ]
    })

    // Viewer Role
    const viewerRole = this.createRole({
      name: 'Viewer',
      description: 'Read-only access to basic financial data',
      level: 30,
      permissions: [
        this.createPermission({
          name: 'Read Basic Data',
          resource: 'financial_data',
          action: 'read',
          conditions: [
            {
              field: 'sensitivity',
              operator: 'not_equals',
              value: 'confidential'
            }
          ]
        }),
        this.createPermission({
          name: 'View Dashboards',
          resource: 'dashboards',
          action: 'read'
        })
      ]
    })
  }

  // Get user's effective permissions
  getUserEffectivePermissions(user: User): Permission[] {
    const role = this.roles.get(user.role.id)
    const rolePermissions = role ? role.permissions : []
    const userPermissions = user.permissions || []
    
    // Combine role and user permissions, removing duplicates
    const allPermissions = [...rolePermissions, ...userPermissions]
    const uniquePermissions = allPermissions.filter((perm, index, self) => 
      index === self.findIndex(p => p.id === perm.id)
    )
    
    return uniquePermissions
  }

  // Check if user can perform action on specific resource
  canPerformAction(
    user: User, 
    action: string, 
    resource: string, 
    resourceId?: string,
    context?: any
  ): boolean {
    return this.hasPermission(user, resource, action, { ...context, resourceId })
  }

  // Get users by role
  getUsersByRole(roleId: string, users: User[]): User[] {
    return users.filter(user => user.role.id === roleId)
  }

  // Get role hierarchy
  getRoleHierarchy(): UserRole[] {
    return Array.from(this.roles.values()).sort((a, b) => b.level - a.level)
  }
}

// Export singleton instance
export const roleBasedPermissions = new RoleBasedPermissions()

































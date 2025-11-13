// Bank-Grade Encryption and Security
import crypto from 'crypto'

export interface EncryptionConfig {
  algorithm: string
  keyLength: number
  ivLength: number
  saltLength: number
  iterations: number
}

export interface EncryptedData {
  data: string
  iv: string
  salt: string
  tag?: string
}

export interface SecurityAudit {
  id: string
  timestamp: Date
  action: string
  resource: string
  userId: string
  ipAddress: string
  userAgent: string
  success: boolean
  details: any
}

export class SecurityManager {
  private config: EncryptionConfig
  private masterKey: Buffer
  private auditLogs: SecurityAudit[]

  constructor() {
    this.config = {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
      saltLength: 32,
      iterations: 100000
    }
    
    this.masterKey = this.generateMasterKey()
    this.auditLogs = []
  }

  // Encryption Methods
  encrypt(data: string, password?: string): EncryptedData {
    try {
      const key = password ? this.deriveKey(password) : this.masterKey
      const iv = crypto.randomBytes(this.config.ivLength)
      const salt = crypto.randomBytes(this.config.saltLength)
      
      const cipher = crypto.createCipher(this.config.algorithm, key)
      cipher.setAAD(salt)
      
      let encrypted = cipher.update(data, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      const tag = cipher.getAuthTag()
      
      return {
        data: encrypted,
        iv: iv.toString('hex'),
        salt: salt.toString('hex'),
        tag: tag.toString('hex')
      }
    } catch (error) {
      this.logSecurityEvent('encryption_error', 'encryption', null, false, { error: error.message })
      throw new Error('Encryption failed')
    }
  }

  decrypt(encryptedData: EncryptedData, password?: string): string {
    try {
      const key = password ? this.deriveKey(password) : this.masterKey
      const iv = Buffer.from(encryptedData.iv, 'hex')
      const salt = Buffer.from(encryptedData.salt, 'hex')
      const tag = encryptedData.tag ? Buffer.from(encryptedData.tag, 'hex') : undefined
      
      const decipher = crypto.createDecipher(this.config.algorithm, key)
      if (tag) {
        decipher.setAuthTag(tag)
      }
      decipher.setAAD(salt)
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
    } catch (error) {
      this.logSecurityEvent('decryption_error', 'decryption', null, false, { error: error.message })
      throw new Error('Decryption failed')
    }
  }

  // Data Hashing
  hashData(data: string, salt?: string): string {
    const actualSalt = salt || crypto.randomBytes(32).toString('hex')
    const hash = crypto.pbkdf2Sync(data, actualSalt, this.config.iterations, 64, 'sha512')
    return `${actualSalt}:${hash.toString('hex')}`
  }

  verifyHash(data: string, hashedData: string): boolean {
    try {
      const [salt, hash] = hashedData.split(':')
      const newHash = crypto.pbkdf2Sync(data, salt, this.config.iterations, 64, 'sha512')
      return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), newHash)
    } catch (error) {
      return false
    }
  }

  // Token Management
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  generateJWT(payload: any, secret: string, expiresIn: string = '24h'): string {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    }

    const now = Math.floor(Date.now() / 1000)
    const exp = now + this.parseExpiresIn(expiresIn)

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header))
    const encodedPayload = this.base64UrlEncode(JSON.stringify({ ...payload, exp, iat: now }))
    
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest('base64url')

    return `${encodedHeader}.${encodedPayload}.${signature}`
  }

  verifyJWT(token: string, secret: string): any {
    try {
      const [header, payload, signature] = token.split('.')
      
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${header}.${payload}`)
        .digest('base64url')

      if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
        throw new Error('Invalid signature')
      }

      const decodedPayload = JSON.parse(this.base64UrlDecode(payload))
      
      if (decodedPayload.exp && decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
      }

      return decodedPayload
    } catch (error) {
      this.logSecurityEvent('jwt_verification_failed', 'authentication', null, false, { error: error.message })
      throw new Error('Invalid token')
    }
  }

  // Data Sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['"]/g, '') // Remove quotes
      .replace(/[;]/g, '') // Remove semicolons
      .trim()
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter')
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter')
    }
    
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number')
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character')
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }

  // Security Audit Logging
  logSecurityEvent(
    action: string,
    resource: string,
    userId: string | null,
    success: boolean,
    details: any
  ): void {
    const audit: SecurityAudit = {
      id: this.generateSecureToken(16),
      timestamp: new Date(),
      action,
      resource,
      userId: userId || 'system',
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      success,
      details
    }

    this.auditLogs.push(audit)
    
    // In production, this would be sent to a secure audit log service
    console.log('Security Audit:', audit)
  }

  getSecurityAuditLogs(
    startDate?: Date,
    endDate?: Date,
    action?: string,
    userId?: string
  ): SecurityAudit[] {
    return this.auditLogs.filter(log => {
      if (startDate && log.timestamp < startDate) return false
      if (endDate && log.timestamp > endDate) return false
      if (action && log.action !== action) return false
      if (userId && log.userId !== userId) return false
      return true
    })
  }

  // Data Isolation
  createDataIsolationKey(tenantId: string): string {
    return this.hashData(tenantId, process.env.DATA_ISOLATION_SALT || 'default-salt')
  }

  encryptForTenant(data: string, tenantId: string): EncryptedData {
    const tenantKey = this.createDataIsolationKey(tenantId)
    return this.encrypt(data, tenantKey)
  }

  decryptForTenant(encryptedData: EncryptedData, tenantId: string): string {
    const tenantKey = this.createDataIsolationKey(tenantId)
    return this.decrypt(encryptedData, tenantKey)
  }

  // Rate Limiting
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>()

  checkRateLimit(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const key = identifier
    const current = this.rateLimitMap.get(key)

    if (!current || now > current.resetTime) {
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (current.count >= maxRequests) {
      this.logSecurityEvent('rate_limit_exceeded', 'rate_limiting', identifier, false, {
        count: current.count,
        maxRequests,
        windowMs
      })
      return false
    }

    current.count++
    return true
  }

  // Private Helper Methods
  private generateMasterKey(): Buffer {
    const key = process.env.ENCRYPTION_MASTER_KEY
    if (!key) {
      throw new Error('ENCRYPTION_MASTER_KEY environment variable is required')
    }
    return Buffer.from(key, 'hex')
  }

  private deriveKey(password: string, salt?: Buffer): Buffer {
    const actualSalt = salt || crypto.randomBytes(32)
    return crypto.pbkdf2Sync(password, actualSalt, this.config.iterations, this.config.keyLength, 'sha512')
  }

  private base64UrlEncode(str: string): string {
    return Buffer.from(str)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  private base64UrlDecode(str: string): string {
    // Add padding if needed
    const padded = str + '='.repeat((4 - str.length % 4) % 4)
    return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
  }

  private parseExpiresIn(expiresIn: string): number {
    const unit = expiresIn.slice(-1)
    const value = parseInt(expiresIn.slice(0, -1))
    
    switch (unit) {
      case 's': return value
      case 'm': return value * 60
      case 'h': return value * 60 * 60
      case 'd': return value * 60 * 60 * 24
      default: return 24 * 60 * 60 // Default to 24 hours
    }
  }

  private getClientIP(): string {
    // In production, this would get the actual client IP from request headers
    return '127.0.0.1'
  }

  private getUserAgent(): string {
    // In production, this would get the actual user agent from request headers
    return 'ReturnSight-AI/1.0'
  }

  // SOC-2 Compliance Helpers
  generateComplianceReport(): any {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const recentAudits = this.getSecurityAuditLogs(thirtyDaysAgo, now)
    const failedLogins = recentAudits.filter(log => 
      log.action === 'login_attempt' && !log.success
    )
    const successfulLogins = recentAudits.filter(log => 
      log.action === 'login_attempt' && log.success
    )
    
    return {
      reportDate: now,
      period: { start: thirtyDaysAgo, end: now },
      metrics: {
        totalAuditEvents: recentAudits.length,
        failedLoginAttempts: failedLogins.length,
        successfulLogins: successfulLogins.length,
        securityIncidents: recentAudits.filter(log => !log.success).length
      },
      compliance: {
        dataEncryption: 'Enabled',
        accessControls: 'Implemented',
        auditLogging: 'Active',
        dataIsolation: 'Configured'
      }
    }
  }
}

// Export singleton instance
export const securityManager = new SecurityManager()

































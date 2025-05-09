export interface UserInput {
    name: string
    email: string
    password?: string // Optional untuk update
    role: 'user' | 'admin'
  }
  
  export interface ValidationResult {
    valid: boolean
    errors: Record<string, string>
  }
  
  export const validateUserInput = (userData: UserInput, options: { requirePassword?: boolean } = {}): ValidationResult => {
    const errors: Record<string, string> = {}
  
    // Name validation
    if (!userData.name || userData.name.trim().length === 0) {
      errors.name = 'Name is required'
    }
  
    // Email validation
    if (!userData.email || userData.email.trim().length === 0) {
      errors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'Email is not valid'
    }
  
    // Password validation (only if required or provided)
    if (options.requirePassword || userData.password) {
      if (!userData.password || userData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
      }
    }
  
    // Role validation
    if (!['user', 'admin'].includes(userData.role)) {
      errors.role = 'Role must be either "user" or "admin"'
    }
  
    return {
      valid: Object.keys(errors).length === 0,
      errors,
    }
  }
  
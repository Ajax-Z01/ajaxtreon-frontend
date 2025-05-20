export interface UserInput {
  name: string
  email: string
  password?: string
  role: 'user' | 'admin' | 'staff' | 'manager'
  phone?: string
  address?: string
}

export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}

export const validateUserInput = (
  userData: UserInput,
  options: { requirePassword?: boolean } = {}
): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!userData.name || userData.name.trim().length === 0) {
    errors.name = 'Name is required'
  }
  
  if (!userData.email || userData.email.trim().length === 0) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
    errors.email = 'Email is not valid'
  }

  if (options.requirePassword || userData.password) {
    if (!userData.password || userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters'
    }
  }

  if (!['user', 'admin', 'staff', 'manager'].includes(userData.role)) {
    errors.role = 'Role must be one of "user", "admin", "staff", or "manager"'
  }

  if (userData.phone) {
    if (!/^[\d\s+()-]{6,20}$/.test(userData.phone)) {
      errors.phone = 'Phone number is not valid'
    }
  }

  if (userData.address) {
    if (userData.address.trim().length < 5) {
      errors.address = 'Address must be at least 5 characters'
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

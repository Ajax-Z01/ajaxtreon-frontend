import type { ValidationResult } from '~/types/Validation'

export interface CustomerInput {
  name: string
  email?: string
  phone?: string
  address?: string
}

export const validateCustomerInput = (
  customerData: CustomerInput
): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!customerData.name || customerData.name.trim().length === 0) {
    errors.name = 'Name is required'
  }

  if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
    errors.email = 'Email is not valid'
  }

  if (customerData.phone && !/^[\d\s+()-]{6,20}$/.test(customerData.phone)) {
    errors.phone = 'Phone number is not valid'
  }

  if (customerData.address && customerData.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

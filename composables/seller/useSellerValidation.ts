import type { ValidationResult } from '~/types/Validation'

export interface SellerInput {
  name: string
  email?: string
  phone?: string
  address?: string
}

export const validateSellerInput = (
  sellerData: SellerInput
): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!sellerData.name || sellerData.name.trim().length === 0) {
    errors.name = 'Name is required'
  }

  if (sellerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sellerData.email)) {
    errors.email = 'Email is not valid'
  }

  if (sellerData.phone && !/^[\d\s+()-]{6,20}$/.test(sellerData.phone)) {
    errors.phone = 'Phone number is not valid'
  }

  if (sellerData.address && sellerData.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

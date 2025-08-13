import type { ValidationResult } from '~/types/Validation'

export interface SupplierInput {
  name: string
  email?: string
  phone?: string
  address?: string
  companyName?: string
  contactPerson?: string
}

export const validateSupplierInput = (
  supplierData: SupplierInput
): ValidationResult => {
  const errors: Record<string, string> = {}

  if (!supplierData.name || supplierData.name.trim().length === 0) {
    errors.name = 'Name is required'
  }

  if (supplierData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supplierData.email)) {
    errors.email = 'Email is not valid'
  }

  if (supplierData.phone && !/^[\d\s+()-]{6,20}$/.test(supplierData.phone)) {
    errors.phone = 'Phone number is not valid'
  }

  if (supplierData.address && supplierData.address.trim().length < 5) {
    errors.address = 'Address must be at least 5 characters'
  }

  if (supplierData.companyName && supplierData.companyName.trim().length === 0) {
    errors.companyName = 'Company Name cannot be empty'
  }

  if (supplierData.contactPerson && supplierData.contactPerson.trim().length === 0) {
    errors.contactPerson = 'Contact Person cannot be empty'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

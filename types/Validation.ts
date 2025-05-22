export interface ValidationResult {
  valid: boolean
  errors: Record<string, string>
}
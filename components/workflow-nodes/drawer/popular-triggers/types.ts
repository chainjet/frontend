import { JSONSchema7 } from 'json-schema'

export interface PopularTrigger {
  integrationKey?: string
  operationId?: string
  hasSchedule: boolean
  name: string
  description: string
  schema?: JSONSchema7
  getIntegrationKey?: (inputs: Record<string, any>) => string
  getOperationId?: (inputs: Record<string, any>) => string
  validate?: (inputs: Record<string, any>) => true
}

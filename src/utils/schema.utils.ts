import { UiSchema } from '@rjsf/core'
import { JSONSchema7 } from 'json-schema'

export function removeHiddenProperties (schema: JSONSchema7): JSONSchema7 | undefined {
  if ((schema as { 'x-hidden'?: boolean })['x-hidden']) {
    return undefined
  }

  // Remove hidden properties from required array
  if (schema.required) {
    schema.required = schema.required.filter(item => {
      return !(schema.properties?.[item] as { 'x-hidden'?: boolean })?.['x-hidden']
    })
  }

  return applySchemaChangeRecursively(schema, removeHiddenProperties)
}

export function fixArraysWithoutItems (schema: JSONSchema7): JSONSchema7 {
  if (schema.type === 'array' && !schema.items) {
    schema.items = { type: 'string' }
  }
  return applySchemaChangeRecursively(schema, fixArraysWithoutItems)
}

export function extractUISchema (schema: JSONSchema7): UiSchema {
  const uiSchema: UiSchema = Object.entries(schema).reduce((prev: UiSchema, [key, value]) => {
    if (key.startsWith('x-ui:')) {
      prev[key.slice(2)] = value
    }
    return prev
  }, {})

  // Extract from items
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      uiSchema.items = schema.items
        .filter(item => typeof item !== 'boolean')
        .map(item => extractUISchema(item as JSONSchema7))
        .filter(item => !!item)
    } else if (typeof schema.items !== 'boolean') {
      uiSchema.items = extractUISchema(schema.items)
      if (!schema.items) {
        delete schema.items
      }
    }
  }

  // Extract from properties
  for (const [propKey, property] of Object.entries(schema.properties ?? {})) {
    if (typeof property !== 'boolean') {
      uiSchema[propKey] = extractUISchema(property)
    }
  }

  // Extract from oneOf
  if (schema.oneOf) {
    uiSchema.oneOf = schema.oneOf
      ?.filter(oneOf => typeof oneOf !== 'boolean')
      ?.map(oneOf => extractUISchema(oneOf as JSONSchema7))
      ?.filter(oneOf => !!oneOf)
  }

  // Extract from anyOf
  if (schema.anyOf) {
    uiSchema.anyOf = schema.anyOf
      ?.filter(anyOf => typeof anyOf !== 'boolean')
      ?.map(anyOf => extractUISchema(anyOf as JSONSchema7))
      ?.filter(anyOf => !!anyOf)
  }

  // Extract from allOf
  if (schema.allOf) {
    uiSchema.allOf = schema.allOf
      ?.filter(allOf => typeof allOf !== 'boolean')
      ?.map(allOf => extractUISchema(allOf as JSONSchema7))
      ?.filter(allOf => !!allOf)
  }

  return uiSchema
}

/**
 * Helper for applying a schema modification recursively to schema properties and items
 * This method also exists on backend jsonSchemaUtils
 */
function applySchemaChangeRecursively <T> (
  schema: JSONSchema7,
  fn: (schema: JSONSchema7, ...args: any[]) => T,
  ...callbackArgs: any[]
): JSONSchema7 {
  // Apply to items
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      schema.items = schema.items
        .filter(item => typeof item !== 'boolean')
        .map(item => fn(item as JSONSchema7, ...callbackArgs))
        .filter(item => !!item)
    } else if (typeof schema.items !== 'boolean') {
      schema.items = fn(schema.items, ...callbackArgs)
      if (!schema.items) {
        delete schema.items
      }
    }
  }

  // Apply to properties
  for (const [propKey, property] of Object.entries(schema.properties ?? {})) {
    if (typeof property !== 'boolean') {
      schema.properties = schema.properties ?? {}
      schema.properties[propKey] = fn(property, ...callbackArgs)
      if (!schema.properties[propKey]) {
        delete schema.properties[propKey]
      }
    }
  }

  // Apply to oneOf
  if (schema.oneOf) {
    schema.oneOf = schema.oneOf
      ?.filter(oneOf => typeof oneOf !== 'boolean')
      ?.map(oneOf => fn(oneOf as JSONSchema7, ...callbackArgs))
      ?.filter(oneOf => !!oneOf)
  }

  // Apply to anyOf
  if (schema.anyOf) {
    schema.anyOf = schema.anyOf
      ?.filter(anyOf => typeof anyOf !== 'boolean')
      ?.map(anyOf => fn(anyOf as JSONSchema7, ...callbackArgs))
      ?.filter(anyOf => !!anyOf)
  }

  // Apply to allOf
  if (schema.allOf) {
    schema.allOf = schema.allOf
      ?.filter(allOf => typeof allOf !== 'boolean')
      ?.map(allOf => fn(allOf as JSONSchema7, ...callbackArgs))
      ?.filter(allOf => !!allOf)
  }

  return schema
}

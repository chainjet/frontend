import { UiSchema } from '@rjsf/utils'
import deepmerge from 'deepmerge'
import { JSONSchema7 } from 'json-schema'
import { IntegrationAction, IntegrationTrigger } from '../../graphql'

export function removeHiddenProperties(schema: JSONSchema7): JSONSchema7 {
  if ((schema as { 'x-hidden'?: boolean })['x-hidden']) {
    return {}
  }

  // Remove hidden properties from required array
  if (schema.required) {
    schema.required = schema.required.filter((item) => {
      return !(schema.properties?.[item] as { 'x-hidden'?: boolean })?.['x-hidden']
    })
  }

  return applySchemaChangeRecursively(schema, removeHiddenProperties)
}

export function fixArraysWithoutItems(schema: JSONSchema7): JSONSchema7 {
  if (schema.type === 'array' && !schema.items) {
    schema.items = { type: 'string' }
  }
  return applySchemaChangeRecursively(schema, fixArraysWithoutItems)
}

export function replaceInheritFields(
  schema: JSONSchema7,
  integrationTriggers: IntegrationTrigger[],
  integrationActions: IntegrationAction[],
): JSONSchema7 {
  schema = { ...schema }
  schema.properties = { ...(schema.properties ?? {}) }
  for (const [key, value] of Object.entries(schema.properties ?? {})) {
    if (typeof value === 'boolean') {
      continue
    }
    const inheritField = (value as any)['x-inheritField']
    if (inheritField?.integrationTrigger) {
      const trigger = integrationTriggers.find((t) => t.id === inheritField.integrationTrigger)
      if (trigger) {
        const field = trigger.schemaRequest?.properties?.[inheritField.key]
        if (field) {
          schema.properties![key] = field
        }
      }
    }
    if (inheritField?.integrationAction) {
      const action = integrationActions.find((t) => t.id === inheritField.integrationAction)
      if (action) {
        const field = action.schemaRequest?.properties?.[inheritField.key]
        if (field) {
          schema.properties![key] = field
        }
      }
    }
  }

  return applySchemaChangeRecursively(schema, replaceInheritFields, integrationTriggers, integrationActions)
}

export function mergePropSchema(schema: JSONSchema7, propSchemas: { [key: string]: JSONSchema7 }): JSONSchema7 {
  // The javascript object can be received as read only, so we need to clone it
  schema = { ...schema }
  if (schema.properties) {
    // do not assign an empty object to an falsy schema.properties
    schema.properties = { ...schema.properties }
  } else {
    return schema
  }

  for (const propKey of Object.keys(propSchemas)) {
    if (schema.properties[propKey] && typeof schema.properties[propKey] === 'object') {
      schema.properties[propKey] = deepmerge(schema.properties[propKey] as JSONSchema7, propSchemas[propKey])
    } else {
      schema.properties[propKey] = propSchemas[propKey]
    }
  }
  return schema
}

export function extractUISchema(schema: JSONSchema7): UiSchema {
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
        .filter((item) => typeof item !== 'boolean')
        .map((item) => extractUISchema(item as JSONSchema7))
        .filter((item) => !!item)
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
      ?.filter((oneOf) => typeof oneOf !== 'boolean')
      ?.map((oneOf) => extractUISchema(oneOf as JSONSchema7))
      ?.filter((oneOf) => !!oneOf)
  }

  // Extract from anyOf
  if (schema.anyOf) {
    uiSchema.anyOf = schema.anyOf
      ?.filter((anyOf) => typeof anyOf !== 'boolean')
      ?.map((anyOf) => extractUISchema(anyOf as JSONSchema7))
      ?.filter((anyOf) => !!anyOf)
  }

  // Extract from allOf
  if (schema.allOf) {
    uiSchema.allOf = schema.allOf
      ?.filter((allOf) => typeof allOf !== 'boolean')
      ?.map((allOf) => extractUISchema(allOf as JSONSchema7))
      ?.filter((allOf) => !!allOf)
  }

  return uiSchema
}

/**
 * Helper for applying a schema modification recursively to schema properties and items
 * This method also exists on backend jsonSchemaUtils
 */
function applySchemaChangeRecursively<T extends JSONSchema7>(
  schema: JSONSchema7,
  fn: (schema: JSONSchema7, ...args: any[]) => T,
  ...callbackArgs: any[]
): JSONSchema7 {
  // Apply to items
  if (schema.items) {
    if (Array.isArray(schema.items)) {
      schema.items = schema.items
        .filter((item) => typeof item !== 'boolean')
        .map((item) => fn(item as JSONSchema7, ...callbackArgs))
        .filter((item) => !!item)
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
      ?.filter((oneOf) => typeof oneOf !== 'boolean')
      ?.map((oneOf) => fn(oneOf as JSONSchema7, ...callbackArgs))
      ?.filter((oneOf) => !!oneOf)
  }

  // Apply to anyOf
  if (schema.anyOf) {
    schema.anyOf = schema.anyOf
      ?.filter((anyOf) => typeof anyOf !== 'boolean')
      ?.map((anyOf) => fn(anyOf as JSONSchema7, ...callbackArgs))
      ?.filter((anyOf) => !!anyOf)
  }

  // Apply to allOf
  if (schema.allOf) {
    schema.allOf = schema.allOf
      ?.filter((allOf) => typeof allOf !== 'boolean')
      ?.map((allOf) => fn(allOf as JSONSchema7, ...callbackArgs))
      ?.filter((allOf) => !!allOf)
  }

  return schema
}

/**
 * Returns an object with the default values for a schema
 * // TODO only works for first level keys in the object
 */
export function getSchemaDefaults(schema: JSONSchema7): Record<string, any> {
  if (schema.type === 'object') {
    return Object.entries(schema.properties ?? {}).reduce((prev: Record<string, any>, [key, value]) => {
      if (value && typeof value === 'object' && value.default) {
        prev[key] = value.default
      }
      return prev
    }, {})
  }
  return {}
}

/**
 * Checks whether a given key is a select on the schema properties
 */
export function isSelectInput(key: string, schema: JSONSchema7): boolean {
  if (!schema.properties) {
    return false
  }
  const prop = schema.properties[key]
  if (!prop || typeof prop !== 'object' || prop.type !== 'string') {
    return false
  }
  return !!prop.enum || !!prop.oneOf
}

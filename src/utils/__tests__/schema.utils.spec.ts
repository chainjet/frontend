import { JSONSchema7 } from 'json-schema'
import { extractUISchema, fixArraysWithoutItems, removeHiddenProperties } from '../schema.utils'

describe('Schema Utils', () => {
  describe('removeHiddenProperties', () => {
    it('should remove properties with x-hidden', () => {
      const schema = {
        properties: {
          foo: {
            type: 'string',
            'x-hidden': true
          },
          bar: {
            type: 'string',
            'x-hidden': false
          },
          baz: {
            type: 'string'
          }
        }
      } as JSONSchema7
      expect(removeHiddenProperties(schema)).toEqual({
        properties: {
          bar: {
            type: 'string',
            'x-hidden': false
          },
          baz: {
            type: 'string'
          }
        }
      })
    })
  })

  describe('fixArraysWithoutItems', () => {
    it('should add items property if an array does not have it', () => {
      const schema: JSONSchema7 = {
        properties: {
          key1: { type: 'array' },
          key2: { type: 'array', items: { type: 'boolean' } },
          key3: { type: 'string' }
        }
      }
      expect(fixArraysWithoutItems(schema)).toEqual({
        properties: {
          key1: { type: 'array', items: { type: 'string' } },
          key2: { type: 'array', items: { type: 'boolean' } },
          key3: { type: 'string' }
        }
      })
    })
  })

  describe('extractUISchema', () => {
    it('should return the UI Schema from a single property', () => {
      const schema = {
        type: 'string',
        'x-ui:autofocus': true
      }
      expect(extractUISchema(schema as JSONSchema7)).toEqual({
        'ui:autofocus': true
      })
    })

    it('should return the UI Schema from inside an object', () => {
      const schema = {
        type: 'object',
        properties: {
          test: {
            title: 'Test',
            'x-ui:help': 'Test'
          }
        }
      }
      expect(extractUISchema(schema as JSONSchema7)).toEqual({
        test: {
          'ui:help': 'Test'
        }
      })
    })

    it('should return the UI Schema from an array of items', () => {
      const schema = {
        type: 'array',
        items: [
          {
            type: 'string',
            'x-ui:help': 'Test'
          },
          {
            type: 'boolean',
            'x-ui:widget': 'radio'
          }
        ]
      }
      expect(extractUISchema(schema as JSONSchema7)).toEqual({
        items: [
          {
            'ui:help': 'Test'
          },
          {
            'ui:widget': 'radio'
          }
        ]
      })
    })

    it('should return the UI Schema from an array with single item spec', () => {
      const schema = {
        type: 'array',
        items: {
          type: 'string',
          'x-ui:help': 'Test'
        }
      }
      expect(extractUISchema(schema as JSONSchema7)).toEqual({
        items: {
          'ui:help': 'Test'
        }
      })
    })

    it('should return the UI Schema from a oneOf array', () => {
      const schema = {
        oneOf: [
          {
            title: 'Test',
            'x-ui:help': 'Test'
          }
        ]
      }
      expect(extractUISchema(schema as JSONSchema7)).toEqual({
        oneOf: [
          {
            'ui:help': 'Test'
          }
        ]
      })
    })

    it('should return the UI Schema from a anyOf array', () => {
      const schema = {
        anyOf: [
          {
            title: 'Test',
            'x-ui:help': 'Test'
          }
        ]
      }
      expect(extractUISchema(schema as JSONSchema7)).toEqual({
        anyOf: [
          {
            'ui:help': 'Test'
          }
        ]
      })
    })

    it('should return the UI Schema from a allOf array', () => {
      const schema = {
        allOf: [
          {
            title: 'Test',
            'x-ui:help': 'Test'
          }
        ]
      }
      expect(extractUISchema(schema as JSONSchema7)).toEqual({
        allOf: [
          {
            'ui:help': 'Test'
          }
        ]
      })
    })
  })
})

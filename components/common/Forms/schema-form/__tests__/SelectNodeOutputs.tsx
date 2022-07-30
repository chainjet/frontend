import { createOutputsTree } from '../SelectNodeOutputs'
import { JSONSchema7 } from 'json-schema'

describe('SelectNodeOutputs', () => {
  describe('createOutputsTree', () => {
    it('should return an array of single level DataNode for scalar properties', async () => {
      const schema: JSONSchema7 = {
        properties: {
          str: {
            type: 'string',
          },
          boolean: {
            type: 'boolean',
          },
          int: {
            type: 'integer',
          },
          number: {
            type: 'number',
          }
        }
      }
      expect(createOutputsTree(schema, 'test')).toEqual([
        {
          title: 'str',
          key: 'test.str',
        },
        {
          title: 'boolean',
          key: 'test.boolean',
        },
        {
          title: 'int',
          key: 'test.int',
        },
        {
          title: 'number',
          key: 'test.number',
        }
      ])
    })

    it('should ignore null property types', async () => {
      const schema: JSONSchema7 = {
        properties: {
          str: {
            type: ['string', 'null'],
          },
          boolean: {
            type: ['boolean', 'null'],
          },
          int: {
            type: ['integer', 'null'],
          },
          number: {
            type: ['number', 'null'],
          },
          null: {
            type: 'null',
          }
        }
      }
      expect(createOutputsTree(schema, 'test')).toEqual([
        {
          title: 'str',
          key: 'test.str',
        },
        {
          title: 'boolean',
          key: 'test.boolean',
        },
        {
          title: 'int',
          key: 'test.int',
        },
        {
          title: 'number',
          key: 'test.number',
        }
      ])
    })

    it('should return a DataTree with children for object properties', async () => {
      const schema: JSONSchema7 = {
        properties: {
          object: {
            type: 'object',
            properties: {
              str: {
                type: 'string',
              },
            },
          }
        }
      }
      expect(createOutputsTree(schema, 'test')).toEqual([
        {
          title: 'object',
          key: 'test.object',
          children: [
            {
              title: 'str',
              key: 'test.object.str',
            },
          ],
        },
      ])
    })

    it('should return empty arrays for empty schemas', async () => {
      expect(createOutputsTree({}, 'test')).toEqual([])
      expect(createOutputsTree({ properties: {} }, 'test')).toEqual([])
    })
  })
})

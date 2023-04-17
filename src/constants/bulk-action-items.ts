import { JSONSchema7, JSONSchema7Definition } from 'json-schema'

export interface BulkActionItem {
  integrationKey: string
  operationKey: string
  name: string
  icon: string
  schema?: JSONSchema7
}

interface DataSource extends BulkActionItem {
  exports: Record<string, string>
}

interface Action extends BulkActionItem {
  imports: Record<string, string>
}

export const bulkDataSources: DataSource[] = [
  {
    integrationKey: 'lens',
    operationKey: 'newFollowerBulk',
    name: 'Lens Followers',
    icon: 'https://chainjet.io/img/lens.png',
    exports: {
      profileId: 'defaultProfile.id',
      handle: 'defaultProfile.handle',
      address: 'address',
    },
  },
  {
    integrationKey: 'lens',
    operationKey: 'newCollectionBulk',
    name: 'Lens Post Collectors',
    icon: 'https://chainjet.io/img/lens.png',
    exports: {
      profileId: 'defaultProfile.id',
      handle: 'defaultProfile.handle',
      address: 'address',
    },
  },
  {
    integrationKey: 'poap',
    operationKey: 'newPoapHolder',
    name: 'POAP Holders',
    icon: 'https://raw.githubusercontent.com/chainjet/assets/master/dapps/poap.xyz.png',
    exports: {
      address: 'owner',
    },
    schema: {
      required: ['eventId'],
      properties: {
        eventId: {
          title: 'Event ID',
          type: 'string',
          description: 'The POAP event ID.',
        },
      },
    },
  },
]

export const bulkActions: Action[] = [
  {
    integrationKey: 'xmtp',
    operationKey: 'sendMessageWallet',
    name: 'Send an XMTP message',
    icon: 'https://raw.githubusercontent.com/chainjet/assets/master/dapps/xmtp.org.png',
    schema: {
      required: ['message'],
      properties: {
        message: {
          title: 'Message',
          type: 'string',
          'x-ui:widget': 'textarea',
          description: 'Message to send',
        } as JSONSchema7Definition,
      },
    },
    imports: {
      address: 'address',
    },
  },
  {
    integrationKey: 'xmtp',
    operationKey: 'sendMessageLens',
    name: 'Send a Lens DM',
    icon: 'https://chainjet.io/img/lens.png',
    schema: {
      required: ['message'],
      properties: {
        message: {
          title: 'Message',
          type: 'string',
          'x-ui:widget': 'textarea',
          description: 'Message to send',
        } as JSONSchema7Definition,
      },
    },
    imports: {
      handle: 'handle',
      address: 'handle',
    },
  },
  {
    integrationKey: 'notion',
    operationKey: 'createDatabaseItem',
    name: 'Export to Notion',
    icon: 'https://github.com/chainjet/assets/blob/master/integrations/notion.png?raw=true',
    imports: {},
  },
]

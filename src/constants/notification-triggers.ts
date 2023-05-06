import { JSONSchema7 } from 'json-schema'
import { getEtherscanNetworkSchema, getExplorerUrlForIntegration } from '../utils/blockchain.utils'
import { ChainId, NETWORK } from './networks'

export interface NotificationTrigger {
  id: string
  name: string
  description: string
  image: string
  workflowName: string
  instantTrigger?: boolean
  schema?: JSONSchema7 // if schema is not provided, it will be fetched from the integration trigger
  triggerData: (inputs: Record<string, any>) => {
    integrationKey: string
    operationKey: string
  }
  actionData: (inputs: Record<string, any>) => {
    email: {
      subject: string
      body: string
    }
    message: string
  }
  validateInputs?: (inputs: Record<string, any>) => void
}

export const notificationTriggers: NotificationTrigger[] = [
  {
    id: 'token-transfer',
    name: 'Token received on an address',
    description: 'Receive a notification every time a token is received on a given address.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/notifications/token.svg',
    workflowName: 'Send notification when a token is received',
    schema: {
      type: 'object',
      required: ['network'],
      properties: {
        network: getEtherscanNetworkSchema(),
        address: {
          title: 'Receiver address',
          description: 'Filter by receiver address',
          type: 'string',
        },
        contractaddress: {
          title: 'Token address',
          description: 'Filter by token contract address. Leave empty to get notifications for all tokens.',
          type: 'string',
        },
      },
    },
    triggerData: (inputs) => ({
      integrationKey: inputs.network,
      operationKey: 'listERC20TokenTransfers',
    }),
    actionData: (inputs) => ({
      email: inputs.address
        ? {
            subject: `New token received on ${inputs.address}`,
            body:
              `A wallet you are watching just received a token.\n\n` +
              `View it on ${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          }
        : {
            subject: `New token transfer`,
            body:
              `There was a transfer on a token you are watching.\n\n` +
              `View it on ${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          },
      message: `New token transfer:\n\n` + `${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
    }),
    validateInputs: (inputs) => {
      if (!inputs.address && !inputs.contractaddress) {
        throw new Error('Either receiver address or token address must be provided.')
      }
    },
  },
  {
    id: 'nft-transfer',
    name: 'NFT received on an address',
    description: 'Receive a notification every time a NFT is received on a given address.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/notifications/nft.svg',
    workflowName: 'Send notification when an NFT is received',
    schema: {
      type: 'object',
      required: ['network', 'nftType'],
      properties: {
        network: getEtherscanNetworkSchema(),
        nftType: {
          title: 'NFT type',
          type: 'string',
          default: 'ERC721',
          enum: ['ERC721', 'ERC1155'],
        },
        address: {
          title: 'Receiver address',
          description: 'Filter by receiver address',
          type: 'string',
        },
        contractaddress: {
          title: 'Token address',
          description: 'Filter by token contract address. Leave empty to get notifications for all NFTs.',
          type: 'string',
        },
      },
    },
    triggerData: (inputs) => ({
      integrationKey: inputs.network,
      operationKey: inputs.nftType === 'ERC1155' ? 'listERC1155TokenTransfers' : 'listERC721TokenTransfers',
    }),
    actionData: (inputs) => ({
      email: inputs.address
        ? {
            subject: `New NFT received on ${inputs.address}`,
            body:
              `A wallet you are watching just received an NFT.\n\n` +
              `View it on ${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          }
        : {
            subject: `New NFT transfer`,
            body:
              `There was a transfer on an NFT you are watching.\n\n` +
              `View it on ${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
          },
      message: `New NFT transfer:\n\n` + `${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
    }),
    validateInputs: (inputs) => {
      if (!inputs.address && !inputs.contractaddress) {
        throw new Error('Either receiver address or token address must be provided.')
      }
    },
  },
  {
    id: 'transaction',
    name: 'Transaction made on an address',
    description: 'Receive a notification every time a transaction is made on a given address.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/notifications/transaction.svg',
    workflowName: 'Send notification when a transaction occurs',
    schema: {
      type: 'object',
      required: ['network', 'address'],
      properties: {
        network: getEtherscanNetworkSchema(),
        address: {
          title: 'Receiver address',
          description: 'The address to get the transactions for',
          type: 'string',
        },
      },
    },
    triggerData: (inputs) => ({
      integrationKey: inputs.network,
      operationKey: 'listERC20TokenTransfers',
    }),
    actionData: (inputs) => ({
      email: {
        subject: `New transaction on ${inputs.address}`,
        body:
          `There was a transaction on an address you are watching.\n\n` +
          `View it on ${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
      },
      message: `New transaction:\n\n` + `${getExplorerUrlForIntegration(inputs.network)}/tx/{{trigger.hash}}`,
    }),
  },
  {
    id: 'event',
    name: 'Event emitted by a smart contract',
    description: 'Receive a notification when a smart contract emits an event.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/notifications/event.svg',
    workflowName: 'Send notification when an event is emitted',
    instantTrigger: true,
    triggerData: () => ({
      integrationKey: 'blockchain',
      operationKey: 'newEvent',
    }),
    actionData: (inputs) => ({
      email: {
        subject: `New {{trigger.eventName}} on ${inputs.address}`,
        body:
          `There was a new {{trigger.eventName}} event on an address you are watching.\n\n` +
          `View it on ${NETWORK[inputs.network as ChainId]?.explorerUrl}/tx/{{trigger.transactionHash}}`,
      },
      message:
        `New {{trigger.eventName}}:\n` +
        `${NETWORK[inputs.network as ChainId]?.explorerUrl}/tx/{{trigger.transactionHash}}`,
    }),
  },
  {
    id: 'ens-expiration',
    name: 'ENS domain is about to expire',
    description: 'Receive a notification when an ENS domain is about to expire.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/dapps/app.ens.domains.png',
    workflowName: 'ENS domain is about to expire',
    instantTrigger: true,
    triggerData: () => ({
      integrationKey: 'ens',
      operationKey: 'domainExpires',
    }),
    actionData: () => ({
      email: {
        subject: `ENS {{trigger.name}} is about to expire`,
        body: `The ENS domain {{trigger.name}} will expire on {{trigger.expiryDate}}.`,
      },
      message: `ENS {{trigger.name}} is about to expire.`,
    }),
  },
]

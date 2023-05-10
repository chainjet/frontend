import { JSONSchema7 } from 'json-schema'
import { getEtherscanNetworkSchema, getExplorerUrlForIntegration } from '../utils/blockchain.utils'
import { ChainId, NETWORK } from './networks'

export interface NotificationTrigger {
  id: string
  name: string
  description: string
  image: string
  workflowName: (inputs: Record<string, any>, signer: string | undefined) => string
  instantTrigger?: boolean
  schema?: JSONSchema7 // if schema is not provided, it will be fetched from the integration trigger
  triggerData: (
    inputs: Record<string, any>,
    signer: string | undefined,
  ) => {
    integrationKey: string
    operationKey: string
    inputs?: Record<string, any> // replace trigger inputs
  }
  actionData: (
    inputs: Record<string, any>,
    signer: string | undefined,
  ) => {
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
    name: 'Track tokens received in your wallet',
    description: 'Receive a notification every time your wallet recevies a token.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/notifications/token.svg',
    workflowName: () => 'Get a notification when you receive a token',
    schema: {
      type: 'object',
      required: ['network'],
      properties: {
        network: getEtherscanNetworkSchema(),
        contractaddress: {
          title: 'Token address',
          description: 'Filter by token contract address. Leave empty to get notifications for all tokens.',
          type: 'string',
        },
      },
    },
    triggerData: (inputs, signer) => ({
      integrationKey: inputs.network,
      operationKey: 'listERC20TokenTransfers',
      inputs: {
        ...inputs,
        address: signer,
      },
    }),
    actionData: (inputs, signer) => ({
      email: inputs.address
        ? {
            subject: `New token received on ${signer}`,
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
  },
  {
    id: 'nft-transfer',
    name: 'Track NFTs received in your wallet',
    description: 'Receive a notification every time your wallet receives an NFT.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/notifications/nft.svg',
    workflowName: () => 'Get a notification when you receive an NFT',
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
        contractaddress: {
          title: 'Token address',
          description: 'Filter by token contract address. Leave empty to get notifications for all NFTs.',
          type: 'string',
        },
      },
    },
    triggerData: (inputs, signer) => ({
      integrationKey: inputs.network,
      operationKey: inputs.nftType === 'ERC1155' ? 'listERC1155TokenTransfers' : 'listERC721TokenTransfers',
      inputs: {
        ...inputs,
        address: signer,
      },
    }),
    actionData: (inputs, signer) => ({
      email: inputs.address
        ? {
            subject: `New NFT received on ${signer}`,
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
  },
  {
    id: 'transaction',
    name: 'Track transactions made on any address',
    description: 'Receive a notification every time a transaction is made on a given address.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/notifications/transaction.svg',
    workflowName: () => 'Get a notification when a transaction occurs',
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
    name: 'Track smart contract events',
    description: 'Receive a notification when a smart contract emits an event.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/notifications/event.svg',
    workflowName: () => 'Get a notification when an event is emitted',
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
    name: 'Track ENS domain expiration',
    description: 'Receive a notification when an ENS domain is about to expire.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/dapps/app.ens.domains.png',
    workflowName: (inputs) => `Get a notification when ${inputs.name} is about to expire`,
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
  {
    id: 'mirror-new-post',
    name: 'Track new Mirror articles',
    description: 'Receive a notification when an address publishes a new article.',
    image: 'https://raw.githubusercontent.com/chainjet/assets/master/dapps/mirror.xyz.png',
    workflowName: (inputs) => `Get a notification on new Mirror articles by ${inputs.address}`,
    triggerData: () => ({
      integrationKey: 'mirror',
      operationKey: 'newPost',
    }),
    actionData: (inputs) => ({
      email: {
        subject: `${inputs.address} just published "{{trigger.title}}"`,
        body: `Hi there! ${inputs.address} just published a new article on Mirror "{{trigger.title}}".\n\n{{trigger.url}}`,
      },
      message: `New article published: "{{trigger.title}}".\n{{trigger.url}}`,
    }),
  },

  // {
  //   id: 'lens-new-mention',
  //   name: 'New mention on Lens Protocol',
  //   description: 'Receive a notification when you get mentioned on Lens Protocol.',
  //   image: 'https://chainjet.io/img/lens.png',
  //   workflowName: 'Get a notification when you get mentioned on Lens',
  //   triggerData: () => ({
  //     integrationKey: 'lens',
  //     operationKey: 'newMention',
  //   }),
  //   actionData: () => ({
  //     email: {
  //       subject: `New XMTP message by {{ trigger.senderAddress }}`,
  //       body: `You just received a new XMTP message from <b>{{trigger.senderAddress}}</b> on the conversation <b>{{trigger.conversation.link}}</b>.

  //       <b>Message received:</b>
  //       {{trigger.content}}`,
  //     },
  //     message: `New XMTP message by {{ trigger.senderAddress }}: {{trigger.content}}`,
  //   }),
  // },
  // {
  //   id: 'xmtp-new-message',
  //   name: 'New XMTP message received',
  //   description: 'Receive a notification when you get a new message on XMTP.',
  //   image: 'https://raw.githubusercontent.com/chainjet/assets/master/dapps/xmtp.org.png',
  //   workflowName: 'Get a notification when you receive a message on XMTP',
  //   triggerData: () => ({
  //     integrationKey: 'xmtp',
  //     operationKey: 'newMessage',
  //   }),
  //   actionData: () => ({
  //     email: {
  //       subject: `New XMTP message by {{ trigger.senderAddress }}`,
  //       body: `You just received a new XMTP message from <b>{{trigger.senderAddress}}</b> on the conversation <b>{{trigger.conversation.link}}</b>.

  //       <b>Message received:</b>
  //       {{trigger.content}}`,
  //     },
  //     message: `New XMTP message by {{ trigger.senderAddress }}: {{trigger.content}}`,
  //   }),
  // },
]

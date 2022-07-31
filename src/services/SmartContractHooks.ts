import { gql, useLazyQuery } from '@apollo/client'

const GET_CONTRACT_SCHEMA = gql`
  query ContractSchema($chainId: Int!, $address: String!, $type: String!) {
    contractSchema(chainId: $chainId, address: $address, type: $type) {
      id
      chainId
      address
      schema
    }
  }
`

export function useLazyGetContractSchema() {
  return useLazyQuery(GET_CONTRACT_SCHEMA)
}

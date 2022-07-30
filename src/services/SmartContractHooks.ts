import { gql, useLazyQuery } from '@apollo/client'

const GET_CONTRACT_SCHEMA = gql`
  query ContractSchema($chainId: Int!, $address: String!) {
    contractSchema(chainId: $chainId, address: $address) {
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

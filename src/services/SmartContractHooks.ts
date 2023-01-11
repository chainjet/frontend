import { gql, useLazyQuery } from '@apollo/client'

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
export function useLazyGetContractSchema() {
  return useLazyQuery(GET_CONTRACT_SCHEMA)
}

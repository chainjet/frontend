import { DocumentNode, gql, useMutation, useQuery } from '@apollo/client'
import { QueryHookOptions } from '@apollo/client/react/types/types'
import {
  AccountCredential,
  AccountCredentialConnection,
  AccountCredentialFilter,
  AccountCredentialSort,
  CreateOneAccountCredentialInput,
  DeleteOneInput,
  UpdateOneAccountCredentialInput,
} from '../../graphql'
import { QueryById, QueryMany } from '../typings/GraphQL'
import { getEntityQuery, getListEntitiesQuery } from './GraphQLHooks'

export function useGetAccountCredentialById(
  fragment: DocumentNode,
  options: QueryHookOptions<{ accountCredential: AccountCredential }, QueryById>,
) {
  const query = getEntityQuery({
    entityName: 'accountCredential',
    key: 'id',
    fragment,
  })
  return useQuery<{ accountCredential: AccountCredential }, QueryById>(query, options)
}

export function useGetAccountCredentials(
  fragment: DocumentNode,
  options: QueryHookOptions<
    { accountCredentials: AccountCredentialConnection },
    QueryMany<AccountCredentialFilter, AccountCredentialSort>
  >,
) {
  const query = getListEntitiesQuery({
    entityName: 'accountCredential',
    pluralEntityName: 'accountCredentials',
    fragment,
    options,
  })
  return useQuery<
    { accountCredentials: AccountCredentialConnection },
    QueryMany<AccountCredentialFilter, AccountCredentialSort>
  >(query, options)
}

export function useCreateOneAccountCredential() {
  const mutation = gql`
    mutation ($input: CreateOneAccountCredentialInput!) {
      createOneAccountCredential(input: $input) {
        id
      }
    }
  `
  return useMutation<{ createOneAccountCredential: AccountCredential }, { input: CreateOneAccountCredentialInput }>(
    mutation,
  )
}

export function useUpdateOneAccountCredential() {
  const mutation = gql`
    mutation ($input: UpdateOneAccountCredentialInput!) {
      updateOneAccountCredential(input: $input) {
        id
      }
    }
  `
  return useMutation<{ updateOneAccountCredential: AccountCredential }, { input: UpdateOneAccountCredentialInput }>(
    mutation,
  )
}

export function useDeleteOneAccountCredential() {
  const mutation = gql`
    mutation ($input: DeleteOneInput!) {
      deleteOneAccountCredential(input: $input) {
        id
      }
    }
  `
  return useMutation<{ deleteOneAccountCredential: AccountCredential }, { input: DeleteOneInput }>(mutation, {
    update: (cache, { data }) => {
      if (data?.deleteOneAccountCredential.id) {
        cache.evict({
          id: data.deleteOneAccountCredential.id,
        })
      }
    },
  })
}

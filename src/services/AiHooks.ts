import { gql, useMutation } from '@apollo/client'

export function useSendPrompt() {
  const mutation = gql`
    mutation sendPrompt($prompt: String!) {
      sendPrompt(prompt: $prompt) {
        id
        trigger {
          integrationId
          integrationName
          integrationLogo
          integrationAccountId
          id
          name
          description
          inputs
        }
        actions {
          integrationId
          integrationName
          integrationLogo
          id
          name
          description
          inputs
        }
      }
    }
  `
  return useMutation(mutation)
}

export function useCreateWorkflowPrompt() {
  const mutation = gql`
    mutation createWorkflowPrompt($id: String!, $credentialIds: JSONObject!) {
      createWorkflowPrompt(id: $id, credentialIds: $credentialIds) {
        id
      }
    }
  `
  return useMutation(mutation)
}

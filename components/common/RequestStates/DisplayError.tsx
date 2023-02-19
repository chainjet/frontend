import { ApolloError } from '@apollo/client'
import React from 'react'

interface Props {
  error?: ApolloError
}

export const DisplayError = ({ error }: Props) => {
  if (error?.message === 'Failed to fetch') {
    return <span>Failed to fetch. Please check your internet connection and try again.</span>
  }
  return <span>{error?.message ?? 'Unexpected error, please try again.'}</span>
}

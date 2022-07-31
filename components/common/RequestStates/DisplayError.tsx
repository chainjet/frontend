import { ApolloError } from '@apollo/client'
import React from 'react'

interface Props {
  error?: ApolloError
}

export const DisplayError = (props: Props) => {
  return <span color="red">{props.error?.message ?? 'Unexpected error, please try again.'}</span>
}

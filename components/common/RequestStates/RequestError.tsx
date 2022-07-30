import { ApolloError } from '@apollo/client'
import { useRouter } from 'next/router'
import React from 'react'
import { useEffect } from 'react'

interface Props {
  error?: ApolloError
}

export const RequestError = (props: Props) => {
  const router = useRouter()

  useEffect(() => {
    if (props.error?.message === 'Unauthorized') {
      void router.push('/login')
    }    
  }, [props.error])

  return <>{ props.error?.message ?? 'Unexpected error, please try again.' }</>
}

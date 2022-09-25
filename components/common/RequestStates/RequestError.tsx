import { ApolloError } from '@apollo/client'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { DisplayError } from './DisplayError'

interface Props {
  error?: ApolloError
}

export const RequestError = ({ error }: Props) => {
  const router = useRouter()

  useEffect(() => {
    if (error?.message === 'Unauthorized') {
      void router.push('/login')
    }
  }, [error?.message, router])

  return <DisplayError error={error} />
}

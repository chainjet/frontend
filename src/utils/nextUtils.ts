import { NextPageContext } from 'next'

export const getQueryParam = (ctx: NextPageContext, key: string): string => {
  const value = ctx.query[key]
  if (Array.isArray(value)) {
    return value[0]
  }
  return value ?? ''
}

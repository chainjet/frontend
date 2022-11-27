import { NextRouter } from 'next/router'

export function getLoginUrl(router: NextRouter) {
  return `/login?go=${router.asPath}`.replace(/&/g, '%26')
}

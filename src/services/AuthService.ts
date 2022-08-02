import { NextPageContext } from 'next'
import { parseCookies } from 'nookies'
import { User } from '../../graphql'
import { isBrowser } from '../utils/environment'

export const TOKEN_COOKIE_NAME = 'fw-token'
export const USER_COOKIE_NAME = 'fw-user'

export class AuthService {
  readonly endpoint: string

  constructor(readonly ctx?: NextPageContext) {
    this.endpoint = isBrowser ? '' : process.env.ENDPOINT!
  }

  getCookies() {
    return parseCookies(this.ctx || null)
  }

  isLoggedIn() {
    return !!this.getCookies()[USER_COOKIE_NAME]
  }

  getViewer(): User | null {
    const userJson = this.getCookies()[USER_COOKIE_NAME]
    if (userJson) {
      return JSON.parse(userJson)
    }
    return null
  }
}

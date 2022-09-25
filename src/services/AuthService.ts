import { NextPageContext } from 'next'
import { parseCookies } from 'nookies'

export const TOKEN_COOKIE_NAME = 'cj-token'

export class AuthService {
  readonly endpoint: string

  constructor(readonly ctx?: NextPageContext) {
    this.endpoint = process.env.NEXT_PUBLIC_API_ENDPOINT!
  }

  getCookies() {
    return parseCookies(this.ctx || null)
  }

  isLoggedIn() {
    return !!this.getCookies()[TOKEN_COOKIE_NAME]
  }

  getSigner(): string | undefined {
    const userJson = this.getCookies()[TOKEN_COOKIE_NAME]
    if (userJson) {
      const signerData = JSON.parse(userJson)
      return signerData.address
    }
  }
}

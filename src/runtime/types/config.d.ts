interface Rest {
  baseUrl: string
  nuxtBaseUrl: string
}

interface Graphql {
  enabled: true
  httpEndpoint: string
  wsEndpoint?: string
}

interface Authentication {
  enabled: true
  userFields?: (string | { [key: string]: string[] })[]
  cookieSecure: boolean
  enableGlobalAuthMiddleware: boolean
  refreshTokenCookieName?: string
  accessTokenCookieName?: string
  expiresCookieName?: string
  msRefreshBeforeExpires?: number
  redirect: {
    login: string
    logout: string
    home: string
    callback: string
    resetPassword: string
    requestPassword: string
  }
}

export interface PublicConfig {
  rest: Rest
  auth: Authentication | { enabled: false }
  graphql: Graphql | { enabled: false }
}

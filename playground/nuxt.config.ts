export default defineNuxtConfig({
  ssr: true,
  modules: ['../src/module'],
  directus: {
    rest: {
      baseUrl: 'http://localhost:8055',
      nuxtBaseUrl: 'http://localhost:3000'
    },
    auth: {
      enabled: true,
      msRefreshBeforeExpires: 3000,
      enableGlobalAuthMiddleware: true,
      cookieSecure: false,
      refreshTokenCookieName: 'auth_refresh_token',
      accessTokenCookieName: 'auth_token',
      expiresCookieName: 'auth_expires',
      loggedInFlagName: 'auth_logged_in',
      userFields: [
        'id',
        'avatar',
        'dealer',
        'email',
        'first_name',
        'last_name',
        'phone',
        'title',
        'role',
        'last_access',
        'status',
        'description',
        { dealer: ['name', 'number'] },
        { role: ['id', 'name'] }
      ],
      redirect: {
        home: '/',
        login: '/auth/login',
        logout: '/auth/login',
        requestPassword: '/auth/request-password',
        resetPassword: '/auth/reset-password',
        callback: '/auth/callback'
      }
    }
  },
  devtools: { enabled: false }
})

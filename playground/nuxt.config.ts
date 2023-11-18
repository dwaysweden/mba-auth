export default defineNuxtConfig({
  ssr: true,
  modules: ['../src/module'],
  directus: {
    rest: {
      baseUrl: 'http://albyhills.test/Api',
      nuxtBaseUrl: 'http://albyhills.test'
    },
    auth: {
      enabled: true,
      enableGlobalAuthMiddleware: true,
      userFields: ['*'],
      cookieSecure: false,
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

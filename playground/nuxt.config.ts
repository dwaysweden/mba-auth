export default defineNuxtConfig({
  ssr: true,
  modules: ['../src/module'],
  directus: {
    rest: {
      baseUrl: 'https://albyhills.test/Api',
      nuxtBaseUrl: 'https://albyhills.test'
    },
    auth: {
      enabled: true,
      enableGlobalAuthMiddleware: true,
      userFields: ['*'],
      cookieSecure: true,
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

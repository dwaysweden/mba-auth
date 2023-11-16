export default defineNuxtConfig({
  ssr: true,
  modules: ['../src/module'],
  directus: {
    rest: {
      baseUrl: 'http://127.0.0.1:8055',
      nuxtBaseUrl: 'http://127.0.0.1:3000'
    },
    auth: {
      enabled: true,
      enableGlobalAuthMiddleware: true,
      userFields: ['*'],
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

import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin({
  enforce: 'pre',
  hooks: {
    'directus:loggedIn': (state) => {
      // eslint-disable-next-line no-console
      console.log('AUTH LOGGED IN', state)
    }
  }
})

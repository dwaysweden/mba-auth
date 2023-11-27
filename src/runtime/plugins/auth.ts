import common from '../middleware/common'
import auth from '../middleware/auth'
import guest from '../middleware/guest'
import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useRuntimeConfig,
  useState,
  useDirectusAuth,
  useDirectusSession,
  useNuxtApp
} from '#imports'

// Hjälpfunktion för att hämta användare och sätta loggedIn-status
async function fetchUserAndSetLoggedIn() {
  const { _loggedIn, _refreshToken, _accessToken, refresh } =
    useDirectusSession()

  if (_accessToken.get()) {
    await useDirectusAuth().fetchUser()
    await refresh()
  } else {
    const isLoggedIn = _loggedIn.get() === 'true'
    if (isLoggedIn || _refreshToken.get()) {
      await refresh()
      if (_accessToken.get()) {
        await useDirectusAuth().fetchUser()
      }
    }
  }
}

export default defineNuxtPlugin(async () => {
  try {
    const config = useRuntimeConfig().public.directus

    addRouteMiddleware('common', common, { global: true })
    addRouteMiddleware('auth', auth, {
      global: config.auth.enableGlobalAuthMiddleware
    })
    addRouteMiddleware('guest', guest)

    const initialized = useState('auth-initialized', () => false)

    if (initialized.value === false) {
      await fetchUserAndSetLoggedIn()
      initialized.value = true
    }

    const { _loggedIn } = useDirectusSession()
    const { user } = useDirectusAuth()
    const nuxtApp = useNuxtApp()

    if (user.value) {
      _loggedIn.set(true)
      await nuxtApp.callHook('auth:loggedIn', true)
    } else {
      _loggedIn.set(false)
    }

    nuxtApp.hook('app:mounted', () => {
      const channel = nuxtApp.$directus.channel

      if (channel) {
        channel.onmessage = (event) => {
          if (event.data === 'logout' && user.value) {
            useDirectusAuth()._onLogout()
          }
        }
      }
    })
  } catch (e) {
    // Hantera fel
    // console.error(e)
  }
})

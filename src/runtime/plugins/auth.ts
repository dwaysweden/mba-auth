import common from '../middleware/common'
import auth from '../middleware/auth'
import guest from '../middleware/guest'
import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useRuntimeConfig,
  useState,
  useDirectusAuth,
  useRoute,
  useDirectusSession,
  useCookie,
  watch
} from '#imports'

export default defineNuxtPlugin(async (nuxtApp) => {
  try {
    const config = useRuntimeConfig().public.directus

    addRouteMiddleware('common', common, { global: true })

    addRouteMiddleware('auth', auth, {
      global: config.auth.enableGlobalAuthMiddleware
    })

    addRouteMiddleware('guest', guest)

    const initialized = useState('auth-initialized', () => false)

    const { _loggedIn, _refreshToken, _accessToken, refresh } =
      useDirectusSession()

    if (initialized.value === false) {
      const { path } = useRoute()

      const { fetchUser } = useDirectusAuth()

      if (_accessToken.get()) {
        await fetchUser()
      } else {
        const isCallback = path === config.auth.redirect.callback
        const isLoggedIn = _loggedIn.get() === 'true'

        if (isCallback || isLoggedIn || _refreshToken.get()) {
          await refresh()
          if (_accessToken.get()) {
            await fetchUser()
          }
        }
      }
    }

    initialized.value = true

    const { user } = useDirectusAuth()

    if (user.value) {
      _loggedIn.set(true)
      await nuxtApp.callHook('auth:loggedIn', true)
    } else {
      _loggedIn.set(false)
    }

    nuxtApp.hook('app:mounted', () => {
      const { _onLogout, user } = useDirectusAuth()
      const accessTokenCookie = useCookie(config.auth.accessTokenCookieName)

      watch(accessTokenCookie, (newValue, oldValue) => {
        if (user.value && !newValue && oldValue) {
          _onLogout()
        }
      })
    })
  } catch (e) {
    // console.error(e)
  }
})

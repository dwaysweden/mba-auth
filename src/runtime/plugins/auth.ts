import type { DirectusUser } from '@directus/sdk'
import common from '../middleware/common'
import auth from '../middleware/auth'
import guest from '../middleware/guest'
import type { Ref } from '#imports'
import {
  defineNuxtPlugin,
  addRouteMiddleware,
  useRuntimeConfig,
  useState,
  useDirectusAuth,
  useDirectusSession,
  useCookie,
  watchEffect,
  computed
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

// Hjälpfunktion för att hantera accessTokenCookie-ändringar
function handleAccessTokenCookieChange(
  newValue: string | undefined,
  oldValue: string | undefined,
  user: Ref<Readonly<DirectusUser<DirectusSchema> | null>>,
  _onLogout: () => void
): void {
  if (user.value && !newValue && oldValue) {
    _onLogout()
  }
}

export default defineNuxtPlugin(async (nuxtApp) => {
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
    const { user, _onLogout } = useDirectusAuth()

    if (user.value) {
      _loggedIn.set(true)
      await nuxtApp.callHook('auth:loggedIn', true)
    } else {
      _loggedIn.set(false)
    }

    const accessTokenCookie = useCookie(config.auth.accessTokenCookieName)

    const accessTokenCookieRef = computed(
      () => accessTokenCookie.value || undefined
    )

    watchEffect(() => {
      handleAccessTokenCookieChange(
        accessTokenCookieRef.value,
        undefined,
        user,
        _onLogout
      )
    })
  } catch (e) {
    // Hantera fel
    // console.error(e)
  }
})

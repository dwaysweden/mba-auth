import { readMe, passwordRequest, passwordReset } from '@directus/sdk'
import { joinURL, withQuery } from 'ufo'
import type { DirectusUser } from '@directus/sdk'
import type { AuthenticationData } from '../types'
import {
  useState,
  useRuntimeConfig,
  useDirectusRest,
  useRoute,
  navigateTo,
  clearNuxtData,
  useDirectusSession,
  useNuxtApp
} from '#imports'

import type { Ref } from '#imports'

export function useDirectusAuth<DirectusSchema extends object>() {
  const user: Ref<Readonly<DirectusUser<DirectusSchema> | null>> = useState(
    'directus-user',
    () => null
  )

  const config = useRuntimeConfig().public.directus

  const { _accessToken, _expires, _loggedIn } = useDirectusSession()

  async function login(email: string, password: string, otp?: string) {
    const { data } = await $fetch<AuthenticationData>('/auth/login', {
      baseURL: config.rest.baseUrl,
      method: 'POST',
      credentials: 'include',
      body: {
        mode: 'cookie',
        email,
        password,
        otp
      }
    })

    await _onLogin(data.access_token, data.expires)
  }

  async function logout() {
    await $fetch('/auth/logout', {
      baseURL: config.rest.baseUrl,
      method: 'POST',
      credentials: 'include'
    }).finally(_onLogout)
  }

  async function fetchUser() {
    // @ts-ignore
    const fields = config.auth.userFields || ['*']
    try {
      // @ts-ignore
      user.value = await useDirectusRest(readMe({ fields }))
    } catch (error) {
      user.value = null
    }
  }

  function loginWithProvider(provider: string) {
    const route = useRoute()
    const returnToPath = route.query.redirect?.toString()
    let redirectUrl = getRedirectUrl(config.auth.redirect.callback)

    if (returnToPath) {
      redirectUrl = withQuery(redirectUrl, { redirect: returnToPath })
    }

    if (process.client) {
      const url = withQuery(
        joinURL(config.rest.baseUrl, '/auth/login', provider),
        {
          redirect: redirectUrl
        }
      )

      window.location.replace(url)
    }
  }

  function requestPasswordReset(email: string) {
    const resetUrl = getRedirectUrl(config.auth.redirect.resetPassword)
    return useDirectusRest(passwordRequest(email, resetUrl))
  }

  function resetPassword(password: string) {
    const route = useRoute()
    const token = route.query.token as string

    return useDirectusRest(passwordReset(token, password))
  }

  function getRedirectUrl(path: string) {
    return joinURL(config.rest.nuxtBaseUrl, path)
  }

  async function _onLogin(accessToken: string, expires: number) {
    _accessToken.set(accessToken)
    _expires.set(expires)
    await fetchUser()
    if (user.value === null) {
      return
    }
    const route = useRoute()
    const { callHook } = useNuxtApp()
    const returnToPath = route.query.redirect?.toString()
    const redirectTo = returnToPath ?? config.auth.redirect.home
    _loggedIn.set(true)
    await callHook('auth:loggedIn', true)
    await navigateTo(redirectTo)
  }

  async function _onLogout() {
    if (user.value === null) {
      return
    }
    const { callHook } = useNuxtApp()
    await callHook('auth:loggedIn', false)
    user.value = null
    _accessToken.clear()
    _expires.clear()
    _loggedIn.set(false)
    clearNuxtData()
    await navigateTo(config.auth.redirect.logout)
  }

  return {
    login,
    logout,
    fetchUser,
    loginWithProvider,
    requestPasswordReset,
    resetPassword,
    _onLogout,
    _onLogin,
    user
  }
}

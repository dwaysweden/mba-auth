import { jwtDecode } from 'jwt-decode'
import {
  deleteCookie,
  getCookie,
  splitCookiesString,
  appendResponseHeader
} from 'h3'

import type { AuthenticationData } from '../types'
import {
  useRequestEvent,
  useRuntimeConfig,
  useState,
  useCookie,
  useRequestHeaders,
  clearNuxtData,
  navigateTo
} from '#imports'

export default function () {
  const event = useRequestEvent()
  const config = useRuntimeConfig().public.directus

  const accessTokenCookieName = config.auth.accessTokenCookieName
  const refreshTokenCookieName = config.auth.refreshTokenCookieName
  const msRefreshBeforeExpires = config.auth.msRefreshBeforeExpires
  const expiresCookieName = config.auth.expiresCookieName
  const loggedInName = 'auth_logged_in'

  const accessTokenCookie = useCookie(accessTokenCookieName, {
    sameSite: 'lax',
    secure: config.auth.cookieSecure ?? true
  })

  const expiresCookie = useCookie(expiresCookieName, {
    sameSite: 'lax',
    secure: config.auth.cookieSecure ?? true
  })

  const _accessToken = {
    get: () =>
      process.server
        ? event.context[accessTokenCookieName] || accessTokenCookie.value
        : accessTokenCookie.value,
    set: (value: string) => {
      if (process.server) {
        event.context[accessTokenCookieName] = value
      }
      accessTokenCookie.value = value
    },
    clear: () => {
      if (process.server) {
        deleteCookie(event, accessTokenCookieName)
      } else {
        accessTokenCookie.value = null
      }
    }
  }

  const _expires = {
    get: () =>
      process.server
        ? event.context[expiresCookieName] || expiresCookie.value
        : expiresCookie.value,
    set: (value: number) => {
      if (process.server) {
        event.context[expiresCookieName] = value.toString()
      }
      expiresCookie.value = value.toString()
    },
    clear: () => {
      if (process.server) {
        deleteCookie(event, expiresCookieName)
      } else {
        expiresCookie.value = null
      }
    }
  }

  const _refreshToken = {
    get: () => process.server && getCookie(event, refreshTokenCookieName),
    clear: () => process.server && deleteCookie(event, refreshTokenCookieName)
  }

  const _loggedIn = {
    get: () => process.client && localStorage.getItem(loggedInName),
    set: (value: boolean) =>
      process.client && localStorage.setItem(loggedInName, value.toString())
  }

  const refresh = async () => {
    const isRefreshOn = useState('auth-refresh-loading', () => false)
    const user = useState('user')

    if (isRefreshOn.value) {
      return
    }

    isRefreshOn.value = true

    const cookie = useRequestHeaders(['cookie']).cookie || ''

    try {
      const res = await $fetch.raw<AuthenticationData>('/auth/refresh', {
        baseURL: config.rest.baseUrl,
        method: 'POST',
        credentials: 'include',
        body: {
          mode: 'cookie'
        },
        headers: {
          cookie
        }
      })

      const setCookie = res.headers.get('set-cookie') || ''
      const cookies = splitCookiesString(setCookie)
      for (const cookie of cookies) {
        appendResponseHeader(event, 'set-cookie', cookie)
      }

      if (res._data) {
        _accessToken.set(res._data?.data.access_token)
        _expires.set(res._data?.data.expires)
        _loggedIn.set(true)
      }

      isRefreshOn.value = false
      return res
    } catch (e) {
      isRefreshOn.value = false
      _accessToken.clear()
      _expires.clear()
      _loggedIn.set(false)
      user.value = null
      clearNuxtData()

      if (process.client) {
        await navigateTo(config.auth.redirect.logout)
      }
    }
  }

  async function getToken(): Promise<string | null | undefined> {
    const accessToken = _accessToken.get()

    if (accessToken && isTokenExpired(accessToken)) {
      await refresh()
    }

    return _accessToken.get()
  }

  function isTokenExpired(token: string) {
    const decoded = jwtDecode(token) as { exp: number }
    const expires = decoded.exp * 1000 - msRefreshBeforeExpires
    return expires < Date.now()
  }

  return { refresh, getToken, _accessToken, _refreshToken, _loggedIn, _expires }
}

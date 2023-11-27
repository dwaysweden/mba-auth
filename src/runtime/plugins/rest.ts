import { createDirectus, rest } from '@directus/sdk'
import {
  defineNuxtPlugin,
  useRuntimeConfig,
  useDirectusSession
} from '#imports'

export default defineNuxtPlugin(() => {
  const channel =
    typeof BroadcastChannel === 'undefined'
      ? null
      : new BroadcastChannel('auth-mba')

  const config = useRuntimeConfig().public.directus

  const directus = createDirectus<DirectusSchema>(config.rest.baseUrl)

  const restClient = directus.with(
    rest({
      onRequest: async (request) => {
        if (config.auth.enabled) {
          const { getToken } = useDirectusSession()

          const accessToken = await getToken()

          if (accessToken) {
            request.headers = {
              ...request.headers,
              authorization: `Bearer ${accessToken}`
            }
          }
        }

        return request
      }
    })
  )

  return {
    provide: {
      directus: {
        rest: restClient,
        channel
      }
    }
  }
})

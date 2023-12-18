import {
  defineNuxtRouteMiddleware,
  useRuntimeConfig,
  navigateTo,
  useDirectusAuth
} from '#imports'

export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig().public.directus

  if (
    to.path === config.auth.redirect.login ||
    to.path === config.auth.redirect.callback ||
    to.path === config.auth.redirect.requestPassword ||
    to.path === config.auth.redirect.resetPassword
  ) {
    return
  }

  if (config.auth.enableGlobalAuthMiddleware === true) {
    if (to.meta.auth === false) {
      return
    }
  }

  const { user } = useDirectusAuth()

  if (!user.value) {
    return navigateTo({
      path: config.auth.redirect.login,
      query: { redirect: to.path }
    })
  }
})

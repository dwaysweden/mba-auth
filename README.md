# mba-auth

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]
[![Nuxt][nuxt-src]][nuxt-href]

New Nuxt module for authentication between nuxt and directus.

- [✨ &nbsp;Release Notes](/CHANGELOG.md)
  <!-- - [🏀 Online playground](https://stackblitz.com/github/your-org/my-module?file=playground%2Fapp.vue) -->
  <!-- - [📖 &nbsp;Documentation](https://example.com) -->

## Features

<!-- Highlight some of the features your module provide here -->

- 🔒 Authentication
- 🔁 Rest/GraphQL

## Quick Setup

1. Add `@digitalway/mba-auth` dependency to your project

```bash
# Using pnpm
pnpm add -D @digitalway/mba-auth

# Using yarn
yarn add --dev @digitalway/mba-auth

# Using npm
npm install --save-dev @digitalway/mba-auth
```

2. Add `@digitalway/mba-auth` to the `modules` section of `nuxt.config.ts`

```js
export default defineNuxtConfig({
  modules: ['@digitalway/mba-auth']
})
```

That's it! You can now use mba-auth in your Nuxt app ✨

## Development

#### TO MAKE IT WORK WITH SELF-SIGNED CERTIFICATED YOU NEED TO ADD NODE_TLS_REJECT_UNAUTHORIZED='0' IN YOUR NUXT .ENV FILE DONT FORGET TO REMOVE THIS IN PRODUCTION.

```bash
# Install dependencies
npm install

# Generate type stubs
npm run dev:prepare

# Develop with the playground
npm run dev

# Build the playground
npm run dev:build

# Run ESLint
npm run lint

# Run Vitest
npm run test
npm run test:watch

# Release new version
npm run release
```

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/my-module/latest.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-version-href]: https://npmjs.com/package/my-module
[npm-downloads-src]: https://img.shields.io/npm/dm/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D
[npm-downloads-href]: https://npmjs.com/package/my-module
[license-src]: https://img.shields.io/npm/l/my-module.svg?style=flat&colorA=18181B&colorB=28CF8D
[license-href]: https://npmjs.com/package/my-module
[nuxt-src]: https://img.shields.io/badge/Nuxt-18181B?logo=nuxt.js
[nuxt-href]: https://nuxt.com

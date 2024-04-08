// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  ssr: false,
  ui: {
    icons: ['heroicons', 'ic'],
  },
});
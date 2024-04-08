// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  ssr: false,
  app: {
    head: {
      title: 'Kassenbuch',
    },
  },
  ui: {
    icons: ['heroicons', 'ic'],
  },
});

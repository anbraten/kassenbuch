<template>
  <div
    class="flex flex-col min-h-screen w-full bg-gradient-to-tl from-stone-200 to-stone-100 dark:from-neutral-950 dark:to-neutral-900"
  >
    <UHorizontalNavigation
      :links="links"
      class="bg-white dark:bg-neutral-950 border-b border-gray-200 dark:border-gray-800 print:hidden"
    />

    <main
      class="flex p-4 m-2 bg-white shadow dark:shadow-none lg:p-6 dark:bg-neutral-950 w-full rounded-xl dark:rounded-none dark:m-0 print:p-0 print:w-full print:shadow-none print:bg-transparent print:rounded-none"
    >
      <slot />
    </main>

    <UNotifications />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

const links = computed(() => [
  {
    label: 'Kassenbücher',
    icon: 'i-heroicons-book-open',
    to: '/',
  },
  // {
  //   label: 'Neues Kassenbuch',
  //   icon: 'i-heroicons-plus',
  //   to: '/book/create',
  // },
  {
    label: '',
    icon: colorMode.value === 'dark' ? 'i-heroicons-moon-20-solid' : 'i-heroicons-sun-20-solid',
    click() {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
    },
  },
]);
</script>

<style>
* {
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

@media print {
  #nuxt-devtools-container {
    display: none;
  }
}
</style>

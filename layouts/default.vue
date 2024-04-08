<template>
  <div
    class="flex flex-col min-h-screen w-full lg:flex-row bg-gradient-to-tl from-stone-200 to-stone-100 dark:from-neutral-950 dark:to-neutral-900"
  >
    <main
      class="flex p-4 m-2 bg-white shadow dark:shadow-none lg:p-6 dark:bg-neutral-950 w-full rounded-xl dark:rounded-none dark:m-0 print:p-0 print:w-full print:shadow-none print:bg-transparent print:rounded-none"
    >
      <slot />
    </main>

    <UNotifications />
  </div>
</template>

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

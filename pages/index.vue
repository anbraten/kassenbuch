<template>
  <div class="flex flex-col w-full">
    <div class="flex">
      <h1 class="text-2xl mb-4">Kassenbücher</h1>

      <div class="flex gap-2 ml-auto items-start">
        <UButton icon="i-heroicons-plus" label="Neues Kassenbuch" to="/book/create" />
        <UButton icon="i-heroicons-cloud-arrow-up-16-solid" label="Kassenbuch importieren" to="/book/import" />
      </div>
    </div>

    <UTable :rows="books" :columns="bookColumns" @select="selectBook" />
  </div>
</template>

<script setup lang="ts">
const db = await useDb();

const books = await db.books.toArray();

const bookColumns = [
  // {
  //   key: 'id',
  //   label: 'ID',
  // },
  {
    key: 'name',
    label: 'Name',
  },
];

async function selectBook(row: Book) {
  await navigateTo(`/book/${row.id}`);
}
</script>

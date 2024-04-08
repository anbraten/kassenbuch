<template>
  <div class="flex flex-col w-full">
    <h1 class="text-2xl mb-4">Kassenbücher</h1>

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

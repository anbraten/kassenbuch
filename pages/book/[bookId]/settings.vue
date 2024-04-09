<template>
  <div v-if="book" class="w-full">
    <div class="flex mb-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl">{{ book.name }} - Einstellungen</h1>
      </div>
    </div>

    <div class="flex flex-col items-start gap-2">
      <UButton icon="i-heroicons-arrow-down-tray" label="Kassenbuch exportieren" @click="exportBook" />
      <UButton icon="i-heroicons-trash" color="red" label="Kassenbuch löschen" @click="removeBook" />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
const db = await useDb();

const bookId = parseInt(route.params.bookId as string);
const book = await db.books.get(bookId);

useHead({
  title: computed(() => `Kassenbuch: ${book?.name}`),
});

async function exportBook() {
  if (!book) return;

  const entries = await db.entries.where({ bookId }).toArray();
  const bookData = {
    book,
    entries,
  };

  const blob = new Blob([JSON.stringify(bookData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `kassenbuch-${book.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function removeBook() {
  if (!book) return;

  if (confirm(`Möchtest du das Kassenbuch "${book.name}" wirklich löschen?`)) {
    await db.books.delete(bookId);
    await db.entries.where({ bookId }).delete();
    await navigateTo('/');
  }
}
</script>

<template>
  <div class="flex w-full items-start justify-center">
    <UCard>
      <h1 class="text-2xl mb-4">Kassenbuch importieren</h1>

      <UInput v-if="!bookData" type="file" accept="kassenbuch-*.json" @change="importBook" />

      <form v-else @submit.prevent="createBook" class="flex flex-col gap-4">
        <UFormGroup label="Name" name="name" required>
          <UInput v-model="book.name" required />
        </UFormGroup>

        <UButton type="submit">Kassenbuch importieren</UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const db = await useDb();

const book = reactive({
  name: '',
});

const bookData = ref<{
  book: Book;
  entries: Entry[];
}>();

async function importBook(file: FileList | null) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async (event) => {
    bookData.value = JSON.parse(event.target?.result as string);
    if (bookData.value) {
      book.name = bookData.value?.book.name;
    }
  };
  reader.readAsText(file[0]);
}

async function createBook() {
  if (!bookData.value) return;

  const id = await db.books.add({
    ...bookData.value.book,
    id: undefined,
    name: book.name,
  });

  if (bookData.value.entries.length > 0) {
    await db.entries.bulkAdd(bookData.value.entries.map((entry) => ({ ...entry, id: undefined, bookId: id })));
  }

  await navigateTo(`/book/${id}`);
}
</script>

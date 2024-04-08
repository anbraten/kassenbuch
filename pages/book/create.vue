<template>
  <div class="flex w-full items-start justify-center">
    <UCard>
      <h1 class="text-2xl mb-4">Neues Kassenbuch</h1>
      <form @submit.prevent="createBook" class="flex flex-col gap-4">
        <UFormGroup label="Name" name="name" required>
          <UInput v-model="book.name" required />
        </UFormGroup>

        <UFormGroup label="Anfangssaldo" name="startAmount" required>
          <UInput v-model="book.startAmount" type="number" required />
        </UFormGroup>

        <UButton type="submit">Kassenbuch erstellen</UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const db = await useDb();

const book = reactive({
  name: '',
  startAmount: 0,
});

async function createBook() {
  const id = await db.books.add({
    name: book.name,
    startAmount: 0,
  });

  await navigateTo(`/book/${id}`);
}
</script>

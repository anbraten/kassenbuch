<template>
  <div v-if="book" class="w-full flex flex-col">
    <div class="flex mb-4 gap-2 items-start">
      <UButton icon="i-heroicons-arrow-left" :to="`/book/${book.id}`" />
      <h1 class="text-2xl">{{ book.name }} - Belegsammler</h1>
    </div>

    <div v-if="!image" class="w-full max-w-96 mx-auto">
      <ImageCapture :capture="capture" @update:capture="capture = false" @file="saveFile" />
    </div>
    <div v-else>
      <form @submit.prevent="saveEntry" class="flex flex-col gap-2 max-w-96 mx-auto items-start">
        <img :src="imageData" class="w-full rounded-md" />

        <UButton icon="i-heroicons-arrow-uturn-left" class="ml-auto" @click="resetForm" />

        <UInput v-model="newEntry.date" type="date" required class="w-full" placeholder="Tag" autofocus />

        <UInput v-model="newEntry.amount" type="number" required class="w-full" placeholder="Betrag" step="0.01">
          <template #trailing>
            <span class="text-gray-500 dark:text-gray-400">€</span>
          </template>
        </UInput>

        <UInputMenu
          v-model="newEntry.description"
          v-model:query="descriptionQuery"
          :options="descriptionSuggestions"
          placeholder="Beschreibung"
          class="w-full"
          required
        />

        <UButton type="submit" class="mx-auto mt-2">Eintrag speichern</UButton>
      </form>
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

const { data: allEntries, refresh: refreshEntires } = await useAsyncData(() => db.entries.where({ bookId }).toArray());

const image = ref<File>();
const imageData = ref<string>();
const capture = ref(true);
async function saveFile(file: File) {
  image.value = file;

  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => {
    imageData.value = reader.result as string;
    capture.value = false;
  };
}

const newEntry = reactive({
  amount: 0,
  date: new Date().toISOString().split('T')[0],
  description: '',
});

const descriptionQuery = ref('');
const descriptionSuggestions = computed(() => {
  const descriptions = allEntries.value?.map((x) => x.description) ?? [];
  descriptions.push(descriptionQuery.value);
  return Array.from(new Set(descriptions)).filter((x) => x !== '');
});

function resetForm() {
  // start capturing next image
  capture.value = true;

  image.value = undefined;
  imageData.value = undefined;
  newEntry.amount = 0;
  newEntry.description = '';
}

async function saveEntry() {
  if (!image.value) {
    return;
  }

  const opfsRoot = await navigator.storage.getDirectory();
  const fileName = `attachment-${bookId}-${Date.now()}`;
  const fileHandle = await opfsRoot.getFileHandle(fileName, {
    create: true,
  });

  const writable = await fileHandle.createWritable();
  await writable.write(image.value);
  await writable.close();

  await db.entries.add({
    bookId,
    amount: newEntry.amount,
    date: new Date(newEntry.date),
    description: newEntry.description,
    attachmentUrl: fileName,
  });

  await refreshEntires();

  resetForm();
}
</script>

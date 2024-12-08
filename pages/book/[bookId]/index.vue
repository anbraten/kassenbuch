<template>
  <div v-if="book" class="w-full">
    <div class="flex mb-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl">{{ book.name }} - {{ months[selectedMonth] }} {{ selectedYear }}</h1>

        <div class="flex gap-1">
          <span>Anfangssaldo:</span>
          <span>{{ startAmountMonth !== undefined ? formatAmount(startAmountMonth) : '---' }}</span>
        </div>

        <div class="flex gap-1">
          <span>Endsaldo:</span>
          <span>{{ endAmountMonth !== undefined ? formatAmount(endAmountMonth) : '---' }}</span>
        </div>
      </div>

      <div class="flex ml-auto items-start print:hidden gap-2">
        <UButton icon="i-heroicons-printer" @click="print" />
        <UButton icon="i-heroicons-adjustments-vertical-solid" :to="`/book/${book.id}/settings`" />
        <UButton icon="i-heroicons-rocket-launch-solid" :to="`/book/${book.id}/rocket`" />
      </div>
    </div>

    <UTabs :items="monthTabs" v-model="selectedMonth" class="w-full print:hidden" />

    <div class="flex flex-col w-full">
      <div class="flex w-full border-b-2 border-stone-200 dark:border-gray-800">
        <div class="w-1/12 p-2 print:border-r">lfd. Nr.</div>
        <div class="w-1/12 p-2 print:border-r">Datum</div>
        <div class="w-3/12 p-2 flex flex-col print:border-r">
          <span class="mx-auto">Betrag</span>
          <div class="flex gap-2 justify-between">
            <span class="text-green-500">Einnahmen</span>
            <span class="text-red-500">Ausgaben</span>
          </div>
        </div>
        <div class="w-1/12 p-2 hidden print:flex print:border-r">Gegen-Konto</div>
        <div class="w-5/12 p-2">Beschreibung</div>
        <div class="w-1/12 p-2 print:hidden" />
      </div>

      <form
        v-for="(entry, i) in entries"
        :key="entry.id"
        class="flex w-full border-b dark:border-gray-800"
        :data-id="entry.id"
        :ref="(el) => selectedEntry?.id === entry.id && (entryRef = el as HTMLElement)"
        @click="selectEntry(entry)"
        @submit.prevent="submitSaveEntry"
      >
        <div class="w-1/12 p-2 print:py-0 flex items-center gap-2 print:border-r">
          <!-- <div class="print:hidden flex items-center cursor-grab handle">
            <UIcon name="i-ic-baseline-drag-indicator" />
          </div> -->
          <span>{{ i + 1 }}</span>
        </div>
        <div class="w-1/12 p-2 print:py-0 flex items-center print:border-r">
          <span
            class="print:block"
            :class="{
              hidden: selectedEntry.id === entry.id,
            }"
            >{{ formatDate(entry.date) }}</span
          >
          <UInput
            v-if="selectedEntry.id === entry.id"
            v-model="selectedEntry.date"
            type="number"
            class="w-full print:hidden"
            required
            placeholder="Tag"
            autofocus
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400"
                >.{{ (selectedMonth + 1).toString().padStart(2, '0') }}.{{ selectedYear }}</span
              >
            </template>
          </UInput>
        </div>
        <div
          class="w-3/12 p-2 print:py-0 flex items-center print:border-r"
          :class="{
            'text-red-500 justify-end': entry.amount < 0,
            'text-green-500': entry.amount >= 0,
          }"
        >
          <span
            class="print:block"
            :class="{
              hidden: selectedEntry.id === entry.id,
            }"
            >{{ formatAmount(entry.amount) }}</span
          >
          <UInput
            v-if="selectedEntry.id === entry.id"
            v-model="selectedEntry.amount"
            type="number"
            class="w-full print:hidden"
            step="0.01"
            required
            placeholder="Betrag"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400">€</span>
            </template>
          </UInput>
        </div>
        <div class="w-1/12 p-2 print:py-0 hidden print:flex items-center print:border-r" />
        <div class="w-5/12 p-2 print:py-0 flex items-center">
          <span
            class="print:block"
            :class="{
              hidden: selectedEntry.id === entry.id,
            }"
            >{{ entry.description }}</span
          >
          <UInputMenu
            v-if="selectedEntry.id === entry.id"
            v-model="selectedEntry.description"
            v-model:query="descriptionQuery"
            :options="descriptionSuggestions"
            class="w-full print:hidden"
            required
            placeholder="Beschreibung"
          />
        </div>
        <div class="w-1/12 p-2 print:p-0 flex items-center ml-auto print:hidden justify-end gap-2">
          <template v-if="selectedEntry.id === entry.id">
            <UButton type="submit" class="hidden" />
            <!-- <UButton icon="i-heroicons-document-arrow-up" @click="uploadEntryAttachment(entry)" />
            <UButton icon="i-heroicons-camera" @click="captureAttachmentFor = entry" />
            <UButton
              v-if="entry.attachmentUrl"
              icon="i-heroicons-document-arrow-up"
              color="red"
              @click="deleteEntryAttachment(entry)"
            />
            <UButton icon="i-heroicons-trash" color="red" @click="deleteEntry(entry)" /> -->
          </template>
          <UButton v-if="entry.attachmentUrl" icon="i-heroicons-document" @click.stop="loadEntryAttachment(entry)" />
          <UDropdown :items="getEditEntryItems(entry)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-horizontal-20-solid" />
          </UDropdown>
        </div>
      </form>

      <div v-if="entries?.length === 0" class="flex justify-center">
        <div class="flex p-2">Keine Einträge vorhanden.</div>
      </div>

      <form class="flex gap-2 w-full mt-2 print:hidden" @submit.prevent="addEntry">
        <div class="w-1/12 flex items-center gap-2">
          <span>{{ (entries?.length ?? 0) + 1 }}</span>
        </div>

        <div class="w-1/12">
          <UInput v-model="newItem.day" type="number" required placeholder="Tag" autofocus>
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400"
                >.{{ (selectedMonth + 1).toString().padStart(2, '0') }}.{{ selectedYear }}</span
              >
            </template>
          </UInput>
        </div>
        <div class="w-3/12">
          <UInput v-model="newItem.amount" type="number" required placeholder="Betrag" step="0.01">
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400">€</span>
            </template>
          </UInput>
        </div>
        <div class="w-6/12">
          <UInputMenu
            v-model="newItem.description"
            v-model:query="descriptionQuery"
            :options="descriptionSuggestions"
            placeholder="Beschreibung"
            required
          />
        </div>
        <div class="w-1/12 ml-auto flex justify-end items-center">
          <UButton type="submit" icon="i-heroicons-plus" />
        </div>
      </form>
    </div>

    <UModal :model-value="!!entryAttachmentData" @update:model-value="entryAttachmentData = undefined">
      <div class="p-4">
        <img :src="entryAttachmentData" class="w-full h-auto rounded-md" />
      </div>
    </UModal>

    <UModal :model-value="!!captureAttachmentFor" @update:model-value="captureAttachmentFor = undefined">
      <ImageCapture
        :capture="!!captureAttachmentFor"
        @update:capture="captureAttachmentFor = undefined"
        @file="(file) => saveEntryAttachment(captureAttachmentFor!, file)"
      />
    </UModal>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';
import { onClickOutside, useFileDialog } from '@vueuse/core';

const route = useRoute();
const db = await useDb();

const months = [
  'Januar',
  'Februar',
  'März',
  'April',
  'Mai',
  'Juni',
  'Juli',
  'August',
  'September',
  'Oktober',
  'November',
  'Dezember',
];
const selectedMonth = ref(0);
const selectedYear = ref(2024);

const selectedEntry = reactive<{
  id?: number;
  date?: number;
  amount?: number;
  description?: string;
}>({});
function selectEntry(entry?: Entry) {
  if (!entry) {
    selectedEntry.id = undefined;
    selectedEntry.date = undefined;
    selectedEntry.amount = undefined;
    selectedEntry.description = undefined;
    return;
  }

  if (selectedEntry.id === entry.id) {
    return;
  }

  selectedEntry.id = entry.id;
  selectedEntry.date = dayjs(entry.date).date();
  selectedEntry.amount = entry.amount;
  selectedEntry.description = entry.description;
}

const lastDay = computed(() => entries.value?.reduce((acc, entry) => Math.max(acc, dayjs(entry.date).date()), 1) ?? 1);

watch(selectedMonth, () => {
  newItem.day = lastDay.value;
});

const monthTabs = computed(() => months.map((month, i) => ({ label: month, value: i })));

const bookId = parseInt(route.params.bookId as string);
const book = await db.books.get(bookId);
const { data: allEntries, refresh: refreshEntires } = await useAsyncData(() => db.entries.where({ bookId }).toArray());

const entries = computed(() =>
  allEntries.value
    ?.filter((x) => dayjs(x.date).month() === selectedMonth.value && dayjs(x.date).year() === selectedYear.value)
    .toSorted((a, b) => (dayjs(a.date).isBefore(b.date) ? -1 : 1)),
);

const newItem = reactive({
  day: lastDay.value,
  amount: 0,
  description: '',
});

useHead({
  title: computed(() => `Kassenbuch: ${book?.name}`),
});

async function addEntry() {
  await db.entries.add({
    ...newItem,
    date: new Date(selectedYear.value, selectedMonth.value, newItem.day),
    bookId,
  });
  newItem.day = lastDay.value;
  newItem.amount = 0;
  newItem.description = '';
  await refreshEntires();
}

const startAmountMonth = computed(() => {
  return allEntries.value
    ?.filter((x) => dayjs(x.date).month() < selectedMonth.value)
    .reduce((acc, entry) => acc + entry.amount, book?.startAmount ?? 0);
});

const endAmountMonth = computed(() => {
  return allEntries.value
    ?.filter((x) => dayjs(x.date).month() <= selectedMonth.value)
    .reduce((acc, entry) => acc + entry.amount, book?.startAmount ?? 0);
});

function formatAmount(amount: number) {
  return amount.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function formatDate(date: Date) {
  return dayjs(date).format('DD.MM');
}

function print() {
  window.print();
}

const descriptionQuery = ref('');
const descriptionSuggestions = computed(() => {
  const descriptions = allEntries.value?.map((x) => x.description) ?? [];
  descriptions.push(descriptionQuery.value);
  return Array.from(new Set(descriptions)).filter((x) => x !== '');
});

const entryRef = ref<HTMLElement>();
onClickOutside(entryRef, async () => {
  const changes = selectedEntry.id !== selectedEntry.id;
  if (changes && !confirm('Änderungen verwerfen?')) {
    return;
  }
  await saveEntry();
  selectEntry(undefined);
});

async function submitSaveEntry() {
  await saveEntry();
  selectEntry(undefined);
}

async function saveEntry() {
  const entry = entries.value!.find((x) => x.id === selectedEntry.id);
  if (!entry) {
    return;
  }
  await db.entries.update(entry.id!, {
    ...entry,
    date: new Date(selectedYear.value, selectedMonth.value, selectedEntry.date!),
    amount: selectedEntry.amount!,
    description: selectedEntry.description!,
  });
  await refreshEntires();
}

async function deleteEntry(entry: Entry) {
  if (!confirm('Eintrag wirklich löschen?')) {
    return;
  }

  await deleteEntryAttachment(entry);
  await db.entries.delete(entry.id!);
  await refreshEntires();
}

async function uploadEntryAttachment(entry: Entry) {
  const file = await new Promise<File | undefined>(async (resolve) => {
    const { open, onChange } = useFileDialog({
      accept: 'image/*',
      multiple: false,
    });

    onChange((e) => {
      resolve(e?.item(0) ?? undefined);
    });

    open();
  });

  if (!file) {
    return;
  }

  await saveEntryAttachment(entry, file);
}

async function saveEntryAttachment(entry: Entry, file: File) {
  if (!book) {
    throw new Error('No book loaded');
  }

  const fileName = `attachment-${book.id}-${entry.id}`;

  const opfsRoot = await navigator.storage.getDirectory();
  const fileHandle = await opfsRoot.getFileHandle(fileName, {
    create: true,
  });

  const writable = await fileHandle.createWritable();
  await writable.write(file);
  await writable.close();

  await db.entries.update(entry.id!, {
    ...entry,
    attachmentUrl: fileName,
  });

  await refreshEntires();

  await loadEntryAttachment(entry);
}

const captureAttachmentFor = ref<Entry>();

async function deleteEntryAttachment(entry: Entry) {
  if (!entry.attachmentUrl) {
    return;
  }

  const opfsRoot = await navigator.storage.getDirectory();
  const fileHandle = await opfsRoot.getFileHandle(entry.attachmentUrl);
  await fileHandle.remove();

  await db.entries.update(entry.id!, {
    ...entry,
    attachmentUrl: undefined,
  });

  await refreshEntires();
}

const entryAttachmentData = ref<string>();
async function loadEntryAttachment(entry: Entry) {
  const opfsRoot = await navigator.storage.getDirectory();

  if (!entry.attachmentUrl) {
    return undefined;
  }

  const fileHandle = await opfsRoot.getFileHandle(entry.attachmentUrl);
  const reader = new FileReader();

  reader.readAsDataURL(await fileHandle.getFile());
  return new Promise<void>((resolve) => {
    reader.onload = () => {
      entryAttachmentData.value = reader.result as string;
      resolve();
    };
  });
}

function getEditEntryItems(entry: Entry) {
  return [
    [
      {
        label: 'Beleg hochladen',
        icon: 'i-heroicons-document-arrow-up',
        click: () => uploadEntryAttachment(entry),
      },
      {
        label: 'Beleg aufnehmen',
        icon: 'i-heroicons-camera',
        click: () => (captureAttachmentFor.value = entry),
      },
      entry.attachmentUrl && {
        label: 'Beleg löschen',
        icon: 'i-heroicons-trash-20-solid',
        click: () => deleteEntryAttachment(entry),
      },
    ].filter(Boolean),
    [
      {
        label: 'Eintrag löschen',
        icon: 'i-heroicons-trash-20-solid',
        click: () => deleteEntry(entry),
      },
    ],
  ];
}
</script>

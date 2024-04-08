<template>
  <div v-if="book" class="w-full">
    <div class="flex mb-4">
      <div class="flex flex-col gap-2">
        <h1 class="text-2xl">Kassenbuch: {{ book.name }}</h1>
        <div class="flex gap-2">
          <span>Jahr</span>
          <span>{{ selectedYear }}</span>
        </div>
        <div class="flex gap-2">
          <span>Anfangssaldo {{ months[selectedMonth] }}</span>
          <span>{{ startAmountMonth !== undefined ? formatAmount(startAmountMonth) : '---' }}</span>
        </div>
        <div class="flex gap-2">
          <span>Endsaldo {{ months[selectedMonth] }}</span>
          <span>{{ endAmountMonth !== undefined ? formatAmount(endAmountMonth) : '---' }}</span>
        </div>
      </div>

      <div class="flex ml-auto items-start print:hidden">
        <UButton icon="i-heroicons-printer" label="Drucken" @click="print" />
      </div>
    </div>

    <UTabs :items="monthTabs" v-model="selectedMonth" class="w-full" />

    <div class="flex flex-col w-full">
      <div class="flex gap-2 w-full border-b-2 border-stone-200">
        <div class="flex w-1/12 p-2 items-center">lfd. Nr.</div>
        <div class="w-2/12 p-2">Datum</div>
        <div class="w-2/12 p-2">Betrag</div>
        <div class="w-4/12 p-2">Beschreibung</div>
        <div class="w-1/12 p-2" />
      </div>

      <div v-for="(entry, i) in entries" class="flex gap-2 w-full border-b" @click="selectedEntryId = entry.id">
        <div class="w-1/12 p-2 flex items-center gap-2">
          <!-- <div class="print:hidden flex items-center cursor-grab handle">
            <UIcon name="i-ic-baseline-drag-indicator" />
          </div> -->
          <span>{{ i + 1 }}</span>
        </div>
        <div class="w-2/12 flex items-center">
          <span v-if="selectedEntry?.id !== entry.id" class="p-2">{{ formatDate(entry.date) }}</span>
          <UInput
            v-else-if="selectedEntry"
            v-model="selectedEntry.date"
            type="number"
            class="w-full"
            required
            placeholder="Tag"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400"
                >.{{ (selectedMonth + 1).toString().padStart(2, '0') }}.{{ selectedYear }}</span
              >
            </template>
          </UInput>
        </div>
        <div
          class="flex items-center w-2/12"
          :class="{
            'text-red-500 justify-end': entry.amount < 0,
            'text-green-500': entry.amount >= 0,
          }"
        >
          <span v-if="selectedEntry?.id !== entry.id" class="p-2">{{ formatAmount(entry.amount) }}</span>
          <UInput
            v-else-if="selectedEntry"
            v-model="selectedEntry.amount"
            type="number"
            class="w-full"
            required
            placeholder="Betrag"
          >
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400">€</span>
            </template>
          </UInput>
        </div>
        <div class="w-4/12 flex items-center">
          <span v-if="selectedEntry?.id !== entry.id" class="p-2">{{ entry.description }}</span>
          <UInput
            v-else-if="selectedEntry"
            v-model="selectedEntry.description"
            class="w-full"
            required
            placeholder="Beschreibung"
          />
        </div>
        <div class="w-1/12 p-2" />
      </div>

      <div v-if="entries?.length === 0" class="flex justify-center">
        <div class="flex p-2">Keine Einträge vorhanden.</div>
      </div>

      <form class="flex gap-2 w-full mt-2 print:hidden" @submit.prevent="addEntry">
        <div class="w-1/12" />
        <div class="w-2/12">
          <UInput v-model="newItem.day" type="number" required placeholder="Tag">
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400"
                >.{{ (selectedMonth + 1).toString().padStart(2, '0') }}.{{ selectedYear }}</span
              >
            </template>
          </UInput>
        </div>
        <div class="w-2/12">
          <UInput v-model="newItem.amount" type="number" required placeholder="Betrag">
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400">€</span>
            </template>
          </UInput>
        </div>
        <div class="w-4/12">
          <UInput v-model="newItem.description" required placeholder="Beschreibung" />
        </div>
        <div class="w-1/12">
          <UButton type="submit" icon="i-heroicons-plus" />
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from 'dayjs';

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

const selectedEntryId = ref<number>();
const selectedEntry = computed({
  get: () => allEntries.value?.find((x) => x.id === selectedEntryId.value),
  set: (value) => {
    if (value) {
      selectedEntryId.value = value.id;
    } else {
      selectedEntryId.value = undefined;
    }
  },
});

const monthTabs = computed(() => months.map((month, i) => ({ label: month, value: i })));

const bookId = parseInt(route.params.bookId as string);
const book = await db.books.get(bookId);
const { data: allEntries, refresh: refreshEntires } = await useAsyncData(() => db.entries.where({ bookId }).toArray(), {
  watch: [selectedMonth, selectedYear],
});

const entries = computed(() => allEntries.value?.filter((x) => dayjs(x.date).month() === selectedMonth.value));

const newItem = reactive({
  day: 1,
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
    type: 'expense',
  });
  newItem.day = 1;
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
</script>

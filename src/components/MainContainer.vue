<template>
  <div class="flex flex-col container justify-center items-center my-8 mx-auto px-5">
    <h1 class="text-xl font-medium text-white mb-4">{{ msg }}</h1>

    <form class="mx-auto">
      <div class="mb-5">
        <label for="taproot_address" class="block pl-0 mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">Taproot Address</label>
        <input
          v-model="taprootAddress"
          type="text"
          id="address"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="bc1p..."
          required>
      </div>

      <div class="mb-5">
        <label for="bitcoin_address" class="block pl-0 mb-2 text-sm font-medium text-gray-900 dark:text-white text-left">Bitcoin Address(optional)</label>
        <input
          v-model="bitcoinAddress"
          type="text"
          id="address"
          class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="3DG...">
        <p id="helper-text" class="text-left mt-2 text-sm text-gray-500 dark:text-gray-400">Such as XVerse, the taproot address may differ from the bitcoin address. If they are the same, you do not need to input it.</p>
      </div>

      <button
        :disabled="loading"
        type="button"
        @click="execMainProcess"
        class="flex justify-center font-medium bg-slate-700 hover:bg-slate-600 text-white rounded px-6 py-4 focus:outline-none disabled:bg-slate-400 disabled:hover:bg-slate-400 disabled:opacity-75">
          <div
            v-if="loading"
            class="mr-3 animate-spin h-6 w-6 border-2 border-white-500 rounded-full border-t-transparent" />
          <span>{{ buttonText }}</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { fetchMEData } from '../lib/magiceden';
import { targetMempoolExportData, ExportDataCollection } from '../lib/mempool';

defineProps<{ msg: string }>();

const loading = ref(false);
const taprootAddress = ref('');
const bitcoinAddress = ref('');

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const buttonText = computed(() => loading.value ? 'Loading...' : 'Export Transaction CSV' );

async function exportCsv(exportDataCollection: ExportDataCollection) {
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const data = exportDataCollection;
  const csvContent = data.map(row => row.join(",")).join("\n");
  const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute('download', 'data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function execMainProcess() {
  loading.value = true;
  const exportDataCollection: ExportDataCollection = await targetMempoolExportData(taprootAddress.value);
  await exportCsv(exportDataCollection);
  loading.value = false;
}
</script>

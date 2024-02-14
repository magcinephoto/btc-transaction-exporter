<template>
  <div class="flex flex-col container justify-center items-center my-8 mx-auto px-5">
    <h1 class="text-xl flex font-medium text-white mb-4">
      <span class="mr-3">{{ msg }}</span>

      <a href="https://btctransactionexporter.gitbook.io/docs/" target="_blank" noreferer noopener>
      <font-awesome-icon
        icon="fa-regular fa-circle-question"
        class="text-white text-lg" />
      </a>
    </h1>
    <form class="container mx-auto">
      <div class="mb-5">
        <label for="main_address" class="block pl-0 mb-2 text-sm font-medium text-white text-left">Main Taproot/Bitcoin Address(Required)</label>
        <input
          v-model="mainAddress"
          type="text"
          id="main_address"
          class="border text-sm rounded-lg block w-full p-2.5 text-white focus:ring-blue-500 focus:border-blue-500"
          :class="inputValid ? 'bg-gray-700 border-gray-600 placeholder-gray-400' : 'bg-red-500 border-red-600 placeholder-red-200'"
          placeholder="bc1p... / 3DG..."
          required>
      </div>

      <div class="mb-5">
        <label for="bitcoin_address" class="block pl-0 mb-2 text-sm font-medium text-white text-left">Other Bitcoin Address(Optional)</label>
        <input
          v-model="bitcoinAddress"
          type="text"
          id="bitcoin_address"
          class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="3DG...">
      </div>

      <div class="mb-5">
        <label for="address_alias" class="block pl-0 mb-2 text-sm font-medium text-white text-left">Address Alias(Optional)</label>
        <input
          v-model="addressAlias"
          type="text"
          id="address_alias"
          class="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-blue-500 focus:border-blue-500"
          placeholder="ex) PersonalWallet, ForCollectArt, ...">
      </div>

      <button
        :disabled="loading"
        type="button"
        @click="execMainProcess"
        class="flex justify-center font-medium mb-6 bg-slate-700 hover:bg-slate-600 text-white rounded px-6 py-4 focus:outline-none disabled:bg-slate-400 disabled:hover:bg-slate-400 disabled:opacity-75">
          <div
            v-if="loading"
            class="mr-3 animate-spin h-6 w-6 border-2 border-white-500 rounded-full border-t-transparent" />
          <span>{{ buttonText }}</span>
      </button>

      <div
        v-if="flashMessage"
        class="text-white text-left p-3 mb-4 rounded"
        :class="flashMessage.type === 'error' ? 'bg-rose-600' : 'bg-green-600'">
        {{ flashMessage.text }}
      </div>
    </form>

    <p class="text-sm flex font-medium text-white mb-2">
      <font-awesome-icon icon="fa-solid fa-book" class="text-white mr-1" />
      <a class="underline underline-offset-1" href="https://btctransactionexporter.gitbook.io/docs" target="_blank" noreferer noopener>How to use</a>
    </p>
    <p class="text-sm flex font-medium text-white mb-2">
      <font-awesome-icon icon="fa-solid fa-user" class="text-white mr-1" />
      Mag (<a class="underline underline-offset-1" href="https://twitter.com/mag_cinephoto" target="_blank" noreferer noopener>@mag_cinephoto</a>)
    </p>
    <p class="text-sm flex font-medium text-white mb-2">
      <a class="underline underline-offset-1" href="https://btctransactionexporter.gitbook.io/docs/donate" target="_blank" noreferer noopener>
        <font-awesome-icon icon="fa-solid fa-circle-dollar-to-slot" class="text-white mr-1" />Donate
      </a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { generateExportData, ExportDataCollection } from '../lib/export';

defineProps<{ msg: string }>();

type FlashMessage = {
  type: string;
  text: string;
};

const loading = ref(false);
const mainAddress = ref('');
const bitcoinAddress = ref('');
const addressAlias = ref('');
const inputValid = ref(true);
const buttonText = computed(() => loading.value ? 'Exporting...' : 'Export Transaction CSV' );
const flashMessage = ref<FlashMessage>();

const csvFileName = computed(() => {
  const prefix = addressAlias.value ? addressAlias.value : 'Wallet';
  const postfix = bitcoinAddress.value ? `-${bitcoinAddress.value}` : '';
  return `${prefix}-${mainAddress.value}${postfix}.csv`;
});

async function exportCsv(exportDataCollection: ExportDataCollection) {
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const data = exportDataCollection;
  const csvContent = data.map(row => row.join(",")).join("\n");
  const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute('download', csvFileName.value);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

async function execMainProcess() {
  if(!mainAddress.value) {
    inputValid.value = false;
    flashMessage.value = { type: 'error', text: 'Main address is required' }
    return;
  }

  try {
    inputValid.value = true;
    flashMessage.value = undefined;
    loading.value = true;
    const exportDataCollection: ExportDataCollection = await generateExportData(mainAddress.value);
    await exportCsv(exportDataCollection);
    flashMessage.value = { type: 'success', text: `Export succeeded! Filename: ${csvFileName.value}` }
  } catch (error) {
    flashMessage.value = { type: 'error', text: 'An error occurred in export. Please check if the address is correct.' }
    console.log(error);
  } finally {
    loading.value = false;
  }
}
</script>

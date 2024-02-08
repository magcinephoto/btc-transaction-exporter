<template>
  <h1 class="text-xl font-medium text-white">{{ msg }}</h1>

  <div className="flex justify-center" aria-label="読み込み中">
    <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
  </div>

  <button
    :disabled="loading"
    type="button"
    @click="execMainProcess"
    class="bg-slate-700 hover:bg-slate-600 text-white rounded px-4 py-2 focus:outline-none disabled:bg-slate-400 disabled:hover:bg-slate-400 disabled:opacity-75"
  >
    Export Transaction CSV
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fetchMEData } from '../lib/magiceden.ts';

defineProps<{ msg: string }>();

const loading = ref(false);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function execMainProcess() {
  loading.value = true;
  console.log(loading.value);
  await sleep(5000);
  loading.value = false;
  console.log(loading.value);
  console.log('fire');
}

</script>

<style scoped>
a {
  color: #42b983;
}

label {
  margin: 0 0.5em;
  font-weight: bold;
}

code {
  background-color: #eee;
  padding: 2px 4px;
  border-radius: 4px;
  color: #304455;
}
</style>

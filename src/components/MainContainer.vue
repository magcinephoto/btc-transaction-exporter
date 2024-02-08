<template>
  <div
    class="flex flex-col justify-center items-center m-5">

    <h1 class="text-xl font-medium text-white mb-4">{{ msg }}</h1>

    <button
      :disabled="loading"
      type="button"
      @click="execMainProcess"
      class="flex justify-center bg-slate-700 hover:bg-slate-600 text-white rounded px-6 py-4 focus:outline-none disabled:bg-slate-400 disabled:hover:bg-slate-400 disabled:opacity-75">
        <div
          v-if="loading"
          class="mr-3 animate-spin h-6 w-6 border-2 border-white-500 rounded-full border-t-transparent" />
        <span>{{ buttonText }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { fetchMEData } from '../lib/magiceden.ts';

defineProps<{ msg: string }>();

const loading = ref(false);

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const buttonText = computed(() => loading.value ? 'Loading...' : 'Export Transaction CSV' );

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

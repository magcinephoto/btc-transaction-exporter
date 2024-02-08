<template>
  <h1>{{ msg }}</h1>

  <div className="flex justify-center" aria-label="読み込み中">
    <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
  </div>

  <button type="button" @click="fetchMEData">Export CSV</button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { fetchMEData } from '../lib/magiceden.ts';

defineProps<{ msg: string }>();

function execMainProcess() {
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

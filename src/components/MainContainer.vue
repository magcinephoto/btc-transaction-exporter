<template>
  <h1>{{ msg }}</h1>
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
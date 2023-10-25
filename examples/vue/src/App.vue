<script setup lang="ts">
import { ref, watch } from 'vue';
import { compress, decompress } from './brotli';

const textToEncode = ref("");
const compressedHex = ref<Uint8Array>(new Uint8Array());
const decompressed = ref("");

watch(() => textToEncode.value, (value) => {
  const uint8Array = new TextEncoder().encode(value);
  compress(uint8Array).then(res => {
    compressedHex.value = res;
    decompress(res).then(dRes => {
      decompressed.value = new TextDecoder().decode(dRes);
    });
  })
}, {
  immediate: true,
});
</script>

<template>
  <div>
    <label>Enter some text to compress:</label> <input type="text" v-model="textToEncode" />
    <br/>
    <label>Compressed bytes: {{ compressedHex }}</label>
    <br/>
    <label>Decompressed back: {{ decompressed }}</label>
    </div>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>

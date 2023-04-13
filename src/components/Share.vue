<template>
  <div class="grid">
    <a :href="item.href" target="_blank" v-for="(item, index) in links">
      <div class="wrapper" @click="goTo($event, item)">
        <iframe :src="item.href" />
        <div class="title text-center">{{ item.title }}</div>
      </div>
    </a>
  </div>
</template>

<script lang="ts" setup>
const links = [
  { href: 'https://incomparable-bienenstitch-0029d9.netlify.app/1', title: 'unplugin share' },
  { href: 'https://keen-dieffenbachia-200746.netlify.app/1', title: 'reactive state' },
  { href: 'https://mellifluous-souffle-86c113.netlify.app/1', title: 'vue3 from'}
]

function goTo(e: any, item: any) {
  window.open(item)
}
</script>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-gap: 0.5rem;
  gap: 1rem;
}
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  cursor: pointer;
}

.wrapper iframe {
  border: 1px solid #eee;
  border-radius: 4px;
  pointer-events: none;
  user-select: none;
  width: 100%;
  height: 100%;
}
</style>

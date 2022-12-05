---
title: '分享'
tags: []
published: true
hideInList: true
feature: 
isTop: false
---

<div class="grid">
  <a :href="item" target="_blank" v-for="(item, index) in links">
    <div class="wrapper" @click="goTo($event, item)">
      <iframe :src="item.href" />
      <div class="title text-center">{{item.title}}</div>
    </div>
  </a>
</div>

<script setup>
const links = [
  {href: 'https://share-unplugin.vercel.app/1', title: 'unplugin share'},
  {href: 'https://share-reactive-state.vercel.app/1', title: 'reactive state'}
]

function goTo(e, item) {
  window.open(item)
}
</script>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-gap: 0.5rem;
  gap: 0.5rem;
}
.wrapper {
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

.title {
  font-weight: 700;
}
</style>

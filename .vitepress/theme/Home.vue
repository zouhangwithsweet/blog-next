<script setup>
import { ref, computed, onMounted } from 'vue'
import Date from './Date.vue'
import { data as rawPosts } from '../posts.data'
const posts = rawPosts.filter(p => !p.hideInList)

const isBlog = ref(false)
const vercel = ref(false)

onMounted(() => {
  if (window?.location.href.includes('blog.zouhaha')) {
    isBlog.value = true
  }

  if (window?.location.href.includes('vercel')) {
    vercel.value = true
  }
})
</script>

<template>
  <div class="divide-y divide-gray-200">
    <div class="pt-6 pb-8 space-y-2 md:space-y-5">
      <h1
        class="
          text-3xl
          leading-9
          font-extrabold
          text-gray-900
          tracking-tight
          sm:text-4xl sm:leading-10
          md:text-4xl md:leading-14
        "
      >
        {{ $frontmatter.title }}
      </h1>
      <p class="flex items-center text-lg leading-7 text-gray-500">{{ $frontmatter.subtext }} <img v-if="vercel" style="height: 16px; margin-left: auto" class="!ml-3" :src="`https://visitor-badge.glitch.me/badge?page_id=zouhaha.next.blog${vercel ? '.vercel' : ''}.visitor-badge`" /></p>
    </div>
    <ul class="divide-y divide-gray-200">
      <li class="py-12" v-for="{ title, href, date, excerpt } of posts">
        <article
          class="
            space-y-2
            xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline
          "
        >
          <Date :date="date" />
          <div class="space-y-5 xl:col-span-3">
            <a :href="href">
              <div class="space-y-6">
                <h2 class="text-2xl leading-8 font-bold tracking-tight">
                  <a class="text-gray-900" :href="href">{{ title }}</a>
                </h2>
                <div
                  v-if="excerpt"
                  class="prose max-w-none text-gray-500"
                  v-html="excerpt"
                ></div>
              </div>
              <div class="text-base leading-6 font-medium">
                <a class="link" aria-label="read more" :href="href"
                  >Read more →</a
                >
              </div>
            </a>
          </div>
        </article>
      </li>
    </ul>
  </div>

  <ClientOnly>
    <div v-if="isBlog" class="py-8 flex justify-center gap-1 items-center text-sm text-blue-gray-500">
      <a href="https://beian.miit.gov.cn/" target="_blank">京ICP备20002347</a>
      |
      <img style="height: 15px" src="https://visitor-badge.glitch.me/badge?page_id=zouhaha.next.blog.visitor-badge" />
    </div>
  </ClientOnly>
</template>

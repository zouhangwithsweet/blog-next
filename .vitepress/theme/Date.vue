<script setup>
const props = defineProps({
  /**
   * { time, string }
   */
  date: [Object, String]
})

function getDateTime() {
  try {
    return new Date(props.date.time).toISOString()
  } catch (error) {
    return new Date().toISOString()
  }
}
</script>

<template>
  <dl v-if="date">
    <dt class="sr-only">Published on</dt>
    <dd class="text-base leading-6 font-medium text-gray-500">
      <time :datetime="getDateTime()">{{ date.string }}</time>
    </dd>
  </dl>
</template>

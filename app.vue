<script setup lang="ts">
useHead({
	title: 'Treepixel 2.0'
})
</script>

<template>
  <div :class="'h-100'">
    <NuxtPage/>
  </div>
</template>

<style lang="scss">
.h-100 {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>

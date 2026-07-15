<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <main class="not-found page-shell container">
    <p class="not-found__code">404</p>
    <h1 class="page-title">这个页面不存在</h1>
    <p>页面可能已移动，或链接已经失效。</p>
    <RouterLink class="btn btn--primary" :to="{ name: 'home' }">
      返回首页 <ArrowRight :size="18" />
    </RouterLink>
  </main>
</template>

<style scoped>
.not-found {
  display: grid;
  min-height: 560px;
  place-items: center;
  align-content: center;
  gap: 18px;
  text-align: center;
}

.not-found__code {
  font-size: 80px;
  font-weight: 700;
  line-height: 88px;
}

.not-found > p:not(.not-found__code) {
  color: #727272;
}
</style>

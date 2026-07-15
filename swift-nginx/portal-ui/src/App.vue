<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import SiteFooter from '@/components/SiteFooter.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import ToastStack from '@/components/ToastStack.vue'

const route = useRoute()
const showSiteChrome = computed(() => !route.meta.isEntry)
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--entry': !showSiteChrome }">
    <SiteHeader v-if="showSiteChrome" />
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in"><component :is="Component" /></Transition>
    </RouterView>
    <SiteFooter v-if="showSiteChrome" />
    <ToastStack />
  </div>
</template>

<style scoped>
.app-shell{min-height:100vh}.app-shell--entry{height:100svh}.page-enter-active,.page-leave-active{transition:opacity 120ms ease}.page-enter-from,.page-leave-to{opacity:0}
</style>

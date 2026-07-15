import { createPinia } from 'pinia'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { configureUnauthorizedHandler } from './services/api'
import { getCurrentReturnUrl, setReturnUrl } from './utils/session'
import './styles/global.css'

configureUnauthorizedHandler(() => {
  const returnUrl = getCurrentReturnUrl(router.currentRoute.value.fullPath)

  if (router.currentRoute.value.name !== 'login') {
    setReturnUrl(returnUrl)
    void router.replace({ name: 'login', query: { redirect: returnUrl } })
  }
})

createApp(App).use(createPinia()).use(router).mount('#app')

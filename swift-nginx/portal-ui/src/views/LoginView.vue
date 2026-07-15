<script setup lang="ts">
import { Eye, EyeOff, LockKeyhole } from 'lucide-vue-next'
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useNotice } from '@/composables/useNotice'
import { useAuthStore } from '@/stores/auth'
import { normalizeReturnUrl, setReturnUrl } from '@/utils/session'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const notice = useNotice()
const form = reactive({ username: '', password: '', rememberMe: false })
const showPassword = ref(false)
const submitted = ref(false)

async function submit() {
  submitted.value = true
  if (!form.username.trim() || !form.password) return
  const redirect = normalizeReturnUrl(route.query.redirect, '/')
  setReturnUrl(redirect)
  try {
    const destination = await auth.login(form)
    notice.success('登录成功')
    await router.replace(destination)
  } catch {
    // The store exposes a user-facing error below the form.
  }
}
</script>

<template>
  <div class="login-page">
    <section class="login-visual" aria-label="SwiftShop 精选商品">
      <img src="/editorial/hero-desktop.webp" alt="精选生活好物" />
      <div class="login-visual__veil" aria-hidden="true"></div>
      <div class="login-visual__copy">
        <p>SWIFTSHOP MEMBERS</p>
        <h1>欢迎回来</h1>
        <span>登录后继续管理购物袋并完成结算。</span>
      </div>
    </section>

    <section class="login-panel" aria-labelledby="login-title">
      <div class="login-panel__inner">
        <p class="login-wordmark">SWIFTSHOP</p>
        <div><p class="eyebrow">ACCOUNT</p><h2 id="login-title" class="page-title">账户登录</h2></div>
        <form class="login-form" novalidate @submit.prevent="submit">
          <label class="field">
            <span class="field__label">用户名</span>
            <input v-model="form.username" class="field__control" type="text" autocomplete="username" placeholder="请输入用户名" />
            <span v-if="submitted && !form.username.trim()" class="field__error">请输入用户名</span>
          </label>
          <label class="field">
            <span class="field__label">密码</span>
            <span class="password-field">
              <input v-model="form.password" class="field__control" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" placeholder="请输入密码" />
              <button type="button" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword">
                <EyeOff v-if="showPassword" :size="19" /><Eye v-else :size="19" />
              </button>
            </span>
            <span v-if="submitted && !form.password" class="field__error">请输入密码</span>
          </label>
          <label class="remember-field"><input v-model="form.rememberMe" type="checkbox" /><span>记住登录状态</span></label>
          <p v-if="auth.error" class="status-message status-message--error" role="alert">{{ auth.error }}</p>
          <button class="btn btn--primary btn--full login-submit" type="submit" :disabled="auth.loading">
            <LockKeyhole :size="18" />{{ auth.loading ? '正在登录...' : '登录' }}
          </button>
        </form>
        <p class="login-note">SwiftShop 当前仅开放已有账户登录。</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.login-page{display:grid;min-height:calc(100svh - var(--header-height));grid-template-columns:minmax(0,1.25fr) minmax(420px,.75fr)}
.login-visual{position:relative;min-height:680px;overflow:hidden;color:#fff;background:#222}
.login-visual img,.login-visual__veil{position:absolute;inset:0;width:100%;height:100%}.login-visual img{object-fit:cover}.login-visual__veil{background:rgba(0,0,0,.38)}
.login-visual__copy{position:absolute;z-index:1;right:48px;bottom:56px;left:48px;text-shadow:0 1px 14px rgba(0,0,0,.4)}
.login-visual__copy>p{font-size:13px;font-weight:700}.login-visual__copy h1{margin-top:10px;font-size:40px;line-height:48px}.login-visual__copy span{display:block;margin-top:12px;font-size:16px}
.login-panel{display:grid;place-items:center;padding:64px 48px;background:#fff}.login-panel__inner{display:grid;width:min(100%,440px);gap:32px}.login-wordmark{font-size:18px;font-weight:700}.login-panel .eyebrow{margin-bottom:6px}.login-form{display:grid;gap:20px}
.password-field{position:relative;display:block}.password-field input{padding-right:48px}.password-field button{position:absolute;top:1px;right:1px;display:grid;width:42px;height:42px;place-items:center;padding:0;border:0;background:transparent}
.remember-field{display:flex;align-items:center;gap:10px;font-size:13px}.remember-field input{width:17px;height:17px;accent-color:#222}.login-submit{min-height:48px;margin-top:4px}.login-note{color:#727272;font-size:12px;line-height:18px}
@media(max-width:900px){.login-page{grid-template-columns:1fr}.login-visual{min-height:340px}.login-panel{padding-block:56px 72px}}
@media(max-width:600px){.login-visual{min-height:280px}.login-visual__copy{right:20px;bottom:24px;left:20px}.login-visual__copy h1{font-size:30px;line-height:38px}.login-panel{padding:40px 16px 64px}.login-wordmark{display:none}}
</style>

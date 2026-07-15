<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const leaving = ref(false)

function enterStore() {
  if (leaving.value) return

  leaving.value = true
  window.setTimeout(() => {
    void router.push({ name: 'home' })
  }, 600)
}
</script>

<template>
  <main class="entry-page" :class="{ 'entry-page--leaving': leaving }">
    <div class="meteor-field" aria-hidden="true">
      <span class="meteor meteor--one"></span>
      <span class="meteor meteor--two"></span>
      <span class="meteor meteor--three"></span>
      <span class="meteor meteor--four"></span>
      <span class="meteor meteor--five"></span>
      <span class="meteor meteor--six"></span>
    </div>

    <div class="entry-page__content">
      <div class="brand-wrap">
        <h1 class="cn-name">极购</h1>
        <p class="en-name">SWIFT</p>
        <p class="slogan">LUXURY SELECTION · 轻奢甄选购物平台</p>
      </div>

      <button class="enter-btn" type="button" :disabled="leaving" @click="enterStore">
        ENTER 进入首页
      </button>
    </div>

    <p class="copyright">© 2026 极购 SWIFT All Rights Reserved</p>
  </main>
</template>

<style scoped>
.entry-page {
  position: relative;
  display: grid;
  min-height: 100svh;
  place-items: center;
  overflow: hidden;
  isolation: isolate;
  color: #ffffff;
  background: #000000;
  animation: page-fade-in 800ms ease-out both;
}

.entry-page--leaving {
  pointer-events: none;
  animation: page-scale-out 600ms ease-in forwards;
}

.meteor-field {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.meteor {
  position: absolute;
  width: var(--meteor-length);
  height: 2px;
  opacity: 0;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.22) 48%, #ffffff);
  box-shadow: 0 0 9px rgba(255, 255, 255, 0.62);
  transform: translate3d(0, 0, 0) rotate(135deg);
  transform-origin: left center;
  animation: meteor-glide var(--meteor-duration) linear var(--meteor-delay) infinite;
}

.meteor--one {
  top: -6vh;
  right: -8vw;
  --meteor-duration: 8.5s;
  --meteor-delay: 0.3s;
  --meteor-length: clamp(170px, 20vw, 300px);
}

.meteor--two {
  top: -14vh;
  right: -20vw;
  --meteor-duration: 10s;
  --meteor-delay: 1.7s;
  --meteor-length: clamp(145px, 17vw, 250px);
}

.meteor--three {
  top: 4vh;
  right: -30vw;
  --meteor-duration: 11.5s;
  --meteor-delay: 3.1s;
  --meteor-length: clamp(125px, 15vw, 220px);
}

.meteor--four {
  top: -18vh;
  right: 22vw;
  --meteor-duration: 9s;
  --meteor-delay: 4.6s;
  --meteor-length: clamp(110px, 13vw, 190px);
}

.meteor--five {
  top: 18vh;
  right: -16vw;
  --meteor-duration: 12s;
  --meteor-delay: 6.1s;
  --meteor-length: clamp(100px, 12vw, 180px);
}

.meteor--six {
  top: -26vh;
  right: 48vw;
  --meteor-duration: 13.5s;
  --meteor-delay: 7.5s;
  --meteor-length: clamp(90px, 11vw, 160px);
}

.entry-page__content {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
}

.brand-wrap {
  margin-bottom: 64px;
  text-align: center;
  opacity: 0;
  transform: translateY(30px);
  animation: brand-slide-up 1s ease-out 400ms forwards;
}

.cn-name {
  margin: 0 0 16px 12px;
  font-size: clamp(52px, 7vw, 72px);
  font-weight: 200;
  line-height: 1;
  letter-spacing: 12px;
  opacity: 0;
  transform: scale(0.95);
  animation: title-zoom-in 900ms ease-out 700ms forwards;
}

.en-name {
  font-size: clamp(25px, 3vw, 32px);
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: 8px;
  opacity: 0;
  animation: copy-fade-in 800ms ease-out 1s forwards;
}

.slogan {
  margin-top: 24px;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 2px;
  opacity: 0;
  animation: copy-fade-in 700ms ease-out 1.3s forwards;
}

.enter-btn {
  min-width: 214px;
  min-height: 50px;
  padding: 14px 32px;
  border: 1px solid #ffffff;
  color: #ffffff;
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  letter-spacing: 3px;
  opacity: 0;
  transition: transform 300ms cubic-bezier(0.2, 0, 0.2, 1), background-color 300ms cubic-bezier(0.2, 0, 0.2, 1), color 300ms cubic-bezier(0.2, 0, 0.2, 1), box-shadow 300ms cubic-bezier(0.2, 0, 0.2, 1);
  animation: button-appear 800ms ease-out 1.6s forwards, button-breathe 3.5s ease-in-out 2.4s infinite;
}

.enter-btn:hover:not(:disabled),
.enter-btn:focus-visible:not(:disabled) {
  color: #000000;
  background: #ffffff;
  box-shadow: 0 8px 24px rgba(255, 255, 255, 0.18);
  opacity: 1;
  transform: translateY(-4px);
  animation-play-state: running, paused;
}

.enter-btn:focus-visible {
  outline: 2px solid #ffffff;
  outline-offset: 4px;
}

.enter-btn:disabled {
  cursor: default;
}

.copyright {
  position: absolute;
  z-index: 1;
  right: 24px;
  bottom: 28px;
  left: 24px;
  margin: 0;
  color: #ffffff;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
  opacity: 0;
  animation: copy-fade-in 1s ease-out 2s forwards;
}

@keyframes page-fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes brand-slide-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes title-zoom-in {
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes copy-fade-in {
  to { opacity: 0.72; }
}

@keyframes button-appear {
  to { opacity: 1; }
}

@keyframes button-breathe {
  0%, 100% { box-shadow: 0 0 0 rgba(255, 255, 255, 0); }
  50% { box-shadow: 0 0 12px rgba(255, 255, 255, 0.25); }
}

@keyframes meteor-glide {
  0% {
    opacity: 0;
    transform: translate3d(0, 0, 0) rotate(135deg);
  }
  7% {
    opacity: 0.88;
  }
  30% {
    opacity: 0.82;
  }
  40% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    transform: translate3d(-150vw, 150vh, 0) rotate(135deg);
  }
}

@keyframes page-scale-out {
  to {
    opacity: 0;
    transform: scale(0.92);
  }
}

@media (max-width: 767px) {
  .brand-wrap { margin-bottom: 48px; }

  .slogan {
    max-width: 300px;
    font-size: 12px;
    letter-spacing: 1.5px;
  }

  .enter-btn {
    min-width: 196px;
    min-height: 48px;
    font-size: 14px;
  }

  .copyright { bottom: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .entry-page,
  .brand-wrap,
  .cn-name,
  .en-name,
  .slogan,
  .enter-btn,
  .copyright,
  .meteor {
    animation: none;
  }

  .brand-wrap,
  .cn-name,
  .en-name,
  .slogan,
  .enter-btn,
  .copyright {
    opacity: 1;
    transform: none;
  }
}
</style>

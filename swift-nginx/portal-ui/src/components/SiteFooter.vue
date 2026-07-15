<template>
  <footer class="site-footer">
    <div class="site-footer__inner container">
      <div>
        <RouterLink class="footer-wordmark" :to="{ name: 'home' }">SWIFTSHOP</RouterLink>
        <p class="footer-copy">精选日常好物，连接可靠购物体验。</p>
      </div>
      <nav class="footer-nav" aria-label="页脚导航">
        <RouterLink :to="{ name: 'home' }">首页</RouterLink>
        <RouterLink :to="{ name: 'search' }">选购</RouterLink>
        <RouterLink :to="{ name: 'cart' }">购物袋</RouterLink>
        <RouterLink :to="{ name: 'login' }">账户</RouterLink>
      </nav>
      <p class="footer-legal">© {{ new Date().getFullYear() }} SwiftShop</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  border-top: 1px solid #e6e6e6;
  background: #f5f5f5;
}

.site-footer__inner {
  display: grid;
  min-height: 220px;
  grid-template-columns: 1fr auto;
  align-content: center;
  gap: 32px 80px;
  padding-block: 48px;
}

.footer-wordmark {
  font-size: 22px;
  font-weight: 700;
  line-height: 28px;
}

.footer-copy {
  margin-top: 12px;
  color: #727272;
}

.footer-nav {
  display: flex;
  align-items: center;
  gap: 32px;
  font-size: 14px;
}

.footer-nav a:hover {
  text-decoration: underline;
  text-underline-offset: 5px;
}

.footer-legal {
  grid-column: 1 / -1;
  padding-top: 24px;
  border-top: 1px solid #e6e6e6;
  color: #727272;
  font-size: 12px;
}

@media (max-width: 767px) {
  .site-footer__inner {
    min-height: 0;
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .footer-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }

  .footer-nav a {
    padding-block: 12px;
    border-bottom: 1px solid #e6e6e6;
  }
}
</style>

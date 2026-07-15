<template>
  <article class="skeleton" aria-hidden="true">
    <div class="skeleton__image"></div>
    <div class="skeleton__line skeleton__line--short"></div>
    <div class="skeleton__line"></div>
    <div class="skeleton__line skeleton__line--price"></div>
  </article>
</template>

<style scoped>
.skeleton {
  display: grid;
  gap: 10px;
}

.skeleton__image,
.skeleton__line {
  background: linear-gradient(90deg, #f5f5f5 20%, #ebebeb 45%, #f5f5f5 70%);
  background-size: 240% 100%;
  animation: shimmer 1.4s infinite linear;
}

.skeleton__image {
  aspect-ratio: 3 / 4;
}

.skeleton__line {
  width: 100%;
  height: 14px;
}

.skeleton__line--short {
  width: 42%;
}

.skeleton__line--price {
  width: 28%;
}

@keyframes shimmer {
  from { background-position: 100% 0; }
  to { background-position: -100% 0; }
}
</style>

<template>
  <div class="not-found-page">
    <div class="content">
      <h1>404</h1>
      <p>Упс! Эта льдина уплыла...</p>
      <p>Страница не найдена</p>
      <button class="home-btn" @click="goHome">На главную</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push({ name: 'home' })
}
</script>

<style scoped>
.not-found-page {
  min-height: 97vh;
  background: linear-gradient(135deg, #1a2a6c, #162452, #0e1d3b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: system-ui, sans-serif;
}

.content {
  text-align: center;
  color: white;
}

h1 {
  font-size: 8rem;
  margin: 0;
  color: #f39c12;
  text-shadow: 0 4px 20px rgba(243, 156, 18, 0.5);
}

p {
  font-size: 1.2rem;
  margin: 10px 0;
  color: #bdc3c7;
}

.home-btn {
  margin-top: 30px;
  padding: 14px 36px;
  font-size: 18px;
  background: #f39c12;
  color: white;
  border: none;
  border-radius: 40px;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 6px 0 #b86d0e;
}

.home-btn:active {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #b86d0e;
}
</style>
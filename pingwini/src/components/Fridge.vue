<script setup>
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { fishCount } = useGacha()

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="fridge-page">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">Холодильник</span>
      <div class="fish-total">🐟 {{ fishCount }}</div>
    </div>

    <div class="content">
      <div class="fish-icon">🐟</div>
      <h2>Запас рыбы</h2>
      <p class="count-big">{{ fishCount }}</p>
      <p class="hint" v-if="fishCount > 0">Можно покормить Пико!</p>
      <p class="hint" v-else>Отправляйся на рыбалку, чтобы наполнить холодильник</p>
    </div>
  </div>
</template>

<style scoped>
.fridge-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a5276, #2c3e50);
  color: white;
  font-family: system-ui, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.2);
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 6px 15px;
  border-radius: 25px;
  font-size: 18px;
  cursor: pointer;
}

.title {
  font-size: 20px;
  font-weight: bold;
}

.fish-total {
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 15px;
  border-radius: 25px;
  font-size: 16px;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 80vh;
}

.fish-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

h2 {
  font-weight: 500;
  margin-bottom: 10px;
}

.count-big {
  font-size: 64px;
  font-weight: bold;
  margin: 0;
}

.hint {
  margin-top: 20px;
  opacity: 0.7;
  font-size: 16px;
}
</style>
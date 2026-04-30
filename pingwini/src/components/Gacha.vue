<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { tickets, pullGacha } = useGacha()

const pulledPenguin = ref(null)

function doPull() {
  const result = pullGacha()
  if (result) {
    pulledPenguin.value = result
  } else {
    pulledPenguin.value = null
    alert('Недостаточно карточек!')
  }
}

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="gacha-container">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">Гача</span>
      <div class="ticket-count">🎟️ {{ tickets }}</div>
    </div>

    <div class="gacha-area">
      <div v-if="pulledPenguin" class="result-card">
        <div class="penguin-image">
          <img :src="pulledPenguin.image" :alt="pulledPenguin.name" />
        </div>
        <div class="penguin-name">{{ pulledPenguin.name }}</div>
        <div class="penguin-rarity" :class="pulledPenguin.rarity">
          {{ pulledPenguin.rarity.toUpperCase() }}
        </div>
      </div>

      <button class="pull-btn" @click="doPull" :disabled="tickets <= 0">
        🎴 Крутить (1 карточка)
      </button>

      <p v-if="tickets <= 0" class="no-tickets">Нет карточек! Идите на рыбалку.</p>
    </div>
  </div>
</template>

<style scoped>
.gacha-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a2a6c, #162452, #0e1d3b);
  color: white;
  font-family: system-ui, sans-serif;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: rgba(0, 0, 0, 0.3);
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

.ticket-count {
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 15px;
  border-radius: 25px;
  font-size: 16px;
}

.gacha-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 30px;
}

.result-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 20px;
  text-align: center;
  min-width: 200px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
}

.penguin-image img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px;
}

.penguin-name {
  font-size: 22px;
  margin: 10px 0 5px;
  font-weight: bold;
}

.penguin-rarity {
  font-size: 14px;
  font-weight: bold;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding: 2px 10px;
  border-radius: 12px;
  display: inline-block;
}

.penguin-rarity.common { background: #7f8c8d; }
.penguin-rarity.rare { background: #3498db; }
.penguin-rarity.epic { background: #9b59b6; }
.penguin-rarity.legendary { background: #f1c40f; color: #000; }

.pull-btn {
  background: #f39c12;
  border: none;
  padding: 16px 40px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  border-radius: 60px;
  cursor: pointer;
  box-shadow: 0 6px 0 #b86d0e;
  transition: transform 0.1s, box-shadow 0.1s;
}

.pull-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #b86d0e;
}

.pull-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.no-tickets {
  color: #e74c3c;
  font-size: 16px;
}
</style>
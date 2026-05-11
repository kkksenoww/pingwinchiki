<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { tickets, pullGacha, pullGacha10 } = useGacha()

const pulledPenguin = ref(null)
const pullType = ref('')
const fragmentAmount = ref(0)
const showError = ref(false)
const collectedPenguin = ref(null)
const multiResults = ref([])
const showMulti = ref(false)

function doPull() {
  showError.value = false
  showMulti.value = false
  collectedPenguin.value = null
  const result = pullGacha()
  if (!result) {
    showError.value = true
    return
  }
  
  pullType.value = result.type
  pulledPenguin.value = result.penguin
  
  if (result.type === 'fragments') {
    fragmentAmount.value = result.amount
    if (result.collected) {
      collectedPenguin.value = result.penguin
    }
  }
}

function doPull10() {
  showError.value = false
  pulledPenguin.value = null
  collectedPenguin.value = null
  
  if (tickets.value < 10) {
    showError.value = true
    return
  }
  
  multiResults.value = pullGacha10()
  showMulti.value = true
}

function goBack() {
  router.push({ name: 'home' })
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
      <div v-if="pulledPenguin && !showMulti" class="result-card">
        <div class="penguin-image">
          <img :src="pulledPenguin.image" :alt="pulledPenguin.name" />
        </div>
        <div class="penguin-name">{{ pulledPenguin.name }}</div>
        <div class="penguin-rarity" :class="pulledPenguin.rarity">
          {{ pulledPenguin.rarity }}
        </div>
        <div v-if="pullType === 'fragments'" class="fragment-text">
          +{{ fragmentAmount }} фрагментов
        </div>
        <div v-if="collectedPenguin" class="collected-text">
          🎉 Пингвин собран!
        </div>
      </div>

      <div v-if="showMulti" class="results-scroll">
        <div v-for="(result, index) in multiResults" :key="index" class="mini-row">
          <img :src="result.penguin.image" :alt="result.penguin.name" />
          <span class="mini-name">{{ result.penguin.name }}</span>
          <span class="mini-rarity" :class="result.penguin.rarity">
            {{ result.type === 'penguin' ? '🎁' : '+' + result.amount + ' фраг.' }}
          </span>
        </div>
      </div>

      <div v-if="showError" class="error-message">
        Недостаточно карточек!
      </div>

      <div class="pull-buttons">
        <button class="pull-btn" @click="doPull" :disabled="tickets <= 0">
          🎴 1 крутка
        </button>
        <button class="pull-btn pull-10" @click="doPull10" :disabled="tickets < 10">
          🔥 10 круток
        </button>
      </div>

      <p v-if="tickets <= 0" class="no-tickets">Нет карточек! Идите на рыбалку.</p>
    </div>

    <!-- Навигация -->
    <div class="bottom-nav-mini">
      <router-link to="/ribalka" class="nav-item">
        <img src="../assets/fishingg.png" class="nav-icon" alt="" />
        <span>Рыбалка</span>
      </router-link>
      <router-link to="/fridge" class="nav-item">
        <img src="../assets/holodil.png" class="nav-icon" alt="" />
        <span>Холодильник</span>
      </router-link>
      <router-link to="/home" class="nav-item">
        <img src="../assets/p_home.png" class="nav-icon" alt="" />
        <span>Дом</span>
      </router-link>
      <router-link to="/gacha" class="nav-item">
        <img src="../assets/gacha.png" class="nav-icon" alt="" />
        <span>Гача</span>
      </router-link>
      <router-link to="/collection" class="nav-item">
        <img src="../assets/staya.png" class="nav-icon" alt="" />
        <span>Стая</span>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.gacha-container {
  min-height: 97vh;
  background: linear-gradient(135deg, #1a2a6c, #162452, #0e1d3b);
  color: white;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  gap: 20px;
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

.fragment-text {
  margin-top: 10px;
  font-size: 16px;
  color: #ffd700;
}

.collected-text {
  margin-top: 10px;
  background: #4caf50;
  padding: 8px;
  border-radius: 10px;
  font-weight: bold;
}

.results-scroll {
  background: rgba(0, 0, 0, 0.3);
  border-radius: 15px;
  padding: 15px;
  width: 90%;
  max-width: 400px;
  max-height: 300px;
  overflow-y: auto;
}

.mini-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.mini-row:last-child {
  border-bottom: none;
}

.mini-row img {
  width: 40px;
  height: 40px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  padding: 4px;
}

.mini-name {
  flex: 1;
  font-size: 14px;
}

.mini-rarity {
  font-size: 12px;
  font-weight: bold;
}

.mini-rarity.common { color: #7f8c8d; }
.mini-rarity.rare { color: #3498db; }
.mini-rarity.epic { color: #9b59b6; }
.mini-rarity.legendary { color: #f1c40f; }

.pull-buttons {
  display: flex;
  gap: 15px;
}

.pull-btn {
  background: #f39c12;
  border: none;
  padding: 16px 30px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  border-radius: 60px;
  cursor: pointer;
  box-shadow: 0 6px 0 #b86d0e;
}

.pull-10 {
  background: #e74c3c;
  box-shadow: 0 6px 0 #a93226;
}

.pull-btn:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 2px 0 #b86d0e;
}

.pull-10:active:not(:disabled) {
  box-shadow: 0 2px 0 #a93226;
}

.pull-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  background: #e74c3c;
  color: white;
  padding: 10px 20px;
  border-radius: 10px;
}

.no-tickets {
  color: #e74c3c;
  font-size: 16px;
}

.bottom-nav-mini {
  display: flex;
  justify-content: space-evenly;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 10px 8px;
  width: 100%;
  z-index: 10;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  gap: 4px;
  min-width: 56px;
}

.nav-icon {
  width: 36px;
  height: 36px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
}

.nav-item.router-link-active {
  color: #f39c12;
}
</style>
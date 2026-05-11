<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { fishInventory, addFish, addTicket, getPenguinLevel, tickets } = useGacha()

const isFishing = ref(false)
const progress = ref(0)
const resultMessage = ref('')
const fishingStage = ref('')
const caughtFish = ref(null)
let fishingInterval = null
let messageTimeout = null

const currentLevel = computed(() => getPenguinLevel())
const fishCount = computed(() => fishInventory.value.length)

const fishPool = [
  { name: 'Мелкая рыбка', value: 1, type: 'small', minLevel: 1, chance: 35, icon: '🐟' },
  { name: 'Пескарь', value: 2, type: 'small', minLevel: 1, chance: 30, icon: '🐟' },
  { name: 'Окунь', value: 3, type: 'river', minLevel: 2, chance: 15, icon: '🐠' },
  { name: 'Карп', value: 4, type: 'river', minLevel: 3, chance: 10, icon: '🐠' },
  { name: 'Лосось', value: 5, type: 'river', minLevel: 4, chance: 5, icon: '🐟' },
  { name: 'Щука', value: 7, type: 'sea', minLevel: 5, chance: 3, icon: '🐡' },
  { name: 'Сом', value: 10, type: 'sea', minLevel: 6, chance: 1.5, icon: '🐡' },
  { name: 'Кальмар', value: 12, type: 'squid', minLevel: 7, chance: 0.3, icon: '🦑' },
  { name: 'Осьминог', value: 15, type: 'squid', minLevel: 8, chance: 0.15, icon: '🦑' },
  { name: 'Осётр', value: 20, type: 'royal', minLevel: 9, chance: 0.04, icon: '👑' },
  { name: 'Королевская рыба', value: 30, type: 'royal', minLevel: 10, chance: 0.01, icon: '👑' }
]

function getFishByLevel() {
  const level = currentLevel.value
  const available = fishPool.filter(f => level >= f.minLevel)
  const totalChance = available.reduce((sum, f) => sum + f.chance, 0)
  let random = Math.random() * totalChance
  for (const fish of available) {
    if (random < fish.chance) return fish
    random -= fish.chance
  }
  return { name: 'Мелкая рыбка', value: 1, type: 'small', icon: '🐟' }
}

function startFishing() {
  if (isFishing.value) return
  isFishing.value = true
  progress.value = 0
  fishingStage.value = 'casting'
  caughtFish.value = null
  resultMessage.value = ''

  if (messageTimeout) clearTimeout(messageTimeout)

  const totalTime = 60
  let step = 0
  fishingInterval = setInterval(() => {
    step++
    progress.value = Math.min(100, (step / totalTime) * 100)
    if (step === 10) fishingStage.value = 'waiting'
    if (step === 40) fishingStage.value = 'biting'
    if (step >= totalTime) {
      clearInterval(fishingInterval)
      progress.value = 100
      fishingStage.value = 'caught'
      const fish = getFishByLevel()
      caughtFish.value = fish
      const added = addFish(fish.value, fish.type, fish.name)
      if (!added) {
        resultMessage.value = '❄️ Холодильник полон! Рыба не поместилась.'
      } else {
        const ticketChance = 0.2 + currentLevel.value * 0.02
        if (Math.random() < ticketChance) {
          addTicket(1)
          resultMessage.value = `${fish.name} +${fish.value} рыбы! +1 билет`
        } else {
          resultMessage.value = `${fish.name} +${fish.value} рыбы!`
        }
      }
      isFishing.value = false
      messageTimeout = setTimeout(() => {
        caughtFish.value = null
        resultMessage.value = ''
        fishingStage.value = ''
      }, 3000)
    }
  }, 50)
}

function goBack() { router.push('/home') }

onUnmounted(() => {
  clearInterval(fishingInterval)
  clearTimeout(messageTimeout)
})
</script>

<template>
  <div class="fishing-page">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <span class="page-title">Рыбалка</span>
      <div class="header-stats">
        <div class="fish-counter">🐟 {{ fishCount }}</div>
        <div class="ticket-counter">🎟️ {{ tickets }}</div>
      </div>
    </div>

    <div class="game-zone">
      <div class="ice-lunka">
        <div class="voda"></div>
        <div class="udochka-icon">🎣</div>
      </div>
      <div class="fishing-status">
        <span v-if="fishingStage === 'casting'">Забрасываем удочку...</span>
        <span v-if="fishingStage === 'waiting'">Ждём поклёвку...</span>
        <span v-if="fishingStage === 'biting'">Клюёт! 🎣</span>
        <span v-if="fishingStage === 'caught' && caughtFish">{{ caughtFish.icon }} {{ caughtFish.name }} пойман(а)!</span>
      </div>
    </div>

    <div class="panel">
      <button class="catch-button" :disabled="isFishing" @click="startFishing">
        {{ isFishing ? 'Ловим...' : '🎣 Ловить' }}
      </button>
      <div class="progress">
        <div class="progress-line"></div>
      </div>
      <div v-if="resultMessage" class="result-message">{{ resultMessage }}</div>
    </div>

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
.fishing-page {
  background: url('../assets/arctic_ice.jpg');
  background-size: cover;
  background-position: center;
  min-height: 97vh;
  display: flex;
  flex-direction: column;
  color: #f0f0f0;
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

.page-title {
  font-size: 18px;
  font-weight: 500;
}

.fish-counter {
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 15px;
  border-radius: 25px;
  font-size: 16px;
}

.ticket-counter {
  background: rgba(0, 0, 0, 0.3);
  padding: 6px 15px;
  border-radius: 25px;
  font-size: 16px;
}

.header-stats {
  display: flex;
  gap: 8px;
}

.game-zone {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;
  min-height: 400px;
}

.ice-lunka {
  width: 140px;
  height: 140px;
  background: #0f5777;
  border-radius: 50%;
  border: 2px solid #bbe6ff;
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.5);
}

.voda {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 55%;
  background: #2f8eb0;
  border-radius: 0 0 50% 50%;
}

.udochka-icon {
  position: absolute;
  bottom: 95px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 40px;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.fishing-status {
  font-size: 1.3rem;
  font-weight: bold;
  color: white;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
}

.panel {
  background: rgba(0, 0, 0, 0.6);
  padding: 20px 20px 30px;
}

.catch-button {
  width: 100%;
  background: #e07c2c;
  border: none;
  padding: 14px;
  border-radius: 60px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 16px;
  cursor: pointer;
  box-shadow: 0 4px 0 #a0581a;
}

.catch-button:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 #a0581a;
}

.catch-button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.progress {
  width: 100%;
  background: #2e404f;
  height: 10px;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-line {
  height: 100%;
  background: #5fbb84;
  border-radius: 15px;
  width: v-bind(progress + '%');
}

.result-message {
  text-align: center;
  font-size: 15px;
  color: white;
  padding-top: 8px;
  font-weight: bold;
  text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
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
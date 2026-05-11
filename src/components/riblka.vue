<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { fishCount, addFish, addTicket, getPenguinLevel } = useGacha()

const isFishing = ref(false)
const progress = ref(0)
const resultMessage = ref('')
const fishingStage = ref('')
const caughtFish = ref(null)
let fishingInterval = null
let messageTimeout = null

const currentLevel = computed(() => getPenguinLevel())

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
      //  Передаём название рыбы
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
      <div class="fish-counter">🐟 {{ fishCount }}</div>
    </div>

    <div class="game-zone">
      <div class="ice-lunka">
        <div class="voda"></div>
        <div class="udochka-icon">🎣</div>
      </div>
      <div class="pingvinchik">
        <span class="pingva">🐧</span>
        <span class="palochka">🎣</span>
      </div>
      <div class="fishing-status">
        <span v-if="fishingStage === 'casting'">Забрасываем удочку...</span>
        <span v-if="fishingStage === 'waiting'">Ждём поклёвку...</span>
        <span v-if="fishingStage === 'biting'">Клюёт! 🎣</span>
        <span v-if="fishingStage === 'caught' && caughtFish">{{ caughtFish.icon }} {{ caughtFish.name }} поймана!</span>
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
  </div>
</template>

<style scoped>
.fishing-page {
  --bg-top: #0f405c;
  --bg-bottom: #1b6d8a;
  --orange-btn: #e07c2c;
  --orange-shadow: #a0581a;
  --gray-bg: #102532;
  --text-white: #f0f0f0;
  --udochka-size: 40px;
  --udochka-bottom: 95px;

  background: linear-gradient(var(--bg-top), var(--bg-bottom));
  min-height: 97vh;
  display: flex;
  flex-direction: column;
  color: var(--text-white);
  font-family: system-ui, 'Segoe UI', 'Helvetica', sans-serif;
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

.game-zone {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
  min-height: 400px;
  background: radial-gradient(circle at 50% 40%, #197c9e, #0a3850);
}

.udochka-icon {
  position: absolute;
  bottom: var(--udochka-bottom);
  left: 50%;
  transform: translateX(-50%);
  font-size: var(--udochka-size);
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
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

.pingvinchik {
  position: absolute;
  bottom: 25px;
  right: 25px;
  text-align: center;
}

.pingva {
  font-size: 65px;
  display: block;
}

.palochka {
  position: absolute;
  top: -25px;
  left: 35px;
  font-size: 32px;
  transform: rotate(-20deg);
}

.panel {
  background: var(--gray-bg);
  padding: 20px 20px 30px;
}

.catch-button {
  width: 100%;
  background: var(--orange-btn);
  border: none;
  padding: 14px;
  border-radius: 60px;
  font-size: 20px;
  font-weight: bold;
  color: white;
  margin-bottom: 16px;
  cursor: pointer;
  box-shadow: 0 4px 0 var(--orange-shadow);
  transition: transform 0.1s, box-shadow 0.1s;
}

.catch-button:active:not(:disabled) {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--orange-shadow);
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
  width: 0%;
  width: v-bind(progress + '%');
}

.result-message {
  text-align: center;
  font-size: 14px;
  color: #ffd966;
  padding-top: 8px;
}

.fishing-status {
  margin-top: 20px;
  font-size: 1.2rem;
  font-weight: bold;
}
</style>
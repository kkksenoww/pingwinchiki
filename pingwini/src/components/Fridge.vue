<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { fishInventory } = useGacha()

const selectedIndex = ref(null)
let fridgeInterval = null

onMounted(() => {
  removeExpiredFish()
  fridgeInterval = setInterval(() => {
    removeExpiredFish()
  }, 60 * 1000)
})
onUnmounted(() => clearInterval(fridgeInterval))

const typeIcons = {
  small: '🐟',
  river: '🐠',
  sea: '🐡',
  squid: '🦑',
  royal: '👑'
}

const fishGroups = computed(() => {
  if (!fishInventory.value || fishInventory.value.length === 0) return []

  const groups = [
    { name: 'Мелкая рыба', key: 'small', count: 0, icon: '' },
    { name: 'Речная рыба', key: 'river', count: 0, icon: '' },
    { name: 'Морская рыба', key: 'sea', count: 0, icon: '' },
    { name: 'Кальмары', key: 'squid', count: 0, icon: '' },
    { name: 'Королевская', key: 'royal', count: 0, icon: '' }
  ]

  for (const fish of fishInventory.value) {
    const group = groups.find(g => g.key === fish.type)
    if (group) group.count += fish.amount
  }

  return groups.filter(g => g.count > 0)
})

const totalFish = computed(() => {
  return fishGroups.value.reduce((sum, g) => sum + g.count, 0)
})
</script>

<template>
  <div class="fridge-page">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">Холодильник</span>
      <div class="fish-total">🐟 {{ totalFish }}</div>
    </div>

    <div class="content">
      <div class="fish-icon">🧊</div>
      <h2>Запасы рыбы</h2>

      <div v-if="fishGroups.length === 0" class="empty-fridge">
        <p>Холодильник пуст...</p>
        <p>🎣 Иди на рыбалку, Пико голоден!</p>
      </div>

      <div v-else class="fish-list">
        <div v-for="group in fishGroups" :key="group.key" class="fish-group">
          <div class="group-header">
            <span class="group-icon">{{ group.icon }}</span>
            <span class="group-name">{{ group.name }}</span>
            <span class="group-count">×{{ group.count }}</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: (group.count / totalFish * 100) + '%' }"></div>
          </div>
        </div>
      </div>

      <div v-if="totalFish > 0" class="hint">
        🐧 Пико может покормиться из холодильника!
      </div>
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
.fridge-page {
  min-height: 97vh;
  color: white;
  font-family: system-ui, sans-serif;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(../assets/fon_holod.jpg);
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
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
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.fish-list {
  width: 90%;
  max-width: 500px;
  margin: 20px auto;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fish-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  cursor: pointer;
}

.fish-item.expiring {
  border: 2px solid #ffaa00;
}

.fish-icon {
  font-size: 20px;
}

.fish-species {
  font-size: 14px;
  font-weight: 500;
}

.fish-time {
  font-size: 12px;
  color: #ccc;
}

.fish-group {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 12px;
  margin-bottom: 12px;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.group-icon {
  font-size: 24px;
}

.group-name {
  flex: 1;
  margin-left: 10px;
  font-size: 14px;
}

.group-count {
  font-weight: bold;
  font-size: 16px;
}

.progress-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #4ade80;
  border-radius: 10px;
  transition: width 0.3s;
}

.empty-fridge {
  text-align: center;
  color: #bdc3c7;
  font-size: 18px;
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

.empty-fridge p:first-child {
  font-size: 20px;
  margin-bottom: 10px;
}

.hint {
  margin-top: 30px;
  opacity: 0.7;
  font-size: 14px;
  text-align: center;
}
</style>
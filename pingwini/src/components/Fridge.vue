<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { fishInventory, removeFishByIndex, removeExpiredFish } = useGacha()

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

function getRemainingMinutes(timestamp) {
  const remainingMs = 20 * 60 * 1000 - (Date.now() - timestamp)
  return Math.max(0, Math.floor(remainingMs / 60000))
}

function removeFish(idx) {
  removeFishByIndex(idx)
  selectedIndex.value = null
}

function goBack() { router.push('/home') }
</script>

<template>
  <div class="fridge-page">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">Холодильник</span>
      <div class="fish-total">🐟 {{ fishInventory.length }}</div>
    </div>

    <div class="content">
      <div v-if="fishInventory.length === 0" class="empty-fridge">Холодильник пуст...</div>
      <div v-else class="fish-list">
        <div v-for="(fish, index) in fishInventory" class="fish-item"
          :class="{ 'expiring': getRemainingMinutes(fish.timestamp) <= 5 }"
          @click="selectedIndex = selectedIndex === index ? null : index">
          <span class="fish-icon">{{ typeIcons[fish.type] || '🐟' }}</span>
          <span class="fish-species">{{ fish.species || fish.type }}</span>
          <span class="fish-time">{{ getRemainingMinutes(fish.timestamp) }} мин</span>
          <button v-if="selectedIndex === index" class="delete-btn" @click.stop="removeFish(index)">🗑️</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fridge-page {
  min-height: 97vh;
  color: white;
  font-family: system-ui, sans-serif;
  background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(../assets/fon_holod.jpg);
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
  min-height: 80vh;
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
  transition: background 0.2s;
}

.fish-item:hover {
  background: rgba(255, 255, 255, 0.2);
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
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fish-time {
  font-size: 12px;
  color: #ccc;
  margin-left: auto;
}

.delete-btn {
  background: #e74c3c;
  border: none;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  position: absolute;
  right: -8px;
  top: -8px;
}

.empty-fridge {
  text-align: center;
  color: #bdc3c7;
  margin-top: 40px;
}
</style>
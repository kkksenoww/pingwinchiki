<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { inventory, getPenguinById, penguinBase, fragments } = useGacha()

const selectedId = ref(null)

const ownedPenguins = computed(() => {
  const result = []
  for (let i = 0; i < inventory.value.length; i++) {
    const penguin = getPenguinById(inventory.value[i])
    if (penguin) {
      result.push(penguin)
    }
  }
  return result
})

const allPenguins = computed(() => {
  const result = []
  for (let i = 0; i < penguinBase.length; i++) {
    const penguin = penguinBase[i]
    let owned = false
    for (let j = 0; j < inventory.value.length; j++) {
      if (inventory.value[j] === penguin.id) {
        owned = true
        break
      }
    }
    const frags = fragments.value[penguin.id] || 0
    result.push({
      id: penguin.id,
      name: penguin.name,
      rarity: penguin.rarity,
      image: penguin.image,
      owned: owned,
      fragments: frags
    })
  }
  
  const sorted = []
  const order = ['legendary', 'epic', 'rare', 'common']

  for (let r = 0; r < order.length; r++) {
    for (let i = 0; i < result.length; i++) {
      if (result[i].rarity === order[r] && result[i].owned) {
        sorted.push(result[i])
      }
    }
  }
  
  for (let r = 0; r < order.length; r++) {
    for (let i = 0; i < result.length; i++) {
      if (result[i].rarity === order[r] && !result[i].owned) {
        sorted.push(result[i])
      }
    }
  }
  
  return sorted
})

const ownedCount = computed(() => {
  const unique = []
  for (let i = 0; i < inventory.value.length; i++) {
    let found = false
    for (let j = 0; j < unique.length; j++) {
      if (unique[j] === inventory.value[i]) {
        found = true
        break
      }
    }
    if (!found) {
      unique.push(inventory.value[i])
    }
  }
  return unique.length
})

const totalCount = computed(() => {
  return penguinBase.length
})

function selectPenguin(id) {
  if (selectedId.value === id) {
    selectedId.value = null
  } else {
    selectedId.value = id
  }
}

function goBack() {
  router.push({ name: 'home' })
}

function convert(id) {
  convertFragmentsToFish(id)
}

function goBack() { router.push('/home') }
</script>

<template>
  <div class="collection-page">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">Стая</span>
      <div class="count">{{ ownedCount }} / {{ totalCount }}</div>
    </div>

    <div v-if="ownedCount === 0" class="empty">
      <p>У вас пока нет пингвинов.</p>
      <p>Ловите рыбу и получайте карточки для Гачи!</p>
    </div>

    <div class="grid" v-else>
      <div
        v-for="penguin in allPenguins"
        :key="penguin.id"
        class="penguin-card"
        :class="{ locked: !penguin.owned, expanded: selectedId === penguin.id }"
        @click="selectPenguin(penguin.id)"
      >
        <img :src="penguin.image" :alt="penguin.name" />
        <div class="name">{{ penguin.name }}</div>
        <div class="rarity" :class="penguin.rarity">{{ penguin.rarity }}</div>
        <div v-if="penguin.owned" class="level">⭐{{ penguin.level }}</div>

        <div v-if="selectedId === penguin.id" class="card-details">
          <div v-if="penguin.owned">
            <p>Фрагменты: {{ penguin.frags }}</p>

            <!-- Шансы помощи -->
            <div class="help-chances" v-if="penguin.owned">
              <p><strong>Помощь каждые 20 мин:</strong></p>
              <p>💊 Шанс: {{ (getStasiHelpChances(penguin.id).medChance * 100).toFixed(1) }}%</p>
              <p>🐟 Шанс: {{ (getStasiHelpChances(penguin.id).fishChance * 100).toFixed(1) }}%</p>
            </div>

            <div v-if="penguin.level < MAX_PENGUIN_LEVEL">
              <button v-if="penguin.frags >= penguin.level * 10" @click.stop="upgrade(penguin.id)" class="upgrade-btn">
                Улучшить ({{ penguin.level * 10 }} фрагментов)
              </button>
              <p v-else>Нужно {{ penguin.level * 10 }} фрагментов для улучшения</p>
            </div>
            <div v-else>
              <p>Макс. уровень</p>
              <button v-if="penguin.frags >= 10" @click.stop="convert(penguin.id)" class="convert-btn">
                Обменять 10 фрагментов на 5 рыбы
              </button>
            </div>
          </div>
          <div v-else>
            <p>Фрагменты: {{ penguin.frags }} / 10</p>
          </div>
        </div>
        
        <div v-if="selectedId === penguin.id" class="card-details">
          <div v-if="penguin.owned" class="owned-badge">✅ Получен</div>
          <div v-else class="fragment-details">
            <p>Фрагменты: {{ penguin.fragments }} / 10</p>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: (penguin.fragments * 10) + '%' }"></div>
            </div>
          </div>
        </div>
        
        <div v-if="!penguin.owned" class="locked-overlay">🔒</div>
        <div v-if="!penguin.owned && penguin.fragments > 0 && selectedId !== penguin.id" class="fragments-badge">
          {{ penguin.fragments }}/10
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collection-page {
  min-height: 97vh;
  background: linear-gradient(135deg, #00416a, #0f2027);
  color: white;
  font-family: system-ui, sans-serif;
}

.convert-btn {
  background: #4caf50;
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

.count {
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 15px;
  border-radius: 25px;
  font-size: 14px;
}

.empty {
  text-align: center;
  margin-top: 100px;
  font-size: 18px;
  color: #bdc3c7;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 15px;
  padding: 20px;
}

.penguin-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  cursor: pointer;
}

.penguin-card.locked {
  opacity: 0.4;
  filter: grayscale(80%);
}

.penguin-card.expanded {
  grid-column: span 2;
  grid-row: span 2;
}

.penguin-card img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  padding: 5px;
  margin-bottom: 8px;
}

.name {
  font-weight: bold;
  font-size: 14px;
}

.rarity {
  font-size: 12px;
  text-transform: capitalize;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  display: inline-block;
}

.rarity.common { background: #7f8c8d; }
.rarity.rare { background: #3498db; }
.rarity.epic { background: #9b59b6; }
.rarity.legendary { background: #f1c40f; color: #000; }

.locked-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 40px;
}

.fragments-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f39c12;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: bold;
}

.card-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.owned-badge {
  background: #4caf50;
  padding: 6px;
  border-radius: 10px;
  font-weight: bold;
  font-size: 14px;
}

.fragment-details p {
  margin-bottom: 6px;
  font-size: 13px;
}

.progress-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #f39c12;
  border-radius: 10px;
}
</style>
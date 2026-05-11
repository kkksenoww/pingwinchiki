<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const {
  inventory, fragments, penguinBase, upgradePenguin,
  penguinLevels, convertFragmentsToFish, MAX_PENGUIN_LEVEL,
  getStasiHelpChances
} = useGacha()

const selectedId = ref(null)

const allPenguins = computed(() => {
  const all = penguinBase.map(p => ({
    ...p,
    owned: inventory.value.includes(p.id),
    frags: fragments.value[p.id] || 0,
    level: penguinLevels.value[p.id] || 1
  }))
  const order = ['legendary', 'epic', 'rare', 'common']
  return all.sort((a,b) => {
    if (a.owned !== b.owned) return a.owned ? -1 : 1
    return order.indexOf(a.rarity) - order.indexOf(b.rarity)
  })
})

function toggleSelect(id) {
  selectedId.value = selectedId.value === id ? null : id
}

function upgrade(id) {
  upgradePenguin(id)
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
      <span class="count">{{ inventory.length }} / {{ penguinBase.length }}</span>
    </div>

    <div class="grid">
      <div v-for="penguin in allPenguins" class="penguin-card"
           :class="{ locked: !penguin.owned, expanded: selectedId === penguin.id }"
           @click="toggleSelect(penguin.id)">
        <img :src="penguin.image" :alt="penguin.name" />
        <div class="name">{{ penguin.name }}</div>
        <div class="rarity" :class="penguin.rarity">{{ penguin.rarity }}</div>
        <div v-if="penguin.owned" class="level">⭐{{ penguin.level }}</div>

        <div v-if="selectedId === penguin.id" class="card-details">
          <div v-if="penguin.owned">
            <p>Фрагменты: {{ penguin.frags }}</p>

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

        <div v-if="!penguin.owned" class="locked-overlay">🔒</div>
        <div v-if="!penguin.owned && penguin.frags > 0" class="fragments-badge">{{ penguin.frags }}/10</div>
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
.collection-page {
  min-height: 97vh;
  background: linear-gradient(135deg, #00416a, #0f2027);
  color: white;
  font-family: system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
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

.progress-fill {
  height: 100%;
  background: #f39c12;
  border-radius: 10px;
}

.upgrade-btn {
  background: #f39c12;
  border: none;
  padding: 6px 12px;
  border-radius: 10px;
  color: white;
  font-weight: bold;
  margin-top: 6px;
  cursor: pointer;
}

.help-info {
  font-size: 0.8rem;
  color: #bdc3c7;
  margin-top: 5px;
}

.help-chances {
  background: rgba(255,255,255,0.1);
  border-radius: 8px;
  padding: 8px;
  margin: 8px 0;
  font-size: 0.85rem;
}

.help-chances p {
  margin: 4px 0;
}

.bottom-nav-mini {
  display: flex;
  justify-content: space-evenly;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  padding: 10px 8px;
  width: 100%;
  z-index: 10;
  margin-top: auto;
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
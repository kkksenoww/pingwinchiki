<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { inventory, getPenguinById, penguinBase } = useGacha()

// Преобразуем id вхождения в объекты пингвинов
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

// Все пингвины с пометкой, есть ли они у игрока
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
    result.push({
      id: penguin.id,
      name: penguin.name,
      rarity: penguin.rarity,
      image: penguin.image,
      owned: owned
    })
  }
  
  // Сортировка
  const sorted = []
  const order = ['legendary', 'epic', 'rare', 'common']

  // Сначала полученные по редкости
  for (let r = 0; r < order.length; r++) {
    for (let i = 0; i < result.length; i++) {
      if (result[i].rarity === order[r] && result[i].owned) {
        sorted.push(result[i])
      }
    }
  }
  
  // Потом неполученные по редкости
  for (let r = 0; r < order.length; r++) {
    for (let i = 0; i < result.length; i++) {
      if (result[i].rarity === order[r] && !result[i].owned) {
        sorted.push(result[i])
      }
    }
  }
  
  return sorted
})

// Считаем только уникальных пингвинов
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

function goBack() {
  router.push({ name: 'home' })
}
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
        :class="{ locked: !penguin.owned }"
      >
        <img :src="penguin.image" :alt="penguin.name" />
        <div class="name">{{ penguin.name }}</div>
        <div class="rarity" :class="penguin.rarity">
          {{ penguin.rarity }}
        </div>
        <div v-if="!penguin.owned" class="locked-overlay">
          🔒
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.collection-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #00416a, #0f2027);
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
  backdrop-filter: blur(5px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
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

.penguin-card.locked {
  opacity: 0.4;
  filter: grayscale(80%);
}

.name {
  font-weight: bold;
  font-size: 14px;
}

.rarity {
  font-size: 12px;
  opacity: 0.7;
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
</style>
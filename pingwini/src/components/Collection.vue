<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const { inventory, getPenguinById } = useGacha()

// Преобразуем id вхождения в объекты пингвинов
const ownedPenguins = computed(() =>
  inventory.value.map((id) => getPenguinById(id)).filter((p) => p !== null)
)

function goBack() {
  router.push('/')
}
</script>

<template>
  <div class="collection-page">
    <div class="header">
      <button class="back-btn" @click="goBack">←</button>
      <span class="title">Стая</span>
      <div class="count">{{ ownedPenguins.length }} пингвинов</div>
    </div>

    <div v-if="ownedPenguins.length === 0" class="empty">
      <p>У вас пока нет пингвинов.</p>
      <p>Ловите рыбу и получайте карточки для Гачи!</p>
    </div>

    <div class="grid" v-else>
      <div
        v-for="penguin in ownedPenguins"
        :key="penguin.id"
        class="penguin-card"
      >
        <img :src="penguin.image" :alt="penguin.name" />
        <div class="name">{{ penguin.name }}</div>
        <div class="rarity" :class="penguin.rarity">
          {{ penguin.rarity }}
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
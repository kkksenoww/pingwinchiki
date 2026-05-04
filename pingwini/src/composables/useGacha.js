import { ref } from 'vue'


const fishCount = ref(0)
const fishInventory = ref([])
const tickets = ref(0)
const inventory = ref([])


const penguinLevel = ref(1)
const penguinXp = ref(0)


const penguinsDB = [
  { id: 1, name: 'Обычный пингвин', rarity: 'common', image: '/src/assets/penguins/common.png' },
  { id: 2, name: 'Ледяной пингвин', rarity: 'rare', image: '/src/assets/penguins/rare.png' },
  { id: 3, name: 'Королевский пингвин', rarity: 'epic', image: '/src/assets/penguins/epic.png' },
  { id: 4, name: 'Пингвин-призрак', rarity: 'legendary', image: '/src/assets/penguins/legendary.png' }
]


function saveToLocalStorage() {
  localStorage.setItem('penguin_fish', fishCount.value)
  localStorage.setItem('penguin_fish_inventory', JSON.stringify(fishInventory.value))
  localStorage.setItem('penguin_tickets', tickets.value)
  localStorage.setItem('penguin_inventory', JSON.stringify(inventory.value))
  localStorage.setItem('penguin_level', penguinLevel.value)
  localStorage.setItem('penguin_xp', penguinXp.value)
}

function loadFromLocalStorage() {
  const savedFish = localStorage.getItem('penguin_fish')
  const savedFishInv = localStorage.getItem('penguin_fish_inventory')
  const savedTickets = localStorage.getItem('penguin_tickets')
  const savedInv = localStorage.getItem('penguin_inventory')
  const savedLevel = localStorage.getItem('penguin_level')
  const savedXp = localStorage.getItem('penguin_xp')

  if (savedFish) fishCount.value = parseInt(savedFish)
  if (savedFishInv) fishInventory.value = JSON.parse(savedFishInv)
  if (savedTickets) tickets.value = parseInt(savedTickets)
  if (savedInv) inventory.value = JSON.parse(savedInv)
  if (savedLevel) penguinLevel.value = parseInt(savedLevel)
  if (savedXp) penguinXp.value = parseInt(savedXp)
}


function addFish(amount, type = 'small') {
  fishCount.value += amount

  const existing = fishInventory.value.find(f => f.type === type)
  if (existing) {
    existing.amount += amount
  } else {
    fishInventory.value.push({ type, amount })
  }

  saveToLocalStorage()
}

function getFishByType(type) {
  const found = fishInventory.value.find(f => f.type === type)
  return found ? found.amount : 0
}

function getTotalFish() {
  return fishInventory.value.reduce((sum, f) => sum + f.amount, 0)
}

function removeFishByType(type, amount = 1) {
  const index = fishInventory.value.findIndex(f => f.type === type)
  if (index === -1) return false

  const fish = fishInventory.value[index]
  if (fish.amount < amount) return false

  fish.amount -= amount
  fishCount.value -= amount

  if (fish.amount === 0) {
    fishInventory.value.splice(index, 1)
  }

  saveToLocalStorage()
  return true
}


function addTicket(amount = 1) {
  tickets.value += amount
  saveToLocalStorage()
}

function pullGacha() {
  if (tickets.value <= 0) return null

  tickets.value--
  
  const rand = Math.random()
  let selectedRarity = 'common'

  if (rand < 0.05) selectedRarity = 'legendary'
  else if (rand < 0.15) selectedRarity = 'epic'
  else if (rand < 0.35) selectedRarity = 'rare'
  else selectedRarity = 'common'

  const available = penguinsDB.filter(p => p.rarity === selectedRarity)
  const pulled = available[Math.floor(Math.random() * available.length)]

  inventory.value.push(pulled.id)
  saveToLocalStorage()
  return pulled
}

function getPenguinById(id) {
  return penguinsDB.find(p => p.id === id) || null
}


function addXp(amount) {
  penguinXp.value += amount
  let leveledUp = false

  while (penguinXp.value >= penguinLevel.value * 100) {
    penguinXp.value -= penguinLevel.value * 100
    penguinLevel.value++
    leveledUp = true
  }

  saveToLocalStorage()
  return leveledUp
}

function getPenguinLevel() {
  return penguinLevel.value
}


loadFromLocalStorage()


export default function useGacha() {
  return {
    // Данные
    fishCount,
    fishInventory,
    tickets,
    inventory,
    penguinLevel,
    penguinXp,

    // Рыба
    addFish,
    getFishByType,
    getTotalFish,
    removeFishByType,

    // Гача
    addTicket,
    pullGacha,
    getPenguinById,

    // Уровень
    addXp,
    getPenguinLevel
  }
}
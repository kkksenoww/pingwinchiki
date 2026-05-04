import { ref } from 'vue'


const fishCount = ref(0)
const fishInventory = ref([])
const tickets = ref(0)
const inventory = ref([])


const penguinLevel = ref(1)
const penguinXp = ref(0)


const penguinsDB = [
  { id: 1, name: 'Пингвин Адели', rarity: 'common', image: '/src/assets/penguins/adelie.png' },
  { id: 2, name: 'Императорский пингвин', rarity: 'legendary', image: '/src/assets/penguins/emperor.png' },
  { id: 3, name: 'Папуанский пингвин', rarity: 'rare', image: '/src/assets/penguins/gentoo.png' },
  { id: 4, name: 'Королевский пингвин', rarity: 'epic', image: '/src/assets/penguins/king.png' },
  { id: 5, name: 'Малый пингвин', rarity: 'common', image: '/src/assets/penguins/little.png' },
  { id: 6, name: 'Хохлатый пингвин', rarity: 'rare', image: '/src/assets/penguins/macaroni.png' },
  { id: 7, name: 'Золотой пингвин', rarity: 'legendary', image: '/src/assets/penguins/golden.png' }
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

  for (let i = 0; i < fishInventory.value.length; i++) {
    if (fishInventory.value[i].type === type) {
      fishInventory.value[i].amount += amount
      saveToLocalStorage()
      return
    }
  }
  fishInventory.value.push({ type, amount })
  saveToLocalStorage()
}

function getFishByType(type) {
  for (let i = 0; i < fishInventory.value.length; i++) {
    if (fishInventory.value[i].type === type) {
      return fishInventory.value[i].amount
    }
  }
  return 0
}

function getTotalFish() {
  let sum = 0
  for (let i = 0; i < fishInventory.value.length; i++) {
    sum = sum + fishInventory.value[i].amount
  }
  return sum
}

function removeFishByType(type, amount = 1) {
  for (let i = 0; i < fishInventory.value.length; i++) {
    if (fishInventory.value[i].type === type) {
      if (fishInventory.value[i].amount < amount) return false
      
      fishInventory.value[i].amount -= amount
      fishCount.value -= amount
      
      if (fishInventory.value[i].amount === 0) {
        fishInventory.value.splice(i, 1)
      }
      
      saveToLocalStorage()
      return true
    }
  }
  return false
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

  const available = []
  for (let i = 0; i < penguinsDB.length; i++) {
    if (penguinsDB[i].rarity === selectedRarity) {
      available.push(penguinsDB[i])
    }
  }
  const pulled = available[Math.floor(Math.random() * available.length)]

  inventory.value.push(pulled.id)
  saveToLocalStorage()
  return pulled
}

function getPenguinById(id) {
  for (let i = 0; i < penguinsDB.length; i++) {
    if (penguinsDB[i].id === id) {
      return penguinsDB[i]
    }
  }
  return null
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
    fishCount,
    fishInventory,
    tickets,
    inventory,
    penguinLevel,
    penguinXp,

    penguinBase: penguinsDB,

    addFish,
    getFishByType,
    getTotalFish,
    removeFishByType,

    addTicket,
    pullGacha,
    getPenguinById,

    addXp,
    getPenguinLevel
  }
}
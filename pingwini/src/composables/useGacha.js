import { ref, computed } from 'vue'

// ---------- Конфигурация (все интервалы в минутах) ----------
const FISH_EXPIRY_MINUTES = 20
const HELP_INTERVAL_MINUTES = 20
const PASSIVE_TICK_MINUTES = 1
const MAX_PENGUIN_LEVEL = 5
const HUNGER_RATES = { baby: 5, young: 7, adult: 8, wise: 10 }
const SICK_HEALTH_DECAY = 1

// ---------- Состояние ----------
const fishCount = ref(0)
const fishInventory = ref([])
const tickets = ref(0)
const inventory = ref([])
const fragments = ref({})
const penguinLevel = ref(1)
const penguinXp = ref(0)
const health = ref(100)
const satiety = ref(80)
const isSick = ref(false)
const medicineCount = ref(2)
const isDead = ref(false)
const lastTimestamp = ref(Date.now())
const penguinLevels = ref({})
const eventLog = ref([])

const penguinStageImages = {
  baby: '/src/assets/babyy.png',
  young: '/src/assets/yong.webp',
  adult: '/src/assets/bigg.png',
  wise: '/src/assets/mudr.png'
}

const penguinsDB = [
  { id: 1, name: 'Пингвин Адели', rarity: 'common', image: '/src/assets/penguins/adelie.png' },
  { id: 2, name: 'Императорский пингвин', rarity: 'legendary', image: '/src/assets/penguins/emperor.png' },
  { id: 3, name: 'Папуанский пингвин', rarity: 'rare', image: '/src/assets/penguins/gentoo.png' },
  { id: 4, name: 'Королевский пингвин', rarity: 'epic', image: '/src/assets/penguins/king.png' },
  { id: 5, name: 'Малый пингвин', rarity: 'common', image: '/src/assets/penguins/little.png' },
  { id: 6, name: 'Хохлатый пингвин', rarity: 'rare', image: '/src/assets/penguins/macaroni.png' },
  { id: 7, name: 'Золотой пингвин', rarity: 'legendary', image: '/src/assets/penguins/golden.png' }
]

function getPenguinStage() {
  const lvl = penguinLevel.value
  if (lvl >= 25) return 'wise'
  if (lvl >= 15) return 'adult'
  if (lvl >= 5) return 'young'
  return 'baby'
}

// ---------- Сохранение/загрузка ----------
function saveToLocalStorage() {
  localStorage.setItem('penguin_fish', fishCount.value)
  localStorage.setItem('penguin_fish_inventory', JSON.stringify(fishInventory.value))
  localStorage.setItem('penguin_tickets', tickets.value)
  localStorage.setItem('penguin_inventory', JSON.stringify(inventory.value))
  localStorage.setItem('penguin_fragments', JSON.stringify(fragments.value))
  localStorage.setItem('penguin_level', penguinLevel.value)
  localStorage.setItem('penguin_xp', penguinXp.value)
  localStorage.setItem('penguin_health', health.value)
  localStorage.setItem('penguin_satiety', satiety.value)
  localStorage.setItem('penguin_isSick', isSick.value)
  localStorage.setItem('penguin_medicine', medicineCount.value)
  localStorage.setItem('penguin_isDead', isDead.value)
  localStorage.setItem('penguin_lastTimestamp', lastTimestamp.value)
  localStorage.setItem('penguin_levels', JSON.stringify(penguinLevels.value))
  localStorage.setItem('penguin_eventLog', JSON.stringify(eventLog.value.slice(-50)))
}

function loadFromLocalStorage() {
  const saved = (key) => localStorage.getItem(key)
  const parse = (key, fallback) => { const val = saved(key); return val ? JSON.parse(val) : fallback }

  fishCount.value = Number(saved('penguin_fish')) || 0
  fishInventory.value = parse('penguin_fish_inventory', [])
  tickets.value = Number(saved('penguin_tickets')) || 0
  inventory.value = parse('penguin_inventory', [])
  fragments.value = parse('penguin_fragments', {})
  penguinLevel.value = Number(saved('penguin_level')) || 1
  penguinXp.value = Number(saved('penguin_xp')) || 0
  health.value = Number(saved('penguin_health')) || 100
  satiety.value = Number(saved('penguin_satiety')) || 80
  isSick.value = saved('penguin_isSick') === 'true'
  medicineCount.value = Number(saved('penguin_medicine')) || 2
  isDead.value = saved('penguin_isDead') === 'true'
  lastTimestamp.value = Number(saved('penguin_lastTimestamp')) || Date.now()
  penguinLevels.value = parse('penguin_levels', {})
  eventLog.value = parse('penguin_eventLog', [])
}

export function hasSaveData() {
  return localStorage.getItem('penguin_level') !== null
}

function addLog(message) {
  const time = new Date().toLocaleTimeString()
  eventLog.value.unshift({ time, message })
  if (eventLog.value.length > 50) eventLog.value.pop()
  saveToLocalStorage()
}

// Удаление просроченной рыбы (поштучно)
function removeExpiredFish() {
  const now = Date.now()
  const expiryMs = FISH_EXPIRY_MINUTES * 60 * 1000
  let removed = 0
  fishInventory.value = fishInventory.value.filter(f => {
    if (now - f.timestamp > expiryMs) {
      removed++
      return false
    }
    return true
  })
  if (removed > 0) {
    fishCount.value -= removed
    addLog(`Испортилось ${removed} рыб.`)
  }
}

// Пассивный прогресс (голод, болезнь, порча рыбы, помощь стаи)
function processPassiveProgress() {
  if (isDead.value) return
  const now = Date.now()
  const elapsedMs = now - lastTimestamp.value
  if (elapsedMs <= 0) return

  const elapsedMinutes = elapsedMs / 60000

  const stage = getPenguinStage()
  const hungerRate = HUNGER_RATES[stage] || 5
  satiety.value = Math.max(0, satiety.value - hungerRate * elapsedMinutes)

  if (satiety.value <= 0 && !isSick.value) {
    isSick.value = true
    addLog('Пико заболел от голода!')
  }

  if (isSick.value) {
    health.value = Math.max(0, health.value - SICK_HEALTH_DECAY * elapsedMinutes)
    if (health.value <= 0) {
      isDead.value = true
      health.value = 0
      addLog('Пико умер...')
    }
  }

  const nowFloor = Math.floor(now / 60000)
  const lastFloor = Math.floor(lastTimestamp.value / 60000)
  if (nowFloor > lastFloor) {
    removeExpiredFish()
  }

  const helpMinutes = Math.floor(elapsedMinutes / HELP_INTERVAL_MINUTES)
  for (let i = 0; i < helpMinutes; i++) {
    triggerStasiHelp()
  }

  lastTimestamp.value = now
  saveToLocalStorage()
}

function triggerStasiHelp() {
  let helped = false
  for (const pid of inventory.value) {
    const penguin = getPenguinById(pid)
    if (!penguin) continue
    const { medChance, fishChance } = getStasiHelpChances(pid)

    if (Math.random() < medChance) {
      medicineCount.value++
      helped = true
    }

    if (Math.random() < fishChance) {
      const types = ['small', 'river', 'sea', 'squid', 'royal']
      const type = types[Math.floor(Math.random() * types.length)]
      const amount = type === 'royal' ? 1 : Math.floor(Math.random() * 2) + 1
      for (let a = 0; a < amount; a++) addFish(1, type) 
      helped = true
    }
  }
  if (helped) addLog('Стая принесла помощь!')
}

function getStasiHelpChances(penguinId) {
  const penguin = getPenguinById(penguinId)
  if (!penguin) return { medChance: 0, fishChance: 0 }
  const level = penguinLevels.value[penguinId] || 1
  const rarity = penguin.rarity

  const baseMedChance = { common: 0.05, rare: 0.07, epic: 0.09, legendary: 0.12 }
  const medChance = Math.min(0.5, (baseMedChance[rarity] || 0.05) + (level - 1) * 0.03)

  const baseFishChance = { common: 0.02, rare: 0.03, epic: 0.04, legendary: 0.06 }
  const fishChance = Math.min(0.3, (baseFishChance[rarity] || 0.02) + (level - 1) * 0.02)

  return { medChance, fishChance }
}

function addFish(amount = 1, type = 'small', species = '') {
  if (fishCount.value >= 100) return false
  let added = 0
  for (let i = 0; i < amount; i++) {
    if (fishCount.value >= 100) break
    fishInventory.value.push({
      type,
      species: species || type,
      timestamp: Date.now()
    })
    fishCount.value++
    added++
  }
  saveToLocalStorage()
  return added > 0
}

function removeFishByIndex(index) {
  if (index < 0 || index >= fishInventory.value.length) return false
  fishInventory.value.splice(index, 1)
  fishCount.value--
  saveToLocalStorage()
  return true
}

function removeFishByType(type, amount = 1) {
  const items = fishInventory.value.filter(f => f.type === type)
  if (items.length < amount) return false
  items.sort((a, b) => a.timestamp - b.timestamp)
  for (let i = 0; i < amount; i++) {
    const index = fishInventory.value.indexOf(items[i])
    if (index > -1) fishInventory.value.splice(index, 1)
    fishCount.value--
  }
  saveToLocalStorage()
  return true
}

function getTotalFish() { return fishCount.value }
function getFishByType(type) {
  return fishInventory.value.filter(f => f.type === type).length
}

function addTicket(amount = 1) { tickets.value += amount; saveToLocalStorage() }

function pullGacha() {
  if (tickets.value <= 0) return null
  tickets.value--
  const rand = Math.random()
  let rarity = 'common'
  if (rand < 0.05) rarity = 'legendary'
  else if (rand < 0.15) rarity = 'epic'
  else if (rand < 0.35) rarity = 'rare'
  const available = penguinsDB.filter(p => p.rarity === rarity)
  const pulled = available[Math.floor(Math.random() * available.length)]
  const fullChanceMap = { common: 0.10, rare: 0.07, epic: 0.04, legendary: 0.02 }
  const gotFull = Math.random() < fullChanceMap[rarity]
  const alreadyOwned = inventory.value.includes(pulled.id)

  if (gotFull && !alreadyOwned) {
    inventory.value.push(pulled.id)
    if (!penguinLevels.value[pulled.id]) penguinLevels.value[pulled.id] = 1
    addLog(`Получен новый пингвин: ${pulled.name}!`)
    saveToLocalStorage()
    return { type: 'penguin', penguin: pulled }
  }
  if (gotFull && alreadyOwned) {
    fragments.value[pulled.id] = (fragments.value[pulled.id] || 0) + 10
    addLog(`+10 фрагментов за дубликат ${pulled.name}`)
    saveToLocalStorage()
    return { type: 'fragments', penguin: pulled, amount: 10, duplicate: true }
  }
  const fragAmount = Math.floor(Math.random() * 3) + 1
  fragments.value[pulled.id] = (fragments.value[pulled.id] || 0) + fragAmount
  if (!alreadyOwned && fragments.value[pulled.id] >= 10) {
    fragments.value[pulled.id] -= 10
    inventory.value.push(pulled.id)
    if (!penguinLevels.value[pulled.id]) penguinLevels.value[pulled.id] = 1
    addLog(`Собран новый пингвин из фрагментов: ${pulled.name}!`)
    saveToLocalStorage()
    return { type: 'fragments', penguin: pulled, amount: fragAmount, collected: true }
  }
  saveToLocalStorage()
  return { type: 'fragments', penguin: pulled, amount: fragAmount, collected: false }
}

function pullGacha10() {
  const results = []
  for (let i = 0; i < 10; i++) {
    if (tickets.value <= 0) break
    const r = pullGacha()
    if (r) results.push(r)
  }
  return results
}

function getPenguinById(id) { return penguinsDB.find(p => p.id === id) || null }

function upgradePenguin(id) {
  const currentLvl = penguinLevels.value[id] || 1
  if (currentLvl >= MAX_PENGUIN_LEVEL) return false
  const cost = currentLvl * 10
  if (fragments.value[id] >= cost && inventory.value.includes(id)) {
    fragments.value[id] -= cost
    penguinLevels.value[id] = currentLvl + 1
    addLog(`${getPenguinById(id)?.name} улучшен до уровня ${currentLvl + 1}`)
    saveToLocalStorage()
    return true
  }
  return false
}

function convertFragmentsToFish(id) {
  const currentLvl = penguinLevels.value[id] || 1
  if (currentLvl < MAX_PENGUIN_LEVEL) return false
  const frags = fragments.value[id] || 0
  if (frags < 10) return false
  const fishGain = Math.floor(frags / 10) * 5
  fragments.value[id] -= Math.floor(frags / 10) * 10
  for (let i = 0; i < fishGain; i++) addFish(1, 'small') 
  addLog(`Обменено фрагментов: получено ${fishGain} рыбы`)
  saveToLocalStorage()
  return true
}

function tryHealSickness() {
  if (isSick.value) {
    isSick.value = false
    addLog('Пико выздоровел!')
  }
}

function feedPenguin(fishType) {
  const fishData = {
    small: { xp: 5, satiety: 20 },
    river: { xp: 12, satiety: 25 },
    sea: { xp: 20, satiety: 30 },
    squid: { xp: 30, satiety: 35 },
    royal: { xp: 50, satiety: 40 }
  }
  const info = fishData[fishType]
  if (!info) return false
  if (!removeFishByType(fishType, 1)) return false
  satiety.value = Math.min(100, Math.round(satiety.value + info.satiety))
  const lev = addXp(info.xp)
  saveToLocalStorage()
  return { lev, satiety: info.satiety, xp: info.xp }
}

function healPenguin() {
  if (medicineCount.value <= 0) return false
  medicineCount.value--
  health.value = Math.min(100, Math.round(health.value + 30))
  tryHealSickness()
  addLog('Пико вылечен.')
  saveToLocalStorage()
  return true
}

function addXp(amount) {
  penguinXp.value += amount
  let leveledUp = false
  while (penguinXp.value >= penguinLevel.value * 100) {
    penguinXp.value -= penguinLevel.value * 100
    penguinLevel.value++
    leveledUp = true
  }
  if (leveledUp) addLog(`Пико достиг ${penguinLevel.value} уровня!`)
  saveToLocalStorage()
  return leveledUp
}

function getPenguinLevel() { return penguinLevel.value }
function resetGame() { localStorage.clear(); window.location.reload() }

loadFromLocalStorage()
processPassiveProgress()

const penguinStage = computed(() => getPenguinStage())
const penguinStageImage = computed(() => penguinStageImages[getPenguinStage()])
const hungerRate = computed(() => HUNGER_RATES[getPenguinStage()])

export default function useGacha() {
  return {
    fishCount, fishInventory, tickets, inventory, fragments, penguinLevel, penguinXp,
    health, satiety, isSick, medicineCount, isDead, penguinLevels, eventLog,
    penguinBase: penguinsDB,
    penguinStage,
    penguinStageImage,
    hungerRate,
    MAX_PENGUIN_LEVEL,
    addFish, removeFishByType, removeFishByIndex, getTotalFish, getFishByType, addTicket,
    pullGacha, pullGacha10, getPenguinById, upgradePenguin, convertFragmentsToFish,
    feedPenguin, healPenguin, addXp, getPenguinLevel, resetGame,
    processPassiveProgress, removeExpiredFish, addLog,
    getStasiHelpChances
  }
}
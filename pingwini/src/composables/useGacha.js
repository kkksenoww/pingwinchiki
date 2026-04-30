import { ref } from 'vue'

const STORAGE_KEY = 'pingwini_gacha'

// База пингвинов (id, имя, редкость, картинка)
const penguinBase = [
    { id: 1, name: 'Пингвин Адели', rarity: 'common', image: '/src/assets/penguins/adelie.png' },
    { id: 2, name: 'Императорский пингвин', rarity: 'legendary', image: '/src/assets/penguins/emperor.png' },
    { id: 3, name: 'Папуанский пингвин', rarity: 'rare', image: '/src/assets/penguins/gentoo.png' },
    { id: 4, name: 'Королевский пингвин', rarity: 'epic', image: '/src/assets/penguins/king.png' },
    { id: 5, name: 'Малый пингвин', rarity: 'common', image: '/src/assets/penguins/little.png' },
    { id: 6, name: 'Хохлатый пингвин', rarity: 'rare', image: '/src/assets/penguins/macaroni.png' },
    { id: 7, name: 'Золотой пингвин', rarity: 'legendary', image: '/src/assets/penguins/golden.png' }
]

// Загрузка из localStorage или стартовые значения
const saved = localStorage.getItem(STORAGE_KEY)
const initialData = saved ? JSON.parse(saved) : { tickets: 0, fishCount: 0, inventory: [] }

const tickets = ref(initialData.tickets)
const fishCount = ref(initialData.fishCount)
const inventory = ref(initialData.inventory) // массив id пингвинов

function save() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            tickets: tickets.value,
            fishCount: fishCount.value,
            inventory: inventory.value
        })
    )
}

/** Добавляет билеты (например, с рыбалки) */
function addTicket(amount = 1) {
    tickets.value += amount
    save()
}

/** Тратит один билет, возвращает true, если билеты были */
function spendTicket() {
    if (tickets.value <= 0) return false
    tickets.value--
    save()
    return true
}

/** Добавляет рыбу (с рыбалки) */
function addFish(amount = 1) {
    fishCount.value += amount
    save()
}

/** Находит пингвина по id */
function getPenguinById(id) {
    return penguinBase.find((p) => p.id === id) || null
}

/*
 * Крутка гачи: тратит 1 билет, возвращает выпавшего пингвина или null.
 * Редкость: common 60%, rare 25%, epic 10%, legendary 5%.
 */
function pullGacha() {
    if (!spendTicket()) return null

    // Определяем редкость по случайному числу
    const rand = Math.random() * 100
    let rarity
    if (rand < 60) rarity = 'common'
    else if (rand < 85) rarity = 'rare'
    else if (rand < 95) rarity = 'epic'
    else rarity = 'legendary'

    const pool = penguinBase.filter((p) => p.rarity === rarity)
    const pulled = pool[Math.floor(Math.random() * pool.length)]
    inventory.value.push(pulled.id)
    save()
    return pulled
}

export default function useGacha() {
    return {
        penguinBase, tickets, fishCount, inventory, addTicket, spendTicket, addFish, pullGacha, getPenguinById
    }
}
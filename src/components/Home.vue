<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import useGacha from '../composables/useGacha'

const router = useRouter()
const {
    health, satiety, isSick, isDead, medicineCount,
    penguinLevel, penguinXp, penguinStage, penguinStageImage,
    feedPenguin, healPenguin, getFishByType, resetGame, processPassiveProgress
} = useGacha()

const roundedSatiety = computed(() => Math.round(satiety.value))
const roundedHealth = computed(() => Math.round(health.value))
const roundedXp = computed(() => Math.round(penguinXp.value))

const statCss = computed(() => Math.round(satiety.value) + '%')
const healthCss = computed(() => Math.round(health.value) + '%')
const xpToNext = computed(() => penguinLevel.value * 100)

const bestAvailableFish = computed(() => {
    const types = ['royal', 'squid', 'sea', 'river', 'small']
    for (const t of types) {
        if (getFishByType(t) > 0) return t
    }
    return null
})

const feedMessage = ref('')
let feedMsgTimeout = null

let passiveTimer = null
onMounted(() => {
    processPassiveProgress()
    passiveTimer = setInterval(() => {
        processPassiveProgress()
    }, 1000)
})
onUnmounted(() => {
    clearInterval(passiveTimer)
})


function feed() {
    const fishType = bestAvailableFish.value
    if (!fishType) {
        feedMessage.value = 'Нет рыбы! Сходите на рыбалку.'
        clearTimeout(feedMsgTimeout)
        feedMsgTimeout = setTimeout(() => feedMessage.value = '', 2000)
        return
    }
    const result = feedPenguin(fishType)
    if (!result) {
        feedMessage.value = 'Ошибка кормления.'
        return
    }
    feedMessage.value = `+${result.satiety} еды, +${result.xp} XP${result.lev ? ' 🆙 Уровень!' : ''}`
    clearTimeout(feedMsgTimeout)
    feedMsgTimeout = setTimeout(() => feedMessage.value = '', 2500)
}

function heal() {
    if (!healPenguin()) {
        feedMessage.value = 'Нет лекарств!'
        clearTimeout(feedMsgTimeout)
        feedMsgTimeout = setTimeout(() => feedMessage.value = '', 2000)
    } else {
        feedMessage.value = '+30 здоровья'
        clearTimeout(feedMsgTimeout)
        feedMsgTimeout = setTimeout(() => feedMessage.value = '', 2000)
    }
}

function goToStart() {
    router.push('/')
}
</script>

<template>
    <div v-if="isDead" class="dead-overlay">
        <div class="dead-message">
            <h1>😢 Пико покинул нас...</h1>
            <p>Вы не уследили за своим питомцем.</p>
            <div class="dead-buttons">
                <button @click="resetGame">Новая игра</button>
                <button @click="goToStart">Выйти в меню</button>
            </div>
        </div>
    </div>

    <div v-else class="home-container">
        <img src="../assets/snejinki.png" class="fon" alt="" />

        <div class="stats-panel-mini">
            <div class="stat-card">
                <img src="../assets/fish.png" alt="" /> {{ roundedSatiety }}%
                <div class="stat-bar-bg">
                    <div class="stat-bar satiety-fill"></div>
                </div>
            </div>
            <div class="stat-card">
                <img src="../assets/hp.png" alt="" /> {{ roundedHealth }}%
                <div class="stat-bar-bg">
                    <div class="stat-bar health-fill"></div>
                </div>
            </div>
            <div class="stat-card level-badge-mini">
                <img src="../assets/kubok.png" alt="" /> {{ penguinLevel }} | <img src="../assets/star.png" alt="" /> {{
                    roundedXp }}/{{ xpToNext }}
            </div>
            <div v-if="isSick" class="sick-badge">🤒 Болен</div>
            <div class="medicine-count">💊 {{ medicineCount }}</div>
        </div>

        <div class="penguin-wrapper">
            <img :src="penguinStageImage" alt="Пико" class="penguin-img" />
            <div class="stage-label">{{ penguinStage === 'baby' ? 'Малыш' : penguinStage === 'young' ? 'Юный' :
                penguinStage === 'adult' ? 'Взрослый' : 'Мудрец' }}</div>
        </div>

        <div v-if="feedMessage" class="feed-msg">{{ feedMessage }}</div>

        <p v-if="isSick" class="sick-hint">🤒 Пико болен! Покормите его или используйте лекарство.</p>

        <div class="action-buttons-mini">
            <button @click="feed">🐟 Кормить</button>
            <button v-if="medicineCount > 0 && health < 100" @click="heal" class="heal-btn">💊 Лечить</button>
        </div>

        <!-- Нижняя навигация -->
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
        
    <div v-if="message" class="message-toast">{{ message }}</div>
    
</template>


<style scoped>
.home-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 93vh;
    background: radial-gradient(circle at 70% 20%, #3bc1ff, #004f72);
    padding: 20px;
    overflow: hidden;
    font-family: system-ui, sans-serif;
}

.fon {
    position: absolute;
}

.stats-panel-mini {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(6px);
    padding: 10px 20px;
    border-radius: 40px;
    margin-bottom: 24px;
    z-index: 2;
}

.stat-card {
    display: flex;
    align-items: center;
    gap: 6px;
    color: white;
    font-size: 0.9rem;
    font-weight: 500;
}

.stat-card img {
    width: 20px;
    height: 20px;
    object-fit: contain;
}

.stat-bar-bg {
    width: 60px;
    height: 8px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    overflow: hidden;
}

.stat-bar {
    height: 100%;
    transition: width 0.4s ease;
}

.satiety-fill {
    background: #4caf50;
    width: v-bind(statCss);
}

.health-fill {
    background: #e74c3c;
    width: v-bind(healthCss);
}

.level-badge-mini {
    background: white;
    color: #2c3e66;
    padding: 2px 12px;
    border-radius: 20px;
    font-weight: 600;
}

.sick-badge {
    background: #e74c3c;
    color: white;
    padding: 2px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
}

.medicine-count {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 12px;
    border-radius: 20px;
    color: white;
    font-size: 0.9rem;
    font-weight: 600;
}

.penguin-wrapper {
    margin: 20px 0 10px;
    text-align: center;
    z-index: 2;
}

.penguin-img {
    display: block;
    width: 200px;
    max-width: 80vw;
    filter: drop-shadow(0 12px 18px rgba(0, 0, 0, 0.5));
    cursor: pointer;
    transition: transform 0.1s;
}

.penguin-img:active {
    transform: scale(0.96);
}

.stage-label {
    color: white;
    margin-top: 10px;
    font-weight: bold;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    background: rgba(0, 0, 0, 0.3);
    display: inline-block;
    padding: 4px 16px;
    border-radius: 20px;
}

.feed-msg {
    background: rgba(0, 0, 0, 0.75);
    color: #ffd966;
    padding: 8px 24px;
    border-radius: 30px;
    margin: 10px 0;
    font-size: 0.95rem;
    font-weight: 500;
    z-index: 2;
}

.sick-hint {
    color: #ffd966;
    background: rgba(231, 76, 60, 0.7);
    padding: 4px 16px;
    border-radius: 12px;
    font-size: 0.85rem;
    margin: 5px 0;
    z-index: 2;
}

.action-buttons-mini {
    display: flex;
    gap: 20px;
    justify-content: center;
    margin: 20px 0 30px;
    z-index: 2;
}

.action-buttons-mini button {
    background: #ffdd99;
    border: none;
    font-size: 1.2rem;
    padding: 14px 32px;
    border-radius: 50px;
    font-weight: bold;
    color: #1e3b4f;
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 8px;
}

.action-buttons-mini button:active {
    transform: scale(0.96);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.heal-btn {
    background: #a5d6a5 !important;
    color: #1e3b4f;
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

.dead-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.dead-message {
    background: white;
    padding: 40px;
    border-radius: 24px;
    text-align: center;
    max-width: 320px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.dead-message h1 {
    margin: 0 0 10px;
    font-size: 1.8rem;
}

.dead-message p {
    color: #555;
    margin-bottom: 24px;
}

.dead-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
}

.dead-buttons button {
    padding: 14px;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 30px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.2s;
}

.dead-buttons button:last-child {
    background: #3498db;
}
</style>
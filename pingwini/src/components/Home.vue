<script setup>
import { ref, computed } from 'vue'
import useGacha from '../composables/useGacha'

const { 
  addXp, 
  getPenguinLevel, 
  penguinXp, 
  penguinLevel,
  removeFishByType,
  getTotalFish,
  getFishByType
} = useGacha()

const satiety = ref(70)
const health = ref(100)

const message = ref('')
let msgTimeout = null
const showBubble = ref(false)
const bubbleText = ref('')

const statCss = ref(satiety.value + '%')
const healthCss = ref(health.value + '%')

const xpToNext = computed(() => getPenguinLevel() * 100)

const hasFish = computed(() => getTotalFish() > 0)

const fishStats = {
  small: { xp: 5, satiety: 25, name: 'Мелкая рыба' },
  river: { xp: 12, satiety: 35, name: 'Речная рыба' },
  sea: { xp: 20, satiety: 45, name: 'Морская рыба' },
  squid: { xp: 30, satiety: 55, name: 'Кальмар' },
  royal: { xp: 50, satiety: 75, name: 'Королевская рыба' }
}

const getBestAvailableFish = () => {
  const types = ['royal', 'squid', 'sea', 'river', 'small']
  for (const type of types) {
    const amount = getFishByType(type)
    if (amount > 0) {
      return { type, ...fishStats[type] }
    }
  }
  return null
}

const showText = (text, duration = 2000) => {
    if (msgTimeout) clearTimeout(msgTimeout)
    message.value = text
    msgTimeout = setTimeout(() => {
        message.value = ''
    }, duration)
}

const tapPico = () => {
    bubbleText.value = 'Пиу!'
    showBubble.value = true
    setTimeout(() => {
        showBubble.value = false
    }, 1200)
}

const feed = () => {
    if (!hasFish.value) {
        showText('Нет рыбы в холодильнике! Сходи на рыбалку', 2000)
        return
    }
    
    const fish = getBestAvailableFish()
    if (!fish) return
    
    removeFishByType(fish.type, 1)
    
    satiety.value = Math.min(100, satiety.value + fish.satiety)
    const leveled = addXp(fish.xp)
    
    showText(`+${fish.satiety} сытости, +${fish.xp} XP (${fish.name})`, 2000)
    
    if (leveled) {
        showText(`УРОВЕНЬ ${getPenguinLevel()}!`, 3000)
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

const heal = () => {
    health.value = Math.min(100, health.value + 5)
    showText('+5 здоровья', 1000)
}

import { watch } from 'vue'
watch([satiety, health], () => {
    statCss.value = satiety.value + '%'
    healthCss.value = health.value + '%'
})
</script>

<template>
    <!-- Хороший финал -->
    <div v-if="isGoodEnding" class="good-ending-overlay">
        <div class="good-ending-message">
            <h1>🎉 Поздравляем! 🐧</h1>
            <p>Пико прожил долгую счастливую жизнь, окружённый верной стаей!</p>
            <p>Вы достигли всех целей и подарили ему лучшую судьбу.</p>
            <div class="dead-buttons">
                <button @click="resetGame">Новая игра</button>
                <button @click="goToStart">Выйти в меню</button>
            </div>
        </div>
    </div>

    <!-- Смерть -->
    <div v-else-if="isDead" class="dead-overlay">
        <div class="dead-message">
            <h1>😢 Пико покинул нас...</h1>
            <p>Вы не уследили за своим питомцем.</p>
            <div class="dead-buttons">
                <button @click="resetGame">Новая игра</button>
                <button @click="goToStart">Выйти в меню</button>
            </div>
        </div>
    </div>

    <!-- Обычный экран -->
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
                <img src="../assets/kubok.png" alt=""> {{ getPenguinLevel()}} | <img src="../assets/star.png" alt=""> {{ penguinXp }}/{{
                    xpToNext }}
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
        
    <div v-if="message" class="message-toast">{{ message }}</div>
       </div> 
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
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.15;
    pointer-events: none;
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

.good-ending-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
}

.good-ending-message {
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    color: white;
    padding: 40px;
    border-radius: 24px;
    text-align: center;
    max-width: 380px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        font-family: system-ui, sans-serif;
}

.good-ending-message h1 {
    margin: 0 0 10px;
    font-size: 2rem;
        font-family: system-ui, sans-serif;
}

.good-ending-message p {
    margin-bottom: 12px;
    font-size: 1.1rem;
        font-family: system-ui, sans-serif;
}

.good-ending-message .dead-buttons button {
    background: #ffd700;
    color: #1e3b4f;
    font-weight: bold;
}

.good-ending-message .dead-buttons button:last-child {
    background: #81c784;
}
</style>
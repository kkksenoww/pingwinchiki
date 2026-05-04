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
    <div class="home-container">
        <img src="../assets/snejinki.png" class="fon" alt="">
        <!-- Верхние шкалы -->
        <div class="stats-panel-mini">
            <div class="stat-card">
                <img src="../assets/fish.png" alt=""> {{ satiety }}
                <div class="stat-bar-bg">
                    <div class="stat-bar satiety-fill"></div>
                </div>
            </div>
            <div class="stat-card">
                <img src="../assets/hp.png" alt=""> {{ health }}
                <div class="stat-bar-bg">
                    <div class="stat-bar health-fill"></div>
                </div>
            </div>
            <div class="stat-card level-badge-mini">
                <img src="../assets/kubok.png" alt=""> {{ getPenguinLevel()}} | <img src="../assets/star.png" alt=""> {{ penguinXp }}/{{
                    xpToNext }}
            </div>
        </div>

        <!-- пингвин -->
        <div class="penguin-wrapper">
            <img src="../assets/mini_piko.png" alt="Пингвин Пико" class="penguin-img" @click="tapPico" />
            <div v-if="showBubble" class="speech-bubble">{{ bubbleText }}</div>
        </div>


        <div class="action-buttons-mini">
            <button @click="feed">Покормить</button>
            <button @click="heal">Вылечить</button>
        </div>

        <!-- Нижняя навигация -->
        <div class="bottom-nav-mini">
            <router-link to="/ribalka" class="nav-item">
                <img src="../assets/fishing.png" class="nav-icon" alt="" />
                <span>Рыбалка</span>
            </router-link>

            <router-link to="/fridge" class="nav-item">
                <img src="../assets/holodil.png" class="nav-icon" alt="" />
                <span>Холодильник</span>
            </router-link>

            <router-link to="/gacha" class="nav-item">
                <img src="../assets/holodil.png" class="nav-icon" alt="" /> 
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
/* ----- ОСНОВНЫЕ СТИЛИ  ----- */
.home-container {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    min-height: 85vh;
    background: radial-gradient(circle at 70% 20%, #3bc1ff, #004f72);
    padding: 20px;
    overflow: hidden;
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
    font-family: system-ui, 'Segoe UI', 'Helvetica', sans-serif;
}


.fon {
    position: absolute;
}

/* Шкалы сверху */
.stats-panel-mini {
    position: absolute;
    top: 20px;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 20px;
    gap: 10px;
    flex-wrap: wrap;
    z-index: 2;
}

.stat-card {
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    border-radius: 40px;
    padding: 6px 14px;
    color: white;
    font-weight: bold;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 6px;

    img {
        width: 20px;
    }
}

.stat-bar-bg {
    width: 80px;
    height: 8px;
    background: #444;
    border-radius: 10px;
    overflow: hidden;
}

.stat-bar {
    height: 100%;
    border-radius: 10px;
    transition: width 0.2s;
}

.satiety-fill {
    background: #4caf50;
    width: v-bind(statCss)
}

.health-fill {
    background: #ff0000;
    width: v-bind(healthCss)
}

.level-badge-mini {
    background: white;
    color: #2c3e66;
    border-radius: 30px;
    padding: 4px 12px;
    font-size: 0.8rem;
}

/* Пингвин */
.penguin-wrapper {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 40px 0 20px;
    position: relative;
    z-index: 2;
}

.penguin-img {
    width: 280px;
    max-width: 80vw;
    filter: drop-shadow(0 20px 25px rgba(0, 0, 0, 0.3));
    cursor: pointer;
    transition: 0.1s;
}

.penguin-img:active {
    transform: scale(0.97);
}

.speech-bubble {
    position: absolute;
    background: white;
    border-radius: 30px;
    padding: 6px 14px;
    top: 60px;
    left: 80%;
    white-space: nowrap;
    font-weight: bold;
    color: #2c3e66;
    box-shadow: 0 2px 8px black;
    z-index: 3;
}

/* Кнопки */
.action-buttons-mini {
    display: flex;
    gap: 24px;
    justify-content: center;
    margin-bottom: 10px;
    z-index: 2;
}

.action-buttons-mini button {
    background: #ffdd99;
    border: none;
    font-size: 1.2rem;
    padding: 12px 28px;
    border-radius: 40% 60% 40% 60% / 60% 40% 60% 40%;
    color: #1e4a66;
    font-weight: bold;
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: 0.1s;
}

.action-buttons-mini button:active {
    border-radius: 60% 40% 60% 40% / 40% 60% 40% 60%;
    transform: scale(0.96);
}

/* Нижняя навигация */
.bottom-nav-mini {
    display: flex;
    justify-content: space-around;
    background: rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(8px);
    padding: 8px;
    margin-top: 10px;
    width: 100%;
    z-index: 2;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: 0.05s;
}

.nav-item,
.router-link-active {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    text-decoration: none;
    color: white;
}

.nav-item:active {
    transform: scale(0.94);
}

.nav-icon {
    width: 36px;
    height: 36px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 40% 60% 40% 60%;
    padding: 6px;
    margin-bottom: 4px;
    object-fit: contain;
}

.nav-item span:last-child {
    font-size: 0.7rem;
    color: white;
    font-weight: bold;
}

/* Всплывающие сообщения */
.message-toast {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: black;
    color: white;
    padding: 6px 16px;
    border-radius: 40px;
    font-size: 0.9rem;
    z-index: 200;
    white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
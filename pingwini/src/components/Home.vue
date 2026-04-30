<script setup>
import { ref, computed } from 'vue'
// import { useRouter } from 'vue-router'

// const router = useRouter()

// Состояние пингвина
const satiety = ref(70)
const health = ref(100)
const xp = ref(0)
const level = ref(1)

const message = ref('')
let msgTimeout = null
const showBubble = ref(false)
const bubbleText = ref('')

// стили
const statCss = ref(satiety + '%')
const healthCss = ref(health + '%')

const xpToNext = computed(() => level.value * 100)

// временное сообщение
const showText = (text, duration = 2000) => {
    if (msgTimeout) clearTimeout(msgTimeout)
    message.value = text
    msgTimeout = setTimeout(() => {
        message.value = ''
    }, duration)
}

// Клик по пингвину
const tapPico = () => {
    bubbleText.value = 'Пиу!'
    showBubble.value = true
    setTimeout(() => {
        showBubble.value = false
    }, 1200)
}

// Кормление
const feed = () => {
    satiety.value = Math.min(100, satiety.value + 25)
    xp.value += 5
    showText('+25 сытости, +5 XP')
    // Повышение уровня
    while (xp.value >= xpToNext.value) {
        xp.value -= xpToNext.value
        level.value++
        showText(`УРОВЕНЬ ${level.value}!`, 3000)
    }
}

// Лечение
const heal = () => {
    health.value = Math.min(100, health.value + 5)
    showText(' +5 здоровья')
}

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
                <img src="../assets/kubok.png" alt=""> {{ level }} | <img src="../assets/star.png" alt=""> {{ xp }}/{{
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
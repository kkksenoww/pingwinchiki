<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { hasSaveData } from '../composables/useGacha'

const router = useRouter()
const canContinue = ref(false)

onMounted(() => {
    canContinue.value = hasSaveData()
})

function newGame() {
    localStorage.clear()
    const homeUrl = router.resolve({ name: 'home' }).href
    window.location.href = homeUrl
}

function continueGame() {
    router.push('/home')
}
</script>

<template>
    <div class="start-page">
        <div class="content">
            <h1>Симулятор пингвина</h1>
            <p>Заботься о своём пингвине, рыбачь, собирай друзей!</p>
            <div class="buttons">
                <button class="btn new" @click="newGame">Новая игра</button>
                <button class="btn continue" :disabled="!canContinue" @click="continueGame">
                    Продолжить
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.start-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 30% 50%, #2b5876, #0e1a2b);
    color: white;
    font-family: system-ui, sans-serif;
}

.content {
    text-align: center;
}

.buttons {
    margin-top: 40px;
    display: flex;
    gap: 20px;
    justify-content: center;
}

.btn {
    padding: 14px 36px;
    font-size: 18px;
    border: none;
    border-radius: 40px;
    cursor: pointer;
    font-weight: bold;
}

.new {
    background: #f39c12;
    color: white;
}

.continue {
    background: #2ecc71;
    color: white;
}

.continue:disabled {
    background: #555;
    color: #aaa;
    cursor: not-allowed;
}
</style>
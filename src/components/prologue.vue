<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
const goToHome = () => router.push('/home')
</script>

<template>
  <div class="prologue-page">
    <video
      src="/video.mp4"
      autoplay
      muted
      @ended="goToHome"
      class="prologue-video"/>
    <button @click="goToHome" class="skip-btn">Пропустить</button>
  </div>
</template>



<style scoped>
.prologue-page {
  width: 100%;
  height: 100vh;
  background: black;
  position: relative;
}

.prologue-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.skip-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
}
</style>
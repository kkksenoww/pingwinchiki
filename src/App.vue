<script setup>
import { onMounted } from 'vue'
import useGacha from './composables/useGacha'

const { processPassiveProgress } = useGacha()

onMounted(() => {
  processPassiveProgress()
})
</script>

<template>
  <router-view />
</template>
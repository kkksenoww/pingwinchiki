import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Riblka from './components/riblka.vue' 

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/ribalka',
    name: 'ribalka',
    component: Riblka
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
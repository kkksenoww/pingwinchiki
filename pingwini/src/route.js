import { createRouter, createWebHistory } from 'vue-router'
import StartPage from './components/StartPage.vue'
import Home from './components/Home.vue'
import Riblka from './components/riblka.vue'
import Gacha from './components/Gacha.vue'
import Fridge from './components/Fridge.vue'
import Collection from './components/Collection.vue'

const routes = [
  { path: '/', name: 'start', component: StartPage },
  { path: '/home', name: 'home', component: Home },
  { path: '/ribalka', name: 'ribalka', component: Riblka },
  { path: '/gacha', name: 'gacha', component: Gacha },
  { path: '/fridge', name: 'fridge', component: Fridge },
  { path: '/collection', name: 'collection', component: Collection }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
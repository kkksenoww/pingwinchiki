import { createRouter, createWebHistory } from 'vue-router'
import StartPage from './components/StartPage.vue'
import Home from './components/Home.vue'
import Riblka from './components/riblka.vue'
import Gacha from './components/Gacha.vue'
import Fridge from './components/Fridge.vue'
import Collection from './components/Collection.vue'
import notFound from './components/notFound.vue'
import Prologue from './components/Prologue.vue'

const routes = [
  { path: '/', name: 'start', component: StartPage },
  { path: '/prologue', name: 'prologue', component: Prologue },
  { path: '/home', name: 'home', component: Home },
  { path: '/ribalka', name: 'ribalka', component: Riblka },
  { path: '/gacha', name: 'gacha', component: Gacha },
  { path: '/fridge', name: 'fridge', component: Fridge },
  { path: '/collection', name: 'collection', component: Collection },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: notFound }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
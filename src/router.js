import Vue from 'vue'
import VueRouter from 'vue-router'

import HomeScreen from './components/HomeScreen.vue'
import Three from './components/Three.vue'
import WebGl from './components/WebGl.vue'
import TimeTable from './components/TimeTable.vue'

Vue.use(VueRouter)

const routes = [
    {path: '/webgl', component: WebGl},
    {path: '/threeJs', component: Three},
    {path: '/timetable', component: TimeTable},
    {path: '', component: HomeScreen}
]

export default new VueRouter({
    routes
  })
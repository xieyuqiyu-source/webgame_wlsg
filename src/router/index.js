import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import GameDemo from '@/views/GameDemo.vue'
import CityView from '@/views/city/index.vue'
import MilitaryView from '@/views/military/index.vue'
import MapView from '@/views/map/index.vue'
import SettingsView from '@/views/settings/index.vue'
import NotificationTest from '@/views/NotificationTest.vue'
import MessageView from '@/views/MessageView.vue'
import BattleSimulator from '@/views/BattleSimulator.vue'

//=== createRouter 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'GameDemo',
      component: GameDemo
    },
    {
      path: '/city',
      name: 'City',
      component: CityView
    },
    {
      path: '/military',
      name: 'Military', 
      component: MilitaryView
    },
    {
      path: '/map',
      name: 'Map',
      component: MapView
    },
    {
      path: '/settings',
      name: 'Settings',
      component: SettingsView
    },
    {
      path: '/notification-test',
      name: 'NotificationTest',
      component: NotificationTest
    },
    {
      path: '/message',
      name: 'Message',
      component: MessageView
    },
    {
      path: '/battle-simulator',
      name: 'BattleSimulator',
      component: BattleSimulator
    }
  ]
})

export default router
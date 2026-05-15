import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/city'
    },
    {
      path: '/city',
      name: 'City',
      component: () => import('@/views/city/index.vue')
    },
    {
      path: '/military',
      name: 'Military',
      component: () => import('@/views/military/index.vue')
    },
    {
      path: '/map',
      name: 'Map',
      component: () => import('@/views/map/index.vue')
    },
    {
      path: '/map-debug',
      name: 'MapDebug',
      component: () => import('@/views/map-debug/index.vue')
    },
    {
      path: '/settings',
      name: 'Settings',
      component: () => import('@/views/settings/index.vue')
    },
    {
      path: '/message',
      name: 'Message',
      component: () => import('@/views/MessageView.vue')
    },
    {
      path: '/demo',
      name: 'GameDemo',
      component: () => import('@/views/GameDemo.vue')
    },
    {
      path: '/notification-test',
      name: 'NotificationTest',
      component: () => import('@/views/NotificationTest.vue')
    }
  ]
})

export default router

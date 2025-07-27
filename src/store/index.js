//=== Pinia Store 入口文件

import { createPinia } from 'pinia'

// 导入所有store模块
import { useGameStore } from './modules/gameStore'
import { useMessageStore } from './modules/messageStore'
import { useNotificationStore } from './modules/notificationStore'
import { useNpcStore } from './modules/npcStore'

/**
 * 创建并导出 Pinia 实例
 */
const pinia = createPinia()

export default pinia

// 导出所有store
export {
  useGameStore,
  useMessageStore,
  useNotificationStore,
  useNpcStore
}
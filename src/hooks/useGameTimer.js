//=== 游戏定时器组合函数 - 管理资源更新和自动保存

import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/store/modules/gameStore.js'

/**
 * 游戏定时器Hook
 * 负责资源自动更新和游戏数据自动保存
 */
export function useGameTimer() {
  const gameStore = useGameStore()
  
  // 定时器引用
  const updateTimer = ref(null)
  const saveTimer = ref(null)
  
  // 定时器间隔配置
  const UPDATE_INTERVAL = 1000 // 1秒更新一次资源
  const SAVE_INTERVAL = 1000 * 60 * 5 // 5分钟自动保存一次
  
  //=== 启动资源更新定时器
  const startUpdateTimer = () => {
    if (updateTimer.value) {
      clearInterval(updateTimer.value)
    }
    
    updateTimer.value = setInterval(() => {
      gameStore.updateResources()
    }, UPDATE_INTERVAL)
  }
  
  //=== 启动自动保存定时器
  const startSaveTimer = () => {
    if (saveTimer.value) {
      clearInterval(saveTimer.value)
    }
    
    saveTimer.value = setInterval(() => {
      gameStore.saveGame()
      console.log('游戏数据已自动保存')
    }, SAVE_INTERVAL)
  }
  
  //=== 停止所有定时器
  const stopTimers = () => {
    if (updateTimer.value) {
      clearInterval(updateTimer.value)
      updateTimer.value = null
    }
    
    if (saveTimer.value) {
      clearInterval(saveTimer.value)
      saveTimer.value = null
    }
  }
  
  //=== 重启定时器
  const restartTimers = () => {
    stopTimers()
    startUpdateTimer()
    startSaveTimer()
  }
  
  //=== 处理页面可见性变化
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 页面隐藏时停止定时器并保存游戏数据
      stopTimers()
      gameStore.saveGame()
      console.log('页面隐藏，定时器已停止，游戏数据已保存')
    } else {
      // 页面重新可见时计算离线收益并重启定时器
      console.log('页面重新可见，计算离线收益...')
      gameStore.updateResources()
      startUpdateTimer()
      startSaveTimer()
      console.log('离线收益计算完成，定时器已重启')
    }
  }
  
  //=== 处理页面卸载前保存
  const handleBeforeUnload = () => {
    gameStore.saveGame()
  }
  
  // 组件挂载时启动定时器
  onMounted(() => {
    // 加载游戏数据
    gameStore.loadGame()
    
    // 计算离线收益
    gameStore.updateResources()
    
    // 启动定时器
    startUpdateTimer()
    startSaveTimer()
    
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    // 监听页面卸载
    window.addEventListener('beforeunload', handleBeforeUnload)
  })
  
  // 组件卸载时清理定时器
  onUnmounted(() => {
    stopTimers()
    
    // 移除事件监听
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('beforeunload', handleBeforeUnload)
    
    // 保存游戏数据
    gameStore.saveGame()
  })
  
  return {
    startUpdateTimer,
    startSaveTimer,
    stopTimers,
    restartTimers
  }
}
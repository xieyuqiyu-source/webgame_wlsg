/**
 * 调度器 Vue 组合式函数
 * 提供在 Vue 组件中使用调度器的便捷方法
 */

import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useStore } from 'vuex'
import gameScheduler, { TASK_TYPE, TASK_PRIORITY } from '@/utils/scheduler.js'
import { schedulerManager, SchedulerExamples } from '@/utils/schedulerManager.js'

/**
 * 使用调度器的组合式函数
 */
export function useScheduler() {
  const store = useStore()
  const isInitialized = ref(false)
  const stats = ref({})
  const registeredTasks = ref([])

  //=== 初始化调度器
  const initialize = async () => {
    try {
      await schedulerManager.initialize()
      isInitialized.value = true
      updateStats()
      console.log('调度器已在组件中初始化')
    } catch (error) {
      console.error('调度器初始化失败:', error)
      throw error
    }
  }

  //=== 更新统计信息
  const updateStats = () => {
    stats.value = schedulerManager.getStats()
    registeredTasks.value = schedulerManager.getRegisteredTasks()
  }

  //=== 注册任务
  const registerTask = (taskConfig) => {
    const taskId = gameScheduler.registerTask(taskConfig)
    updateStats()
    return taskId
  }

  //=== 注册游戏任务
  const registerGameTask = (taskKey, handler, customConfig = {}) => {
    const taskId = schedulerManager.registerGameTask(taskKey, handler, customConfig)
    updateStats()
    return taskId
  }

  //=== 暂停任务
  const pauseTask = (taskId) => {
    const result = gameScheduler.pauseTask(taskId)
    updateStats()
    return result
  }

  //=== 恢复任务
  const resumeTask = (taskId) => {
    const result = gameScheduler.resumeTask(taskId)
    updateStats()
    return result
  }

  //=== 取消任务
  const cancelTask = (taskId) => {
    const result = gameScheduler.cancelTask(taskId)
    updateStats()
    return result
  }

  //=== 暂停游戏任务
  const pauseGameTask = (taskKey) => {
    const result = schedulerManager.pauseGameTask(taskKey)
    updateStats()
    return result
  }

  //=== 恢复游戏任务
  const resumeGameTask = (taskKey) => {
    const result = schedulerManager.resumeGameTask(taskKey)
    updateStats()
    return result
  }

  //=== 暂停所有任务
  const pauseAllTasks = () => {
    const count = schedulerManager.pauseAllGameTasks()
    updateStats()
    return count
  }

  //=== 恢复所有任务
  const resumeAllTasks = () => {
    const count = schedulerManager.resumeAllGameTasks()
    updateStats()
    return count
  }

  //=== 获取任务信息
  const getTask = (taskId) => {
    return gameScheduler.getTask(taskId)
  }

  //=== 获取游戏任务状态
  const getGameTaskStatus = (taskKey) => {
    return schedulerManager.getGameTaskStatus(taskKey)
  }

  // 计算属性
  const isRunning = computed(() => stats.value.scheduler?.isRunning || false)
  const totalTasks = computed(() => stats.value.scheduler?.totalTasks || 0)
  const runningTasks = computed(() => stats.value.scheduler?.runningTasks || 0)
  const pausedTasks = computed(() => stats.value.scheduler?.pausedTasks || 0)

  return {
    // 状态
    isInitialized,
    stats,
    registeredTasks,
    isRunning,
    totalTasks,
    runningTasks,
    pausedTasks,

    // 方法
    initialize,
    updateStats,
    registerTask,
    registerGameTask,
    pauseTask,
    resumeTask,
    cancelTask,
    pauseGameTask,
    resumeGameTask,
    pauseAllTasks,
    resumeAllTasks,
    getTask,
    getGameTaskStatus
  }
}

/**
 * 游戏核心任务管理组合式函数
 */
export function useGameTasks() {
  const store = useStore()
  const { registerGameTask, pauseGameTask, resumeGameTask } = useScheduler()
  const activeTasks = ref(new Set())

  //=== 启动核心游戏任务
  const startCoreGameTasks = async () => {
    try {
      // 资源增长任务
      const resourceTaskId = SchedulerExamples.setupResourceGrowth(store)
      activeTasks.value.add('RESOURCE_GROWTH')

      // 建筑升级检查任务
      const buildingTaskId = SchedulerExamples.setupBuildingUpgradeCheck(store)
      activeTasks.value.add('BUILDING_UPGRADE_CHECK')

      // 自动保存任务
      const saveTaskId = SchedulerExamples.setupAutoSave(store)
      activeTasks.value.add('AUTO_SAVE')

      // 军队训练检查任务
      const armyTaskId = registerGameTask('ARMY_TRAINING_CHECK', async () => {
        const trainingQueues = store.getters['military/getTrainingQueues']
        
        trainingQueues.forEach(queue => {
          if (queue.endTime && Date.now() >= queue.endTime) {
            store.dispatch('military/completeTraining', queue.id)
            console.log(`军队训练完成: ${queue.unitType}`)
          }
        })
      })
      activeTasks.value.add('ARMY_TRAINING_CHECK')

      console.log('核心游戏任务已启动')
    } catch (error) {
      console.error('启动核心游戏任务失败:', error)
      throw error
    }
  }

  //=== 启动在线功能任务
  const startOnlineTasks = async () => {
    try {
      // 在线心跳任务
      const heartbeatTaskId = registerGameTask('ONLINE_HEARTBEAT', async () => {
        // 发送心跳到服务器
        try {
          await store.dispatch('online/sendHeartbeat')
        } catch (error) {
          console.warn('心跳发送失败:', error)
          // 可能需要切换到离线模式
          store.dispatch('game/setOnlineStatus', false)
        }
      })
      activeTasks.value.add('ONLINE_HEARTBEAT')

      console.log('在线功能任务已启动')
    } catch (error) {
      console.error('启动在线功能任务失败:', error)
      throw error
    }
  }

  //=== 处理离线收益
  const handleOfflineIncome = async (offlineTime) => {
    try {
      const taskId = SchedulerExamples.calculateOfflineIncome(store, offlineTime)
      console.log('离线收益计算任务已启动')
      return taskId
    } catch (error) {
      console.error('离线收益计算失败:', error)
      throw error
    }
  }

  //=== 暂停游戏任务（游戏暂停时）
  const pauseGameTasks = () => {
    const tasksToKeep = ['AUTO_SAVE'] // 保持自动保存运行
    
    activeTasks.value.forEach(taskKey => {
      if (!tasksToKeep.includes(taskKey)) {
        pauseGameTask(taskKey)
      }
    })
    
    console.log('游戏任务已暂停（保留自动保存）')
  }

  //=== 恢复游戏任务（游戏恢复时）
  const resumeGameTasks = () => {
    activeTasks.value.forEach(taskKey => {
      resumeGameTask(taskKey)
    })
    
    console.log('游戏任务已恢复')
  }

  //=== 停止所有游戏任务
  const stopAllGameTasks = () => {
    activeTasks.value.forEach(taskKey => {
      pauseGameTask(taskKey)
    })
    activeTasks.value.clear()
    
    console.log('所有游戏任务已停止')
  }

  return {
    activeTasks,
    startCoreGameTasks,
    startOnlineTasks,
    handleOfflineIncome,
    pauseGameTasks,
    resumeGameTasks,
    stopAllGameTasks
  }
}

/**
 * 调度器监控组合式函数
 */
export function useSchedulerMonitor() {
  const { stats, updateStats } = useScheduler()
  const monitorInterval = ref(null)

  //=== 开始监控
  const startMonitoring = (interval = 5000) => {
    if (monitorInterval.value) {
      console.warn('调度器监控已在运行')
      return
    }

    monitorInterval.value = setInterval(() => {
      updateStats()
    }, interval)

    console.log(`调度器监控已启动，更新间隔: ${interval}ms`)
  }

  //=== 停止监控
  const stopMonitoring = () => {
    if (monitorInterval.value) {
      clearInterval(monitorInterval.value)
      monitorInterval.value = null
      console.log('调度器监控已停止')
    }
  }

  // 组件卸载时自动停止监控
  onUnmounted(() => {
    stopMonitoring()
  })

  return {
    stats,
    startMonitoring,
    stopMonitoring,
    updateStats
  }
}

/**
 * 一次性任务组合式函数
 */
export function useOneTimeTask() {
  //=== 创建延时任务
  const createDelayedTask = (handler, delay, priority = TASK_PRIORITY.NORMAL) => {
    return gameScheduler.registerTask({
      name: `delayed_task_${Date.now()}`,
      type: TASK_TYPE.TIMEOUT,
      delay,
      priority,
      handler
    })
  }

  //=== 创建立即执行任务
  const createImmediateTask = (handler, priority = TASK_PRIORITY.NORMAL) => {
    return gameScheduler.registerTask({
      name: `immediate_task_${Date.now()}`,
      type: TASK_TYPE.IMMEDIATE,
      priority,
      handler
    })
  }

  //=== 创建重复任务
  const createRepeatingTask = (handler, interval, priority = TASK_PRIORITY.NORMAL) => {
    return gameScheduler.registerTask({
      name: `repeating_task_${Date.now()}`,
      type: TASK_TYPE.INTERVAL,
      interval,
      priority,
      handler
    })
  }

  return {
    createDelayedTask,
    createImmediateTask,
    createRepeatingTask
  }
}
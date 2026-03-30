/**
 * 调度器 Vue 组合式函数
 * 当前仅保留与现有 Pinia 架构兼容的监控与通用任务能力。
 */

import { computed, onUnmounted, ref } from 'vue'
import gameScheduler, { TASK_PRIORITY, TASK_TYPE } from '@/utils/scheduler.js'
import { schedulerManager } from '@/utils/schedulerManager.js'

export function useScheduler() {
  const isInitialized = ref(false)
  const stats = ref({})
  const registeredTasks = ref([])

  const updateStats = () => {
    stats.value = schedulerManager.getStats()
    registeredTasks.value = schedulerManager.getRegisteredTasks()
  }

  const initialize = async () => {
    await schedulerManager.initialize()
    isInitialized.value = true
    updateStats()
  }

  const registerTask = (taskConfig) => {
    const taskId = gameScheduler.registerTask(taskConfig)
    updateStats()
    return taskId
  }

  const registerGameTask = (taskKey, handler, customConfig = {}) => {
    const taskId = schedulerManager.registerGameTask(taskKey, handler, customConfig)
    updateStats()
    return taskId
  }

  const pauseTask = (taskId) => {
    const result = gameScheduler.pauseTask(taskId)
    updateStats()
    return result
  }

  const resumeTask = (taskId) => {
    const result = gameScheduler.resumeTask(taskId)
    updateStats()
    return result
  }

  const cancelTask = (taskId) => {
    const result = gameScheduler.cancelTask(taskId)
    updateStats()
    return result
  }

  const pauseGameTask = (taskKey) => {
    const result = schedulerManager.pauseGameTask(taskKey)
    updateStats()
    return result
  }

  const resumeGameTask = (taskKey) => {
    const result = schedulerManager.resumeGameTask(taskKey)
    updateStats()
    return result
  }

  const pauseAllTasks = () => {
    const count = schedulerManager.pauseAllGameTasks()
    updateStats()
    return count
  }

  const resumeAllTasks = () => {
    const count = schedulerManager.resumeAllGameTasks()
    updateStats()
    return count
  }

  const getTask = (taskId) => gameScheduler.getTask(taskId)
  const getGameTaskStatus = (taskKey) => schedulerManager.getGameTaskStatus(taskKey)

  const isRunning = computed(() => stats.value.scheduler?.isRunning || false)
  const totalTasks = computed(() => stats.value.scheduler?.totalTasks || 0)
  const runningTasks = computed(() => stats.value.scheduler?.runningTasks || 0)
  const pausedTasks = computed(() => stats.value.scheduler?.pausedTasks || 0)

  return {
    isInitialized,
    stats,
    registeredTasks,
    isRunning,
    totalTasks,
    runningTasks,
    pausedTasks,
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

export function useGameTasks() {
  const activeTasks = ref(new Set())

  const unsupported = () => {
    throw new Error('useGameTasks 仍是旧版 Vuex 设计，迁移到 Pinia 后再启用。')
  }

  return {
    activeTasks,
    startCoreGameTasks: unsupported,
    startOnlineTasks: unsupported,
    handleOfflineIncome: unsupported,
    pauseGameTasks: unsupported,
    resumeGameTasks: unsupported,
    stopAllGameTasks: unsupported
  }
}

export function useSchedulerMonitor() {
  const { stats, updateStats } = useScheduler()
  const monitorInterval = ref(null)

  const startMonitoring = (interval = 5000) => {
    if (monitorInterval.value) return

    monitorInterval.value = setInterval(() => {
      updateStats()
    }, interval)
  }

  const stopMonitoring = () => {
    if (!monitorInterval.value) return

    clearInterval(monitorInterval.value)
    monitorInterval.value = null
  }

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

export function useOneTimeTask() {
  const createDelayedTask = (handler, delay, priority = TASK_PRIORITY.NORMAL) => {
    return gameScheduler.registerTask({
      name: `delayed_task_${Date.now()}`,
      type: TASK_TYPE.TIMEOUT,
      delay,
      priority,
      handler
    })
  }

  const createImmediateTask = (handler, priority = TASK_PRIORITY.NORMAL) => {
    return gameScheduler.registerTask({
      name: `immediate_task_${Date.now()}`,
      type: TASK_TYPE.IMMEDIATE,
      priority,
      handler
    })
  }

  return {
    createDelayedTask,
    createImmediateTask
  }
}

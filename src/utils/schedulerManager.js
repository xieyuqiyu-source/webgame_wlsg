/**
 * 调度器使用示例和常用任务配置
 * 展示如何在游戏中使用统一调度器
 */

import gameScheduler, { TASK_TYPE, TASK_PRIORITY, TASK_STATUS } from './scheduler.js'

// 游戏常用任务配置
export const GAME_TASKS = {
  // 资源自动增长
  RESOURCE_GROWTH: {
    name: 'resource_growth',
    type: TASK_TYPE.INTERVAL,
    interval: 5000, // 每5秒执行一次
    priority: TASK_PRIORITY.HIGH,
    description: '资源自动增长任务'
  },

  // 建筑升级检查
  BUILDING_UPGRADE_CHECK: {
    name: 'building_upgrade_check',
    type: TASK_TYPE.INTERVAL,
    interval: 10000, // 每10秒检查一次
    priority: TASK_PRIORITY.NORMAL,
    description: '建筑升级完成检查'
  },

  // 军队训练检查
  ARMY_TRAINING_CHECK: {
    name: 'army_training_check',
    type: TASK_TYPE.INTERVAL,
    interval: 3000, // 每3秒检查一次
    priority: TASK_PRIORITY.HIGH,
    description: '军队训练完成检查'
  },

  // 自动保存游戏
  AUTO_SAVE: {
    name: 'auto_save',
    type: TASK_TYPE.INTERVAL,
    interval: 30000, // 每30秒自动保存
    priority: TASK_PRIORITY.CRITICAL,
    description: '自动保存游戏数据'
  },

  // 在线状态心跳
  ONLINE_HEARTBEAT: {
    name: 'online_heartbeat',
    type: TASK_TYPE.INTERVAL,
    interval: 60000, // 每分钟发送心跳
    priority: TASK_PRIORITY.NORMAL,
    description: '在线状态心跳检测'
  },

  // 离线收益计算
  OFFLINE_INCOME_CALC: {
    name: 'offline_income_calc',
    type: TASK_TYPE.TIMEOUT,
    delay: 1000, // 1秒后执行
    priority: TASK_PRIORITY.HIGH,
    description: '离线收益计算'
  },

  // 战斗结果处理
  BATTLE_RESULT_PROCESS: {
    name: 'battle_result_process',
    type: TASK_TYPE.IMMEDIATE,
    priority: TASK_PRIORITY.CRITICAL,
    description: '战斗结果处理'
  }
}

/**
 * 调度器管理类 - 封装常用的调度器操作
 */
export class SchedulerManager {
  constructor() {
    this.registeredTasks = new Map()
    this.isInitialized = false
  }

  //=== 初始化调度器
  async initialize() {
    if (this.isInitialized) {
      console.warn('调度器管理器已经初始化')
      return
    }

    try {
      // 启动调度器
      gameScheduler.start()

      // 注册事件监听器
      this.setupEventListeners()

      this.isInitialized = true
      console.log('调度器管理器初始化完成')
    } catch (error) {
      console.error('调度器管理器初始化失败:', error)
      throw error
    }
  }

  //=== 设置事件监听器
  setupEventListeners() {
    // 任务完成事件
    gameScheduler.on('task:completed', (data) => {
      console.log(`任务完成: ${data.task.name}`)
    })

    // 任务错误事件
    gameScheduler.on('task:error', (data) => {
      console.error(`任务执行错误: ${data.task.name}`, data.error)
    })

    // 调度器启动事件
    gameScheduler.on('scheduler:started', () => {
      console.log('游戏调度器已启动')
    })

    // 调度器停止事件
    gameScheduler.on('scheduler:stopped', () => {
      console.log('游戏调度器已停止')
    })
  }

  //=== 注册游戏任务
  registerGameTask(taskKey, handler, customConfig = {}) {
    const taskConfig = GAME_TASKS[taskKey]
    if (!taskConfig) {
      throw new Error(`未知的游戏任务: ${taskKey}`)
    }

    const finalConfig = {
      ...taskConfig,
      ...customConfig,
      handler
    }

    const taskId = gameScheduler.registerTask(finalConfig)
    this.registeredTasks.set(taskKey, taskId)

    console.log(`游戏任务已注册: ${taskKey} -> ${taskId}`)
    return taskId
  }

  //=== 注销游戏任务
  unregisterGameTask(taskKey) {
    const taskId = this.registeredTasks.get(taskKey)
    if (taskId) {
      gameScheduler.cancelTask(taskId)
      this.registeredTasks.delete(taskKey)
      console.log(`游戏任务已注销: ${taskKey}`)
      return true
    }
    return false
  }

  //=== 暂停游戏任务
  pauseGameTask(taskKey) {
    const taskId = this.registeredTasks.get(taskKey)
    if (taskId) {
      return gameScheduler.pauseTask(taskId)
    }
    return false
  }

  //=== 恢复游戏任务
  resumeGameTask(taskKey) {
    const taskId = this.registeredTasks.get(taskKey)
    if (taskId) {
      return gameScheduler.resumeTask(taskId)
    }
    return false
  }

  //=== 获取任务状态
  getGameTaskStatus(taskKey) {
    const taskId = this.registeredTasks.get(taskKey)
    if (taskId) {
      const task = gameScheduler.getTask(taskId)
      return task ? task.status : null
    }
    return null
  }

  //=== 获取所有已注册的游戏任务
  getRegisteredTasks() {
    return Array.from(this.registeredTasks.entries()).map(([key, taskId]) => {
      const task = gameScheduler.getTask(taskId)
      return {
        key,
        taskId,
        task
      }
    })
  }

  //=== 暂停所有游戏任务
  pauseAllGameTasks() {
    let pausedCount = 0
    this.registeredTasks.forEach((taskId, taskKey) => {
      if (gameScheduler.pauseTask(taskId)) {
        pausedCount++
      }
    })
    console.log(`已暂停 ${pausedCount} 个游戏任务`)
    return pausedCount
  }

  //=== 恢复所有游戏任务
  resumeAllGameTasks() {
    let resumedCount = 0
    this.registeredTasks.forEach((taskId, taskKey) => {
      if (gameScheduler.resumeTask(taskId)) {
        resumedCount++
      }
    })
    console.log(`已恢复 ${resumedCount} 个游戏任务`)
    return resumedCount
  }

  //=== 获取调度器统计信息
  getStats() {
    return {
      scheduler: gameScheduler.getStats(),
      registeredGameTasks: this.registeredTasks.size,
      gameTasksList: this.getRegisteredTasks()
    }
  }

  //=== 销毁调度器管理器
  destroy() {
    // 取消所有已注册的游戏任务
    this.registeredTasks.forEach((taskId) => {
      gameScheduler.cancelTask(taskId)
    })

    // 清空注册记录
    this.registeredTasks.clear()

    // 停止调度器
    gameScheduler.stop()

    this.isInitialized = false
    console.log('调度器管理器已销毁')
  }
}

// 创建全局调度器管理器实例
export const schedulerManager = new SchedulerManager()

// 使用示例
export const SchedulerExamples = {
  //=== 资源增长任务示例
  setupResourceGrowth(store) {
    return schedulerManager.registerGameTask('RESOURCE_GROWTH', async () => {
      // 获取当前资源增长速度
      const growthRates = store.getters['resources/getGrowthRates']
      
      // 计算资源增长
      const growth = {
        gold: growthRates.gold * 5, // 5秒的增长量
        food: growthRates.food * 5,
        wood: growthRates.wood * 5,
        stone: growthRates.stone * 5,
        iron: growthRates.iron * 5
      }

      // 更新资源
      store.dispatch('resources/addResources', growth)
      
      console.log('资源增长:', growth)
    })
  },

  //=== 建筑升级检查示例
  setupBuildingUpgradeCheck(store) {
    return schedulerManager.registerGameTask('BUILDING_UPGRADE_CHECK', async () => {
      const buildings = store.getters['buildings/getUpgradingBuildings']
      
      buildings.forEach(building => {
        if (building.upgradeEndTime && Date.now() >= building.upgradeEndTime) {
          // 升级完成
          store.dispatch('buildings/completeUpgrade', building.id)
          console.log(`建筑升级完成: ${building.name}`)
        }
      })
    })
  },

  //=== 自动保存示例
  setupAutoSave(store) {
    return schedulerManager.registerGameTask('AUTO_SAVE', async () => {
      try {
        await store.dispatch('game/saveGame')
        console.log('游戏自动保存完成')
      } catch (error) {
        console.error('自动保存失败:', error)
        throw error // 让调度器处理重试
      }
    })
  },

  //=== 一次性任务示例
  calculateOfflineIncome(store, offlineTime) {
    return gameScheduler.registerTask({
      name: 'calculate_offline_income',
      type: TASK_TYPE.IMMEDIATE,
      priority: TASK_PRIORITY.HIGH,
      handler: async () => {
        const growthRates = store.getters['resources/getGrowthRates']
        const offlineSeconds = Math.floor(offlineTime / 1000)
        
        const offlineIncome = {
          gold: growthRates.gold * offlineSeconds,
          food: growthRates.food * offlineSeconds,
          wood: growthRates.wood * offlineSeconds,
          stone: growthRates.stone * offlineSeconds,
          iron: growthRates.iron * offlineSeconds
        }

        store.dispatch('resources/addResources', offlineIncome)
        store.dispatch('ui/showOfflineIncomeDialog', offlineIncome)
        
        console.log('离线收益计算完成:', offlineIncome)
        return offlineIncome
      }
    })
  }
}

export default schedulerManager
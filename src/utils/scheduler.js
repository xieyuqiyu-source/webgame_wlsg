/**
 * 统一调度器 - 管理游戏中的各种定时任务和事件调度
 * 支持任务注册、执行、暂停、恢复、移除等功能
 */

// 任务状态枚举
export const TASK_STATUS = {
  PENDING: 'pending',     // 等待执行
  RUNNING: 'running',     // 正在执行
  PAUSED: 'paused',       // 已暂停
  COMPLETED: 'completed', // 已完成
  CANCELLED: 'cancelled'  // 已取消
}

// 任务类型枚举
export const TASK_TYPE = {
  INTERVAL: 'interval',   // 间隔执行
  TIMEOUT: 'timeout',     // 延时执行
  IMMEDIATE: 'immediate', // 立即执行
  CRON: 'cron'           // 定时执行
}

// 任务优先级枚举
export const TASK_PRIORITY = {
  LOW: 1,
  NORMAL: 2,
  HIGH: 3,
  CRITICAL: 4
}

class GameScheduler {
  constructor() {
    this.tasks = new Map()           // 存储所有任务
    this.timers = new Map()          // 存储定时器引用
    this.isRunning = false           // 调度器运行状态
    this.taskIdCounter = 0           // 任务ID计数器
    this.maxConcurrentTasks = 50     // 最大并发任务数
    this.currentRunningTasks = 0     // 当前运行任务数
    this.taskQueue = []              // 任务队列
    this.eventListeners = new Map()  // 事件监听器
  }

  //=== 启动调度器
  start() {
    if (this.isRunning) {
      console.warn('调度器已经在运行中')
      return
    }
    
    this.isRunning = true
    this.emit('scheduler:started')
    console.log('游戏调度器已启动')
  }

  //=== 停止调度器
  stop() {
    if (!this.isRunning) {
      console.warn('调度器未在运行')
      return
    }

    // 清除所有定时器
    this.timers.forEach((timer) => {
      clearTimeout(timer)
      clearInterval(timer)
    })
    
    // 清空所有数据
    this.tasks.clear()
    this.timers.clear()
    this.taskQueue = []
    this.currentRunningTasks = 0
    this.isRunning = false
    
    this.emit('scheduler:stopped')
    console.log('游戏调度器已停止')
  }

  //=== 注册任务
  registerTask(taskConfig) {
    if (!this.isRunning) {
      throw new Error('调度器未启动，请先调用 start() 方法')
    }

    const {
      name,
      type = TASK_TYPE.TIMEOUT,
      handler,
      delay = 0,
      interval = 1000,
      priority = TASK_PRIORITY.NORMAL,
      maxRetries = 3,
      context = null,
      data = null
    } = taskConfig

    // 验证必要参数
    if (!name || typeof handler !== 'function') {
      throw new Error('任务名称和处理函数是必需的')
    }

    // 生成唯一任务ID
    const taskId = `${name}_${++this.taskIdCounter}_${Date.now()}`

    // 创建任务对象
    const task = {
      id: taskId,
      name,
      type,
      handler,
      delay,
      interval,
      priority,
      maxRetries,
      currentRetries: 0,
      context,
      data,
      status: TASK_STATUS.PENDING,
      createdAt: Date.now(),
      lastExecutedAt: null,
      nextExecuteAt: null,
      executionCount: 0,
      errors: []
    }

    // 存储任务
    this.tasks.set(taskId, task)

    // 根据任务类型调度执行
    this.scheduleTask(task)

    this.emit('task:registered', { taskId, task })
    console.log(`任务已注册: ${name} (${taskId})`)

    return taskId
  }

  //=== 调度任务执行
  scheduleTask(task) {
    const { id, type, delay, interval } = task

    switch (type) {
      case TASK_TYPE.IMMEDIATE:
        this.executeTask(task)
        break

      case TASK_TYPE.TIMEOUT:
        const timeoutId = setTimeout(() => {
          this.executeTask(task)
        }, delay)
        this.timers.set(id, timeoutId)
        task.nextExecuteAt = Date.now() + delay
        break

      case TASK_TYPE.INTERVAL:
        const intervalId = setInterval(() => {
          this.executeTask(task)
        }, interval)
        this.timers.set(id, intervalId)
        task.nextExecuteAt = Date.now() + interval
        break

      case TASK_TYPE.CRON:
        // 简单的定时执行实现
        this.scheduleCronTask(task)
        break

      default:
        console.error(`未知的任务类型: ${type}`)
    }

    task.status = TASK_STATUS.RUNNING
  }

  //=== 执行任务
  async executeTask(task) {
    if (task.status === TASK_STATUS.PAUSED || task.status === TASK_STATUS.CANCELLED) {
      return
    }

    // 检查并发限制
    if (this.currentRunningTasks >= this.maxConcurrentTasks) {
      this.taskQueue.push(task)
      return
    }

    this.currentRunningTasks++
    task.status = TASK_STATUS.RUNNING
    task.lastExecutedAt = Date.now()
    task.executionCount++

    try {
      this.emit('task:started', { taskId: task.id, task })

      // 执行任务处理函数
      const result = await task.handler.call(task.context, task.data, task)

      // 任务执行成功
      task.status = task.type === TASK_TYPE.INTERVAL ? TASK_STATUS.RUNNING : TASK_STATUS.COMPLETED
      this.emit('task:completed', { taskId: task.id, task, result })

      // 如果是一次性任务，清理资源
      if (task.type !== TASK_TYPE.INTERVAL) {
        this.cleanupTask(task.id)
      }

    } catch (error) {
      // 任务执行失败
      task.errors.push({
        error: error.message,
        timestamp: Date.now(),
        retryCount: task.currentRetries
      })

      this.emit('task:error', { taskId: task.id, task, error })

      // 重试逻辑
      if (task.currentRetries < task.maxRetries) {
        task.currentRetries++
        console.warn(`任务 ${task.name} 执行失败，正在重试 (${task.currentRetries}/${task.maxRetries})`)
        
        // 延迟重试
        setTimeout(() => {
          this.executeTask(task)
        }, 1000 * task.currentRetries)
      } else {
        // 重试次数用尽，标记为失败
        task.status = TASK_STATUS.CANCELLED
        console.error(`任务 ${task.name} 执行失败，已达到最大重试次数`)
        this.cleanupTask(task.id)
      }
    } finally {
      this.currentRunningTasks--
      
      // 处理队列中的任务
      if (this.taskQueue.length > 0) {
        const nextTask = this.taskQueue.shift()
        this.executeTask(nextTask)
      }
    }
  }

  //=== 暂停任务
  pauseTask(taskId) {
    const task = this.tasks.get(taskId)
    if (!task) {
      console.warn(`任务不存在: ${taskId}`)
      return false
    }

    if (task.status === TASK_STATUS.RUNNING) {
      task.status = TASK_STATUS.PAUSED
      
      // 清除定时器
      const timer = this.timers.get(taskId)
      if (timer) {
        clearTimeout(timer)
        clearInterval(timer)
        this.timers.delete(taskId)
      }

      this.emit('task:paused', { taskId, task })
      console.log(`任务已暂停: ${task.name}`)
      return true
    }

    return false
  }

  //=== 恢复任务
  resumeTask(taskId) {
    const task = this.tasks.get(taskId)
    if (!task) {
      console.warn(`任务不存在: ${taskId}`)
      return false
    }

    if (task.status === TASK_STATUS.PAUSED) {
      this.scheduleTask(task)
      this.emit('task:resumed', { taskId, task })
      console.log(`任务已恢复: ${task.name}`)
      return true
    }

    return false
  }

  //=== 取消任务
  cancelTask(taskId) {
    const task = this.tasks.get(taskId)
    if (!task) {
      console.warn(`任务不存在: ${taskId}`)
      return false
    }

    task.status = TASK_STATUS.CANCELLED
    this.cleanupTask(taskId)
    this.emit('task:cancelled', { taskId, task })
    console.log(`任务已取消: ${task.name}`)
    return true
  }

  //=== 清理任务资源
  cleanupTask(taskId) {
    const timer = this.timers.get(taskId)
    if (timer) {
      clearTimeout(timer)
      clearInterval(timer)
      this.timers.delete(taskId)
    }

    // 保留任务记录用于统计，但可以选择删除
    // this.tasks.delete(taskId)
  }

  //=== 获取任务信息
  getTask(taskId) {
    return this.tasks.get(taskId)
  }

  //=== 获取所有任务
  getAllTasks() {
    return Array.from(this.tasks.values())
  }

  //=== 获取指定状态的任务
  getTasksByStatus(status) {
    return this.getAllTasks().filter(task => task.status === status)
  }

  //=== 获取指定类型的任务
  getTasksByType(type) {
    return this.getAllTasks().filter(task => task.type === type)
  }

  //=== 获取调度器统计信息
  getStats() {
    const tasks = this.getAllTasks()
    return {
      totalTasks: tasks.length,
      runningTasks: tasks.filter(t => t.status === TASK_STATUS.RUNNING).length,
      pausedTasks: tasks.filter(t => t.status === TASK_STATUS.PAUSED).length,
      completedTasks: tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
      cancelledTasks: tasks.filter(t => t.status === TASK_STATUS.CANCELLED).length,
      currentRunningTasks: this.currentRunningTasks,
      maxConcurrentTasks: this.maxConcurrentTasks,
      queuedTasks: this.taskQueue.length,
      isRunning: this.isRunning
    }
  }

  //=== 简单的定时任务实现
  scheduleCronTask(task) {
    // 这里可以实现更复杂的 cron 表达式解析
    // 目前简单实现每分钟检查一次
    const checkInterval = setInterval(() => {
      if (task.status === TASK_STATUS.RUNNING) {
        this.executeTask(task)
      }
    }, 60000) // 每分钟检查一次

    this.timers.set(task.id, checkInterval)
  }

  //=== 事件系统
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(listener)
  }

  off(event, listener) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(listener => {
        try {
          listener(data)
        } catch (error) {
          console.error(`事件监听器执行错误 (${event}):`, error)
        }
      })
    }
  }

  //=== 批量操作
  pauseAllTasks() {
    const runningTasks = this.getTasksByStatus(TASK_STATUS.RUNNING)
    runningTasks.forEach(task => this.pauseTask(task.id))
    return runningTasks.length
  }

  resumeAllTasks() {
    const pausedTasks = this.getTasksByStatus(TASK_STATUS.PAUSED)
    pausedTasks.forEach(task => this.resumeTask(task.id))
    return pausedTasks.length
  }

  cancelAllTasks() {
    const activeTasks = this.getAllTasks().filter(
      task => task.status === TASK_STATUS.RUNNING || task.status === TASK_STATUS.PAUSED
    )
    activeTasks.forEach(task => this.cancelTask(task.id))
    return activeTasks.length
  }
}

// 创建全局调度器实例
export const gameScheduler = new GameScheduler()

// 导出类和实例
export { GameScheduler }
export default gameScheduler
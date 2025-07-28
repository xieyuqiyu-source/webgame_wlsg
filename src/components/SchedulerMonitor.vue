<template>
  <div class="scheduler-monitor p-6 bg-gray-50 min-h-screen">
    <!-- 标题栏 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">游戏调度器监控台</h1>
      <p class="text-gray-600">实时监控和管理游戏中的定时任务</p>
    </div>

    <!-- 控制面板 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <!-- 调度器状态 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-3 text-gray-700">调度器状态</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">运行状态:</span>
            <span :class="isRunning ? 'text-green-600' : 'text-red-600'" class="font-medium">
              {{ isRunning ? '运行中' : '已停止' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">总任务数:</span>
            <span class="font-medium text-blue-600">{{ totalTasks }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">运行中:</span>
            <span class="font-medium text-green-600">{{ runningTasks }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">已暂停:</span>
            <span class="font-medium text-yellow-600">{{ pausedTasks }}</span>
          </div>
        </div>
      </div>

      <!-- 性能指标 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-3 text-gray-700">性能指标</h3>
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-600">当前并发:</span>
            <span class="font-medium">{{ stats.scheduler?.currentRunningTasks || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">最大并发:</span>
            <span class="font-medium">{{ stats.scheduler?.maxConcurrentTasks || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">队列任务:</span>
            <span class="font-medium">{{ stats.scheduler?.queuedTasks || 0 }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">已完成:</span>
            <span class="font-medium text-green-600">{{ stats.scheduler?.completedTasks || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- 控制按钮 -->
      <div class="bg-white rounded-lg shadow p-4">
        <h3 class="text-lg font-semibold mb-3 text-gray-700">控制操作</h3>
        <div class="space-y-2">
          <button 
            @click="pauseAllTasks"
            :disabled="!isRunning"
            class="w-full px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            暂停所有任务
          </button>
          <button 
            @click="resumeAllTasks"
            :disabled="!isRunning"
            class="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            恢复所有任务
          </button>
          <button 
            @click="refreshStats"
            class="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            刷新数据
          </button>
          <button 
            @click="toggleMonitoring"
            :class="isMonitoring ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'"
            class="w-full px-4 py-2 text-white rounded"
          >
            {{ isMonitoring ? '停止监控' : '开始监控' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-700">任务列表</h3>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">任务名称</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">优先级</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">执行次数</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最后执行</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="taskInfo in registeredTasks" :key="taskInfo.taskId" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ taskInfo.task?.name || 'Unknown' }}</div>
                <div class="text-sm text-gray-500">{{ taskInfo.taskId }}</div>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getTypeColor(taskInfo.task?.type)">
                  {{ getTypeLabel(taskInfo.task?.type) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                      :class="getStatusColor(taskInfo.task?.status)">
                  {{ getStatusLabel(taskInfo.task?.status) }}
                </span>
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ getPriorityLabel(taskInfo.task?.priority) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ taskInfo.task?.executionCount || 0 }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatTime(taskInfo.task?.lastExecutedAt) }}
              </td>
              <td class="px-4 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button 
                  v-if="taskInfo.task?.status === 'running'"
                  @click="pauseTask(taskInfo.taskId)"
                  class="text-yellow-600 hover:text-yellow-900"
                >
                  暂停
                </button>
                <button 
                  v-if="taskInfo.task?.status === 'paused'"
                  @click="resumeTask(taskInfo.taskId)"
                  class="text-green-600 hover:text-green-900"
                >
                  恢复
                </button>
                <button 
                  @click="cancelTask(taskInfo.taskId)"
                  class="text-red-600 hover:text-red-900"
                >
                  取消
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 空状态 -->
      <div v-if="registeredTasks.length === 0" class="p-8 text-center text-gray-500">
        <div class="text-lg mb-2">暂无任务</div>
        <div class="text-sm">调度器中没有注册的任务</div>
      </div>
    </div>

    <!-- 任务详情模态框 -->
    <div v-if="selectedTask" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">任务详情</h3>
            <button @click="selectedTask = null" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">任务名称</label>
              <div class="mt-1 text-sm text-gray-900">{{ selectedTask.name }}</div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">任务ID</label>
              <div class="mt-1 text-sm text-gray-900 font-mono">{{ selectedTask.id }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">创建时间</label>
                <div class="mt-1 text-sm text-gray-900">{{ formatTime(selectedTask.createdAt) }}</div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">执行次数</label>
                <div class="mt-1 text-sm text-gray-900">{{ selectedTask.executionCount }}</div>
              </div>
            </div>
            
            <div v-if="selectedTask.errors.length > 0">
              <label class="block text-sm font-medium text-gray-700">错误记录</label>
              <div class="mt-1 space-y-2">
                <div v-for="(error, index) in selectedTask.errors" :key="index" 
                     class="p-2 bg-red-50 border border-red-200 rounded text-sm">
                  <div class="text-red-800">{{ error.error }}</div>
                  <div class="text-red-600 text-xs">{{ formatTime(error.timestamp) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useScheduler, useSchedulerMonitor } from '@/hooks/useScheduler.js'
import { TASK_STATUS, TASK_TYPE, TASK_PRIORITY } from '@/utils/scheduler.js'

export default {
  name: 'SchedulerMonitor',
  setup() {
    const {
      isInitialized,
      stats,
      registeredTasks,
      isRunning,
      totalTasks,
      runningTasks,
      pausedTasks,
      initialize,
      pauseTask: schedulerPauseTask,
      resumeTask: schedulerResumeTask,
      cancelTask: schedulerCancelTask,
      pauseAllTasks: schedulerPauseAllTasks,
      resumeAllTasks: schedulerResumeAllTasks,
      updateStats
    } = useScheduler()

    const { startMonitoring, stopMonitoring } = useSchedulerMonitor()

    const selectedTask = ref(null)
    const isMonitoring = ref(false)

    //=== 初始化组件
    onMounted(async () => {
      try {
        if (!isInitialized.value) {
          await initialize()
        }
        updateStats()
      } catch (error) {
        console.error('调度器监控组件初始化失败:', error)
      }
    })

    //=== 组件卸载时清理
    onUnmounted(() => {
      if (isMonitoring.value) {
        stopMonitoring()
      }
    })

    //=== 暂停任务
    const pauseTask = (taskId) => {
      schedulerPauseTask(taskId)
      updateStats()
    }

    //=== 恢复任务
    const resumeTask = (taskId) => {
      schedulerResumeTask(taskId)
      updateStats()
    }

    //=== 取消任务
    const cancelTask = (taskId) => {
      schedulerCancelTask(taskId)
      updateStats()
    }

    //=== 暂停所有任务
    const pauseAllTasks = () => {
      schedulerPauseAllTasks()
      updateStats()
    }

    //=== 恢复所有任务
    const resumeAllTasks = () => {
      schedulerResumeAllTasks()
      updateStats()
    }

    //=== 刷新统计数据
    const refreshStats = () => {
      updateStats()
    }

    //=== 切换监控状态
    const toggleMonitoring = () => {
      if (isMonitoring.value) {
        stopMonitoring()
        isMonitoring.value = false
      } else {
        startMonitoring(2000) // 每2秒更新一次
        isMonitoring.value = true
      }
    }

    //=== 获取任务类型颜色
    const getTypeColor = (type) => {
      const colors = {
        [TASK_TYPE.IMMEDIATE]: 'bg-red-100 text-red-800',
        [TASK_TYPE.TIMEOUT]: 'bg-yellow-100 text-yellow-800',
        [TASK_TYPE.INTERVAL]: 'bg-blue-100 text-blue-800',
        [TASK_TYPE.CRON]: 'bg-purple-100 text-purple-800'
      }
      return colors[type] || 'bg-gray-100 text-gray-800'
    }

    //=== 获取任务类型标签
    const getTypeLabel = (type) => {
      const labels = {
        [TASK_TYPE.IMMEDIATE]: '立即执行',
        [TASK_TYPE.TIMEOUT]: '延时执行',
        [TASK_TYPE.INTERVAL]: '间隔执行',
        [TASK_TYPE.CRON]: '定时执行'
      }
      return labels[type] || '未知'
    }

    //=== 获取任务状态颜色
    const getStatusColor = (status) => {
      const colors = {
        [TASK_STATUS.PENDING]: 'bg-gray-100 text-gray-800',
        [TASK_STATUS.RUNNING]: 'bg-green-100 text-green-800',
        [TASK_STATUS.PAUSED]: 'bg-yellow-100 text-yellow-800',
        [TASK_STATUS.COMPLETED]: 'bg-blue-100 text-blue-800',
        [TASK_STATUS.CANCELLED]: 'bg-red-100 text-red-800'
      }
      return colors[status] || 'bg-gray-100 text-gray-800'
    }

    //=== 获取任务状态标签
    const getStatusLabel = (status) => {
      const labels = {
        [TASK_STATUS.PENDING]: '等待中',
        [TASK_STATUS.RUNNING]: '运行中',
        [TASK_STATUS.PAUSED]: '已暂停',
        [TASK_STATUS.COMPLETED]: '已完成',
        [TASK_STATUS.CANCELLED]: '已取消'
      }
      return labels[status] || '未知'
    }

    //=== 获取优先级标签
    const getPriorityLabel = (priority) => {
      const labels = {
        [TASK_PRIORITY.LOW]: '低',
        [TASK_PRIORITY.NORMAL]: '普通',
        [TASK_PRIORITY.HIGH]: '高',
        [TASK_PRIORITY.CRITICAL]: '紧急'
      }
      return labels[priority] || '未知'
    }

    //=== 格式化时间
    const formatTime = (timestamp) => {
      if (!timestamp) return '-'
      return new Date(timestamp).toLocaleString('zh-CN')
    }

    return {
      // 状态
      selectedTask,
      isMonitoring,
      stats,
      registeredTasks,
      isRunning,
      totalTasks,
      runningTasks,
      pausedTasks,

      // 方法
      pauseTask,
      resumeTask,
      cancelTask,
      pauseAllTasks,
      resumeAllTasks,
      refreshStats,
      toggleMonitoring,
      getTypeColor,
      getTypeLabel,
      getStatusColor,
      getStatusLabel,
      getPriorityLabel,
      formatTime
    }
  }
}
</script>

<style scoped>
/* 自定义样式 */
.scheduler-monitor {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* 表格样式优化 */
table {
  border-collapse: separate;
  border-spacing: 0;
}

/* 滚动条样式 */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>